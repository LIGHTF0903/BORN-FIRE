# BORN FIRE — Calling Choir landing page

Promo landing page for **BORN FIRE (CALLING GOSPEL LIVE SHOW VOL.1)**, the debut live album by Calling Choir (콜링콰이어).
Static HTML/CSS/JS, no build step. English by default, Korean via the EN/KO toggle (or `?lang=ko`; Korean browsers switch automatically).

Live URL (after GitHub Pages is on): https://lightf0903.github.io/born-fire/

## Things to fill in

| What | Where |
| --- | --- |
| Official album cover | Save as `assets/cover.jpg` (square, 1200×1200 or larger). Until then a generated placeholder is shown. |
| Streaming links | `index.html`, section `#listen`: replace each `href="#"` (Spotify, Apple Music, YouTube Music, Melon, Genie, Bugs). Links left as `#` show "Soon". |
| Share image | `assets/og-image.png` (1200×630) is a generated placeholder; replace with official artwork if you like. |
| Custom domain | If you use one, update the `canonical`, `og:url`, `og:image` and JSON-LD URLs in `index.html`. |

## Enable GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save.
