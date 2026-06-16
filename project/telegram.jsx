// telegram.jsx — connect-your-Telegram flow (links employee/director to the bot).

function TelegramConnect({ onClose, onConnected, who = "\u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a" }) {
  const [phase, setPhase] = React.useState("intro"); // intro | connecting | done

  const open = () => {
    setPhase("connecting");
    setTimeout(() => setPhase("done"), 1500);
  };
  const finish = () => { onConnected && onConnected(); onClose(); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 250, background: "rgba(20,20,22,.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="modalIn" style={{ width: "min(440px, 100%)", background: "var(--surface)", borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}>
        <div style={{ padding: "34px 30px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {phase !== "done" ? (
            <>
              <div className="popIn" style={{ marginBottom: 18 }}><TelegramGlyph size={76} /></div>
              <h2 style={{ margin: "0 0 8px", fontSize: "calc(23px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Подключить Telegram</h2>
              <p style={{ margin: "0 0 24px", fontSize: "calc(15px * var(--s))", color: "var(--text-2)", lineHeight: 1.5, maxWidth: 320 }}>
                Уведомления о документах будут приходить в Telegram — мгновенно и с отметками о прочтении.
              </p>

              {phase === "intro" && (
                <>
                  <div style={{ width: "100%", background: "var(--surface-2)", borderRadius: 16, padding: 18, marginBottom: 22, textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
                    {[["1", `Откройте бота ${TELEGRAM.bot}`], ["2", "Нажмите «Запустить» (Start)"], ["3", "Готово — аккаунт связан"]].map(([n, txt]) => (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#229ED9", color: "#fff", fontWeight: 700, fontSize: "calc(13px * var(--s))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
                        <span style={{ fontSize: "calc(14.5px * var(--s))", color: "var(--text)" }}>{txt}</span>
                      </div>
                    ))}
                  </div>
                  <Button kind="primary" size="lg" icon="send" full onClick={open} style={{ background: "#229ED9", boxShadow: "0 4px 16px rgba(34,158,217,.4)" }}>Открыть в Telegram</Button>
                  <button onClick={onClose} style={{ marginTop: 12, border: "none", background: "transparent", color: "var(--text-3)", fontSize: "calc(14px * var(--s))", fontFamily: "inherit", cursor: "pointer" }}>Позже</button>
                </>
              )}

              {phase === "connecting" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0 6px" }}>
                  <div className="tgSpin" style={{ width: 38, height: 38, borderRadius: "50%", border: "3px solid rgba(34,158,217,.2)", borderTopColor: "#229ED9" }} />
                  <span style={{ fontSize: "calc(15px * var(--s))", color: "var(--text-2)" }}>Ожидание подтверждения…</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="popIn" style={{ position: "relative", marginBottom: 20 }}>
                <TelegramGlyph size={76} />
                <span style={{ position: "absolute", bottom: -4, right: -4, width: 30, height: 30, borderRadius: "50%", background: "#34c759", border: "3px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" size={16} stroke={3} style={{ color: "#fff" }} />
                </span>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "calc(23px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Telegram подключён</h2>
              <p style={{ margin: "0 0 24px", fontSize: "calc(15px * var(--s))", color: "var(--text-2)", lineHeight: 1.5, maxWidth: 320 }}>
                Готово! Теперь уведомления приходят в чат {TELEGRAM.bot}.
              </p>
              <Button kind="primary" size="lg" full onClick={finish}>Готово</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TelegramConnect });
