# BORN FIRE — Calling Choir landing page

Promo landing page for **BORN FIRE (CALLING GOSPEL LIVE SHOW VOL.1)**, the debut live album by Calling Choir (콜링콰이어).
Static site, no build step: `index.html` (Korean) and `en/index.html` (English) share `assets/site.css` and `assets/site.js`. Every track in the tracklist plays its official live video inline.

Live: https://lightf0903.github.io/BORN-FIRE/

## Editing

- Tracks and video IDs: the `TRACKS` array near the bottom of each page (`[number, name, credit, youtubeId]`; empty id = "video coming soon"). The page's own button words sit next to it in `PAGE`.
- Design or behaviour changes go in `assets/site.css` / `assets/site.js` once, for both pages. After changing them, bump `?v=1` in both pages so visitors get the new file.
- Share image: `assets/og-image.png` (1200×630).
- Streaming links (Melon, Spotify, Apple Music…) can be added as buttons in the Follow section.
