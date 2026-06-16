// mobile-app.jsx — mobile-optimized version of the CER signing tool (iOS).
const { useState, useEffect, useRef } = React;

// ── small primitives ─────────────────────────────────────────────────────────
function MBtn({ kind = "primary", icon, children, onClick, full, disabled, style, tg }) {
  const base = {
    height: 52, borderRadius: 15, border: "none", fontFamily: "inherit", fontSize: 17, fontWeight: 600,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1, width: full ? "100%" : "auto",
    padding: "0 22px", whiteSpace: "nowrap",
  };
  const kinds = {
    primary: { background: tg ? "#229ED9" : "var(--accent)", color: "#fff", boxShadow: tg ? "0 3px 14px rgba(34,158,217,.35)" : "0 3px 14px rgba(10,132,255,.3)" },
    secondary: { background: "var(--surface)", color: "var(--text)", boxShadow: "inset 0 0 0 1px var(--border)" },
    tint: { background: "var(--accent-weak)", color: "var(--accent)" },
    ghost: { background: "transparent", color: "var(--accent)" },
  };
  return (
    <button className="mTap" onClick={onClick} disabled={disabled} style={{ ...base, ...kinds[kind], ...style }}>
      {icon && <Icon name={icon} size={21} />}{children}
    </button>
  );
}

function MCard({ children, onClick, style }) {
  return (
    <div className={onClick ? "mTap" : ""} onClick={onClick} style={{
      background: "var(--surface)", borderRadius: 18, padding: 16, cursor: onClick ? "pointer" : "default", flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,.05), 0 0 0 .5px var(--border)", ...style,
    }}>{children}</div>
  );
}

// large iOS-style header
function MHeader({ title, count, sub, right, logo }) {
  return (
    <div style={{ padding: "max(54px, calc(var(--sat) + 14px)) 20px 8px", flexShrink: 0 }}>
      {logo && <img src="assets/cer-logo.png" alt="CER" style={{ height: 26, width: "auto", display: "block", marginBottom: 12 }} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", color: "var(--text)", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
          <span>{title}</span>
          {count != null && <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", background: "var(--accent)", borderRadius: 999, minWidth: 28, height: 28, padding: "0 9px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
        </h1>
        {right}
      </div>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 15, color: "var(--text-2)" }}>{sub}</p>}
    </div>
  );
}

// urgent red theme (light) — tints the whole card, not just the strip
const URGENT_RED = "#fb3b30";
const URGENT_INK = "#c01a12";
const urgentCardStyle = {
  background: `color-mix(in srgb, ${URGENT_RED} 5%, #fff)`,
  boxShadow: `0 1px 2px rgba(0,0,0,.04), 0 0 0 1px color-mix(in srgb, ${URGENT_RED} 34%, transparent)`,
};

// document card: colored type strip on top, white body below
function MDocHeader({ type, time, urgent }) {
  const t = DOC_TYPES[type];
  const tint = t.tint;
  if (urgent) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 9, padding: "9px 14px",
        background: `color-mix(in srgb, ${URGENT_RED} 13%, #fff)`,
        borderBottom: `1px solid color-mix(in srgb, ${URGENT_RED} 22%, transparent)`,
      }}>
        <Icon name="doc" size={17} stroke={2} style={{ color: URGENT_INK }} />
        <span style={{ fontSize: 14.5, fontWeight: 700, color: URGENT_INK, whiteSpace: "nowrap" }}>{t.short}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px 3px 7px", borderRadius: 999, background: `color-mix(in srgb, ${URGENT_RED} 18%, #fff)`, color: URGENT_INK, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1 }}>
          <Bolt size={13} style={{ color: "#f5a623" }} /> Срочный
        </span>
        {time &&
          <span style={{ marginLeft: "auto", fontSize: 13.5, fontWeight: 700, color: URGENT_INK, whiteSpace: "nowrap" }}>{time}</span>}
      </div>);

  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9, padding: "9px 14px",
      background: `color-mix(in srgb, ${tint} 16%, #fff)`,
    }}>
      <Icon name="doc" size={17} stroke={2} style={{ color: tint }} />
      <span style={{ fontSize: 14.5, fontWeight: 700, color: tint, whiteSpace: "nowrap" }}>{t.short}</span>
      {time &&
        <span style={{ marginLeft: "auto", fontSize: 13.5, fontWeight: 600, color: "var(--text-3)", whiteSpace: "nowrap" }}>{time}</span>}
    </div>);

}

