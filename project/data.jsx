// data.jsx — sample users, documents, audit log (Russian). Demo content for CER.

const COMPANY = {
  name: "Caspian Engineering & Research",
  ru: "Каспийский инжиниринг и исследования",
  short: "CER",
};

// Telegram delivery channel — the bot that notifies senders & directors.
const TELEGRAM = {
  bot: "@CER_docs_bot",
  channel: "Telegram",
  blue: "#229ED9",
};

// People in the org. Two are "switchable accounts" for the demo (director + staff).
const USERS = {
  director: {
    id: "director",
    name: "Асылжан Акботин",
    role: "Директор по операциям",
    roleKey: "director",
    initials: "АА",
    tint: "#0a84ff",
  },
  staff: {
    id: "staff",
    name: "Ольга Иванова",
    role: "Бухгалтерия",
    roleKey: "staff",
    initials: "ОИ",
    tint: "#34c759",
  },
};

// Other requesters (appear as senders in the queue).
const PEOPLE = {
  samir:   { name: "Самир Гасанов",  dept: "Отдел бурения",  initials: "СГ", tint: "#ff9500" },
  dmitri:  { name: "Дмитрий Петров", dept: "Снабжение",      initials: "ДП", tint: "#5e5ce6" },
  leyla:   { name: "Лейла Рагимова", dept: "Договорной отдел",initials: "ЛР", tint: "#ff2d55" },
  olga:    { name: "Ольга Иванова",  dept: "Бухгалтерия",    initials: "ОИ", tint: "#34c759" },
};

// Document type metadata — drives the icon, the suggested signature field,
// and the page template rendered in the preview.
const DOC_TYPES = {
  leave: {
    key: "leave",
    label: "Заявление на отпуск",
    short: "Отпуск",
    tint: "#34c759",
    // Suggested signature field, as % of the page (where to drop the signature).
    field: { page: 0, x: 78, y: 86, w: 26, label: "Подпись руководителя" },
  },
  utility: {
    key: "utility",
    label: "Коммунальный счёт",
    short: "Счёт",
    tint: "#ff9500",
    field: { page: 0, x: 77, y: 87, w: 28, label: "Утверждаю" },
  },
  purchase: {
    key: "purchase",
    label: "Заказ на покупку",
    short: "Закупка",
    tint: "#5e5ce6",
    field: { page: 0, x: 77, y: 87, w: 28, label: "Согласовано" },
  },
  proposal: {
    key: "proposal",
    label: "Коммерческое предложение",
    short: "Предложение",
    tint: "#0a84ff",
    field: { page: 0, x: 76, y: 87, w: 30, label: "Директор" },
  },
};

// Pending queue (awaiting the director's signature).
const QUEUE = [
  {
    id: "DOC-2041",
    title: "Заявление на отпуск",
    subtitle: "Гасанов С. — ежегодный, 14 дней",
    type: "leave",
    from: "samir",
    submitted: "Сегодня, 09:24",
    pages: 1,
    size: "148 КБ",
    priority: "Обычный",
    path: "/Отдел бурения/Кадры/2026",
  },
  {
    id: "DOC-2040",
    title: "Счёт за электроэнергию",
    subtitle: "АО «Азерэнержи» — март 2026",
    type: "utility",
    from: "olga",
    submitted: "Сегодня, 08:51",
    pages: 1,
    size: "212 КБ",
    priority: "Срочный",
    path: "/Бухгалтерия/Счета/Март",
  },
  {
    id: "DOC-2039",
    title: "Заказ на покупку №2026-0417",
    subtitle: "Буровые долота PDC — 6 шт.",
    type: "purchase",
    from: "dmitri",
    submitted: "Вчера, 17:02",
    pages: 2,
    size: "486 КБ",
    priority: "Обычный",
    path: "/Снабжение/Заказы/2026",
  },
  {
    id: "DOC-2038",
    title: "Коммерческое предложение",
    subtitle: "ООО «Каспий-Сервис» — логистика",
    type: "proposal",
    from: "leyla",
    submitted: "Вчера, 14:38",
    pages: 2,
    size: "640 КБ",
    priority: "Обычный",
    path: "/Договорной отдел/КП/2026",
  },
  {
    id: "DOC-2037",
    title: "Счёт за водоснабжение",
    subtitle: "АО «Мангистаумунайгаз» — март 2026",
    type: "utility",
    from: "olga",
    submitted: "Вчера, 11:15",
    pages: 1,
    size: "176 КБ",
    priority: "Обычный",
    path: "/Бухгалтерия/Счета/Март",
  },
  {
    id: "DOC-2036",
    title: "Заявление на отпуск",
    subtitle: "Рагимова Л. — за свой счёт, 3 дня",
    type: "leave",
    from: "leyla",
    submitted: "2 июня, 16:40",
    pages: 1,
    size: "132 КБ",
    priority: "Обычный",
    path: "/Договорной отдел/Кадры/2026",
  },
];

