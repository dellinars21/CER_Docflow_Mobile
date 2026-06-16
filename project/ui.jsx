// ui.jsx — shared primitives + the three file-browser layouts.

// ── Icons ────────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  tray: "M3 13l2.5-7A2 2 0 017.4 4.7h9.2A2 2 0 0118.5 6L21 13M3 13v5a2 2 0 002 2h14a2 2 0 002-2v-5M3 13h5l1.5 2.5h5L16 13h5",
  check: "M4 12.5l5 5L20 6.5",
  checkSeal: "M9 12l2 2 4-4M7.5 4.2a3 3 0 012.3-1l4.4 0a3 3 0 012.3 1l1.3 1.6a3 3 0 01.7 2.3l-.3 4.3a3 3 0 01-1 2l-3.4 2.8a3 3 0 01-3.6 0L6.5 16.4a3 3 0 01-1-2l-.3-4.3a3 3 0 01.7-2.3z",
  checkCircle: "M8 12.5l3 3 5-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 7v5l3.5 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  doc: "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5",
  pen: "M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3zM13.5 6.5l3 3",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  columns: "M4 5h16v14H4zM10 5v14M16 5v14",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  back: "M11 6l-6 6 6 6M5 12h14",
  send: "M22 3L3 10.5l7 2.5m12-10l-7 18-2.5-7m9.5-11L10 13",
  folder: "M3 7a2 2 0 012-2h4l2 2.5h8A2 2 0 0121 11v6a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  flag: "M5 21V4M5 4h11l-1.5 4L16 12H5",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  download: "M12 4v11m0 0l-4-4m4 4l4-4M5 19h14",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  switch: "M7 8h13l-3-3M17 16H4l3 3",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H10a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V10c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z",
  calendar: "M7 3v3M17 3v3M4 8.5h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  calCheck: "M7 3v3M17 3v3M4 8.5h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM9 14.5l2 2 4-4",
  sun: "M12 4V2M12 22v-2M4.9 4.9L3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1L3.5 20.5M20.5 3.5l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z",
  wallet: "M19 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M21 12h-5a2 2 0 100 4h5a1 1 0 001-1v-2a1 1 0 00-1-1zM3 7h13",
  pulse: "M3 12h4l2.5-7 4 14 2.5-7H21",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  users: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  route: "M6.5 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6.5 15V11a4 4 0 014-4h3M17.5 9v4a4 4 0 01-4 4h-3",
  stamp: "M9 3h6a1 1 0 011 1v3.5a3 3 0 01-1 2.24L13 12v3h2l1.5 5H7.5L9 15h2v-3L9 9.74A3 3 0 018 7.5V4a1 1 0 011-1zM5 22h14",
  briefcase: "M4 7h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12.5h18"
};

function Icon({ name, size = 22, stroke = 1.7, style, className }) {
  const d = ICON_PATHS[name] || "";
  const fill = name === "grid" ? "none" : "none";
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: "block", ...style }} aria-hidden="true">
      <path d={d} fill={fill} />
    </svg>);

}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ person, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: person.tint, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: size * 0.36, letterSpacing: ".01em",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,.25)"
    }}>{person.initials}</div>);

}

// ── Document glyph (a little PDF thumbnail tinted by type) ─────────────────────
function DocGlyph({ type, size = 44 }) {
  const t = DOC_TYPES[type];
  return (
    <div style={{
      width: size, height: size * 1.18, borderRadius: 9, flexShrink: 0,
      background: "#fff", position: "relative", overflow: "hidden",
      boxShadow: "0 1px 0 rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.07), 0 0 0 .5px rgba(0,0,0,.06)"
    }}>
      <div style={{ height: size * 0.34, background: t.tint, opacity: 0.92 }} />
      <div style={{ padding: "6px 6px 0", display: "flex", flexDirection: "column", gap: 3 }}>
        <i style={{ height: 2.5, borderRadius: 2, background: "rgba(0,0,0,.16)", width: "85%" }} />
        <i style={{ height: 2.5, borderRadius: 2, background: "rgba(0,0,0,.1)", width: "70%" }} />
        <i style={{ height: 2.5, borderRadius: 2, background: "rgba(0,0,0,.1)", width: "78%" }} />
      </div>
    </div>);

}

