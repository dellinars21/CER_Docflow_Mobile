// signing.jsx — the signature placement experience + realistic PDF page renderer.

const clamp = (n, lo = 4, hi = 96) => Math.max(lo, Math.min(hi, n));

// ── Faux PDF page bodies, per document type ──────────────────────────────────
function Bar({ w = "100%", h = 8, dim = 1 }) {
  return <i style={{ display: "block", height: h, width: w, borderRadius: 3, background: `rgba(0,0,0,${0.09 * dim})` }} />;
}
function Line({ children, strong }) {
  return <p style={{ margin: 0, fontSize: "calc(15px * var(--s))", lineHeight: 1.7, color: strong ? "#1d1d1f" : "#3a3a3c", fontWeight: strong ? 600 : 400 }}>{children}</p>;
}

function DocBody({ doc }) {
  const t = DOC_TYPES[doc.type];
  if (doc.type === "leave") {
    return (
      <>
        <h3 style={hStyle}>ЗАЯВЛЕНИЕ</h3>
        <Line>Прошу предоставить мне ежегодный оплачиваемый отпуск продолжительностью 14 (четырнадцать) календарных дней.</Line>
        <div style={{ height: 10 }} />
        <Line strong>Период: с 15 июня 2026 г. по 28 июня 2026 г.</Line>
        <div style={{ height: 18 }} />
        <Bar w="94%" /><div style={{ height: 9 }} /><Bar w="88%" /><div style={{ height: 9 }} /><Bar w="64%" />
        <div style={{ height: 22 }} />
        <Line>Заявитель: Гасанов С. А., инженер-буровик</Line>
      </>
    );
  }
  if (doc.type === "utility") {
    return (
      <>
        <h3 style={hStyle}>СЧЁТ НА ОПЛАТУ № 03-2026</h3>
        <Line>Поставщик: АО «Мангистауэнерго»</Line>
        <Line>Период поставки: март 2026 г.</Line>
        <div style={{ height: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "11px 20px", fontSize: "calc(14.5px * var(--s))" }}>
          <span>Потребление, кВт·ч</span><span style={{ textAlign: "right", fontWeight: 600 }}>42 180</span>
          <span>Тариф, ₸/кВт·ч</span><span style={{ textAlign: "right", fontWeight: 600 }}>0,085</span>
          <span style={{ borderTop: "1px solid rgba(0,0,0,.12)", paddingTop: 11 }}>Итого к оплате</span>
          <span style={{ textAlign: "right", fontWeight: 700, borderTop: "1px solid rgba(0,0,0,.12)", paddingTop: 11 }}>3 585,30 ₸</span>
        </div>
        <div style={{ height: 18 }} />
        <Line>Назначение: электроэнергия, производственная база № 2.</Line>
      </>
    );
  }
  if (doc.type === "purchase") {
    return (
      <>
        <h3 style={hStyle}>ЗАКАЗ НА ПОКУПКУ № 2026-0417</h3>
        <Line>Контрагент: ООО «ТехБурСнаб»</Line>
        <div style={{ height: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "10px 18px", fontSize: "calc(14.5px * var(--s))" }}>
          <span style={{ fontWeight: 600, color: "#6e6e73" }}>Наименование</span><span style={{ fontWeight: 600, color: "#6e6e73", textAlign: "right" }}>Кол-во</span><span style={{ fontWeight: 600, color: "#6e6e73", textAlign: "right" }}>Сумма</span>
          <span>Долото PDC 215,9 мм</span><span style={{ textAlign: "right" }}>6 шт.</span><span style={{ textAlign: "right" }}>74 400 ₸</span>
          <span>Переводник П-117</span><span style={{ textAlign: "right" }}>4 шт.</span><span style={{ textAlign: "right" }}>5 200 ₸</span>
          <span style={{ borderTop: "1px solid rgba(0,0,0,.12)", paddingTop: 10, fontWeight: 700 }}>Итого</span><span style={{ borderTop: "1px solid rgba(0,0,0,.12)", paddingTop: 10 }} /><span style={{ textAlign: "right", borderTop: "1px solid rgba(0,0,0,.12)", paddingTop: 10, fontWeight: 700 }}>79 600 ₸</span>
        </div>
      </>
    );
  }
  // proposal
  return (
    <>
      <h3 style={hStyle}>КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h3>
      <Line>От: ООО «Каспий-Сервис»</Line>
      <Line>Предмет: транспортно-логистическое обслуживание объектов на 2026 г.</Line>
      <div style={{ height: 16 }} />
      <Bar w="96%" /><div style={{ height: 9 }} /><Bar w="91%" /><div style={{ height: 9 }} /><Bar w="93%" /><div style={{ height: 9 }} /><Bar w="72%" />
      <div style={{ height: 16 }} />
      <Line strong>Стоимость контракта: 248 000 ₸ / год.</Line>
      <Line>Срок действия предложения — 30 дней.</Line>
    </>
  );
}
const hStyle = { margin: "0 0 14px", fontSize: "calc(19px * var(--s))", fontWeight: 700, letterSpacing: ".02em", color: "#1d1d1f" };

