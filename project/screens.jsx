// screens.jsx — Director and Staff screens (queue, history, journal, my docs, send flow).

// ── Reusable page header ─────────────────────────────────────────────────────
function PageHeader({ title, sub, count, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 26, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "calc(34px * var(--s))", fontWeight: 700, letterSpacing: "-.02em", color: "var(--text)", display: "flex", alignItems: "center", gap: 14 }}>
          {title}
          {count != null && <span style={{ fontSize: "calc(20px * var(--s))", fontWeight: 600, color: "#fff", background: "var(--accent)", borderRadius: 999, minWidth: 34, height: 34, padding: "0 11px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
        </h1>
        {sub && <p style={{ margin: "8px 0 0", fontSize: "calc(16px * var(--s))", color: "var(--text-2)" }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{children}</div>
    </div>
  );
}

// ── Search field ─────────────────────────────────────────────────────────────
function SearchField({ value, onChange, placeholder, showAt }) {
  const inputRef = React.useRef(null);
  const handleAt = () => {
    if (!value.includes("@")) onChange(value ? value + " @" : "@");
    else onChange(value);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
      <Icon name="search" size={19} style={{ position: "absolute", left: 13, color: "var(--text-3)", zIndex: 1 }} />
      <input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ height: "calc(46px * var(--s))", padding: "0 16px 0 42px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: "calc(15px * var(--s))", fontFamily: "inherit", color: "var(--text)", width: 240, outline: "none" }} />
      {showAt && <button onClick={handleAt} title="Поиск по имени" style={{
        width: "calc(46px * var(--s))", height: "calc(46px * var(--s))", borderRadius: 12, border: "1px solid var(--border)",
        background: value.includes("@") ? "var(--accent-weak)" : "var(--surface)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        color: value.includes("@") ? "var(--accent)" : "var(--text-3)", fontFamily: "inherit", fontSize: "calc(18px * var(--s))", fontWeight: 700,
      }}>@</button>}
    </div>
  );
}

// ── Layout segmented control (mirrors the Tweak) ─────────────────────────────
function LayoutSwitch({ value, onChange }) {
  const opts = [["list", "list"], ["grid", "grid"], ["columns", "columns"]];
  return (
    <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }}>
      {opts.map(([key, icon]) => (
        <button key={key} onClick={() => onChange(key)} aria-label={key} style={{
          width: "calc(42px * var(--s))", height: "calc(38px * var(--s))", borderRadius: 9, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: value === key ? "var(--surface)" : "transparent", color: value === key ? "var(--accent)" : "var(--text-3)",
          boxShadow: value === key ? "0 1px 3px rgba(0,0,0,.12)" : "none",
        }}>
          <Icon name={icon} size={20} />
        </button>
      ))}
    </div>
  );
}

// ════════════════ DIRECTOR: QUEUE ════════════════
function DirectorQueue({ queue = QUEUE, layout, setLayout, onOpen }) {
  const [q, setQ] = React.useState("");
  const [peek, setPeek] = React.useState(queue[0] ? queue[0].id : null);
  const docs = queue.filter((d) => (d.title + d.subtitle).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="На подпись" count={queue.length} sub="Документы, ожидающие вашей подписи">
        <SearchField value={q} onChange={setQ} placeholder="Поиск документов" />
        <LayoutSwitch value={layout} onChange={setLayout} />
      </PageHeader>
      {docs.length === 0
        ? <Empty title="Ничего не найдено" sub="Измените поисковый запрос" />
        : layout === "list" ? <ListBrowser docs={docs} onOpen={onOpen} />
        : layout === "grid" ? <GridBrowser docs={docs} onOpen={onOpen} />
        : <ColumnsBrowser docs={docs} onOpen={onOpen} peek={peek} setPeek={setPeek} />}
    </div>
  );
}

// ════════════════ DIRECTOR: SIGNED HISTORY ════════════════
function SignedHistory({ extraSigned }) {
  const [q, setQ] = React.useState("");
  const all = [...(extraSigned || []), ...SIGNED];
  const filtered = q ? all.filter(d => {
    const ql = q.toLowerCase();
    const p = senderOf(d);
    // Support @name search
    const atMatch = ql.match(/@\s*(.+)/);
    if (atMatch) return p.name.toLowerCase().includes(atMatch[1].trim());
    return d.title.toLowerCase().includes(ql) || p.name.toLowerCase().includes(ql);
  }) : all;
  return (
    <div>
      <PageHeader title="Подписанные" sub="История подписанных документов и отметки о прочтении">
        <SearchField value={q} onChange={setQ} placeholder="Поиск документов" showAt />
      </PageHeader>
      <div style={{ background: "var(--surface)", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)" }}>
        {filtered.map((d, i) => {
          const p = senderOf(d);
          const t = DOC_TYPES[d.type];
          return (
            <div key={d.id + i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--hairline)" }}>
              <DocGlyph type={d.type} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "calc(16px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{d.title}</div>
                <div style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-2)" }}>{p.name} · подписан {d.signed}</div>
              </div>
              {d.receipt && <ReadReceipt receipt={d.receipt} />}
              <StatusBadge kind="signed" />
            </div>
          );
        })}
        {q && filtered.length === 0 && <div style={{ padding: "30px 20px", textAlign: "center", fontSize: "calc(15px * var(--s))", color: "var(--text-3)" }}>Ничего не найдено</div>}
      </div>
    </div>
  );
}

// ════════════════ JOURNAL (audit log) ════════════════
const ACTION_META = {
  signed:    { icon: "checkCircle", tint: "#34c759", verb: "Подписан" },
  notified:  { icon: "bell",      tint: "#0a84ff", verb: "Уведомление" },
  submitted: { icon: "send",      tint: "#8e8e93", verb: "Отправлен" },
};
function journalDateKey(when) {
  // "Сегодня, 08:30" → "Сегодня", "2 июня, 15:20" → "2 июня"
  const comma = when.indexOf(",");
  return comma > -1 ? when.slice(0, comma) : when;
}

function Journal({ extra }) {
  const [q, setQ] = React.useState("");
  const allItems = [...(extra || []), ...JOURNAL];
  const items = q ? allItems.filter(j => {
    const ql = q.toLowerCase();
    const actor = USERS[j.actor] || PEOPLE[j.actor] || { name: j.actor };
    // Support @name search
    const atMatch = ql.match(/@\s*(.+)/);
    if (atMatch) return actor.name.toLowerCase().includes(atMatch[1].trim());
    return j.title.toLowerCase().includes(ql) || j.detail.toLowerCase().includes(ql) || actor.name.toLowerCase().includes(ql);
  }) : allItems;

  // Group by date, collecting all items per date key (preserving first-seen order)
  const dateOrder = [];
  const dateMap = {};
  for (const j of items) {
    const dk = journalDateKey(j.when);
    if (!dateMap[dk]) {
      dateMap[dk] = [];
      dateOrder.push(dk);
    }
    dateMap[dk].push(j);
  }
  const groups = dateOrder.map(dk => ({ date: dk, items: dateMap[dk] }));

  return (
    <div>
      <PageHeader title="Журнал" sub="Все действия с документами — кто, что и когда">
        <SearchField value={q} onChange={setQ} placeholder="Поиск по журналу" showAt />
      </PageHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map((g) => (
          <div key={g.date}>
            <div style={{ fontSize: "calc(13.5px * var(--s))", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", padding: "0 6px 8px" }}>{g.date}</div>
            <div style={{ background: "var(--surface)", borderRadius: 18, padding: "8px 4px", boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)" }}>
              {g.items.map((j) => {
                const m = ACTION_META[j.action];
                const actor = USERS[j.actor] || PEOPLE[j.actor] || { name: j.actor };
                const time = j.when.indexOf(",") > -1 ? j.when.slice(j.when.indexOf(",") + 2) : j.when;
                const dim = j.action === "notified";
                const t = j.type && DOC_TYPES[j.type];
                return (
                  <div key={j.id} style={{ display: "flex", alignItems: "center", gap: dim ? 12 : 16, padding: dim ? "8px 18px" : "14px 18px", position: "relative", opacity: dim ? 0.55 : 1 }}>
                    <div style={{ width: dim ? 32 : 42, height: dim ? 32 : 42, borderRadius: dim ? 8 : 11, background: dim ? "transparent" : `color-mix(in srgb, ${m.tint} 14%, transparent)`, color: dim ? "var(--text-3)" : m.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {j.action === "notified" ? <TelegramGlyph size={dim ? 18 : 26} /> : <Icon name={m.icon} size={21} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: dim ? "calc(13.5px * var(--s))" : "calc(15.5px * var(--s))", color: dim ? "var(--text-2)" : "var(--text)" }}>
                        <span style={{ fontWeight: dim ? 400 : 600 }}>{m.verb}</span>
                        <span style={{ color: dim ? "var(--text-3)" : "var(--text-2)" }}>·</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{j.title}</span>
                      </div>
                      {!dim && <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-2)" }}>{actor.name} · {j.detail}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--text-3)", whiteSpace: "nowrap" }}>{time}</span>
                      {t && !dim && <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 999, background: `color-mix(in srgb, ${t.tint} 12%, transparent)`, color: t.tint, fontSize: "calc(12px * var(--s))", fontWeight: 600, whiteSpace: "nowrap" }}>{t.label}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {q && groups.length === 0 && <div style={{ padding: "30px 20px", textAlign: "center", fontSize: "calc(15px * var(--s))", color: "var(--text-3)" }}>Ничего не найдено</div>}
      </div>
    </div>
  );
}

// ════════════════ STAFF: MY DOCUMENTS ════════════════
const STAFF_DOCS = [
  { id: "DOC-2040", title: "Счёт за электроэнергию", type: "utility", status: "pending", when: "Сегодня, 08:51" },
  { id: "DOC-2037", title: "Счёт за водоснабжение",  type: "utility", status: "pending", when: "Вчера, 11:15" },
  { id: "DOC-2034", title: "Счёт за интернет и связь", type: "utility", status: "signed", when: "Вчера, 18:12" },
  { id: "DOC-2031", title: "Заявление на отпуск",     type: "leave",   status: "signed", when: "30 мая, 10:20" },
  { id: "DOC-2028", title: "Счёт за аренду склада",   type: "utility", status: "draft",  when: "Черновик" },
];
function StaffDocs({ onSend, sent, tgConnected, onConnectTelegram }) {
  const all = [...(sent || []), ...STAFF_DOCS];
  return (
    <div>
      <PageHeader title="Мои документы" sub="Отправленные на подпись и черновики" />

      {!tgConnected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, marginBottom: 18, background: "rgba(34,158,217,.08)", border: "1px solid rgba(34,158,217,.25)" }}>
          <TelegramGlyph size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "calc(16px * var(--s))", fontWeight: 600, color: "var(--text)" }}>Подключите Telegram</div>
            <div style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-2)" }}>Получайте уведомление сразу, как только документ подпишут.</div>
          </div>
          <Button kind="primary" size="md" onClick={onConnectTelegram} style={{ background: "#229ED9", boxShadow: "0 2px 10px rgba(34,158,217,.35)" }}>Подключить</Button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <TelegramTag label="Telegram подключён" />
          <span style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--text-3)" }}>уведомления приходят в чат {TELEGRAM.bot}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {all.map((d, i) => {
          const t = DOC_TYPES[d.type];
          return (
            <div key={d.id + i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "var(--surface)", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 0 0 .5px var(--border)" }}>
              <DocGlyph type={d.type} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "calc(16.5px * var(--s))", fontWeight: 600, color: "var(--text)" }}>{d.title}</div>
                <div style={{ fontSize: "calc(14px * var(--s))", color: "var(--text-2)" }}>{t.label} · {d.when}</div>
              </div>
              {d.status === "pending" && <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "calc(14px * var(--s))", color: "var(--text-3)" }}><Icon name="clock" size={17} /> У директора</span>}
              <StatusBadge kind={d.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function Empty({ title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-3)" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--surface)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: "0 0 0 .5px var(--border)" }}>
        <Icon name="tray" size={30} />
      </div>
      <div style={{ fontSize: "calc(19px * var(--s))", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: "calc(15px * var(--s))" }}>{sub}</div>
    </div>
  );
}

Object.assign(window, {
  PageHeader, SearchField, LayoutSwitch, DirectorQueue, SignedHistory, Journal,
  StaffDocs, STAFF_DOCS, Empty, ACTION_META,
});