// ── Flame (urgency) ──────────────────────────────────────────────────────────
function Flame({ size = 13, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, display: "block", ...style }} aria-hidden="true">
      <path d="M12 23c-4.97 0-9-3.86-9-8.6 0-2.9 1.4-5.1 2.8-6.8.7-.86 1.44-1.6 1.97-2.56.54-.97.73-2.05.73-3.54 0-.28.18-.52.45-.6.27-.08.56.04.69.29C10.5 3.4 11.44 5.1 12.5 6.5c.6.8 1.27 1.5 1.82 2.35.12-.9.1-1.82-.1-2.7a.6.6 0 0 1 .34-.68.6.6 0 0 1 .74.2C17.5 8 19 11 19 14.4 19 19.14 15.97 23 12 23zm0-2c2.76 0 5-2.46 5-5.6 0-2.2-.9-4.3-2.46-6.04.03.9-.1 1.8-.45 2.64a.6.6 0 0 1-.98.18C11.94 10.5 10.7 9 9.7 7.37c-.3 1.02-.9 1.9-1.55 2.7C7.1 11.3 6 12.96 6 14.4 6 18.54 8.24 21 12 21z" />
    </svg>);

}

// ── Bolt (urgency) ───────────────────────────────────────────────────────────
function Bolt({ size = 13, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, display: "block", ...style }} aria-hidden="true">
      <path d="M11 21h-1l1-7H6.5c-.88 0-.33-.75-.31-.78C7.42 10.94 9.21 7.76 11.85 3h1l-1 7h4.51c.4 0 .62.19.4.66C9.97 17.55 11 21 11 21z" />
    </svg>);

}

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS = {
  pending: { label: "Ожидает подписи", color: "#b25e00", bg: "rgba(255,149,0,.14)" },
  signed: { label: "Подписан", color: "#1d7a36", bg: "rgba(52,199,89,.16)" },
  notified: { label: "Уведомлён", color: "#0a6cff", bg: "rgba(10,132,255,.14)" },
  draft: { label: "Черновик", color: "#6e6e73", bg: "rgba(120,120,128,.14)" },
  urgent: { label: "Срочный", color: "#c01a12", bg: "rgba(255,59,48,.14)" }
};
function StatusBadge({ kind, children }) {
  const s = STATUS[kind] || STATUS.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.color,
      fontSize: "calc(13px * var(--s))", fontWeight: 600, whiteSpace: "nowrap"
    }}>
      {kind === "urgent" &&
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M12 23c-4.97 0-9-3.86-9-8.6 0-2.9 1.4-5.1 2.8-6.8.7-.86 1.44-1.6 1.97-2.56.54-.97.73-2.05.73-3.54 0-.28.18-.52.45-.6.27-.08.56.04.69.29C10.5 3.4 11.44 5.1 12.5 6.5c.6.8 1.27 1.5 1.82 2.35.12-.9.1-1.82-.1-2.7a.6.6 0 0 1 .34-.68.6.6 0 0 1 .74.2C17.5 8 19 11 19 14.4 19 19.14 15.97 23 12 23zm0-2c2.76 0 5-2.46 5-5.6 0-2.2-.9-4.3-2.46-6.04.03.9-.1 1.8-.45 2.64a.6.6 0 0 1-.98.18C11.94 10.5 10.7 9 9.7 7.37c-.3 1.02-.9 1.9-1.55 2.7C7.1 11.3 6 12.96 6 14.4 6 18.54 8.24 21 12 21z" />
        </svg>
      }
      {children || s.label}
    </span>);

}

