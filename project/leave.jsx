// leave.jsx — Leave & Absence requests (desktop): type glyph, route stepper,
// request flow modal, "Мои заявления" screen, and request detail.

// ── Type tile ────────────────────────────────────────────────────────────────
function LeaveGlyph({ type, size = 44 }) {
  const t = LEAVE_TYPES[type];
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.27, flexShrink: 0,
      background: `color-mix(in srgb, ${t.tint} 15%, transparent)`, color: t.tint,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name={t.icon} size={Math.round(size * 0.54)} stroke={1.9} />
    </div>
  );
}

// ── Route stepper (horizontal, used on cards and in the flow preview) ─────────
const ROUTE_SHORT = ["Кадры", "Рук. отдела", "Зам.", "Директор", "Приказ"];

// state for stage i given current `stage` index + overall status
function routeState(i, stage, status) {
  if (status === "approved") return "done";
  if (status === "declined") return i < stage ? "done" : i === stage ? "declined" : "skip";
  return i < stage ? "done" : i === stage ? "current" : "pending";
}

function StepNode({ state, n }) {
  const base = { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "calc(12px * var(--s))", fontWeight: 700, position: "relative", zIndex: 1 };
  if (state === "done")
    return <div style={{ ...base, background: "#34c759", color: "#fff" }}><Icon name="check" size={15} stroke={3} /></div>;
  if (state === "declined")
    return <div style={{ ...base, background: "#ff3b30", color: "#fff" }}><Icon name="x" size={14} stroke={3} /></div>;
  if (state === "current")
    return <div style={{ ...base, background: "var(--surface)", border: "2px solid var(--accent)", color: "var(--accent)" }}>
      <span className="fieldPulse" style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)" }} />
    </div>;
  return <div style={{ ...base, background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text-3)" }}>{n}</div>;
}