// Already-signed documents (history). `receipt` = director's read-receipt on the
// notification sent back to the employee via Telegram.
const SIGNED = [
  { id: "DOC-2035", title: "Заказ на покупку №2026-0411", type: "purchase", from: "dmitri", signed: "Сегодня, 08:30", receipt: { state: "read", time: "08:34" } },
  { id: "DOC-2034", title: "Счёт за интернет и связь",   type: "utility",  from: "olga",   signed: "Вчера, 18:12", receipt: { state: "read", time: "18:20" } },
  { id: "DOC-2033", title: "Заявление на отпуск",         type: "leave",    from: "samir",  signed: "Вчера, 12:05", receipt: { state: "delivered", time: "" } },
  { id: "DOC-2032", title: "Коммерческое предложение",    type: "proposal", from: "leyla",  signed: "2 июня, 15:20", receipt: { state: "read", time: "15:25" } },
];

// Audit log — every signature event, newest first.
const JOURNAL = [
  { id: "j8", doc: "DOC-2035", title: "Заказ на покупку №2026-0411", type: "purchase", actor: "director", action: "signed", when: "Сегодня, 08:30", detail: "Подпись добавлена · стр. 1" },
  { id: "j7", doc: "DOC-2035", title: "Заказ на покупку №2026-0411", type: "purchase", actor: "dmitri",   action: "notified", when: "Сегодня, 08:30", detail: "Уведомление в Telegram · прочитано 08:34" },
  { id: "j6", doc: "DOC-2034", title: "Счёт за интернет и связь",     type: "utility",  actor: "director", action: "signed", when: "Вчера, 18:12",  detail: "Подпись добавлена · стр. 1" },
  { id: "j5", doc: "DOC-2041", title: "Заявление на отпуск",          type: "leave",    actor: "samir",    action: "submitted", when: "Сегодня, 09:24", detail: "Отправлено на подпись" },
  { id: "j4", doc: "DOC-2033", title: "Заявление на отпуск",          type: "leave",    actor: "director", action: "signed", when: "Вчера, 12:05", detail: "Подпись добавлена · стр. 1" },
  { id: "j3", doc: "DOC-2040", title: "Счёт за электроэнергию",       type: "utility",  actor: "olga",     action: "submitted", when: "Сегодня, 08:51", detail: "Отправлено на подпись" },
  { id: "j2", doc: "DOC-2032", title: "Коммерческое предложение",     type: "proposal", actor: "director", action: "signed", when: "2 июня, 15:20", detail: "Подпись добавлена · стр. 2" },
  { id: "j1", doc: "DOC-2032", title: "Коммерческое предложение",     type: "proposal", actor: "leyla",    action: "notified", when: "2 июня, 15:21", detail: "Уведомление в Telegram · прочитано 15:25" },
];

// Files available on the internal server (for the "send for signature" picker).
const SERVER_FILES = [
  { name: "Заявление_отпуск_Иванова.pdf", type: "leave",    size: "138 КБ", modified: "Сегодня, 10:02", folder: "Кадры" },
  { name: "Счёт_электроэнергия_март.pdf", type: "utility",  size: "212 КБ", modified: "Сегодня, 08:40", folder: "Счета" },
  { name: "Счёт_водоснабжение_март.pdf",  type: "utility",  size: "176 КБ", modified: "Вчера, 16:30",   folder: "Счета" },
  { name: "Заказ_долота_PDC.pdf",         type: "purchase", size: "486 КБ", modified: "Вчера, 14:10",   folder: "Заказы" },
  { name: "КП_Каспий-Сервис.pdf",         type: "proposal", size: "640 КБ", modified: "2 июня, 17:55",  folder: "Договоры" },
  { name: "Заявление_отпуск_Гасанов.pdf", type: "leave",    size: "148 КБ", modified: "2 июня, 09:12",  folder: "Кадры" },
  { name: "Счёт_аренда_склад.pdf",        type: "utility",  size: "198 КБ", modified: "1 июня, 11:20",  folder: "Счета" },
  { name: "Заказ_трубопровод.pdf",        type: "purchase", size: "512 КБ", modified: "1 июня, 09:48",  folder: "Заказы" },
];

// ════════════════════════════════════════════════════════════════════════════
// LEAVE & ABSENCE — типы заявлений, маршрут согласования, баланс, заявления.
// ════════════════════════════════════════════════════════════════════════════

// Типы заявлений, сгруппированные: «Отпуск» и «Медицинские».
const LEAVE_TYPES = {
  annual:  { key: "annual",  group: "Отпуск",      label: "Ежегодный оплачиваемый отпуск", short: "Ежегодный отпуск", icon: "sun",      tint: "#34c759", balance: true,  hint: "Оплачиваемый, из годового баланса" },
  unpaid:  { key: "unpaid",  group: "Отпуск",      label: "Отпуск без сохранения зарплаты", short: "За свой счёт",    icon: "wallet",   tint: "#ff9500", balance: false, hint: "Без сохранения заработной платы" },
  sick:    { key: "sick",    group: "Медицинские", label: "Больничный лист",               short: "Больничный",      icon: "pulse",    tint: "#ff2d55", balance: false, hint: "По листку нетрудоспособности" },
  medcert: { key: "medcert", group: "Медицинские", label: "Медицинская справка",           short: "Медсправка",      icon: "clipboard",tint: "#5e5ce6", balance: false, hint: "Справка о посещении врача" },
};
const LEAVE_GROUPS = ["Отпуск", "Медицинские"];