// ── A single PDF page sheet ──────────────────────────────────────────────────
const PageSheet = React.forwardRef(function PageSheet({ doc, field, children, onArmedMove, onArmedClick, armed }, ref) {
  const t = DOC_TYPES[doc.type];
  return (
    <div ref={ref}
      onMouseMove={armed ? onArmedMove : undefined}
      onClick={armed ? onArmedClick : undefined}
      style={{
        position: "relative", width: "100%", maxWidth: 640, aspectRatio: "1 / 1.414",
        background: "#fff", borderRadius: 4, margin: "0 auto",
        boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 12px 40px rgba(0,0,0,.14), 0 0 0 .5px rgba(0,0,0,.05)",
        cursor: armed ? "crosshair" : "default", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", inset: 0, padding: "8.5% 9%", display: "flex", flexDirection: "column" }}>
        {/* letterhead */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "2px solid #1d1d1f", marginBottom: 22 }}>
          <img src="assets/cer-logo.png" alt="CER" style={{ height: "calc(30px * var(--s))", width: "auto", display: "block" }} />
          <div style={{ lineHeight: 1.25, marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: "calc(13px * var(--s))", color: "#1d1d1f" }}>Caspian Engineering &amp; Research</div>
            <div style={{ fontSize: "calc(12px * var(--s))", color: "#8e8e93" }}>г. Актау, 17 мкрн., д. 38 · {doc.id}</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <DocBody doc={doc} />
        </div>
        {/* signature row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 18, paddingTop: 8 }}>
          <div>
            <div style={{ width: 130, borderBottom: "1px solid #1d1d1f", marginBottom: 5 }} />
            <span style={{ fontSize: "calc(12px * var(--s))", color: "#8e8e93" }}>Исполнитель</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ width: 150, borderBottom: "1px solid #1d1d1f", marginBottom: 5 }} />
            <span style={{ fontSize: "calc(12px * var(--s))", color: "#8e8e93" }}>{field.label}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
});

// ── The signature stamp (saved director signature, placeholder image) ────────
function SignatureMark({ small, applied, signer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
      <span style={{ fontFamily: "'Caveat', cursive", fontSize: small ? "calc(30px * var(--s))" : "calc(40px * var(--s))", color: "#0b3b8c", transform: "rotate(-3deg)", whiteSpace: "nowrap" }}>А. Акботин</span>
      {applied && <span style={{ fontSize: "calc(9.5px * var(--s))", color: "#6e6e73", marginTop: 4, letterSpacing: ".02em" }}>Подписано · 04.06.2026</span>}
    </div>
  );
}

// ── Main signing view ────────────────────────────────────────────────────────
function SignDocument({ doc, onBack, onSigned }) {
  const t = DOC_TYPES[doc.type];
  const field = t.field;
  const p = senderOf(doc);
  const pageRefs = React.useRef([]);
  const canvasRef = React.useRef(null);
  const [placedByPage, setPlacedByPage] = React.useState({}); // { [page]: {x, y} } — one signature per page
  const [currentPage, setCurrentPage] = React.useState(0);    // page currently centered in the viewport
  const [armed, setArmed] = React.useState(false);
  const [ghost, setGhost] = React.useState(null);   // {page, x, y} crosshair preview
  const [drag, setDrag] = React.useState(null);     // {x, y} client coords (dragging stamp)
  const [phase, setPhase] = React.useState("place"); // place | applying | done

  const signedPages = Object.keys(placedByPage).map(Number).sort((a, b) => a - b);
  const currentSigned = placedByPage[currentPage] != null;

  const pageAtPoint = (cx, cy) => {
    for (let i = 0; i < pageRefs.current.length; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return { page: i, rect: r };
    }
    return null;
  };

  // Detect which page is currently centered in the scroll viewport.
  const detectCurrentPage = React.useCallback(() => {
    const cont = canvasRef.current;
    if (!cont) return;
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

  React.useEffect(() => {
    const cont = canvasRef.current;
    if (!cont) return;
    detectCurrentPage();
    cont.addEventListener("scroll", detectCurrentPage, { passive: true });
    window.addEventListener("resize", detectCurrentPage);
    return () => { cont.removeEventListener("scroll", detectCurrentPage); window.removeEventListener("resize", detectCurrentPage); };
  }, [detectCurrentPage]);

  const placeOnPage = (page, x, y) => setPlacedByPage((prev) => ({ ...prev, [page]: { x: clamp(x), y: clamp(y) } }));
  const removeFromPage = (page) => setPlacedByPage((prev) => { const n = { ...prev }; delete n[page]; return n; });

  // Drag the stamp from the panel onto a page.
  const startStampDrag = (e) => {
    e.preventDefault();
    setArmed(false);
    setDrag({ x: e.clientX, y: e.clientY });
    const move = (ev) => setDrag({ x: ev.clientX, y: ev.clientY });
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDrag(null);
      const hit = pageAtPoint(ev.clientX, ev.clientY);
      if (hit) placeOnPage(hit.page, ((ev.clientX - hit.rect.left) / hit.rect.width) * 100, ((ev.clientY - hit.rect.top) / hit.rect.height) * 100);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Reposition an already-placed signature within its own page.
  const startReposition = (page) => (e) => {
    e.preventDefault(); e.stopPropagation();
    const el = pageRefs.current[page];
    if (!el) return;
    const move = (ev) => {
      const r = el.getBoundingClientRect();
      placeOnPage(page, ((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100);
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const armedMove = (pageIdx) => (e) => {
    const r = pageRefs.current[pageIdx].getBoundingClientRect();
    setGhost({ page: pageIdx, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const armedClick = (pageIdx) => (e) => {
    const r = pageRefs.current[pageIdx].getBoundingClientRect();
    placeOnPage(pageIdx, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    setArmed(false); setGhost(null);
  };

  // Auto-place the signature in the recommended field on the CURRENT page —
  // but only if that page doesn't already carry a signature.
  const signCurrentPage = () => {
    if (placedByPage[currentPage] != null) return; // already exists on this page
    placeOnPage(currentPage, field.x, field.y);
    setArmed(false);
  };

  const apply = () => {
    setPhase("applying");
    setTimeout(() => setPhase("done"), 850);
  };

  const pages = Array.from({ length: doc.pages });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)" }}>
      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", background: "var(--surface)", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
        <Button kind="ghost" size="sm" icon="back" onClick={onBack} style={{ marginLeft: -8 }}>Очередь</Button>
        <div style={{ width: 1, height: 26, background: "var(--hairline)" }} />
        <DocGlyph type={doc.type} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "calc(16px * var(--s))", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{doc.title}</div>
          <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--text-2)" }}>{doc.id} · {doc.pages} стр. · {doc.size}</div>
        </div>
        <div style={{ flex: 1 }} />
        <Button kind="secondary" size="sm" icon="download">Скачать</Button>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* document canvas */}
        <div ref={canvasRef} style={{ flex: 1, overflow: "auto", padding: "32px clamp(20px, 5vw, 72px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 640, margin: "0 auto" }}>
            {pages.map((_, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{ fontSize: "calc(12.5px * var(--s))", fontWeight: 600, marginBottom: 8, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: i === currentPage ? "var(--accent)" : "var(--text-3)" }}>
                  Страница {i + 1} из {doc.pages}
                  {placedByPage[i] && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1d7a36" }}><Icon name="checkCircle" size={14} /> подписана</span>}
                </div>
                <PageSheet ref={(el) => (pageRefs.current[i] = el)} doc={doc} field={field}
                  armed={armed} onArmedMove={armedMove(i)} onArmedClick={armedClick(i)}>
                  {/* recommended field highlight on the current, not-yet-signed page */}
                  {i === currentPage && !placedByPage[i] && phase === "place" && (
                    <div style={{ position: "absolute", left: field.x + "%", top: field.y + "%", width: field.w + "%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
                      <div className="fieldPulse" style={{ border: "2px dashed var(--accent)", borderRadius: 8, height: "calc(46px * var(--s))", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-weak)" }}>
                        <span style={{ fontSize: "calc(12px * var(--s))", fontWeight: 700, color: "var(--accent)" }}>Рекомендуемое поле</span>
                      </div>
                    </div>
                  )}
                  {/* armed crosshair ghost */}
                  {armed && ghost && ghost.page === i && (
                    <div style={{ position: "absolute", left: ghost.x + "%", top: ghost.y + "%", transform: "translate(-50%, -50%)", opacity: 0.55, pointerEvents: "none" }}>
                      <SignatureMark small />
                    </div>
                  )}
                  {/* placed signature for this page */}
                  {placedByPage[i] && (
                    <div onMouseDown={phase === "place" ? startReposition(i) : undefined}
                      style={{ position: "absolute", left: placedByPage[i].x + "%", top: placedByPage[i].y + "%", transform: "translate(-50%, -50%)", cursor: phase === "place" ? "grab" : "default" }}>
                      <div style={{ position: "relative", padding: "8px 14px", borderRadius: 8, border: phase === "place" ? "1.5px solid var(--accent)" : "1.5px solid transparent", background: phase === "place" ? "rgba(255,255,255,.5)" : "transparent" }}>
                        <SignatureMark applied={phase === "done"} />
                        {phase === "place" && (
                          <button onClick={(e) => { e.stopPropagation(); removeFromPage(i); }}
                            style={{ position: "absolute", top: -12, right: -12, width: 26, height: 26, borderRadius: "50%", border: "none", background: "#1d1d1f", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}>
                            <Icon name="x" size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </PageSheet>
              </div>
            ))}
          </div>
        </div>

        {/* right panel */}
        <aside style={{ width: 372, flexShrink: 0, background: "var(--surface)", borderLeft: "1px solid var(--hairline)", display: "flex", flexDirection: "column", overflow: "auto" }}>
          {phase === "done"
            ? <DonePanel doc={doc} sender={p} signedCount={signedPages.length} onBack={() => onSigned(doc, signedPages)} />
            : <PlacePanel {...{ doc, p, field, currentPage, currentSigned, signedPages, armed, setArmed, startStampDrag, signCurrentPage, apply, phase }} />}
        </aside>
      </div>

      {/* floating drag ghost */}
      {drag && (
        <div style={{ position: "fixed", left: drag.x, top: drag.y, transform: "translate(-50%, -50%) scale(1.05)", zIndex: 9999, pointerEvents: "none", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.25))" }}>
          <SignatureMark />
        </div>
      )}
    </div>
  );
}

// ── Right panel: placement controls ──────────────────────────────────────────
function PlacePanel({ doc, p, field, currentPage, currentSigned, signedPages, armed, setArmed, startStampDrag, signCurrentPage, apply, phase }) {
  const applying = phase === "applying";
  const count = signedPages.length;
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "calc(22px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Добавить подпись</h2>
      <p style={{ margin: "0 0 18px", fontSize: "calc(14.5px * var(--s))", color: "var(--text-2)", lineHeight: 1.5 }}>Документ от {p.name}, {p.dept}.</p>

      {/* current page indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--border)", marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "calc(12px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)" }}>Текущая страница</div>
          <div style={{ fontSize: "calc(20px * var(--s))", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{currentPage + 1} <span style={{ fontSize: "calc(14px * var(--s))", fontWeight: 500, color: "var(--text-3)" }}>из {doc.pages}</span></div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, fontSize: "calc(12.5px * var(--s))", fontWeight: 600, whiteSpace: "nowrap", background: currentSigned ? "rgba(52,199,89,.15)" : "rgba(120,120,128,.14)", color: currentSigned ? "#1d7a36" : "var(--text-3)" }}>
          {currentSigned ? <><Icon name="checkCircle" size={14} /> Подписана</> : "Не подписана"}
        </span>
      </div>

      {/* saved signature card / stamp */}
      <div style={{ fontSize: "calc(12.5px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>Ваша подпись</div>
      <div onPointerDown={startStampDrag} style={{
        border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", background: "var(--surface-2)",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", position: "relative",
        boxShadow: "0 1px 2px rgba(0,0,0,.03)", userSelect: "none",
      }}>
        <SignatureMark />
        <span style={{ position: "absolute", bottom: 7, right: 12, fontSize: "calc(11px * var(--s))", color: "var(--text-3)" }}>Сканированный образец</span>
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: "calc(13.5px * var(--s))", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 7 }}>
        <Icon name="pen" size={16} style={{ color: "var(--accent)" }} /> Перетащите подпись на любую страницу
      </p>

      {/* methods */}
      <div style={{ fontSize: "calc(12.5px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>Поставить автоматически</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button kind="secondary" size="md" icon={currentSigned ? "checkCircle" : "checkCircle"} full disabled={currentSigned} onClick={signCurrentPage}>
          {currentSigned ? `Стр. ${currentPage + 1} уже подписана` : `Подписать стр. ${currentPage + 1}`}
        </Button>
        <Button kind={armed ? "primary" : "secondary"} size="md" icon="pen" full onClick={() => setArmed((a) => !a)}>
          {armed ? "Нажмите на документ…" : "Нажать и поставить"}
        </Button>
      </div>

      <div style={{ flex: 1, minHeight: 18 }} />

      {/* status + apply */}
      <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 18, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, fontSize: "calc(14.5px * var(--s))" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: count ? "#34c759" : "#c7c7cc", flexShrink: 0 }} />
          <span style={{ color: count ? "var(--text)" : "var(--text-2)", fontWeight: count ? 600 : 400 }}>
            {count ? `Подписано ${count} из ${doc.pages} стр.` : "Подпись не размещена"}
          </span>
        </div>
        <Button kind="primary" size="lg" icon={applying ? null : "checkCircle"} full disabled={!count || applying} onClick={apply}>
          {applying ? "Применение…" : count > 1 ? `Применить подпись (${count} стр.)` : "Применить подпись"}
        </Button>
        <p style={{ margin: "12px 0 0", fontSize: "calc(13px * var(--s))", color: "var(--text-3)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <TelegramGlyph size={15} /> Уведомление придёт в Telegram
        </p>
      </div>
    </div>
  );
}

// ── Right panel: success ─────────────────────────────────────────────────────
function DonePanel({ doc, sender, signedCount, onBack }) {
  const pagesValue = (signedCount && signedCount > 0)
    ? `${signedCount} из ${doc.pages}`
    : `1 из ${doc.pages}`;
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, justifyContent: "center" }}>
      <div className="popIn" style={{ width: 92, height: 92, borderRadius: "50%", background: "rgba(52,199,89,.14)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#34c759", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(52,199,89,.4)" }}>
          <Icon name="check" size={36} stroke={2.6} style={{ color: "#fff" }} />
        </div>
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: "calc(24px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Документ подписан</h2>
      <p style={{ margin: "0 0 24px", fontSize: "calc(15.5px * var(--s))", color: "var(--text-2)", lineHeight: 1.5 }}>
        Подпись добавлена и сохранена на сервере.
      </p>
      <div style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--hairline)", borderRadius: 14, padding: 16, marginBottom: 14, textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
        <Row label="Документ" value={doc.id} />
        <Row label="Подписал" value="А. Акботин" />
        <Row label="Страниц" value={pagesValue} />
        <Row label="Дата" value="04.06.2026, 11:32" />
      </div>
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", borderRadius: 14, background: "rgba(34,158,217,.1)", marginBottom: 24 }}>
        <TelegramGlyph size={24} />
        <span style={{ fontSize: "calc(14px * var(--s))", color: "var(--text)", textAlign: "left", lineHeight: 1.4 }}>Уведомление отправлено в Telegram — {sender.name}</span>
      </div>
      <Button kind="primary" size="lg" full onClick={onBack}>Готово</Button>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: "calc(14.5px * var(--s))" }}>
      <span style={{ color: "var(--text-3)", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--text)", fontWeight: 600, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

Object.assign(window, { SignDocument, DocBody, PageSheet, SignatureMark, signClamp: clamp });