// ── Button ───────────────────────────────────────────────────────────────────
function Button({ kind = "secondary", size = "md", icon, children, onClick, style, disabled, full }) {
  const sizes = {
    sm: { h: 38, px: 14, fs: 15, gap: 7, ic: 18 },
    md: { h: 48, px: 18, fs: 16, gap: 9, ic: 20 },
    lg: { h: 56, px: 24, fs: 18, gap: 10, ic: 22 }
  }[size];
  const kinds = {
    primary: { background: "var(--accent)", color: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.12), 0 2px 10px color-mix(in srgb, var(--accent) 35%, transparent)" },
    secondary: { background: "var(--surface)", color: "var(--text)", boxShadow: "inset 0 0 0 1px var(--border), 0 1px 1px rgba(0,0,0,.03)" },
    ghost: { background: "transparent", color: "var(--accent)", boxShadow: "none" },
    danger: { background: "var(--surface)", color: "#c01a12", boxShadow: "inset 0 0 0 1px rgba(255,59,48,.3)" }
  }[kind];
  return (
    <button onClick={onClick} disabled={disabled} className="btn" style={{ ...{
        height: `calc(${sizes.h}px * var(--s))`, padding: `0 calc(${sizes.px}px * var(--s))`,
        fontSize: `calc(${sizes.fs}px * var(--s))`, gap: sizes.gap,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "none", borderRadius: 13, fontWeight: 600, fontFamily: "inherit",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
        width: full ? "100%" : "auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        transition: "transform .12s ease, filter .12s ease, box-shadow .12s ease",
        ...kinds, ...style
      }, gap: "9px", borderRadius: "13px" }}>
      {icon && <Icon name={icon} size={sizes.ic} />}
      {children}
    </button>);

}

// ── Priority dot ─────────────────────────────────────────────────────────────
function PriorityTag({ priority }) {
  if (priority === "Срочный") return <StatusBadge kind="urgent">Срочный</StatusBadge>;
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// FILE-BROWSER LAYOUTS — the variation axis. List / Grid / Columns.
// All three render the pending queue and call onOpen(doc).
// ════════════════════════════════════════════════════════════════════════════

function senderOf(doc) {return PEOPLE[doc.from] || USERS[doc.from] || PEOPLE.olga;}

// ── 1. LIST (Mail / Finder-list inspired) ─────────────────────────────────────
function ListBrowser({ docs, onOpen, activeId }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 18, overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)"
    }}>
      {docs.map((doc, i) => {
        const p = senderOf(doc);
        const t = DOC_TYPES[doc.type];
        return (
          <button key={doc.id} onClick={() => onOpen(doc)} className="rowItem" style={{
            display: "flex", alignItems: "center", gap: 16, width: "100%",
            padding: "16px 20px", border: "none", background: activeId === doc.id ? "var(--accent-weak)" : "transparent",
            borderTop: i === 0 ? "none" : "1px solid var(--hairline)", cursor: "pointer",
            textAlign: "left", fontFamily: "inherit", position: "relative"
          }}>
            {doc.priority === "Срочный" && <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#ff3b30" }} />}
            <DocGlyph type={doc.type} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, minWidth: 0 }}>
                <span style={{ fontSize: "calc(17px * var(--s))", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{doc.title}</span>
                <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 999, background: `color-mix(in srgb, ${t.tint} 12%, transparent)`, color: t.tint, fontSize: "calc(12px * var(--s))", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{t.short}</span>
                <PriorityTag priority={doc.priority} />
              </div>
              <div style={{ fontSize: "calc(15px * var(--s))", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.subtitle}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", flexShrink: 0 }}>
              <Avatar person={p} size={30} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                <span style={{ fontSize: "calc(14px * var(--s))", color: "var(--text)", fontWeight: 500 }}>{p.name.split(" ")[0]} {p.name.split(" ")[1]?.[0]}.</span>
                <span style={{ fontSize: "calc(13px * var(--s))" }}>{doc.submitted}</span>
              </div>
            </div>
            <Icon name="chevR" size={20} style={{ color: "var(--text-3)" }} />
          </button>);

      })}
    </div>);

}