// ── DIRECTOR: queue ──────────────────────────────────────────────────────────
function MQueueCard({ doc, onOpen }) {
  const p = senderOf(doc);
  const urgent = doc.priority === "Срочный";
  return (
    <MCard onClick={() => onOpen(doc)} style={{ padding: 0, overflow: "hidden", ...(urgent ? urgentCardStyle : null) }}>
      <MDocHeader type={doc.type} time={doc.submitted} urgent={urgent} />
      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: 14 }}>
        <Avatar person={p} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17.5, fontWeight: 700, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</div>
          <div style={{ fontSize: 14.5, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.subtitle}</div>
          <div style={{ fontSize: 14.5, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
        </div>
        <Icon name="chevR" size={22} style={{ color: urgent ? `color-mix(in srgb, ${URGENT_INK} 55%, var(--text-3))` : "var(--text-3)", flexShrink: 0 }} />
      </div>
    </MCard>);

}

function MQueue({ queue, onOpen }) {
  return (
    <>
      <MHeader title="На подпись" count={queue.length} sub="Ожидают вашей подписи" logo />
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 100px", display: "flex", flexDirection: "column", gap: 12 }}>
        {queue.length === 0
          ? <MEmpty title="Очередь пуста" sub="Все документы подписаны" />
          : queue.map((d) => <MQueueCard key={d.id} doc={d} onOpen={onOpen} />)}
      </div>
    </>
  );
}

// ── DIRECTOR: signed (read receipts) ─────────────────────────────────────────
function MSigned({ all }) {
  return (
    <>
      <MHeader title="Подписано" sub="Отметки о прочтении в Telegram" />
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 100px", display: "flex", flexDirection: "column", gap: 12 }}>
        {all.map((d, i) => {
          const p = senderOf(d);
          return (
            <MCard key={d.id + i} style={{ padding: 0, overflow: "hidden" }}>
              <MDocHeader type={d.type} time={d.signed} />
              <div style={{ display: "flex", gap: 13, alignItems: "center", padding: "12px 14px 0" }}>
                <Avatar person={p} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                  <div style={{ fontSize: 13.5, color: "var(--text-3)" }}>{p.name}</div>
                </div>
                <StatusBadge kind="signed">Подписан</StatusBadge>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "12px 14px 0", padding: "12px 0 14px", borderTop: "1px solid var(--hairline)" }}>
                <TelegramGlyph size={20} />
                <span style={{ fontSize: 14, color: "var(--text-2)", flex: 1 }}>Уведомление отправителю</span>
                <ReadReceipt receipt={d.receipt} />
              </div>
            </MCard>
          );
        })}
      </div>
    </>
  );
}

// ── JOURNAL ──────────────────────────────────────────────────────────────────
function mJournalDateKey(when) {
  // "Сегодня, 08:30" → "Сегодня", "2 июня, 15:20" → "2 июня"
  const comma = when.indexOf(",");
  return comma > -1 ? when.slice(0, comma) : when;
}
function MJournal({ items }) {
  // Group by date, preserving first-seen order (items are newest-first)
  const dateOrder = [];
  const dateMap = {};
  for (const j of items) {
    const dk = mJournalDateKey(j.when);
    if (!dateMap[dk]) { dateMap[dk] = []; dateOrder.push(dk); }
    dateMap[dk].push(j);
  }
  const groups = dateOrder.map((dk) => ({ date: dk, items: dateMap[dk] }));

  return (
    <>
      <MHeader title="Журнал" sub="Действия с документами" />
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 100px", display: "flex", flexDirection: "column", gap: 18 }}>
        {groups.map((g) => (
          <div key={g.date}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", padding: "0 6px 8px" }}>{g.date}</div>
            <MCard style={{ padding: "4px 0" }}>
              {g.items.map((j, i) => {
                const m = ACTION_META[j.action];
                const actor = USERS[j.actor] || PEOPLE[j.actor] || { name: j.actor };
                const time = j.when.indexOf(",") > -1 ? j.when.slice(j.when.indexOf(",") + 2) : j.when;
                return (
                  <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--hairline)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `color-mix(in srgb, ${m.tint} 14%, transparent)`, color: m.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {j.action === "notified" ? <TelegramGlyph size={22} /> : <Icon name={m.icon} size={19} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: "var(--text)" }}><b style={{ fontWeight: 600 }}>{m.verb}</b> · {j.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{actor.name} · {j.detail}</div>
                    </div>
                    <span style={{ fontSize: 12.5, color: "var(--text-3)", whiteSpace: "nowrap", flexShrink: 0 }}>{time}</span>
                  </div>
                );
              })}
            </MCard>
          </div>
        ))}
      </div>
    </>
  );
}

