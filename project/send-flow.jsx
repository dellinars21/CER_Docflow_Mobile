// send-flow.jsx — staff flow to pick a server file and route it to the director.

function SendFlow({ onClose, onSent, tgConnected, onConnectTelegram }) {
  const [step, setStep] = React.useState(1);
  const [folder, setFolder] = React.useState("Все");
  const [picked, setPicked] = React.useState(null);
  const [priority, setPriority] = React.useState("Обычный");
  const [note, setNote] = React.useState("");
  const [preview, setPreview] = React.useState(false);

  const folders = ["Все", "Кадры", "Счета", "Заказы", "Договоры"];
  const files = SERVER_FILES.filter((f) => folder === "Все" || f.folder === folder);

  const submit = () => {
    onSent({
      id: "DOC-" + (2042 + Math.floor(Math.random() * 50)),
      title: picked.name.replace(/_/g, " ").replace(/\.pdf$/, ""),
      type: picked.type, status: "pending", when: "Только что",
    });
    setStep(3);
  };

  return (
    <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,20,22,.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="modalIn" style={{ width: "min(720px, 100%)", maxHeight: "90vh", background: "var(--surface)", borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--accent-weak)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="send" size={21} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "calc(18px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Отправить на подпись</div>
            <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)" }}>{step === 1 ? "Шаг 1 — выберите файл" : step === 2 ? "Шаг 2 — проверьте и отправьте" : "Готово"}</div>
          </div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {step === 1 && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                {folders.map((f) => (
                  <button key={f} onClick={() => setFolder(f)} style={{
                    padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: "calc(14px * var(--s))", fontWeight: 600,
                    background: folder === f ? "var(--accent)" : "var(--surface-2)", color: folder === f ? "#fff" : "var(--text-2)",
                    boxShadow: folder === f ? "none" : "inset 0 0 0 1px var(--border)",
                  }}>{f}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((f) => {
                  const t = DOC_TYPES[f.type];
                  const on = picked && picked.name === f.name;
                  return (
                    <button key={f.name} onClick={() => setPicked(f)} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", borderRadius: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%",
                      border: on ? "2px solid var(--accent)" : "2px solid transparent",
                      background: on ? "var(--accent-weak)" : "var(--surface-2)",
                    }}>
                      <DocGlyph type={f.type} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "calc(15px * var(--s))", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                        <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--text-3)" }}>{f.folder} · {f.size} · {f.modified}</div>
                      </div>
                      <span style={{ fontSize: "calc(12.5px * var(--s))", fontWeight: 600, color: t.tint, padding: "4px 9px", borderRadius: 999, background: `color-mix(in srgb, ${t.tint} 12%, transparent)` }}>{t.label}</span>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", border: on ? "none" : "2px solid var(--border)", background: on ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {on && <Icon name="check" size={14} stroke={3} style={{ color: "#fff" }} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && picked && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div onClick={() => setPreview(true)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)", cursor: "pointer", transition: "background .12s ease" }}>
                <DocGlyph type={picked.type} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "calc(15.5px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{picked.name}</div>
                  <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-3)" }}>{DOC_TYPES[picked.type].label} · {picked.size}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: "calc(13.5px * var(--s))", fontWeight: 600, color: "var(--accent)" }}>
                  <span>Просмотр</span>
                  <Icon name="chevR" size={18} style={{ color: "var(--accent)" }} />
                </div>
              </div>

              <Field label="Получатель">
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 13, border: "1px solid var(--border)" }}>
                  <Avatar person={USERS.director} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "calc(15px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{USERS.director.name}</div>
                    <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--text-3)" }}>{USERS.director.role}</div>
                  </div>
                  <Icon name="checkCircle" size={20} style={{ color: "var(--accent)" }} />
                </div>
              </Field>

              <Field label="Приоритет">
                <div style={{ display: "flex", gap: 8 }}>
                  {["Обычный", "Срочный"].map((pr) => (
                    <button key={pr} onClick={() => setPriority(pr)} style={{
                      flex: 1, height: "calc(46px * var(--s))", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontSize: "calc(15px * var(--s))", fontWeight: 600,
                      border: priority === pr ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: priority === pr ? "var(--accent-weak)" : "var(--surface)", color: priority === pr ? "var(--accent)" : "var(--text-2)",
                    }}>{pr}</button>
                  ))}
                </div>
              </Field>

              <Field label="Комментарий (необязательно)">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Например: прошу подписать до конца недели"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 13, border: "1px solid var(--border)", fontFamily: "inherit", fontSize: "calc(15px * var(--s))", color: "var(--text)", resize: "none", outline: "none", background: "var(--surface)", boxSizing: "border-box" }} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <div className="popIn" style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(52,199,89,.14)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#34c759", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" size={32} stroke={2.6} style={{ color: "#fff" }} />
                </div>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "calc(23px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Отправлено на подпись</h2>
              <p style={{ margin: "0 auto 18px", maxWidth: 380, fontSize: "calc(15.5px * var(--s))", color: "var(--text-2)", lineHeight: 1.5 }}>
                {USERS.director.name} получит уведомление. Статус появится в разделе «Мои документы».
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 16px", borderRadius: 999, background: "rgba(34,158,217,.1)" }}>
                <TelegramGlyph size={20} />
                <span style={{ fontSize: "calc(14px * var(--s))", color: "#1583b3", fontWeight: 600 }}>{tgConnected ? "Ответ придёт в Telegram" : "Подключите Telegram для мгновенных ответов"}</span>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--hairline)" }}>
          {step === 1 && <><span style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-3)" }}>{picked ? picked.name : "Файл не выбран"}</span>
            <Button kind="primary" size="md" disabled={!picked} onClick={() => setStep(2)}>Далее</Button></>}
          {step === 2 && <><Button kind="ghost" size="md" icon="back" onClick={() => setStep(1)}>Назад</Button>
            <Button kind="primary" size="md" icon="send" onClick={submit}>Отправить директору</Button></>}
          {step === 3 && <><span /><Button kind="primary" size="md" onClick={onClose}>Готово</Button></>}
        </div>
      </div>
    </div>
    {preview && picked && (
      <div className="fadeIn" onClick={() => setPreview(false)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, maxHeight: "85vh", background: "var(--surface)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--hairline)" }}>
            <DocGlyph type={picked.type} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "calc(16px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{picked.name}</div>
              <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--text-3)" }}>{DOC_TYPES[picked.type].label} · {picked.size}</div>
            </div>
            <button onClick={() => setPreview(false)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontFamily: "inherit", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 480, aspectRatio: "210/297", background: "#fff", borderRadius: 8, boxShadow: "0 2px 20px rgba(0,0,0,.1)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, padding: "8.5% 9%", display: "flex", flexDirection: "column", fontSize: "calc(14.5px * var(--s))", color: "#333", lineHeight: 1.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, paddingBottom: 14, borderBottom: "2px solid #1d1d1f" }}>
                  <div style={{ fontWeight: 700, fontSize: "calc(14px * var(--s))", color: "#1d1d1f" }}>Caspian Engineering &amp; Research</div>
                  <div style={{ fontSize: "calc(11.5px * var(--s))", color: "#8e8e93", textAlign: "right" }}>г. Актау, 17 мкрн., д. 38</div>
                </div>
                <DocBody doc={{ type: picked.type, id: "preview", title: picked.name, pages: 1 }} />
                <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(0,0,0,.08)", display: "flex", justifyContent: "space-between", fontSize: "calc(12px * var(--s))", color: "#8e8e93" }}>
                  <span>Дата: _______________</span>
                  <span>Подпись: _______________</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 9 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { SendFlow });