function RouteStepper({ stage, status, showLabels = true, preview = false }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      {LEAVE_ROUTE.map((st, i) => {
        const state = preview ? "pending" : routeState(i, stage, status);
        const lineDoneL = i <= stage && (status === "done" || status === "approved" || (status !== "declined" && i <= stage)) ;
        const leftDone = i > 0 && (status === "approved" || (i <= stage && status !== "declined") || (status === "declined" && i <= stage));
        const rightDone = (status === "approved") || (status !== "declined" && i < stage);
        const lineCol = (filled) => filled && !preview ? "#34c759" : "var(--hairline)";
        return (
          <div key={st.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1, height: 2, background: i === 0 ? "transparent" : lineCol(leftDone), borderRadius: 2 }} />
              <StepNode state={state} n={i + 1} />
              <div style={{ flex: 1, height: 2, background: i === LEAVE_ROUTE.length - 1 ? "transparent" : lineCol(rightDone), borderRadius: 2 }} />
            </div>
            {showLabels && (
              <span style={{
                marginTop: 7, fontSize: "calc(11.5px * var(--s))", textAlign: "center", lineHeight: 1.2,
                fontWeight: state === "current" ? 700 : 500,
                color: state === "current" ? "var(--accent)" : state === "declined" ? "#c01a12" : state === "done" ? "var(--text-2)" : "var(--text-3)",
              }}>{ROUTE_SHORT[i]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Status pill for a request ────────────────────────────────────────────────
function LeaveStatus({ req, big }) {
  const stageName = LEAVE_ROUTE[req.stage] ? LEAVE_ROUTE[req.stage].label : "";
  const map = {
    in_progress: { label: `На этапе: ${stageName}`, color: "#0a6cff", bg: "rgba(10,132,255,.13)" },
    approved:    { label: req.orderNo ? `Одобрено · приказ ${req.orderNo}` : "Одобрено", color: "#1d7a36", bg: "rgba(52,199,89,.16)" },
    declined:    { label: "Отклонено", color: "#c01a12", bg: "rgba(255,59,48,.14)" },
  };
  const s = map[req.status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: big ? "6px 13px" : "4px 11px", borderRadius: 999, background: s.bg, color: s.color, fontSize: big ? "calc(14px * var(--s))" : "calc(13px * var(--s))", fontWeight: 600, whiteSpace: "nowrap" }}>
      {req.status === "approved" && <Icon name="checkCircle" size={big ? 17 : 15} />}
      {req.status === "declined" && <Icon name="x" size={big ? 16 : 14} stroke={2.6} />}
      {req.status === "in_progress" && <span className="fieldPulse" style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />}
      {s.label}
    </span>
  );
}

// ════════════════ THE REQUEST FLOW (modal) ════════════════
function LeaveFlow({ onClose, onSubmit }) {
  const [step, setStep] = React.useState(1);
  const [type, setType] = React.useState(null);
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [note, setNote] = React.useState("");

  const days = daysBetween(start, end);
  const remaining = LEAVE_BALANCE.total - LEAVE_BALANCE.used;
  const isAnnual = type === "annual";
  const overdrawn = isAnnual && days > remaining;
  const canSubmit = type && start && end && days > 0 && !overdrawn;

  const submit = () => {
    onSubmit({ id: "REQ-" + (119 + Math.floor(Math.random() * 60)), type, start, end, note,
      submitted: "Только что", stage: 0, status: "in_progress", times: ["Только что", null, null, null, null] });
    setStep(3);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,20,22,.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="modalIn" style={{ width: "min(680px, 100%)", maxHeight: "92vh", background: "var(--surface)", borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--accent-weak)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="calendar" size={21} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "calc(18px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Заявление на отсутствие</div>
            <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)" }}>{step === 1 ? "Шаг 1 — тип заявления" : step === 2 ? "Шаг 2 — даты и маршрут" : "Готово"}</div>
          </div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* STEP 1 — choose type */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {LEAVE_GROUPS.map((group) => (
                <div key={group}>
                  <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 11 }}>{group}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {Object.values(LEAVE_TYPES).filter((lt) => lt.group === group).map((lt) => {
                      const on = type === lt.key;
                      return (
                        <button key={lt.key} onClick={() => setType(lt.key)} style={{
                          display: "flex", alignItems: "center", gap: 13, padding: "14px 15px", borderRadius: 15, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                          border: on ? "2px solid var(--accent)" : "2px solid transparent",
                          background: on ? "var(--accent-weak)" : "var(--surface-2)",
                        }}>
                          <LeaveGlyph type={lt.key} size={42} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "calc(15px * var(--s))", fontWeight: 600, color: "var(--text)", lineHeight: 1.25 }}>{lt.short}</div>
                            <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)", marginTop: 2 }}>{lt.hint}</div>
                          </div>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", border: on ? "none" : "2px solid var(--border)", background: on ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {on && <Icon name="check" size={14} stroke={3} style={{ color: "#fff" }} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2 — dates + route preview */}
          {step === 2 && type && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* chosen type recap */}
              <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
                <LeaveGlyph type={type} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "calc(15px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{LEAVE_TYPES[type].label}</div>
                  <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--text-3)" }}>{LEAVE_TYPES[type].hint}</div>
                </div>
                <button onClick={() => setStep(1)} style={{ border: "none", background: "transparent", color: "var(--accent)", fontFamily: "inherit", fontSize: "calc(13.5px * var(--s))", fontWeight: 600, cursor: "pointer" }}>Изменить</button>
              </div>

              {/* annual balance */}
              {isAnnual && (
                <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--surface)", boxShadow: "0 0 0 .5px var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                    <span style={{ fontSize: "calc(13.5px * var(--s))", fontWeight: 600, color: "var(--text)" }}>Остаток ежегодного отпуска</span>
                    <span style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)" }}><b style={{ color: "var(--text)", fontSize: "calc(16px * var(--s))" }}>{remaining}</b> из {LEAVE_BALANCE.total} дн.</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${(LEAVE_BALANCE.used / LEAVE_BALANCE.total) * 100}%`, background: "var(--border)" }} />
                    <div style={{ width: `${(Math.min(days, remaining) / LEAVE_BALANCE.total) * 100}%`, background: overdrawn ? "#ff3b30" : "#34c759" }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: "calc(12.5px * var(--s))", color: overdrawn ? "#c01a12" : "var(--text-3)" }}>
                    {days > 0 ? (overdrawn ? `Запрошено ${daysLabel(days)} — превышает остаток` : `Запрошено ${daysLabel(days)} · останется ${remaining - days} дн.`) : "Выберите даты ниже"}
                  </div>
                </div>
              )}

              {/* date range */}
              <div>
                <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 9 }}>Период отсутствия</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <label style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)", marginBottom: 5 }}>Начало</span>
                    <input type="date" value={start} min="2026-06-10" onChange={(e) => { setStart(e.target.value); if (end && e.target.value > end) setEnd(e.target.value); }}
                      style={dateInputStyle} />
                  </label>
                  <Icon name="chevR" size={18} style={{ color: "var(--text-3)", marginTop: 18, flexShrink: 0 }} />
                  <label style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)", marginBottom: 5 }}>Окончание</span>
                    <input type="date" value={end} min={start || "2026-06-10"} onChange={(e) => setEnd(e.target.value)}
                      style={dateInputStyle} />
                  </label>
                </div>
                {days > 0 && (
                  <div style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999, background: "var(--accent-weak)", color: "var(--accent)", fontSize: "calc(13.5px * var(--s))", fontWeight: 600 }}>
                    <Icon name="calCheck" size={16} /> {fmtRange(start, end)} · {daysLabel(days)}
                  </div>
                )}
              </div>

              {/* comment */}
              <div>
                <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 9 }}>Причина / комментарий (необязательно)</div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Например: семейные обстоятельства"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 13, border: "1px solid var(--border)", fontFamily: "inherit", fontSize: "calc(15px * var(--s))", color: "var(--text)", resize: "none", outline: "none", background: "var(--surface)", boxSizing: "border-box" }} />
              </div>

              {/* WORKFLOW NOTICE — route preview before submitting */}
              <div style={{ borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--hairline)", padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <Icon name="route" size={19} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: "calc(14.5px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Маршрут согласования</span>
                </div>
                <RouteStepper preview />
                <p style={{ margin: "14px 0 0", fontSize: "calc(13px * var(--s))", color: "var(--text-3)", lineHeight: 1.5, textAlign: "center" }}>
                  После отправки документ пройдет по такому пути
                </p>

              </div>
            </div>
          )}

          {/* STEP 3 — success */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "26px 20px 10px" }}>
              <div className="popIn" style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(52,199,89,.14)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#34c759", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" size={32} stroke={2.6} style={{ color: "#fff" }} />
                </div>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "calc(23px * var(--s))", fontWeight: 700, color: "var(--text)" }}>Заявление отправлено</h2>
              <p style={{ margin: "0 auto 22px", maxWidth: 400, fontSize: "calc(15.5px * var(--s))", color: "var(--text-2)", lineHeight: 1.5 }}>
                Заявление поступило в <b style={{ color: "var(--text)" }}>Отдел кадров</b>. Следите за маршрутом в разделе «Мои заявления».
              </p>
              <div style={{ maxWidth: 420, margin: "0 auto" }}><RouteStepper stage={0} status="in_progress" /></div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--hairline)" }}>
          {step === 1 && <><span style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-3)" }}>{type ? LEAVE_TYPES[type].short : "Тип не выбран"}</span>
            <Button kind="primary" size="md" disabled={!type} onClick={() => setStep(2)}>Далее</Button></>}
          {step === 2 && <><Button kind="ghost" size="md" icon="back" onClick={() => setStep(1)}>Назад</Button>
            <Button kind="primary" size="md" icon="send" disabled={!canSubmit} onClick={submit}>Отправить на согласование</Button></>}
          {step === 3 && <><span /><Button kind="primary" size="md" onClick={onClose}>Готово</Button></>}
        </div>
      </div>
    </div>
  );
}

