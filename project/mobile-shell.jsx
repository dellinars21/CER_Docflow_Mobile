// mobile-shell.jsx — mobile signing screen, bottom sheets, tab bar, root + mount.
const { useState: mUseState, useRef: mUseRef, useEffect: mUseEffect, useCallback: mUseCallback } = React;

// ── Bottom sheet wrapper ─────────────────────────────────────────────────────
function MSheet({ onClose, title, children, footer }) {
  return (
    <div className="fadeIn" onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 80, background: "rgba(0,0,0,.42)", display: "flex", alignItems: "flex-end" }}>
      <div className="sheetUp" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxHeight: "94%", background: "var(--bg)", borderRadius: "26px 26px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px", flexShrink: 0 }}>
          <div style={{ width: 38, height: 5, borderRadius: 9, background: "rgba(0,0,0,.16)" }} />
        </div>
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 20px 10px", flexShrink: 0 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={19} /></button>
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto", padding: "0 16px" }}>{children}</div>
        {footer && <div style={{ padding: "12px 16px max(30px, calc(var(--sab) + 14px))", flexShrink: 0, borderTop: "1px solid var(--hairline)", background: "var(--surface)" }}>{footer}</div>}
      </div>
    </div>
  );
}

// ── MOBILE SIGNING ───────────────────────────────────────────────────────────
function MSign({ doc, onBack, onApply }) {
  const t = DOC_TYPES[doc.type], field = t.field, p = senderOf(doc);
  const scrollRef = mUseRef(null);
  const pageRefs = mUseRef([]);
  const [placedByPage, setPlacedByPage] = mUseState({}); // { [page]: {x, y} } — one signature per page
  const [currentPage, setCurrentPage] = mUseState(0);    // page currently centered in the scroll viewport
  const [phase, setPhase] = mUseState("place"); // place | applying | done

  const signedPages = Object.keys(placedByPage).map(Number).sort((a, b) => a - b);
  const count = signedPages.length;
  const currentSigned = placedByPage[currentPage] != null;

  const coordsFrom = (page, cx, cy) => {
    const el = pageRefs.current[page]; if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: signClamp(((cx - r.left) / r.width) * 100), y: signClamp(((cy - r.top) / r.height) * 100) };
  };
  const placeOnPage = (page, x, y) => setPlacedByPage((prev) => ({ ...prev, [page]: { x, y } }));
  const removeFromPage = (page) => setPlacedByPage((prev) => { const n = { ...prev }; delete n[page]; return n; });

  // Detect which page is currently centered in the scroll viewport.
  const detectCurrentPage = mUseCallback(() => {
    const cont = scrollRef.current; if (!cont) return;
    const cr = cont.getBoundingClientRect();
    const mid = cr.top + cr.height / 2;
    let best = 0, bestDist = Infinity;
    pageRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs((r.top + r.height / 2) - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setCurrentPage((prev) => (prev === best ? prev : best));
  }, []);

  mUseEffect(() => {
    const cont = scrollRef.current; if (!cont) return;
    detectCurrentPage();
    cont.addEventListener("scroll", detectCurrentPage, { passive: true });
    window.addEventListener("resize", detectCurrentPage);
    return () => { cont.removeEventListener("scroll", detectCurrentPage); window.removeEventListener("resize", detectCurrentPage); };
  }, [detectCurrentPage]);

  const onArmedClick = (page) => (e) => {
    if (phase !== "place") return;
    const c = coordsFrom(page, e.clientX, e.clientY);
    if (c) placeOnPage(page, c.x, c.y);
  };
  const startDrag = (page) => (e) => {
    if (phase !== "place") return;
    e.stopPropagation();
    const move = (ev) => { ev.preventDefault(); const c = coordsFrom(page, ev.clientX, ev.clientY); if (c) placeOnPage(page, c.x, c.y); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  // Auto-place in the recommended field on the CURRENT page — only if it isn't already signed.
  const signCurrentPage = () => {
    if (placedByPage[currentPage] != null) return;
    placeOnPage(currentPage, field.x, field.y);
  };
  const apply = () => { setPhase("applying"); setTimeout(() => setPhase("done"), 850); };

  const pages = Array.from({ length: doc.pages });

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ paddingTop: "max(50px, calc(var(--sat) + 12px))", paddingBottom: 12, paddingLeft: 12, paddingRight: 16, display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
        <button className="mTap" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 2, border: "none", background: "transparent", color: "var(--accent)", fontFamily: "inherit", fontSize: 17, fontWeight: 500, cursor: "pointer", padding: 4 }}>
          <Icon name="chevR" size={22} style={{ transform: "rotate(180deg)" }} /> Назад
        </button>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{doc.id} · {t.label}</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* doc preview — all pages, scroll to switch */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "20px 18px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
        {pages.map((_, i) => (
          <div key={i}>
            <div style={{ fontSize: 12.5, fontWeight: 600, textAlign: "center", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: i === currentPage ? "var(--accent)" : "var(--text-3)" }}>
              Страница {i + 1} из {doc.pages}
              {placedByPage[i] && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1d7a36" }}><Icon name="checkCircle" size={13} /> подписана</span>}
            </div>
            <PageSheet ref={(el) => (pageRefs.current[i] = el)} doc={doc} field={field} armed={phase === "place"} onArmedMove={() => {}} onArmedClick={onArmedClick(i)}>
              {i === currentPage && !placedByPage[i] && phase === "place" && (
                <div className="mFieldPulse" style={{ position: "absolute", left: field.x + "%", top: field.y + "%", width: field.w + "%", transform: "translate(-50%,-50%)", pointerEvents: "none", border: "2px dashed var(--accent)", borderRadius: 8, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-weak)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>Поле для подписи</span>
                </div>
              )}
              {placedByPage[i] && (
                <div onClick={(e) => e.stopPropagation()} onPointerDown={startDrag(i)} style={{ position: "absolute", left: placedByPage[i].x + "%", top: placedByPage[i].y + "%", transform: "translate(-50%,-50%)", cursor: phase === "place" ? "grab" : "default", touchAction: "none" }}>
                  <div style={{ position: "relative", padding: "6px 12px", borderRadius: 8, border: phase === "place" ? "1.5px solid var(--accent)" : "1.5px solid transparent", background: phase === "place" ? "rgba(255,255,255,.5)" : "transparent" }}>
                    <SignatureMark small applied={phase === "done"} />
                    {phase === "place" && (
                      <button onClick={(e) => { e.stopPropagation(); removeFromPage(i); }} style={{ position: "absolute", top: -11, right: -11, width: 24, height: 24, borderRadius: "50%", border: "none", background: "#1d1d1f", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={13} /></button>
                    )}
                  </div>
                </div>
              )}
            </PageSheet>
          </div>
        ))}
      </div>

      {/* bottom action bar */}
      {phase !== "done" ? (
        <div style={{ flexShrink: 0, background: "var(--surface)", borderTop: "1px solid var(--hairline)", padding: "12px 16px max(30px, calc(var(--sab) + 14px))", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* current page indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)" }}>Текущая страница</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginTop: 1 }}>{currentPage + 1} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-3)" }}>из {doc.pages}</span></div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", background: currentSigned ? "rgba(52,199,89,.15)" : "rgba(120,120,128,.14)", color: currentSigned ? "#1d7a36" : "var(--text-3)" }}>
              {currentSigned ? <><Icon name="checkCircle" size={14} /> Подписана</> : "Не подписана"}
            </span>
          </div>
          {/* sign current page */}
          <MBtn kind="secondary" icon="pen" full disabled={currentSigned} onClick={signCurrentPage}>
            {currentSigned ? `Стр. ${currentPage + 1} уже подписана` : `Подписать стр. ${currentPage + 1}`}
          </MBtn>
          {/* apply */}
          <MBtn kind="primary" icon={phase === "applying" ? null : "checkCircle"} full disabled={!count || phase === "applying"} onClick={apply}>
            {phase === "applying" ? "Применение…" : count > 1 ? `Применить подпись (${count} стр.)` : "Применить подпись"}
          </MBtn>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-3)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {count ? <><TelegramGlyph size={15} /> Подписано {count} из {doc.pages} стр.</> : "Нажмите на страницу или подпишите её кнопкой"}
          </p>
        </div>
      ) : (
        <div className="sheetUp" style={{ flexShrink: 0, background: "var(--surface)", borderTop: "1px solid var(--hairline)", padding: "22px 20px max(30px, calc(var(--sab) + 14px))", textAlign: "center" }}>
          <div className="popIn" style={{ width: 64, height: 64, borderRadius: "50%", background: "#34c759", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 6px 18px rgba(52,199,89,.4)" }}><Icon name="check" size={34} stroke={2.6} style={{ color: "#fff" }} /></div>
          <div style={{ fontSize: 21, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Документ подписан</div>
          <div style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 12 }}>Подпись на {count} из {doc.pages} стр.</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "rgba(34,158,217,.1)", marginBottom: 18 }}>
            <TelegramGlyph size={18} /><span style={{ fontSize: 13.5, color: "#1583b3", fontWeight: 600 }}>Уведомление в Telegram — {p.name}</span>
          </div>
          <MBtn kind="primary" full onClick={() => onApply(doc)}>Готово</MBtn>
        </div>
      )}
    </div>
  );
}

// ── SEND SHEET (staff) ───────────────────────────────────────────────────────
function SendSheet({ onClose, onSent, tgConnected }) {
  const [step, setStep] = mUseState(1);
  const [picked, setPicked] = mUseState(null);
  const [priority, setPriority] = mUseState("Обычный");
  const [comment, setComment] = mUseState("");
  const [preview, setPreview] = mUseState(false);

  const submit = () => {
    onSent({ id: "DOC-" + (2042 + Math.floor(Math.random() * 50)), title: picked.name.replace(/_/g, " ").replace(/\.pdf$/, ""), type: picked.type, status: "pending", when: "Только что", priority });
    setStep(3);
  };

  const footer = step === 1
    ? <MBtn kind="primary" full disabled={!picked} onClick={() => setStep(2)}>Далее</MBtn>
    : step === 2
      ? <div style={{ display: "flex", gap: 10 }}><MBtn kind="secondary" onClick={() => setStep(1)} style={{ flex: "0 0 auto" }}>Назад</MBtn><MBtn kind="primary" icon="send" full onClick={submit}>Отправить</MBtn></div>
      : <MBtn kind="primary" full onClick={onClose}>Готово</MBtn>;

  return (
    <>
    <MSheet onClose={onClose} title={step === 3 ? null : "Отправить на подпись"} footer={footer}>
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 }}>
          <div style={{ fontSize: 14, color: "var(--text-3)", padding: "2px 4px 4px" }}>Выберите файл с сервера</div>
          {SERVER_FILES.map((f) => {
            const t = DOC_TYPES[f.type], on = picked && picked.name === f.name;
            return (
              <button key={f.name} className="mTap" onClick={() => setPicked(f)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%", border: on ? "2px solid var(--accent)" : "2px solid transparent", background: on ? "var(--accent-weak)" : "var(--surface)" }}>
                <DocGlyph type={f.type} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{f.folder} · {f.size}</div>
                </div>
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: on ? "none" : "2px solid var(--border)", background: on ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on && <Icon name="check" size={13} stroke={3} style={{ color: "#fff" }} />}</span>
              </button>
            );
          })}
        </div>
      )}
      {step === 2 && picked && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 12 }}>
          <MCard onClick={() => setPreview(true)} style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
            <DocGlyph type={picked.type} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{picked.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>{DOC_TYPES[picked.type].label} · {picked.size}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
              <span>Открыть</span>
              <Icon name="chevR" size={16} style={{ color: "var(--accent)" }} />
            </div>
          </MCard>
          <div>
            <div style={MSecLabel}>Получатель</div>
            <MCard style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar person={USERS.director} size={40} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--text)" }}>{USERS.director.name}</div><div style={{ fontSize: 13, color: "var(--text-3)" }}>{USERS.director.role}</div></div>
              <Icon name="checkCircle" size={20} style={{ color: "var(--accent)" }} />
            </MCard>
          </div>
          <div>
            <div style={MSecLabel}>Комментарий</div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Добавьте комментарий для директора…"
              rows={3} style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 15, fontFamily: "inherit", color: "var(--text)", resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={MSecLabel}>Приоритет</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Обычный", "Срочный"].map((pr) => (
                <button key={pr} className="mTap" onClick={() => setPriority(pr)} style={{ flex: 1, height: 50, borderRadius: 14, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 600, border: priority === pr ? "2px solid var(--accent)" : "1px solid var(--border)", background: priority === pr ? "var(--accent-weak)" : "var(--surface)", color: priority === pr ? "var(--accent)" : "var(--text-2)" }}>{pr}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "20px 10px 28px" }}>
          <div className="popIn" style={{ width: 72, height: 72, borderRadius: "50%", background: "#34c759", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Icon name="check" size={38} stroke={2.6} style={{ color: "#fff" }} /></div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Отправлено</h2>
          <p style={{ margin: "0 auto 16px", maxWidth: 280, fontSize: 15, color: "var(--text-2)", lineHeight: 1.5 }}>{USERS.director.name} получит уведомление.</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 15px", borderRadius: 999, background: "rgba(34,158,217,.1)" }}><TelegramGlyph size={18} /><span style={{ fontSize: 13.5, color: "#1583b3", fontWeight: 600 }}>{tgConnected ? "Ответ придёт в Telegram" : "Подключите Telegram для ответов"}</span></div>
        </div>
      )}
    </MSheet>
    {preview && picked && (
      <div className="fadeIn" style={{ position: "absolute", inset: 0, zIndex: 90, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <div style={{ paddingTop: "max(50px, calc(var(--sat) + 12px))", paddingBottom: 12, paddingLeft: 12, paddingRight: 16, display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
          <button className="mTap" onClick={() => setPreview(false)} style={{ display: "flex", alignItems: "center", gap: 2, border: "none", background: "transparent", color: "var(--accent)", fontFamily: "inherit", fontSize: 17, fontWeight: 500, cursor: "pointer", padding: 4 }}>
            <Icon name="chevR" size={22} style={{ transform: "rotate(180deg)" }} /> Назад
          </button>
          <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{picked.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{DOC_TYPES[picked.type].label} · {picked.size}</div>
          </div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "20px 18px 28px" }}>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,.12)", overflow: "hidden", aspectRatio: "210/297", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, padding: "28px 24px", display: "flex", flexDirection: "column", fontSize: 11, color: "#333", lineHeight: 1.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1d1d1f" }}>Caspian Engineering &amp; Research</div>
                <div style={{ fontSize: 10, color: "#8e8e93", textAlign: "right" }}>г. Актау, 17 мкрн., д. 38</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1d1d1f", textAlign: "center", margin: "12px 0 16px" }}>{DOC_TYPES[picked.type].label}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(8)].map((_, i) => <div key={i} style={{ height: 8, borderRadius: 4, background: "#e5e5ea", width: i === 7 ? "60%" : "100%" }} />)}
                <div style={{ marginTop: 12 }}>
                  {[...Array(5)].map((_, i) => <div key={i} style={{ height: 8, borderRadius: 4, background: "#e5e5ea", width: i === 4 ? "45%" : "100%", marginTop: 6 }} />)}
                </div>
              </div>
              <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #e5e5ea", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ fontSize: 10, color: "#8e8e93" }}>Дата: _______________</div>
                <div style={{ fontSize: 10, color: "#8e8e93" }}>Подпись: _______________</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ── TELEGRAM SHEET — real Bot API: paste token → capture chat → send ─────────
const tgInputStyle = { width: "100%", padding: "13px 15px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 15, fontFamily: "inherit", color: "var(--text)", outline: "none", boxSizing: "border-box" };

function TgSheet({ tg, onClose, onToast }) {
  const [view, setView] = mUseState(tg.connected ? "manage" : "token");
  const [token, setToken] = mUseState(tg.config.token || "");
  const [bot, setBot] = mUseState(null);   // result of getMe
  const [busy, setBusy] = mUseState(false);
  const [err, setErr] = mUseState("");

  const verifyToken = async () => {
    const t = token.trim();
    if (!t) return;
    setBusy(true); setErr("");
    try { const me = await tgGetMe(t); setBot(me); setView("await"); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const detectChat = async () => {
    setBusy(true); setErr("");
    try {
      const found = await tgDetectChat(token.trim());
      if (!found) { setErr("Сообщение не найдено. Откройте бота, отправьте любое сообщение и попробуйте снова."); setBusy(false); return; }
      tg.save({ token: token.trim(), chatId: found.chatId, chatName: found.chatName, botName: bot ? bot.username : "" });
      setView("manage");
      onToast && onToast("Telegram подключён");
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const sendTest = async () => {
    setBusy(true);
    const ok = await tg.send("✅ <b>CER Документооборот</b>\nТестовое сообщение — интеграция работает.");
    setBusy(false);
    onToast && onToast(ok ? "Сообщение отправлено в Telegram" : "Не удалось отправить");
  };

  const errBox = err ? (
    <div style={{ width: "100%", background: "rgba(255,59,48,.1)", color: "#c1271b", fontSize: 13.5, lineHeight: 1.45, padding: "10px 13px", borderRadius: 12, marginBottom: 14, textAlign: "left" }}>{err}</div>
  ) : null;

  return (
    <MSheet onClose={onClose} title={view === "manage" ? null : "Telegram"}>
      <div style={{ padding: "8px 6px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {view === "token" && (
          <>
            <div className="popIn" style={{ marginBottom: 14 }}><TelegramGlyph size={62} /></div>
            <h2 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>Подключить Telegram</h2>
            <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.5, maxWidth: 300, textAlign: "center" }}>Создайте бота в <b>@BotFather</b> (команда <b>/newbot</b>) и вставьте его токен.</p>
            {errBox}
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456789:ABCdef..." autoCapitalize="off" autoCorrect="off" spellCheck={false} style={{ ...tgInputStyle, marginBottom: 14 }} />
            <MBtn kind="primary" tg full disabled={!token.trim() || busy} onClick={verifyToken}>{busy ? "Проверка…" : "Продолжить"}</MBtn>
            <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ marginTop: 14, fontSize: 13.5, color: "var(--accent)", textDecoration: "none" }}>Открыть @BotFather →</a>
          </>
        )}

        {view === "await" && bot && (
          <>
            <div className="popIn" style={{ marginBottom: 14 }}><TelegramGlyph size={62} /></div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>Бот @{bot.username}</h2>
            <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.5, maxWidth: 300, textAlign: "center" }}>Откройте бота и отправьте ему любое сообщение (например <b>/start</b>), затем вернитесь сюда.</p>
            {errBox}
            <a href={"https://t.me/" + bot.username} target="_blank" rel="noreferrer" style={{ width: "100%", textDecoration: "none", marginBottom: 12 }}>
              <MBtn kind="secondary" tg icon="send" full>Открыть @{bot.username}</MBtn>
            </a>
            <MBtn kind="primary" full disabled={busy} onClick={detectChat}>{busy ? "Поиск чата…" : "Я отправил сообщение"}</MBtn>
            <button onClick={() => { setView("token"); setErr(""); }} style={{ marginTop: 14, border: "none", background: "none", fontFamily: "inherit", fontSize: 13.5, color: "var(--text-3)", cursor: "pointer" }}>← Изменить токен</button>
          </>
        )}

        {view === "manage" && (
          <>
            <div className="popIn" style={{ position: "relative", marginBottom: 16 }}>
              <TelegramGlyph size={64} />
              <span style={{ position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: "50%", background: "#34c759", border: "3px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={15} stroke={3} style={{ color: "#fff" }} /></span>
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: 21, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>Telegram подключён</h2>
            <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.5, maxWidth: 300, textAlign: "center" }}>
              Сообщения отправляются в чат <b>{tg.config.chatName || tg.config.chatId}</b>{tg.config.botName ? <> через <b>@{tg.config.botName}</b></> : null}.
            </p>
            <MBtn kind="primary" tg icon="send" full disabled={busy} onClick={sendTest}>{busy ? "Отправка…" : "Отправить тестовое сообщение"}</MBtn>
            <button onClick={() => { tg.disconnect(); setBot(null); setToken(""); setView("token"); }} style={{ marginTop: 16, border: "none", background: "none", fontFamily: "inherit", fontSize: 14, color: "#ff3b30", fontWeight: 500, cursor: "pointer" }}>Отключить Telegram</button>
          </>
        )}
      </div>
    </MSheet>
  );
}

// ── TAB BAR ──────────────────────────────────────────────────────────────────
function MTabBar({ tabs, active, onTab }) {
  return (
    <div style={{ flexShrink: 0, display: "flex", background: "rgba(252,252,253,.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderTop: "1px solid var(--hairline)", paddingBottom: "max(22px, calc(var(--sab) + 8px))", paddingTop: 8 }}>
      {tabs.map((tab) => {
        const on = active === tab.key;
        return (
          <button key={tab.key} className="mTap" onClick={() => onTab(tab)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", padding: "4px 0", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <Icon name={tab.icon} size={26} stroke={on ? 2 : 1.7} style={{ color: on ? "var(--accent)" : "var(--text-3)" }} />
              {tab.badge > 0 && <span style={{ position: "absolute", top: -4, right: -8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: "#ff3b30", color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{tab.badge}</span>}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500, color: on ? "var(--accent)" : "var(--text-3)" }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
function MobileApp() {
  const [account, setAccount] = mUseState("director");
  const [screen, setScreen] = mUseState("queue");
  const [signingDoc, setSigningDoc] = mUseState(null);
  const [sheet, setSheet] = mUseState(null); // 'send' | 'tg' | null
  const [toast, setToast] = mUseState(null);
  const tg = useTelegram();
  const [signedIds, setSignedIds] = mUseState([]);
  const [extraSigned, setExtraSigned] = mUseState([]);
  const [extraJournal, setExtraJournal] = mUseState([]);
  const [sentDocs, setSentDocs] = mUseState([]);
  const [extraRequests, setExtraRequests] = mUseState([]);
  const [openReq, setOpenReq] = mUseState(null);

  const user = USERS[account];
  const queue = QUEUE.filter((d) => !signedIds.includes(d.id));
  const signedAll = [...extraSigned, ...SIGNED];
  const journalAll = [...extraJournal, ...JOURNAL];
  const staffAll = [...sentDocs, ...STAFF_DOCS];

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const switchAccount = (acc) => { setAccount(acc); setScreen(acc === "director" ? "queue" : "docs"); setSigningDoc(null); };

  const onApply = (doc) => {
    const sid = doc.id;
    const dt = DOC_TYPES[doc.type];
    tg.send("✅ <b>Документ подписан</b>\n" + doc.title + "\nТип: " + (dt ? dt.label : doc.type) + "\nПодписал: " + USERS.director.name);
    setSignedIds((p) => [...p, sid]);
    setExtraSigned((p) => [{ ...doc, signed: "Только что", receipt: { state: "delivered", time: "" } }, ...p]);
    setExtraJournal((p) => [
      { id: "n" + sid + "a", title: doc.title, actor: "director", action: "signed", when: "Только что", detail: "Подпись добавлена · стр. 1" },
      { id: "n" + sid + "b", title: doc.title, actor: doc.from, action: "notified", when: "Только что", detail: "Уведомление в Telegram · доставлено" },
      ...p,
    ]);
    setSigningDoc(null); setScreen("queue");
    showToast("Подписано · уведомление в Telegram");
    setTimeout(() => {
      setExtraSigned((p) => p.map((d) => (d.id === sid ? { ...d, receipt: { state: "read", time: "сейчас" } } : d)));
      setExtraJournal((p) => p.map((j) => (j.id === "n" + sid + "b" ? { ...j, detail: "Уведомление в Telegram · прочитано" } : j)));
    }, 4500);
  };

  const onSent = (doc) => {
    const dt = DOC_TYPES[doc.type];
    tg.send("📄 <b>Новый документ на подпись</b>\n" + doc.title + "\nТип: " + (dt ? dt.label : doc.type) + "\nПриоритет: " + (doc.priority || "Обычный") + "\nОтправитель: " + USERS.staff.name);
    setSentDocs((p) => [doc, ...p]);
    setExtraJournal((p) => [{ id: "s" + doc.id, title: doc.title, actor: "staff", action: "submitted", when: "Только что", detail: "Отправлено на подпись" }, ...p]);
  };

  const onSubmitRequest = (req) => {
    tg.send("📝 <b>Новое заявление</b>\n" + (LEAVE_TYPES[req.type] ? LEAVE_TYPES[req.type].label : req.type) + "\nОтправитель: " + USERS.staff.name);
    setExtraRequests((p) => [req, ...p]);
    setExtraJournal((p) => [{ id: "r" + req.id, title: LEAVE_TYPES[req.type].label, actor: "staff", action: "submitted", when: "Только что", detail: "Заявление в Отдел кадров" }, ...p]);
    showToast("Заявление отправлено");
  };
  const requestsAll = [...extraRequests, ...MY_REQUESTS];

  const dirTabs = [
    { key: "queue", icon: "tray", label: "Подпись", badge: queue.length },
    { key: "signed", icon: "checkCircle", label: "Подписано" },
    { key: "search", icon: "search", label: "Поиск", action: "search" },
    { key: "journal", icon: "clock", label: "Журнал" },
    { key: "profile", icon: "user", label: "Профиль" },
  ];
  const staffTabs = [
    { key: "docs", icon: "doc", label: "Документы" },
    { key: "requests", icon: "calendar", label: "Заявления" },
    { key: "search", icon: "search", label: "Поиск", action: "search" },
    { key: "journal", icon: "clock", label: "Журнал" },
    { key: "profile", icon: "user", label: "Профиль" },
  ];
  const tabs = account === "director" ? dirTabs : staffTabs;
  const onTab = (tab) => { if (tab.action === "send") setSheet("send"); else if (tab.action === "search") setSheet("search"); else { setScreen(tab.key); setSigningDoc(null); } };

  return (
    <IOSDevice>
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {account === "director" && screen === "queue" && <MQueue queue={queue} onOpen={setSigningDoc} />}
          {account === "director" && screen === "signed" && <MSigned all={signedAll} />}
          {screen === "journal" && <MJournal items={journalAll} />}
          {account === "staff" && screen === "docs" && <MDocs all={staffAll} tgConnected={tg.connected} onConnectTg={() => setSheet("tg")} onSend={() => setSheet("send")} />}
          {account === "staff" && screen === "requests" && <MRequests requests={requestsAll} onNew={() => setSheet("leave")} onOpen={setOpenReq} />}
          {screen === "profile" && <MProfile account={account} user={user} onSwitch={switchAccount} tgConnected={tg.connected} onConnectTg={() => setSheet("tg")} />}
        </div>

        <MTabBar tabs={tabs} active={screen} onTab={onTab} />

        {signingDoc && <MSign doc={signingDoc} onBack={() => setSigningDoc(null)} onApply={onApply} />}
        {sheet === "send" && <SendSheet onClose={() => setSheet(null)} onSent={onSent} tgConnected={tg.connected} />}
        {sheet === "leave" && <MLeaveSheet onClose={() => setSheet(null)} onSubmit={onSubmitRequest} />}
        {openReq && <MRequestDetail req={openReq} onClose={() => setOpenReq(null)} />}
        {sheet === "tg" && <TgSheet tg={tg} onClose={() => setSheet(null)} onToast={showToast} />}
        {sheet === "search" && <MSearch queue={queue} signed={signedAll} journal={journalAll} onOpen={(doc) => { setSheet(null); setSigningDoc(doc); }} onClose={() => setSheet(null)} />}

        {toast && (
          <div className="toastIn" style={{ position: "absolute", top: 58, left: "50%", transform: "translateX(-50%)", zIndex: 90, display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", borderRadius: 14, background: "rgba(28,28,30,.95)", color: "#fff", fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.3)", maxWidth: "88%" }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#34c759", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" size={13} stroke={3} /></span>
            {toast}
          </div>
        )}
      </div>
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MobileApp />);
