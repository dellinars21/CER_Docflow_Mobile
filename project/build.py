#!/usr/bin/env python3
"""Bundle the CER Mobile design (JSX modules + logo) into a single
self-contained index.html at the repo root."""
import base64
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return f.read()


# Logo embedded as a data URL so the file needs no external assets.
with open(os.path.join(HERE, "assets", "cer-logo.png"), "rb") as f:
    LOGO = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

# Home-screen app icon (180×180), embedded too.
with open(os.path.join(HERE, "assets", "apple-touch-icon.png"), "rb") as f:
    APP_ICON = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

# Load modules in dependency order (mirrors the original HTML's <script> order).
MODULES = [
    "data.jsx", "ui.jsx", "signing.jsx", "screens.jsx",
    "ios-frame.jsx", "tg-api.jsx", "mobile-app.jsx", "leave-mobile.jsx", "mobile-shell.jsx",
]
sources = {m: read(m) for m in MODULES}

# Inline the logo where the prototype referenced it from disk.
for m in ("signing.jsx", "mobile-app.jsx"):
    sources[m] = sources[m].replace('"assets/cer-logo.png"', f'"{LOGO}"')

scripts = "\n".join(
    f'<script type="text/babel">\n{sources[m]}\n</script>' for m in MODULES
)

HTML = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Документооборот CER — Mobile</title>
<!-- Installable web app: tap Share → Add to Home Screen in Safari -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="CER" />
<meta name="theme-color" content="#F2F2F7" />
<link rel="apple-touch-icon" href="{APP_ICON}" />
<link rel="icon" href="{APP_ICON}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap" rel="stylesheet" />
<style>
  :root {{
    --ui-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui, sans-serif;
    --s: 1;
    /* Safe-area insets — 0 inside the desktop frame, real values on a notched
       device (iPhone 15 Dynamic Island ≈ 59px top, home indicator ≈ 34px bottom). */
    --sat: env(safe-area-inset-top, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
    --bg: #F2F2F7; --surface: #ffffff; --surface-2: #f4f4f6;
    --accent: #0a84ff; --accent-weak: rgba(10,132,255,.12);
    --text: #1d1d1f; --text-2: #6e6e73; --text-3: #a1a1a6;
    --border: rgba(0,0,0,.10); --hairline: rgba(0,0,0,.07);
  }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; padding: 0; height: 100%; }}
  body {{
    font-family: var(--ui-font);
    background: #e7e7ec;
    color: #1d1d1f;
    -webkit-font-smoothing: antialiased;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px;
  }}
  button {{ font-family: inherit; -webkit-tap-highlight-color: transparent; }}
  #root {{ display: flex; align-items: center; justify-content: center; }}
  *::-webkit-scrollbar {{ width: 0; height: 0; }}

  /* Full-bleed device on real phones (matches IOSDevice's compact branch). */
  .ios-fill {{ width: 100vw; height: 100vh; height: 100dvh; }}
  @media (max-width: 640px) {{
    body {{ padding: 0; background: #F2F2F7; align-items: stretch; justify-content: stretch; }}
    #root {{ display: block; width: 100%; height: 100dvh; }}
  }}

  @keyframes popIn {{ from {{ opacity: 0; transform: scale(.9); }} to {{ opacity: 1; transform: scale(1); }} }}
  .popIn {{ animation: popIn .28s cubic-bezier(.2,.9,.3,1.2); }}
  @keyframes sheetUp {{ from {{ transform: translateY(100%); }} to {{ transform: translateY(0); }} }}
  .sheetUp {{ animation: sheetUp .32s cubic-bezier(.2,.8,.25,1); }}
  @keyframes fadeIn {{ from {{ opacity: 0; }} to {{ opacity: 1; }} }}
  .fadeIn {{ animation: fadeIn .2s ease; }}
  @keyframes toastIn {{ from {{ opacity: 0; transform: translateX(-50%) translateY(-12px); }} to {{ opacity: 1; transform: translateX(-50%) translateY(0); }} }}
  .toastIn {{ animation: toastIn .3s cubic-bezier(.2,.8,.3,1); }}
  @keyframes tgSpin {{ to {{ transform: rotate(360deg); }} }}
  .tgSpin {{ animation: tgSpin .8s linear infinite; }}
  @keyframes fieldPulse {{ 0%,100% {{ opacity: .85; }} 50% {{ opacity: 1; }} }}
  .mFieldPulse {{ animation: fieldPulse 1.8s ease-in-out infinite; }}
  @media (prefers-reduced-motion: reduce) {{ .popIn,.sheetUp,.fadeIn,.toastIn,.mFieldPulse {{ animation: none; }} }}

  .mTap {{ transition: transform .1s ease, background .12s ease; }}
  .mTap:active {{ transform: scale(.985); }}
</style>
</head>
<body>
<div id="root"></div>

<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

{scripts}
</body>
</html>"""

out = os.path.join(ROOT, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(HTML)
print(f"Wrote {len(HTML):,} bytes to {out}")