// Годовой баланс отпуска (для ежегодного оплачиваемого).
const LEAVE_BALANCE = { total: 28, used: 10 }; // → 18 дней доступно

// Маршрут согласования заявления (5 этапов).
const LEAVE_ROUTE = [
  { key: "hr",       label: "Отдел кадров",          task: "Проверка и регистрация",      person: { name: "Эльмира Сулейменова", initials: "ЭС", tint: "#ff9500", role: "Специалист по кадрам" } },
  { key: "head",     label: "Руководитель отдела",   task: "Согласование",                person: { name: "Тимур Назаров",       initials: "ТН", tint: "#5e5ce6", role: "Главный бухгалтер" } },
  { key: "deputy",   label: "Зам. по проектированию",task: "Согласование",                person: { name: "Руслан Карим",        initials: "РК", tint: "#0a84ff", role: "Заместитель по проектированию" } },
  { key: "director", label: "Директор",              task: "Утверждение",                 person: USERS.director },
  { key: "order",    label: "Издание приказа",       task: "Кадровый приказ",             person: { name: "Отдел кадров",        initials: "ОК", tint: "#34c759", role: "Оформление приказа" } },
];

// Заявления сотрудника — реалистичный набор на разных этапах маршрута.
// stage = индекс текущего/остановившегося этапа. status: in_progress | approved | declined.
// times[i] — отметка времени по пройденному этапу (null — ещё не пройден).
const MY_REQUESTS = [
  {
    id: "REQ-118", type: "annual", start: "2026-07-06", end: "2026-07-19",
    submitted: "Сегодня, 09:40", stage: 1, status: "in_progress",
    times: ["Сегодня, 09:42", null, null, null, null],
  },
  {
    id: "REQ-117", type: "sick", start: "2026-06-08", end: "2026-06-12",
    submitted: "8 июня, 08:15", stage: 3, status: "in_progress",
    times: ["8 июня, 08:20", "8 июня, 10:05", "8 июня, 14:30", null, null],
  },
  {
    id: "REQ-115", type: "unpaid", start: "2026-06-22", end: "2026-06-24",
    submitted: "5 июня, 14:10", stage: 1, status: "declined",
    times: ["5 июня, 14:18", "6 июня, 09:30", null, null, null],
    declineNote: "Период совпадает со сдачей квартального отчёта. Прошу перенести.",
  },
  {
    id: "REQ-112", type: "annual", start: "2026-05-19", end: "2026-05-30",
    submitted: "12 мая, 10:05", stage: 5, status: "approved", orderNo: "№ 142-О",
    times: ["12 мая, 10:12", "12 мая, 15:40", "13 мая, 09:15", "13 мая, 16:50", "14 мая, 11:30"],
  },
  {
    id: "REQ-110", type: "medcert", start: "2026-06-03", end: "2026-06-03",
    submitted: "2 июня, 16:20", stage: 5, status: "approved", orderNo: "№ 139-О",
    times: ["2 июня, 16:25", "3 июня, 09:40", "3 июня, 11:10", "3 июня, 15:20", "4 июня, 10:00"],
  },
];

// ── Date helpers (Russian) ───────────────────────────────────────────────────
const RU_MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const RU_MONTHS_SHORT = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
function fmtRu(iso, short) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return short ? `${d} ${RU_MONTHS_SHORT[m - 1]}` : `${d} ${RU_MONTHS[m - 1]} ${y}`;
}
function fmtRange(start, end) {
  if (!start || !end) return "—";
  const [, ms] = start.split("-").map(Number);
  const [, me] = end.split("-").map(Number);
  if (start === end) return fmtRu(start);
  // same month: "6 — 19 июля 2026"
  const [sy, , sd] = start.split("-").map(Number);
  const [ey, mm, ed] = end.split("-").map(Number);
  if (ms === me && sy === ey) return `${sd} — ${ed} ${RU_MONTHS[mm - 1]} ${ey}`;
  return `${fmtRu(start)} — ${fmtRu(end)}`;
}
function daysBetween(a, b) {
  if (!a || !b) return 0;
  const diff = Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}
// Склонение: день / дня / дней
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
function daysLabel(n) { return `${n} ${plural(n, "день", "дня", "дней")}`; }

Object.assign(window, {
  COMPANY, TELEGRAM, USERS, PEOPLE, DOC_TYPES, QUEUE, SIGNED, JOURNAL, SERVER_FILES,
  LEAVE_TYPES, LEAVE_GROUPS, LEAVE_BALANCE, LEAVE_ROUTE, MY_REQUESTS,
  RU_MONTHS, RU_MONTHS_SHORT, fmtRu, fmtRange, daysBetween, plural, daysLabel,
});
