// api/telegram.js — Vercel serverless proxy for the Telegram Bot API.
//
// The browser cannot call api.telegram.org directly: Telegram does not send
// CORS headers, so the request is blocked and appears to hang. This same-origin
// endpoint forwards the request server-side, where CORS does not apply.
//
// Token resolution order:
//   1. TELEGRAM_BOT_TOKEN env var  (recommended — set in Vercel → Settings →
//      Environment Variables, so the token never lives in the client or repo)
//   2. `token` field from the request body  (prototype / paste-in-UI flow)

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, description: "Use POST" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const method = body.method;
  const token = process.env.TELEGRAM_BOT_TOKEN || body.token;
  if (!method) return res.status(400).json({ ok: false, description: "Missing 'method'" });
  if (!token) return res.status(400).json({ ok: false, description: "No bot token configured" });

  const payload = Object.assign({}, body);
  delete payload.method;
  delete payload.token;

  try {
    const tgRes = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await tgRes.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ ok: false, description: "Proxy error: " + (e && e.message) });
  }
};
