// leave-mobile.jsx — Leave & Absence requests (mobile iOS):
// type glyph, route stepper, request sheet flow, "Заявления" screen + detail.
const { useState: lUseState } = React;

// ── Type tile ────────────────────────────────────────────────────────────────
function MLeaveGlyph({ type, size = 44 }) {
  const t = LEAVE_TYPES[type];
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.27, flexShrink: 0, background: `color-mix(in srgb, ${t.tint} 15%, transparent)`, color: t.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name={t.icon} size={Math.round(size * 0.54)} stroke={1.9} />
    </div>
  );
}

// ── Route stepper (shared logic) ─────────────────────────────────────────────
const MROUTE_SHORT = ["Кадры", "Рук.", "Зам.", "Дир.", "Приказ"];
function mRouteState(i, stage, status) {
  if (status === "approved") return "done";
  if (status === "declined") return i < stage ? "done" : i === stage ? "declined" : "skip";
  return i < stage ? "done" : i === stage ? "current" : "pending";
}
function MStepNode({ state, n, size = 24 }) {
  const base = { width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700 };
  if (state === "done") return <div style={{ ...base, background: "#34c759", color: "#fff" }}><Icon name="check" size={13} stroke={3} /></div>;
  if (state === "declined") return <div style={{ ...base, background: "#ff3b30", color: "#fff" }}><Icon name="x" size={12} stroke={3} /></div>;
  if (state === "current") return <div style={{ ...base, background: "var(--surface)", border: "2px solid var(--accent)" }}><span className="mFieldPulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} /></div>;
  return <div style={{ ...base, background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text-3)" }}>{n}</div>;
}
function MRouteStepper({ stage, status, showLabels = true, preview = false }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      {LEAVE_ROUTE.map((st, i) => {
        const state = preview ? "pending" : mRouteState(i, stage, status);
        const leftDone = i > 0 && (status === "approved" || (i <= stage && status !== "declined"));
        const rightDone = (status === "approved") || (status !== "declined" && i < stage);
        const lineCol = (f) => f && !preview ? "#34c759" : "var(--hairline)";
        return (
          <div key={st.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1, height: 2, background: i === 0 ? "transparent" : lineCol(leftDone), borderRadius: 2 }} />
              <MStepNode state={state} n={i + 1} />
              <div style={{ flex: 1, height: 2, background: i === LEAVE_ROUTE.length - 1 ? "transparent" : lineCol(rightDone), borderRadius: 2 }} />
            </div>
            {showLabels && (
              <span style={{ marginTop: 6, fontSize: 10.5, textAlign: "center", lineHeight: 1.15, fontWeight: state === "current" ? 700 : 500, color: state === "current" ? "var(--accent)" : state === "declined" ? "#c01a12" : state === "done" ? "var(--text-2)" : "var(--text-3)" }}>{MROUTE_SHORT[i]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Status pill ──────────────────────────────────────────────────────────────
function MLeaveStatus({ req }) {
  if (req.status === "approved") return <span style={mPill("#1d7a36", "rgba(52,199,89,.16)")}><Icon name="checkCircle" size={14} /> Одобрено</span>;
  if (req.status === "declined") return <span style={mPill("#c01a12", "rgba(255,59,48,.14)")}><Icon name="x" size={13} stroke={2.6} /> Отклонено</span>;
  return <span style={mPill("#0a6cff", "rgba(10,132,255,.13)")}><span className="mFieldPulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#0a6cff" }} /> В маршруте</span>;
}
function mPill(color, bg) {
  return { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: bg, color, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" };
}

// ════════════════ "ЗАЯВЛЕНИЯ" SCREEN ════════════════
function MRequests({ requests, onNew, onOpen }) {
  const remaining = LEAVE_BALANCE.total - LEAVE_BALANCE.used;
  const active = requests.filter((r) => r.status === "in_progress").length;
  return (
    <>
      <MHeader title="Заявления" sub="Отпуск и отсутствие" logo
        right={<button className="mTap" onClick={onNew} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 12px rgba(10,132,255,.35)" }}><Icon name="plus" size={24} stroke={2.4} /></button>} />
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 100px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* balance strip */}
        <div style={{ display: "flex", gap: 12 }}>
          <MMini icon="sun" tint="#34c759" big={remaining} unit="дн." label="Ежегодный отпуск" />
          <MMini icon="route" tint="#0a84ff" big={active} unit="" label="В маршруте" />
        </div>
        {requests.map((req) => {
          const lt = LEAVE_TYPES[req.type];
          return (
            <MCard key={req.id} onClick={() => onOpen(req)} style={{ padding: 15, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
                <MLeaveGlyph type={req.type} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lt.short}</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)" }}>{fmtRange(req.start, req.end)} · {daysLabel(daysBetween(req.start, req.end))}</div>
                </div>
                <MLeaveStatus req={req} />
              </div>
              <MRouteStepper stage={req.stage} status={req.status} />
            </MCard>
          );
        })}
      </div>
    </>
  );
}
function MMini({ icon, tint, big, unit, label }) {
  return (
    <MCard style={{ flex: 1, padding: 14, display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: `color-mix(in srgb, ${tint} 14%, transparent)`, color: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} size={22} stroke={1.9} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{big}<span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginLeft: 3 }}>{unit}</span></div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</div>
      </div>
    </MCard>
  );
}

// ════════════════ REQUEST SHEET FLOW ════════════════
function MLeaveSheet({ onClose, onSubmit }) {
  const [step, setStep] = lUseState(1);
  const [type, setType] = lUseState(null);
  const [start, setStart] = lUseState("");
  const [end, setEnd] = lUseState("");
  const [note, setNote] = lUseState("");

  const days = daysBetween(start, end);
  const remaining = LEAVE_BALANCE.total - LEAVE_BALANCE.used;
  const isAnnual = type === "annual";
  const overdrawn = isAnnual && days > remaining;
  const canSubmit = type && start && end && days > 0 && !overdrawn;

  const submit = () => {
    onSubmit({ id: "REQ-" + (119 + Math.floor(Math.random() * 60)), type, start, end, note, submitted: "Только что", stage: 0, status: "in_progress", times: ["Только что", null, null, null, null] });
    setStep(3);
  };

  const footer = step === 1
    ? <MBtn kind="primary" full disabled={!type} onClick={() => setStep(2)}>Далее</MBtn>
    : step === 2
      ? <div style={{ display: "flex", gap: 10 }}><MBtn kind="secondary" onClick={() => setStep(1)} style={{ flex: "0 0 auto" }}>Назад</MBtn><MBtn kind="primary" icon="send" full disabled={!canSubmit} onClick={submit}>На согласование</MBtn></div>
      : <MBtn kind="primary" full onClick={onClose}>Готово</MBtn>;

  const dateStyle = { width: "100%", height: 50, padding: "0 14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 15, fontFamily: "inherit", color: "var(--text)", outline: "none", boxSizing: "border-box", colorScheme: "light" };

  return (
    <MSheet onClose={onClose} title={step === 3 ? null : "Заявление на отсутствие"} footer={footer}>
      {/* STEP 1 — type */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 12 }}>
          {LEAVE_GROUPS.map((group) => (
            <div key={group}>
              <div style={MSecLabel}>{group}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.values(LEAVE_TYPES).filter((lt) => lt.group === group).map((lt) => {
                  const on = type === lt.key;
                  return (
                    <button key={lt.key} className="mTap" onClick={() => setType(lt.key)} style={{ display: "flex", alignItems: "center", gap: 13, padding: 13, borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%", border: on ? "2px solid var(--accent)" : "2px solid transparent", background: on ? "var(--accent-weak)" : "var(--surface)" }}>
                      <MLeaveGlyph type={lt.key} size={42} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--text)" }}>{lt.short}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{lt.hint}</div>
                      </div>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", border: on ? "none" : "2px solid var(--border)", background: on ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on && <Icon name="check" size={13} stroke={3} style={{ color: "#fff" }} />}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 — dates + route */}
      {step === 2 && type && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 12 }}>
          <MCard style={{ display: "flex", alignItems: "center", gap: 12, padding: 13 }}>
            <MLeaveGlyph type={type} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{LEAVE_TYPES[type].short}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{LEAVE_TYPES[type].hint}</div>
            </div>
            <button onClick={() => setStep(1)} style={{ border: "none", background: "transparent", color: "var(--accent)", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Изменить</button>
          </MCard>

          {isAnnual && (
            <MCard style={{ padding: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Остаток отпуска</span>
                <span style={{ fontSize: 14, color: "var(--text-2)" }}><b style={{ color: "var(--text)", fontSize: 16 }}>{remaining}</b> из {LEAVE_BALANCE.total} дн.</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${(LEAVE_BALANCE.used / LEAVE_BALANCE.total) * 100}%`, background: "var(--border)" }} />
                <div style={{ width: `${(Math.min(days, remaining) / LEAVE_BALANCE.total) * 100}%`, background: overdrawn ? "#ff3b30" : "#34c759" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, color: overdrawn ? "#c01a12" : "var(--text-3)" }}>
                {days > 0 ? (overdrawn ? `Запрошено ${daysLabel(days)} — превышает остаток` : `Запрошено ${daysLabel(days)} · останется ${remaining - days} дн.`) : "Выберите даты ниже"}
              </div>
            </MCard>
          )}

          <div>
            <div style={MSecLabel}>Период отсутствия</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <label style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 5 }}>Начало</span>
                <input type="date" value={start} min="2026-06-10" onChange={(e) => { setStart(e.target.value); if (end && e.target.value > end) setEnd(e.target.value); }} style={dateStyle} />
              </label>
              <label style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 5 }}>Окончание</span>
                <input type="date" value={end} min={start || "2026-06-10"} onChange={(e) => setEnd(e.target.value)} style={dateStyle} />
              </label>
            </div>
            {days > 0 && (
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, background: "var(--accent-weak)", color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>
                <Icon name="calCheck" size={15} /> {fmtRange(start, end)} · {daysLabel(days)}
              </div>
            )}
          </div>

          <div>
            <div style={MSecLabel}>Причина (необязательно)</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Например: семейные обстоятельства"
              style={{ width: "100%", padding: "13px 15px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 15, fontFamily: "inherit", color: "var(--text)", resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
          </div>

          {/* route notice */}
          <MCard style={{ padding: 16, background: "var(--surface-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
              <Icon name="route" size={18} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>Маршрут согласования</span>
            </div>
            <MRouteStepper preview />
            <p style={{ margin: "14px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
              После отправки: <b style={{ color: "var(--text)" }}>Отдел кадров → Руководитель отдела → Зам. по проектированию → Директор → Издание приказа</b>. На каждом этапе согласующий получит уведомление.
            </p>
          </MCard>
        </div>
      )}

      {/* STEP 3 — success */}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "18px 6px 24px" }}>
          <div className="popIn" style={{ width: 72, height: 72, borderRadius: "50%", background: "#34c759", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Icon name="check" size={38} stroke={2.6} style={{ color: "#fff" }} /></div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Заявление отправлено</h2>
          <p style={{ margin: "0 auto 20px", maxWidth: 290, fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.5 }}>Поступило в <b style={{ color: "var(--text)" }}>Отдел кадров</b>. Следите за маршрутом во вкладке «Заявления».</p>
          <div style={{ padding: "0 6px" }}><MRouteStepper stage={0} status="in_progress" /></div>
        </div>
      )}
    </MSheet>
  );
}

// ════════════════ REQUEST DETAIL (full screen) ════════════════
function MRequestDetail({ req, onClose }) {
  const lt = LEAVE_TYPES[req.type];
  return (
    <div className="fadeIn" style={{ position: "absolute", inset: 0, zIndex: 90, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ paddingTop: "max(50px, calc(var(--sat) + 12px))", paddingBottom: 12, paddingLeft: 12, paddingRight: 16, display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
        <button className="mTap" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 2, border: "none", background: "transparent", color: "var(--accent)", fontFamily: "inherit", fontSize: 17, fontWeight: 500, cursor: "pointer", padding: 4 }}>
          <Icon name="chevR" size={22} style={{ transform: "rotate(180deg)" }} /> Назад
        </button>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lt.short}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{req.id}</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "18px 18px 40px" }}>
        <MCard style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 14 }}>
            <MLeaveGlyph type={req.type} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16.5, fontWeight: 600, color: "var(--text)" }}>{lt.label}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)" }}>{fmtRange(req.start, req.end)} · {daysLabel(daysBetween(req.start, req.end))}</div>
            </div>
          </div>
          <MLeaveStatus req={req} />
          {req.orderNo && req.status === "approved" && <span style={{ marginLeft: 8, ...mPill("#1d7a36", "rgba(52,199,89,.12)") }}><Icon name="stamp" size={14} /> Приказ {req.orderNo}</span>}
          {req.note && <div style={{ marginTop: 13, padding: "11px 14px", borderRadius: 12, background: "var(--surface-2)", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.5 }}><span style={{ color: "var(--text-3)", fontWeight: 600 }}>Комментарий: </span>{req.note}</div>}
        </MCard>

        <div style={{ ...MSecLabel, padding: "0 4px 12px" }}>Маршрут согласования</div>
        <MCard style={{ padding: "18px 16px" }}>
          {LEAVE_ROUTE.map((st, i) => {
            const state = mRouteState(i, req.stage, req.status);
            const last = i === LEAVE_ROUTE.length - 1;
            const lineCol = state === "done" ? "#34c759" : "var(--hairline)";
            return (
              <div key={st.key} style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <MStepNode state={state} n={i + 1} size={26} />
                  {!last && <div style={{ width: 2, flex: 1, minHeight: 30, background: lineCol, borderRadius: 2 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: (state === "pending" || state === "skip") ? "var(--text-3)" : "var(--text)" }}>{st.label}</span>
                    {req.times[i] && <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>{req.times[i]}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 1 }}>{st.task}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <Avatar person={st.person} size={24} />
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{st.person.name}</span>
                    {state === "current" && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}><span className="mFieldPulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} /> На рассмотрении</span>}
                    {state === "done" && <Icon name="check" size={15} stroke={2.6} style={{ marginLeft: "auto", color: "#34c759" }} />}
                    {state === "declined" && <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 600, color: "#c01a12" }}>Отклонил</span>}
                  </div>
                  {state === "declined" && req.declineNote && <div style={{ marginTop: 9, padding: "10px 13px", borderRadius: 11, background: "rgba(255,59,48,.08)", border: "1px solid rgba(255,59,48,.2)", fontSize: 13, color: "#a51810", lineHeight: 1.5 }}>{req.declineNote}</div>}
                </div>
              </div>
            );
          })}
        </MCard>
      </div>
    </div>
  );
}

Object.assign(window, { MLeaveGlyph, MRouteStepper, MStepNode, mRouteState, MLeaveStatus, MRequests, MMini, MLeaveSheet, MRequestDetail });