// ── 2. GRID (cards with mini page previews) ───────────────────────────────────
function GridBrowser({ docs, onOpen, activeId }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
      {docs.map((doc) => {
        const p = senderOf(doc);
        const t = DOC_TYPES[doc.type];
        return (
          <button key={doc.id} onClick={() => onOpen(doc)} className="cardItem" style={{
            display: "flex", flexDirection: "column", textAlign: "left", cursor: "pointer",
            background: "var(--surface)", borderRadius: 18, overflow: "hidden", padding: 0,
            border: "none", fontFamily: "inherit", position: "relative",
            boxShadow: activeId === doc.id ?
            "0 0 0 2px var(--accent), 0 8px 24px rgba(0,0,0,.1)" :
            "0 1px 2px rgba(0,0,0,.05), 0 0 0 .5px var(--border)"
          }}>
            {doc.priority === "Срочный" && <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 16, bottom: 16, width: 4, borderRadius: 2, background: "#ff3b30", zIndex: 2 }} />}
            <div style={{ position: "relative", height: 150, background: "linear-gradient(180deg,#f2f2f5,#e9e9ee)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 18, overflow: "hidden" }}>
              <MiniPage type={doc.type} />
            </div>
            <div style={{ padding: "14px 16px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: "calc(16px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{doc.title}</span>
                <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 999, background: `color-mix(in srgb, ${t.tint} 12%, transparent)`, color: t.tint, fontSize: "calc(12px * var(--s))", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{t.short}</span>
                {doc.priority === "Срочный" && <PriorityTag priority={doc.priority} />}
              </div>
              <div style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-2)", marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.subtitle}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar person={p} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "calc(13.5px * var(--s))", fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                  <div style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)" }}>{doc.submitted}</div>
                </div>
              </div>
            </div>
          </button>);

      })}
    </div>);

}

