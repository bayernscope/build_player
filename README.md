# Build Your Player

A static fan site: pick one player for each attribute (left foot, right foot, pace, shooting,
passing, vision, dribbling, heading, defending, stamina, face) and your player is drawn piece by
piece. At the end you get a 1080x1350 card with a rating to download or share.

## Files
- `index.html` – the page (no need to edit)
- `style.css` – page look (no need to edit)
- `app.js` – game logic and drawing (no need to edit)
- `data.js` – **everything you edit**: texts, kit colours, players, scores, positions, rating weights, badges
- `faces/` – optional face photos

## Publish free on GitHub Pages
1. Create a GitHub account, then a **public** repository named `<username>.github.io`
   (or any name: the site will then be at `<username>.github.io/<repo-name>`).
2. Upload all these files (keep the `faces` folder).
3. Repository **Settings → Pages → Deploy from a branch → main / root → Save**.
4. After 1-2 minutes the site is live. Put that address in `siteUrl` in `data.js`.

## Test on your computer
Double-clicking `index.html` works, but face photos only appear in the exported image when the
site runs from a web server. For a local test, run `python -m http.server` in this folder and
open http://localhost:8000.

## Common edits (all in data.js)
- Change a score: edit the number in the player's `stats`.
- Add a player: copy a player line, give it a new unique `id`.
- Change the rating formula: edit the `weights` of a position (bigger = more important).
- Change the kit: edit the colours in `kit`.