// ── STAFF: my documents ──────────────────────────────────────────────────────
function MDocs({ all, tgConnected, onConnectTg, onSend }) {
  return (
    <>
      <MHeader title="Документы" sub="Отправленные на подпись" logo
        right={<button className="mTap" onClick={onSend} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 3px 12px rgba(10,132,255,.35)" }}><Icon name="plus" size={24} stroke={2.4} /></button>} />
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 100px", display: "flex", flexDirection: "column", gap: 12 }}>
        {!tgConnected && (
          <MCard className="mTap" onClick={onConnectTg} style={{ background: "rgba(34,158,217,.08)", boxShadow: "0 0 0 1px rgba(34,158,217,.25)", display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
            <TelegramGlyph size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--text)" }}>Подключить Telegram</div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)" }}>Уведомления о подписи в чат</div>
            </div>
            <Icon name="chevR" size={20} style={{ color: "#229ED9" }} />
          </MCard>
        )}
        {tgConnected && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
            <TelegramTag label="Telegram подключён" />
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>{TELEGRAM.bot}</span>
          </div>
        )}
        {all.map((d, i) => {
          const t = DOC_TYPES[d.type];
          return (
            <MCard key={d.id + i} style={{ padding: 0, overflow: "hidden" }}>
              <MDocHeader type={d.type} time={d.when} urgent={d.priority === "Срочный"} />
              <div style={{ display: "flex", gap: 13, alignItems: "center", padding: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                  <div style={{ fontSize: 13.5, color: "var(--text-3)" }}>{t.label} · {d.id}</div>
                </div>
                <StatusBadge kind={d.status} />
              </div>
            </MCard>
          );
        })}
      </div>
    </>
  );
}

// ── PROFILE (role switch + telegram) ─────────────────────────────────────────
function MProfile({ account, user, onSwitch, tgConnected, onConnectTg }) {
  return (
    <>
      <MHeader title="Профиль" />
      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 100px", display: "flex", flexDirection: "column", gap: 22 }}>
        <MCard style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar person={user} size={56} />
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: "var(--text)" }}>{user.name}</div>
            <div style={{ fontSize: 14.5, color: "var(--text-2)" }}>{user.role}</div>
          </div>
        </MCard>

        <div>
          <div style={MSecLabel}>Роль (демо)</div>
          <MCard style={{ padding: 6 }}>
            {["director", "staff"].map((acc, i) => {
              const u = USERS[acc];
              return (
                <button key={acc} className="mTap" onClick={() => onSwitch(acc)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 10px", borderRadius: 13,
                  border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  borderTop: i === 0 ? "none" : "1px solid var(--hairline)", background: account === acc ? "var(--accent-weak)" : "transparent",
                }}>
                  <Avatar person={u} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{u.name}</div>
                    <div style={{ fontSize: 13.5, color: "var(--text-3)" }}>{u.role}</div>
                  </div>
                  {account === acc && <Icon name="check" size={20} stroke={2.4} style={{ color: "var(--accent)" }} />}
                </button>
              );
            })}
          </MCard>
        </div>

        <div>
          <div style={MSecLabel}>Уведомления</div>
          <MCard className="mTap" onClick={tgConnected ? undefined : onConnectTg} style={{ display: "flex", alignItems: "center", gap: 13, cursor: tgConnected ? "default" : "pointer" }}>
            <TelegramGlyph size={38} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Telegram</div>
              <div style={{ fontSize: 13.5, color: "var(--text-3)" }}>{TELEGRAM.bot}</div>
            </div>
            {tgConnected
              ? <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#1d7a36", fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34c759" }} />подключён</span>
              : <span style={{ fontSize: 14, color: "#1583b3", fontWeight: 600 }}>Подключить</span>}
          </MCard>
        </div>
      </div>
    </>
  );
}
const MSecLabel = { fontSize: 13, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-3)", padding: "0 16px 8px" };

function MEmpty({ title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--text-3)" }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--surface)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 0 .5px var(--border)" }}><Icon name="checkCircle" size={28} /></div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 14.5 }}>{sub}</div>
    </div>
  );
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
const IOS_KB_ROWS = [
  ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
  ["ф","ы","в","а","п","р","о","л","д","ж","э"],
  ["⇧","я","ч","с","м","и","т","ь","б","ю","⌫"],
];

