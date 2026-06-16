# Urgent documents design update

_Started 2026-06-15 07:03 UTC_

---

## User

Design the document cards in this style.
Keep all tags abbreviated, matching the PC version.
Urgent documents should feature a red theme, similar to the provided image.

## Assistant

## Assistant

_[tool: view_image]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Now I understand the structure. Let me add a reusable `Flame` icon to `ui.jsx`, then redesign the mobile document cards with the header-strip style from your image.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now let me add the `MDocHeader` helper and redesign the document cards in `mobile-app.jsx`:

_[tool: str_replace_edit]_

Now the signed cards — apply the same header strip, keeping the Telegram receipt footer:

_[tool: str_replace_edit]_

Now the staff documents cards (no sender person — header strip + title + status badge):

_[tool: str_replace_edit]_

Now the search result cards, for consistency:

_[tool: str_replace_edit]_

Let me wire the chosen priority into newly sent docs so the urgent red theme appears when staff sends an urgent document:

_[tool: str_replace_edit]_

Now let me verify it renders correctly:

_[tool: show_html]_

_[tool: show_html]_

The cards render with the header strips, but the bodies are being vertically compressed (avatars clipped to half-domes, subtitle lines hidden) — the cards are shrinking as flex items. Let me fix `MCard` to not shrink:

_[tool: str_replace_edit]_

_[tool: show_html]_

The cards now render exactly in the style of your reference image — a colored type strip up top (with the abbreviated tag matching the PC version: «Отпуск», «Счёт», «Закупка», «Предложение»), timestamp on the right, and a white body with avatar, title, detail and sender. The urgent invoice carries the full red theme with the «🔥 Срочно» badge, matching the provided image.

_[tool: done]_

Done. The mobile document cards now use the header-strip style from your image:

- **Type tag** in the strip uses the abbreviated PC labels (Отпуск, Счёт, Закупка, Предложение), with the matching type tint.
- **Timestamp** sits on the right of the strip.
- **Body** has the round initials avatar, bold title, detail line, and sender name.
- **Urgent docs** get the solid red strip with white text and the «🔥 Срочно» badge.

Applied consistently across the director queue, signed list, staff documents, and search results. Urgent priority chosen in the "send" flow now also renders the red theme on the resulting card.

## User

Urgent documents will now follow a design similar to this. The only difference is a light theme instead of dark.

## Assistant

_[tool: view_image]_

## Assistant

## Assistant

The new reference applies the red theme to the **entire** urgent card (tinted body + red border) rather than just the strip, uses a ⚡ bolt with «Срочный», and I'll do the light-theme version. Let me add a `Bolt` icon and rework the urgent treatment.

_[tool: str_replace_edit]_

## Assistant

_[tool: str_replace_edit]_

Now rework `MDocHeader` and add the urgent card-level treatment in `mobile-app.jsx`:

_[tool: str_replace_edit]_

