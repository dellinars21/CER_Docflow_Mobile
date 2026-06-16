// app.jsx — shell: sidebar, account switching, routing, tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0a84ff",
  "browserLayout": "list",
  "textScale": "Крупный",
  "highContrast": false
}/*EDITMODE-END*/;

const SCALE_MAP = { "Обычный": 1, "Крупный": 1.12, "Максимальный": 1.26 };

const NAV = {
  director: [
    { key: "queue",  label: "На подпись",  icon: "tray", badge: true },
    { key: "signed", label: "Подписанные", icon: "checkCircle" },
    { key: "journal", label: "Журнал",     icon: "clock" },
  ],
  staff: [
    { key: "mydocs",   label: "Мои документы",  icon: "doc" },
    { key: "requests", label: "Мои заявления",  icon: "calendar" },
    { key: "journal",  label: "Журнал",         icon: "clock" },
  ],
};

function NavItem({ item, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 13, width: "100%",
      padding: "calc(11px * var(--s)) 14px", borderRadius: 12, border: "none", cursor: "pointer",
      fontFamily: "inherit", fontSize: "calc(16px * var(--s))", fontWeight: active ? 600 : 500, textAlign: "left",
      background: active ? "var(--accent)" : "transparent",
      color: active ? "#fff" : "var(--text)",
      transition: "background .12s",
    }}>
      <Icon name={item.icon} size={22} style={{ opacity: active ? 1 : 0.75 }} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge != null && badge > 0 && (
        <span style={{ minWidth: 24, height: 24, padding: "0 7px", borderRadius: 999, fontSize: "calc(13px * var(--s))", fontWeight: 700,
          background: active ? "rgba(255,255,255,.25)" : "var(--accent)", color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>
      )}
    </button>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [account, setAccount] = React.useState("director");
  const [screen, setScreen] = React.useState("queue");
  const [signingDoc, setSigningDoc] = React.useState(null);
  const [sending, setSending] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const [extraRequests, setExtraRequests] = React.useState([]);
  const [menu, setMenu] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [tgStaff, setTgStaff] = React.useState(false);
  const [tgConnect, setTgConnect] = React.useState(false);

  // dynamic data
  const [signedIds, setSignedIds] = React.useState([]);
  const [extraSigned, setExtraSigned] = React.useState([]);
  const [extraJournal, setExtraJournal] = React.useState([]);
  const [sentDocs, setSentDocs] = React.useState([]);

  const s = SCALE_MAP[t.textScale] || 1.12;
  const user = USERS[account];
  const queue = QUEUE.filter((d) => !signedIds.includes(d.id));

  const switchAccount = (acc) => {
    setAccount(acc);
    setScreen(acc === "director" ? "queue" : "mydocs");
    setSigningDoc(null); setMenu(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const onSigned = (doc, signedPages) => {
    const sid = doc.id;
    const pagesLabel = (signedPages && signedPages.length)
      ? "стр. " + signedPages.map((n) => n + 1).join(", ")
      : "стр. 1";
    setSignedIds((p) => [...p, sid]);
    setExtraSigned((p) => [{ ...doc, signed: "Только что", receipt: { state: "delivered", time: "" } }, ...p]);
    setExtraJournal((p) => [
      { id: "n" + sid + "a", title: doc.title, actor: "director", action: "signed", when: "Только что", detail: "Подпись добавлена · " + pagesLabel },
      { id: "n" + sid + "b", title: doc.title, actor: doc.from, action: "notified", when: "Только что", detail: "Уведомление в Telegram · доставлено" },
      ...p,
    ]);
    setSigningDoc(null); setScreen("queue");
    showToast("Документ подписан · уведомление в Telegram");
    // The employee opens the Telegram notification — read receipt arrives for the director.
    setTimeout(() => {
      setExtraSigned((p) => p.map((d) => (d.id === sid ? { ...d, receipt: { state: "read", time: "сейчас" } } : d)));
      setExtraJournal((p) => p.map((j) => (j.id === "n" + sid + "b" ? { ...j, detail: "Уведомление в Telegram · прочитано" } : j)));
    }, 4500);
  };

  const onSent = (doc) => {
    setSentDocs((p) => [doc, ...p]);
    setExtraJournal((p) => [{ id: "s" + doc.id, title: doc.title, actor: "staff", action: "submitted", when: "Только что", detail: "Отправлено на подпись" }, ...p]);
  };

  const onSubmitRequest = (req) => {
    setExtraRequests((p) => [req, ...p]);
    setExtraJournal((p) => [{ id: "r" + req.id, title: LEAVE_TYPES[req.type].label, actor: "staff", action: "submitted", when: "Только что", detail: "Заявление отправлено в Отдел кадров" }, ...p]);
    showToast("Заявление отправлено · Отдел кадров уведомлён");
  };

  // theme tokens
  const hc = t.highContrast;
  const themeVars = {
    "--s": s,
    "--accent": t.accent,
    "--accent-weak": `color-mix(in srgb, ${t.accent} 13%, transparent)`,
    "--text": hc ? "#000000" : "#1d1d1f",
    "--text-2": hc ? "#37373a" : "#6e6e73",
    "--text-3": hc ? "#5c5c61" : "#a1a1a6",
    "--border": hc ? "rgba(0,0,0,.26)" : "rgba(0,0,0,.10)",
    "--hairline": hc ? "rgba(0,0,0,.15)" : "rgba(0,0,0,.07)",
  };

  const badgeFor = (key) => (key === "queue" ? queue.length : null);

  return (
    <div style={{ ...themeVars, display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--ui-font)" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: "calc(272px * min(var(--s),1.12))", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--hairline)", display: "flex", flexDirection: "column", padding: "20px 14px 14px" }}>
        {/* brand */}
        <div style={{ padding: "2px 8px 20px" }}>
          <img src="assets/cer-logo.png" alt="Caspian Engineering & Research" style={{ height: "calc(30px * min(var(--s),1.12))", width: "auto", display: "block", marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: "calc(15px * var(--s))", color: "var(--text)" }}>Документооборот</div>
          <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)" }}>Электронная подпись</div>
        </div>

        {/* staff primary actions */}
        {account === "staff" && (
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Button kind="secondary" size="md" icon="calendar" full onClick={() => setRequesting(true)}>Подать заявление</Button>
            <Button kind="secondary" size="md" icon="send" full onClick={() => setSending(true)}>Отправить на подпись</Button>
          </div>
        )}

        {/* nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV[account].map((item) => (
            <NavItem key={item.key} item={item} active={screen === item.key && !signingDoc}
              badge={badgeFor(item.key)} onClick={() => { setScreen(item.key); setSigningDoc(null); }} />
          ))}
          <NavItem key="settings" item={{ key: "settings", label: "Настройки", icon: "gear" }} active={screen === "settings" && !signingDoc}
            onClick={() => { setScreen("settings"); setSigningDoc(null); }} />
        </nav>

        <div style={{ flex: 1 }} />

        {/* Telegram status */}
        <button onClick={() => { if (account === "staff" && !tgStaff) setTgConnect(true); }} style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 10, borderRadius: 12,
          border: "1px solid var(--hairline)", background: "var(--surface-2)", cursor: (account === "staff" && !tgStaff) ? "pointer" : "default", fontFamily: "inherit", textAlign: "left",
        }}>
          <TelegramGlyph size={22} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: "calc(13.5px * var(--s))", fontWeight: 600, color: "var(--text)" }}>Уведомления</span>
            <span style={{ fontSize: "calc(12px * var(--s))", color: "var(--text-3)" }}>Telegram</span>
          </div>
          {(account === "director" || tgStaff)
            ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "calc(12.5px * var(--s))", color: "#1d7a36", fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34c759" }} />подключён</span>
            : <span style={{ fontSize: "calc(12.5px * var(--s))", color: "#1583b3", fontWeight: 600 }}>подключить</span>}
        </button>

        {/* account switcher */}
        <div style={{ position: "relative" }}>
          {menu && (
            <div className="popIn" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, background: "var(--surface)", borderRadius: 16, padding: 6, boxShadow: "0 12px 40px rgba(0,0,0,.18), 0 0 0 .5px var(--border)" }}>
              <div style={{ fontSize: "calc(11.5px * var(--s))", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text-3)", padding: "8px 10px 6px" }}>Сменить роль</div>
              {["director", "staff"].map((acc) => {
                const u = USERS[acc];
                return (
                  <button key={acc} onClick={() => switchAccount(acc)} style={{
                    display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "9px 10px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    background: account === acc ? "var(--accent-weak)" : "transparent",
                  }}>
                    <Avatar person={u} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "calc(14.5px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{u.name}</div>
                      <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)" }}>{u.role}</div>
                    </div>
                    {account === acc && <Icon name="check" size={18} stroke={2.4} style={{ color: "var(--accent)" }} />}
                  </button>
                );
              })}
            </div>
          )}
          <button onClick={() => setMenu((m) => !m)} style={{
            display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px", borderRadius: 14, border: "1px solid var(--hairline)", cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: "var(--surface-2)",
          }}>
            <Avatar person={user} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "calc(14.5px * var(--s))", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)" }}>{user.role}</div>
            </div>
            <Icon name="switch" size={19} style={{ color: "var(--text-3)" }} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {signingDoc ? (
          <SignDocument doc={signingDoc} onBack={() => setSigningDoc(null)} onSigned={onSigned} />
        ) : (
          <div style={{ flex: 1, overflow: "auto", padding: "34px clamp(22px, 4vw, 56px) 60px" }}>
            <div style={{ maxWidth: 1180, margin: "0 auto" }}>
              {account === "director" && screen === "queue" &&
                <DirectorQueue queue={queue} layout={t.browserLayout} setLayout={(v) => setTweak("browserLayout", v)} onOpen={setSigningDoc} />}
              {account === "director" && screen === "signed" && <SignedHistory extraSigned={extraSigned} />}
              {screen === "journal" && <Journal extra={extraJournal} />}
              {account === "staff" && screen === "mydocs" && <StaffDocs onSend={() => setSending(true)} sent={sentDocs} tgConnected={tgStaff} onConnectTelegram={() => setTgConnect(true)} />}
              {account === "staff" && screen === "requests" && <MyRequests requests={[...extraRequests, ...MY_REQUESTS]} onNew={() => setRequesting(true)} />}
              {screen === "settings" && (
                <div>
                  <PageHeader title="Настройки" sub="Внешний вид и параметры отображения" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 520 }}>
                    {/* Accent color */}
                    <div>
                      <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>Цвет акцента</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {[
                          { value: "#0a84ff", label: "Синий" },
                          { value: "#34c759", label: "Зелёный" },
                          { value: "#5e5ce6", label: "Фиолетовый" },
                          { value: "#1d1d1f", label: "Чёрный" },
                        ].map((c) => (
                          <button key={c.value} onClick={() => setTweak("accent", c.value)} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "12px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                            border: t.accent === c.value ? "2px solid var(--accent)" : "2px solid transparent",
                            background: t.accent === c.value ? "var(--accent-weak)" : "var(--surface)",
                            boxShadow: t.accent === c.value ? "none" : "0 0 0 .5px var(--border)",
                          }}>
                            <span style={{ width: 32, height: 32, borderRadius: "50%", background: c.value }} />
                            <span style={{ fontSize: "calc(13px * var(--s))", fontWeight: 600, color: t.accent === c.value ? "var(--accent)" : "var(--text-2)" }}>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text size */}
                    <div>
                      <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>Размер текста</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["Обычный", "Крупный", "Максимальный"].map((sz) => (
                          <button key={sz} onClick={() => setTweak("textScale", sz)} style={{
                            flex: 1, height: "calc(48px * var(--s))", borderRadius: 13, cursor: "pointer", fontFamily: "inherit",
                            fontSize: "calc(15px * var(--s))", fontWeight: 600,
                            border: t.textScale === sz ? "2px solid var(--accent)" : "1px solid var(--border)",
                            background: t.textScale === sz ? "var(--accent-weak)" : "var(--surface)",
                            color: t.textScale === sz ? "var(--accent)" : "var(--text-2)",
                          }}>{sz}</button>
                        ))}
                      </div>
                    </div>

                    {/* High contrast */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--surface)", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)" }}>
                        <div>
                          <div style={{ fontSize: "calc(16px * var(--s))", fontWeight: 600, color: "var(--text)" }}>Высокий контраст</div>
                          <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-3)", marginTop: 2 }}>Увеличить контрастность текста</div>
                        </div>
                        <button onClick={() => setTweak("highContrast", !t.highContrast)} style={{
                          width: 52, height: 30, borderRadius: 999, border: "none", cursor: "pointer", padding: 2, transition: "background .2s ease",
                          background: t.highContrast ? "var(--accent)" : "#c7c7cc",
                        }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "transform .2s ease", transform: t.highContrast ? "translateX(22px)" : "translateX(0)" }} />
                        </button>
                      </div>
                    </div>

                    {/* Live preview */}
                    <div>
                      <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>Предпросмотр</div>
                      <div style={{ padding: "20px 22px", background: "var(--surface)", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)", display: "flex", flexDirection: "column", gap: 14 }}>
                        {/* Doc row sample */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--bg)", borderRadius: 12, boxShadow: "0 0 0 .5px var(--border)" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-weak)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon name="doc" size={20} style={{ color: "var(--accent)" }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "calc(15px * var(--s))", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Приказ № 47 об утверждении регламента</div>
                            <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--text-3)", marginTop: 2 }}>Отдел кадров · 9 июня 2026</div>
                          </div>
                          <StatusBadge kind="urgent" />
                        </div>
                        {/* Typography sample */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontSize: "calc(17px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Заголовок документа</div>
                          <div style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-2)", lineHeight: 1.55 }}>Основной текст документа выглядит именно так. Здесь отображается рабочий контент: описания, комментарии и прочие сведения.</div>
                          <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)" }}>Вспомогательная подпись · метаданные</div>
                        </div>
                        {/* Button row */}
                        <div style={{ display: "flex", gap: 10 }}>
                          <Button kind="primary" size="sm">Подписать</Button>
                          <Button kind="secondary" size="sm">Отклонить</Button>
                        </div>
                      </div>
                    </div>

                    {/* View mode */}
                    <div>
                      <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>Вид списка документов</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {[
                          { value: "list", label: "Список", icon: "list" },
                          { value: "grid", label: "Сетка", icon: "grid" },
                          { value: "columns", label: "Колонки", icon: "columns" },
                        ].map((v) => (
                          <button key={v.value} onClick={() => setTweak("browserLayout", v.value)} style={{
                            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                            border: t.browserLayout === v.value ? "2px solid var(--accent)" : "2px solid transparent",
                            background: t.browserLayout === v.value ? "var(--accent-weak)" : "var(--surface)",
                            boxShadow: t.browserLayout === v.value ? "none" : "0 0 0 .5px var(--border)",
                          }}>
                            <Icon name={v.icon} size={24} style={{ color: t.browserLayout === v.value ? "var(--accent)" : "var(--text-3)" }} />
                            <span style={{ fontSize: "calc(14px * var(--s))", fontWeight: 600, color: t.browserLayout === v.value ? "var(--accent)" : "var(--text-2)" }}>{v.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {sending && <SendFlow onClose={() => setSending(false)} onSent={onSent} tgConnected={tgStaff} onConnectTelegram={() => setTgConnect(true)} />}
      {requesting && <LeaveFlow onClose={() => setRequesting(false)} onSubmit={onSubmitRequest} />}
      {tgConnect && <TelegramConnect onClose={() => setTgConnect(false)} onConnected={() => setTgStaff(true)} />}

      {/* toast */}
      {toast && (
        <div className="toastIn" style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 300,
          display: "flex", alignItems: "center", gap: 11, padding: "14px 20px", borderRadius: 14,
          background: "#1d1d1f", color: "#fff", fontSize: "calc(15px * var(--s))", fontWeight: 500,
          boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#34c759", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={14} stroke={3} /></span>
          {toast}
        </div>
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Внешний вид" />
        <TweakColor label="Акцент" value={t.accent}
          options={["#0a84ff", "#34c759", "#5e5ce6", "#1d1d1f"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Размер текста" value={t.textScale}
          options={["Обычный", "Крупный", "Максимальный"]}
          onChange={(v) => setTweak("textScale", v)} />
        <TweakToggle label="Высокий контраст" value={t.highContrast}
          onChange={(v) => setTweak("highContrast", v)} />
        <TweakSection label="Список файлов" />
        <TweakRadio label="Вид" value={t.browserLayout}
          options={[{ value: "list", label: "Список" }, { value: "grid", label: "Сетка" }, { value: "columns", label: "Колонки" }]}
          onChange={(v) => setTweak("browserLayout", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