function MSearch({ queue, signed, journal, onOpen, onClose }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(null); // "queue" | "signed" | "journal" | null
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current && inputRef.current.focus(), 120); }, []);

  const recentSearches = ["Заказ на покупку", "Гасанов", "Счёт за электроэнергию"];

  const filters = [
    { key: "queue",   label: "На подпись", tint: "#ff9500" },
    { key: "signed",  label: "Подписано",  tint: "#34c759" },
    { key: "journal", label: "Журнал",     tint: "#0a84ff" },
  ];

  const ql = q.toLowerCase().trim();
  const results = [];
  if (ql || filter) {
    if (!filter || filter === "queue") {
      for (const d of queue) {
        const p = senderOf(d);
        if (!ql || (d.title + d.subtitle + p.name).toLowerCase().includes(ql))
          results.push({ kind: "queue", doc: d, person: p });
      }
    }
    if (!filter || filter === "signed") {
      for (const d of signed) {
        const p = senderOf(d);
        if (!ql || (d.title + p.name).toLowerCase().includes(ql))
          results.push({ kind: "signed", doc: d, person: p });
      }
    }
    if (!filter || filter === "journal") {
      for (const j of journal) {
        const actor = USERS[j.actor] || PEOPLE[j.actor] || { name: j.actor };
        if (!ql || (j.title + j.detail + actor.name).toLowerCase().includes(ql))
          results.push({ kind: "journal", item: j, actor });
      }
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Search input at top */}
      <div style={{ flexShrink: 0, padding: "max(54px, calc(var(--sat) + 14px)) 16px 12px", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
            <Icon name="search" size={17} style={{ position: "absolute", left: 12, color: "var(--text-3)" }} />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск документов"
              style={{ width: "100%", height: 42, padding: "0 38px 0 38px", borderRadius: 12, border: "none", background: "var(--surface-2)", fontSize: 16, fontFamily: "inherit", color: "var(--text)", outline: "none" }} />
            {q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 10, width: 20, height: 20, borderRadius: "50%", border: "none", background: "var(--text-3)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", color: "var(--accent)", fontSize: 16, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: "4px 2px", whiteSpace: "nowrap" }}>Отмена</button>
        </div>
      </div>

      {/* Filter tags */}
      <div style={{ flexShrink: 0, padding: "0 16px 10px", display: "flex", gap: 8, overflowX: "auto" }}>
        {filters.map((f) => {
          const on = filter === f.key;
          return (
            <button key={f.key} className="mTap" onClick={() => setFilter(on ? null : f.key)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999,
              border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
              background: on ? `color-mix(in srgb, ${f.tint} 18%, transparent)` : "var(--surface)",
              color: on ? f.tint : "var(--text-2)",
              boxShadow: on ? "none" : "0 0 0 .5px var(--border)",
              transition: "all .15s ease",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.tint }} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Results / recent */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 16px 100px" }}>
        {!ql && !filter && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", padding: "8px 4px 10px" }}>Недавние запросы</div>
            <MCard style={{ padding: "4px 0" }}>
              {recentSearches.map((term, i) => (
                <button key={term} onClick={() => setQ(term)} className="mTap" style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px",
                  border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                }}>
                  <Icon name="clock" size={18} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 16, color: "var(--text)" }}>{term}</span>
                  <Icon name="chevR" size={16} style={{ color: "var(--text-3)" }} />
                </button>
              ))}
            </MCard>
          </div>
        )}
        {(ql || filter) && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-2)" }}>Ничего не найдено</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Попробуйте другой запрос</div>
          </div>
        )}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r, i) => {
              if (r.kind === "queue") return (
                <MCard key={"q" + r.doc.id} onClick={() => onOpen && onOpen(r.doc)} style={{ padding: 0, overflow: "hidden" }}>
                  <MDocHeader type={r.doc.type} time={r.doc.submitted} urgent={r.doc.priority === "Срочный"} />
                  <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 13 }}>
                    <Avatar person={r.person} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.doc.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-3)" }}>{r.person.name}</div>
                    </div>
                    <StatusBadge kind="pending">Ожидает</StatusBadge>
                  </div>
                </MCard>
              );
              if (r.kind === "signed") return (
                <MCard key={"s" + r.doc.id + i} style={{ padding: 0, overflow: "hidden" }}>
                  <MDocHeader type={r.doc.type} time={r.doc.signed} />
                  <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 13 }}>
                    <Avatar person={r.person} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.doc.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-3)" }}>{r.person.name}</div>
                    </div>
                    <StatusBadge kind="signed">Подписан</StatusBadge>
                  </div>
                </MCard>
              );
              if (r.kind === "journal") {
                const m = ACTION_META[r.item.action];
                return (
                  <MCard key={"j" + r.item.id} style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${m.tint} 14%, transparent)`, color: m.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {r.item.action === "notified" ? <TelegramGlyph size={22} /> : <Icon name={m.icon} size={19} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, color: "var(--text)" }}><b style={{ fontWeight: 600 }}>{m.verb}</b> · {r.item.title}</div>
                        <div style={{ fontSize: 13, color: "var(--text-3)" }}>{r.actor.name} · {r.item.when}</div>
                      </div>
                    </div>
                  </MCard>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MBtn, MCard, MHeader, MQueue, MSigned, MJournal, MDocs, MProfile, MEmpty, MQueueCard, MSearch });