const dateInputStyle = {
  width: "100%", height: "calc(48px * var(--s))", padding: "0 14px", borderRadius: 13,
  border: "1px solid var(--border)", fontFamily: "inherit", fontSize: "calc(15px * var(--s))",
  color: "var(--text)", background: "var(--surface)", outline: "none", boxSizing: "border-box",
  colorScheme: "light",
};

// ════════════════ MY REQUESTS SCREEN ════════════════
function MyRequests({ requests, onNew }) {
  const [open, setOpen] = React.useState(null);
  const all = requests;
  const remaining = LEAVE_BALANCE.total - LEAVE_BALANCE.used;
  const active = all.filter((r) => r.status === "in_progress").length;

  return (
    <div>
      <PageHeader title="Мои заявления" sub="Заявления на отпуск и отсутствие — статус по маршруту">
        <Button kind="primary" size="md" icon="plus" onClick={onNew}>Подать заявление</Button>
      </PageHeader>

      {/* summary strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <SummaryCard icon="sun" tint="#34c759" big={`${remaining}`} unit="дн." label="Ежегодный отпуск" sub={`Использовано ${LEAVE_BALANCE.used} из ${LEAVE_BALANCE.total} дней`} />
        <SummaryCard icon="route" tint="#0a84ff" big={`${active}`} unit="" label="На согласовании" sub="Заявления в маршруте" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {all.map((req) => {
          const lt = LEAVE_TYPES[req.type];
          return (
            <button key={req.id} onClick={() => setOpen(req)} className="cardItem" style={{
              textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: "none", padding: "18px 22px",
              background: "var(--surface)", borderRadius: 18, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)",
              display: "flex", flexDirection: "column", gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <LeaveGlyph type={req.type} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "calc(17px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{lt.label}</div>
                  <div style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-2)", marginTop: 2 }}>{fmtRange(req.start, req.end)} · {daysLabel(daysBetween(req.start, req.end))} · {req.id}</div>
                </div>
                <LeaveStatus req={req} />
              </div>
              <div style={{ padding: "2px 4px 0" }}>
                <RouteStepper stage={req.stage} status={req.status} />
              </div>
            </button>
          );
        })}
      </div>

      {open && <RequestDetail req={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function SummaryCard({ icon, tint, big, unit, label, sub }) {
  return (
    <div style={{ flex: "1 1 240px", display: "flex", alignItems: "center", gap: 15, padding: "16px 20px", background: "var(--surface)", borderRadius: 18, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)" }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `color-mix(in srgb, ${tint} 14%, transparent)`, color: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={26} stroke={1.9} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, lineHeight: 1.1 }}>
          <span style={{ fontSize: "calc(28px * var(--s))", fontWeight: 700, color: "var(--text)", letterSpacing: "-.02em" }}>{big}</span>
          {unit && <span style={{ fontSize: "calc(15px * var(--s))", color: "var(--text-2)", fontWeight: 500 }}>{unit}</span>}
        </div>
        <div style={{ fontSize: "calc(14.5px * var(--s))", fontWeight: 600, color: "var(--text)", marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)", marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

// ════════════════ REQUEST DETAIL (vertical timeline) ════════════════
function RequestDetail({ req, onClose }) {
  const lt = LEAVE_TYPES[req.type];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,20,22,.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="modalIn" style={{ width: "min(640px, 100%)", maxHeight: "92vh", background: "var(--surface)", borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
          <LeaveGlyph type={req.type} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "calc(18px * var(--s))", fontWeight: 700, color: "var(--text)" }}>{lt.label}</div>
            <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)" }}>{fmtRange(req.start, req.end)} · {daysLabel(daysBetween(req.start, req.end))} · {req.id}</div>
          </div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "22px 24px 28px" }}>
          <div style={{ marginBottom: 22 }}><LeaveStatus req={req} big /></div>

          {req.note && (
            <div style={{ marginBottom: 22, padding: "13px 16px", borderRadius: 13, background: "var(--surface-2)", fontSize: "calc(14px * var(--s))", color: "var(--text-2)", lineHeight: 1.5 }}>
              <span style={{ color: "var(--text-3)", fontWeight: 600 }}>Комментарий: </span>{req.note}
            </div>
          )}

          <div style={{ fontSize: "calc(13px * var(--s))", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>Маршрут согласования</div>

          {/* vertical timeline */}
          <div>
            {LEAVE_ROUTE.map((st, i) => {
              const state = routeState(i, req.stage, req.status);
              const last = i === LEAVE_ROUTE.length - 1;
              const lineCol = (state === "done") ? "#34c759" : "var(--hairline)";
              return (
                <div key={st.key} style={{ display: "flex", gap: 15 }}>
                  {/* node + connector column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <StepNode state={state} n={i + 1} />
                    {!last && <div style={{ width: 2, flex: 1, minHeight: 34, background: lineCol, borderRadius: 2 }} />}
                  </div>
                  {/* content */}
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: "calc(15.5px * var(--s))", fontWeight: 600, color: state === "pending" || state === "skip" ? "var(--text-3)" : "var(--text)" }}>{st.label}</span>
                      {req.times[i] && <span style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)", whiteSpace: "nowrap" }}>{req.times[i]}</span>}
                    </div>
                    <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)", marginTop: 1 }}>{st.task}</div>
                    {/* approver + state line */}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 9 }}>
                      <Avatar person={st.person} size={26} />
                      <span style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)" }}>{st.person.name}</span>
                      {state === "current" && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "calc(13px * var(--s))", fontWeight: 600, color: "var(--accent)" }}><span className="fieldPulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} /> На рассмотрении</span>}
                      {state === "done" && <Icon name="check" size={16} stroke={2.6} style={{ marginLeft: "auto", color: "#34c759" }} />}
                      {state === "declined" && <span style={{ marginLeft: "auto", fontSize: "calc(13px * var(--s))", fontWeight: 600, color: "#c01a12" }}>Отклонил</span>}
                    </div>
                    {state === "declined" && req.declineNote && (
                      <div style={{ marginTop: 10, padding: "11px 14px", borderRadius: 12, background: "rgba(255,59,48,.08)", border: "1px solid rgba(255,59,48,.2)", fontSize: "calc(13.5px * var(--s))", color: "#a51810", lineHeight: 1.5 }}>{req.declineNote}</div>
                    )}
                    {last && state === "done" && req.orderNo && (
                      <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 10, background: "rgba(52,199,89,.12)", color: "#1d7a36", fontSize: "calc(13.5px * var(--s))", fontWeight: 600 }}>
                        <Icon name="stamp" size={16} /> Приказ {req.orderNo} издан
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  LeaveGlyph, RouteStepper, StepNode, routeState, LeaveStatus,
  LeaveFlow, MyRequests, SummaryCard, RequestDetail, ROUTE_SHORT,
});