// ── 3. COLUMNS (Finder column view: list on left, preview on right) ───────────
function ColumnsBrowser({ docs, onOpen, activeId, peek, setPeek }) {
  const sel = docs.find((d) => d.id === peek) || docs[0];
  const p = senderOf(sel);
  const t = DOC_TYPES[sel.type];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1.1fr) 1.4fr", gap: 18, alignItems: "start" }}>
      <div style={{ background: "var(--surface)", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)" }}>
        {docs.map((doc, i) => {
          const selnow = sel.id === doc.id;
          const dt = DOC_TYPES[doc.type];
          return (
            <button key={doc.id} onClick={() => setPeek(doc.id)} onDoubleClick={() => onOpen(doc)} style={{
              display: "flex", alignItems: "center", gap: 13, width: "100%",
              padding: "13px 16px", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              background: selnow ? "var(--accent)" : "transparent",
              borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
              position: "relative"
            }}>
              {!selnow && doc.priority === "Срочный" && <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#ff3b30" }} />}
              <DocGlyph type={doc.type} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden", marginBottom: 2 }}>
                  <span style={{ fontSize: "calc(15.5px * var(--s))", fontWeight: 600, color: selnow ? "#fff" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{doc.title}</span>
                  <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 999, background: selnow ? "rgba(255,255,255,.22)" : `color-mix(in srgb, ${dt.tint} 12%, transparent)`, color: selnow ? "#fff" : dt.tint, fontSize: "calc(11.5px * var(--s))", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{dt.short}</span>
                </div>
                <div style={{ fontSize: "calc(13.5px * var(--s))", color: selnow ? "rgba(255,255,255,.8)" : "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.subtitle}</div>
              </div>
              <Icon name="chevR" size={18} style={{ color: selnow ? "rgba(255,255,255,.7)" : "var(--text-3)" }} />
            </button>);

        })}
      </div>
      <div style={{ background: "var(--surface)", borderRadius: 18, padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)", position: "sticky", top: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ transform: "scale(1.5)", transformOrigin: "top center", marginBottom: 60 }}><MiniPage type={sel.type} /></div>
        </div>
        <div style={{ fontSize: "calc(20px * var(--s))", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{sel.title}</div>
        <div style={{ fontSize: "calc(15px * var(--s))", color: "var(--text-2)", marginBottom: 18 }}>{sel.subtitle}</div>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 16px", margin: "0 0 22px", fontSize: "calc(14.5px * var(--s))" }}>
          {[["Тип", t.label], ["Отправитель", p.name], ["Отдел", p.dept], ["Поступил", sel.submitted], ["Размер", sel.size], ["Страниц", String(sel.pages)], ["Папка", sel.path]].map((row, i) =>
          <React.Fragment key={i}>
              <dt style={{ color: "var(--text-3)" }}>{row[0]}</dt>
              <dd style={{ margin: 0, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{row[1]}</dd>
            </React.Fragment>
          )}
        </dl>
        <Button kind="primary" size="md" icon="pen" full onClick={() => onOpen(sel)}>Открыть и подписать</Button>
      </div>
    </div>);

}

// Mini page preview used in grid/column thumbnails.
function MiniPage({ type }) {
  const t = DOC_TYPES[type];
  return (
    <div style={{ width: 96, height: 124, background: "#fff", borderRadius: 5, boxShadow: "0 2px 10px rgba(0,0,0,.14)", padding: "10px 11px", display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" }}>
      <div style={{ height: 7, width: "55%", borderRadius: 2, background: t.tint, opacity: .85, marginBottom: 2 }} />
      {[92, 80, 88, 70, 84, 60].map((w, i) => <i key={i} style={{ height: 3, width: w + "%", borderRadius: 2, background: "rgba(0,0,0,.1)" }} />)}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
        <i style={{ height: 12, width: 34, borderRadius: 2, background: `color-mix(in srgb, ${t.tint} 22%, transparent)`, border: `1px dashed ${t.tint}` }} />
      </div>
    </div>);

}

// ── Telegram brand glyph + read receipts ─────────────────────────────────────
function TelegramGlyph({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path d="M5.3 11.7l11-4.24c.5-.19.95.12.8.85l-1.87 8.8c-.13.6-.5.74-1 .46l-2.74-2.02-1.32 1.27c-.15.15-.27.27-.55.27l.2-2.83 5.13-4.63c.22-.2-.05-.3-.34-.12l-6.34 3.99-2.73-.85c-.6-.18-.6-.6.13-.9z" fill="#fff" />
    </svg>);

}

function DoubleCheck({ read, single, size = 15 }) {
  const c = read ? "#229ED9" : "#9b9ba1";
  return (
    <svg width={size * (single ? 1 : 1.55)} height={size} viewBox={single ? "0 0 14 16" : "0 0 22 16"} fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d="M1 8.5L4.6 12.4L11.4 4" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      {!single && <path d="M9.2 12L10.1 13L16.9 4.3" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>);

}

// Director's read-receipt on the Telegram notification sent to the employee.
function ReadReceipt({ receipt, compact }) {
  if (!receipt) return null;
  const read = receipt.state === "read";
  const label = read ? `Прочитано${receipt.time ? " · " + receipt.time : ""}` : receipt.state === "delivered" ? "Доставлено" : "Отправлено";
  return (
    <span title={`Уведомление в Telegram — ${label}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: compact ? 0 : "4px 10px 4px 8px", borderRadius: 999, background: compact ? "transparent" : read ? "rgba(34,158,217,.12)" : "var(--surface-2)", whiteSpace: "nowrap" }}>
      <DoubleCheck read={read} single={receipt.state === "sent"} />
      <span style={{ fontSize: "calc(13px * var(--s))", fontWeight: 600, color: read ? "#1583b3" : "var(--text-3)" }}>{label}</span>
    </span>);

}

function TelegramTag({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px 4px 7px", borderRadius: 999, background: "rgba(34,158,217,.12)", color: "#1583b3", fontSize: "calc(13px * var(--s))", fontWeight: 600, whiteSpace: "nowrap" }}>
      <TelegramGlyph size={16} /> {label || "Telegram"}
    </span>);

}

Object.assign(window, {
  Icon, Avatar, DocGlyph, StatusBadge, Button, PriorityTag, Flame, Bolt,
  ListBrowser, GridBrowser, ColumnsBrowser, MiniPage, senderOf, STATUS,
  TelegramGlyph, DoubleCheck, ReadReceipt, TelegramTag
});