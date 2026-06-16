// tg-api.jsx — Telegram Bot API client (calls through the /api/telegram proxy).
//
// Telegram's API sends no CORS headers, so the browser cannot call it directly
// (the request hangs/blocks). All calls go through the same-origin Vercel
// serverless function in api/telegram.js, which forwards them server-side.
//
// SECURITY NOTE: in the prototype the token is entered in the UI and stored in
// localStorage, then passed to the proxy. For production, set TELEGRAM_BOT_TOKEN
// as a Vercel env var instead — the proxy prefers it, so the token never has to
// live in the browser or the repo.

const TG_LS_KEY = "cer_tg_config_v1";
// Same-origin proxy (Vercel serverless function at /api/telegram). Telegram's
// own API has no CORS headers, so the browser must go through this hop.
const TG_PROXY = "/api/telegram";

function tgLoad() {
  try { return JSON.parse(localStorage.getItem(TG_LS_KEY)) || {}; }
  catch (e) { return {}; }
}
function tgSaveLS(cfg) {
  try { localStorage.setItem(TG_LS_KEY, JSON.stringify(cfg)); } catch (e) {}
}
function tgClearLS() {
  try { localStorage.removeItem(TG_LS_KEY); } catch (e) {}
}

// Low-level call through the proxy. Throws Error(description) when !ok.
async function tgCall(token, method, params) {
  let res;
  try {
    res = await fetch(TG_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ token, method }, params || {})),
    });
  } catch (e) {
    throw new Error("Сеть недоступна. Откройте сайт, развёрнутый на Vercel.");
  }
  let data;
  try { data = await res.json(); }
  catch (e) {
    throw new Error("Telegram-прокси не найден (/api/telegram). Эта функция работает на развёрнутом сайте Vercel, а не при локальном открытии файла.");
  }
  if (!data.ok) throw new Error(data.description || ("Ошибка Telegram " + res.status));
  return data.result;
}

const tgGetMe = (token) => tgCall(token, "getMe");
const tgGetUpdates = (token) => tgCall(token, "getUpdates", { timeout: 0, limit: 20, allowed_updates: ["message"] });
const tgSendMessage = (token, chatId, text) =>
  tgCall(token, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });

// Pull the most recent chat that has written to the bot (used to capture the
// recipient's chat_id automatically after they message the bot once).
async function tgDetectChat(token) {
  const updates = await tgGetUpdates(token);
  for (let i = updates.length - 1; i >= 0; i--) {
    const m = updates[i].message;
    if (m && m.chat) {
      const c = m.chat;
      const name = c.title || [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || String(c.id);
      return { chatId: c.id, chatName: name };
    }
  }
  return null;
}

// Shared React hook: persisted Telegram config + send helper.
function useTelegram() {
  const [config, setConfig] = React.useState(tgLoad);
  const connected = !!(config.token && config.chatId);

  const save = (c) => { tgSaveLS(c); setConfig(c); };
  const disconnect = () => { tgClearLS(); setConfig({}); };

  // Fire a message to the connected chat. Resolves to true/false; never throws,
  // so wiring it into UI events can't break the flow if Telegram is down.
  const send = React.useCallback((text) => {
    if (!(config.token && config.chatId)) return Promise.resolve(false);
    return tgSendMessage(config.token, config.chatId, text)
      .then(() => true)
      .catch((e) => { console.warn("Telegram send failed:", e.message); return false; });
  }, [config.token, config.chatId]);

  return { config, connected, save, disconnect, send };
}

// Cross-script visibility (each <script type="text/babel"> runs in its own
// scope; the app shares symbols through window).
Object.assign(window, { useTelegram, tgGetMe, tgGetUpdates, tgSendMessage, tgDetectChat });
