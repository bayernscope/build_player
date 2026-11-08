/* Build Your Player – game logic. You normally only need to edit data.js */
(function () {
  "use strict";
  const D = window.BUILDER_DATA;
  const K = D.kit;
  const ATTRS = D.attributes;
  const STAT_KEYS = ATTRS.map(a => a.key);

  /* ---------- Card geometry (1080 x 1350, Instagram 4:5) ---------- */
  const W = 1080, H = 1350, PX = 320, PY = 262, S = 1.1;
  const toCard = (x, y) => [PX + x * S, PY + y * S];
  const LEFT_COL = ["heading", "stamina", "defending", "shooting", "rightFoot"];
  const RIGHT_COL = ["vision", "passing", "pace", "dribbling", "leftFoot"];
  const ANCHOR = {
    heading: [172, 60], vision: [251, 112], stamina: [146, 375], defending: [98, 360],
    shooting: [40, 700], rightFoot: [140, 742], passing: [302, 360],
    pace: [268, 432], dribbling: [232, 630], leftFoot: [262, 742]
  };
  const GREY = 'fill="#39415a" stroke="#5f6b8a" stroke-width="2" stroke-dasharray="6 5"';

  /* ---------- State ---------- */
  let st;
  function reset(mode) {
    st = { stage: mode ? "build" : "mode", mode: mode || null, position: null,
           history: [], picks: {}, number: "", pop: null };
  }
  reset();

  const players = () => (st.mode ? D.modes[st.mode].players : []);
  const byId = id => players().find(p => p.id === id);
  const used = id => Object.values(st.picks).includes(id);
  const stepIndex = () => st.history.length;
  const pos = () => D.positions.find(p => p.id === st.position);

  /* ---------- Helpers ---------- */
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const fit = (text, maxW, base) => Math.min(base, Math.floor(maxW / (String(text).length * 0.6)));

  // All players, best first for this attribute; players already used go to the bottom (disabled)
  function optionsFor(key) {
    const sorted = players().slice().sort((a, b) => b.stats[key] - a.stats[key]);
    return sorted.filter(p => !used(p.id)).concat(sorted.filter(p => used(p.id)));
  }
  const usedFor = id => { const k = Object.keys(st.picks).find(k => st.picks[k] === id); return k ? ATTRS.find(a => a.key === k).label : ""; };

  /* ---------- Rating ---------- */
  /* ---------- Trained model (model.js, made by training/train_model.py) ----------
     rating = base + sum(weight x attribute); each position has its own weights,
     or uses the shared weights + its own base value.                              */
  function predictModel(M) {
    const code = String(pos().code);
    const x = M.attributes.map(k => byId(st.picks[k]).stats[k]);
    const own = M.positions && M.positions[code];
    const coef = own ? own.coef : M.shared.coef;
    const base = own ? own.intercept : (M.shared.base[code] || 0);
    return base + coef.reduce((t, w, i) => t + w * x[i], 0);
  }

  function computeRating() {
    const M = window.BUILDER_MODEL;
    if (M && pos() && STAT_KEYS.every(k => st.picks[k])) {
      return { value: Math.max(60, Math.min(99, Math.round(predictModel(M)))), penalty: 0, badges: [], model: true };
    }
    const p = pos(); // no position yet = plain average
    let sum = 0, wsum = 0;
    STAT_KEYS.forEach(k => {
      if (!st.picks[k]) return;
      const w = p ? (p.weights[k] || 1) : 1;
      sum += w * byId(st.picks[k]).stats[k]; wsum += w;
    });
    if (!wsum) return null;
    let r = sum / wsum;
    let penalty = 0;
    if (st.picks.leftFoot && st.picks.rightFoot) {
      const diff = Math.abs(byId(st.picks.leftFoot).stats.leftFoot - byId(st.picks.rightFoot).stats.rightFoot);
      for (const wf of D.weakFoot) if (diff >= wf.diff) { penalty = wf.penalty; break; }
    }
    const badges = earnedBadges();
    const bonus = badges.reduce((s, b) => s + (b.bonus || 0), 0);
    return { value: Math.max(60, Math.min(99, Math.round(r - penalty + bonus))), penalty, badges };
  }
  function earnedBadges() {
    const ids = [...new Set(Object.values(st.picks))];
    return D.badges.filter(b => ids.filter(id => (byId(id).tags || []).includes(b.tag)).length >= b.min);
  }
  const tierFor = v => (D.tiers.find(t => v >= t.min) || {}).label || "";

  /* Card code: 20 codes per rating (60-99). The same build always gets the same code. */
  const CODES = atob(window.BUILDER_CODES).split(",");
  const PER = CODES.length / 40;
  function cardCode() {
    const R = computeRating(); if (!R || !st.position) return "";
    const key = st.mode + "|" + st.position + "|" + STAT_KEYS.map(k => st.picks[k]).join(",");
    let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return CODES[(R.value - 60) * PER + (h % PER)];
  }


  /* ---------- Cartoon player (local coords 400 x 780) ---------- */
  function playerSVG(opt) {
    const on = k => !!st.picks[k];
    const wrap = (k, inner) => `<g class="part${!opt.exporting && st.pop === k ? " pop" : ""}">${inner}</g>`;
    const P = k => (st.picks[k] ? byId(st.picks[k]) : null);
    const skin = K.skin;
    const hair = (P("heading") && P("heading").hair) || K.hair;
    const number = st.number;
    const gold = K.gold || "#d8b46a";
    // Chest: sponsor letter with a dot on each side, original kit-maker mark, BYN badge
    const chestGraphics = () => {
      const letter = esc(K.chestMark || "B");
      const sponsor = `<rect x="150" y="300" width="15" height="15" rx="2" fill="#fff"/><rect x="235" y="300" width="15" height="15" rx="2" fill="#fff"/>
        <text x="200" y="322" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="72" fill="#fff">${letter}</text>`;
      const mark = `<g transform="translate(160 240)"><path d="M-11 6 L0 -6 L11 6 L6 6 L0 0 L-6 6 Z M-11 13 L0 1 L11 13 L6 13 L0 7 L-6 13 Z" fill="#fff"/></g>`;
      const badge = `<g transform="translate(240 242)">
          <circle r="19" fill="${K.shirt}" stroke="#fff" stroke-width="2"/>
          <circle r="14.5" fill="#fff"/>
          <circle r="14.5" fill="url(#loz)" clip-path="url(#badgeLow)"/>
          <text y="-1" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="10.5" fill="${K.shirt}">${esc(K.badgeText || "BYN")}</text>
        </g>`;
      return sponsor + mark + badge;
    };
    let s = `<defs><pattern id="pin" width="9" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="2.2" height="20" fill="${K.pinstripe || K.shirtShade}"/></pattern>
      <pattern id="loz" width="7" height="9" patternUnits="userSpaceOnUse"><rect width="7" height="9" fill="#fff"/><polygon points="3.5,0 7,4.5 3.5,9 0,4.5" fill="${K.badgeBlue || "#1f63b8"}"/></pattern>
      <clipPath id="badgeLow"><path d="M-15 1 L15 1 L15 16 L-15 16 Z"/></clipPath></defs>
      <ellipse cx="200" cy="760" rx="175" ry="20" fill="#ffffff" opacity="0.07"/>`;

    // Ball – shooting
    s += wrap("shooting", on("shooting")
      ? `<circle cx="62" cy="716" r="36" fill="#fff" stroke="#1c1c1c" stroke-width="3"/>
         <polygon points="62,703 74,712 70,726 54,726 50,712" fill="#1c1c1c"/>
         <path d="M62 703 L62 681 M74 712 L95 705 M70 726 L83 744 M54 726 L41 744 M50 712 L29 705" stroke="#1c1c1c" stroke-width="3"/>`
      : `<circle cx="62" cy="716" r="36" ${GREY}/>`);

    // Thighs + shorts – pace
    const thighs = c => `<rect x="147" y="470" width="42" height="92" rx="14" ${c}/><rect x="211" y="470" width="42" height="92" rx="14" ${c}/>`;
    const shortsPath = "M132 398 L268 398 L281 502 L208 507 L200 468 L192 507 L119 502 Z";
    s += wrap("pace", on("pace")
      ? thighs(`fill="${skin}"`) + `<path d="${shortsPath}" fill="${K.shorts}"/>
         <path d="M134 404 L122 497 M266 404 L278 497" stroke="${K.trim}" stroke-width="6"/>
         <path d="M140 404 L128 497 M260 404 L272 497" stroke="${gold}" stroke-width="2.5"/>
         <path d="M121 499 L192 504 M279 499 L208 504" stroke="${K.trim}" stroke-width="4"/>
         <path d="M132 401 L268 401" stroke="${K.trim}" stroke-width="3" opacity="0.8"/>
         <text x="240" y="490" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="${K.numberColor}">${esc(number)}</text>`
      : thighs(GREY) + `<path d="${shortsPath}" ${GREY}/>`);

    // Socks – dribbling
    const sock = x => on("dribbling")
      ? `<rect x="${x}" y="553" width="40" height="166" rx="10" fill="${K.socks}"/>
         <path d="M${x} 563 Q${x} 553 ${x + 10} 553 L${x + 30} 553 Q${x + 40} 553 ${x + 40} 563 L${x + 40} 580 L${x} 580 Z" fill="${K.sockTop}"/>
         <rect x="${x}" y="580" width="40" height="3" fill="${gold}"/>
         <rect x="${x + 4}" y="600" width="32" height="2" fill="${gold}" opacity="0.8"/>
         <rect x="${x}" y="692" width="40" height="27" fill="#000" opacity="0.07"/>`
      : `<rect x="${x}" y="553" width="40" height="166" rx="10" ${GREY}/>`;
    s += wrap("dribbling", sock(149) + sock(211));

    // Boots – right foot (viewer left), left foot (viewer right, mirrored)
    const boot = k => {
      const d = "M150 710 L190 710 Q194 734 191 752 L118 754 Q110 736 130 729 Q146 722 150 710 Z";
      const inner = on(k)
        ? `<path d="${d}" fill="${K.boots}"/><path d="M118 754 L191 752" stroke="${K.bootSole}" stroke-width="6" stroke-linecap="round"/><path d="M140 735 L182 726" stroke="${K.shirt}" stroke-width="5" stroke-linecap="round"/>`
        : `<path d="${d}" ${GREY}/>`;
      return k === "leftFoot" ? `<g transform="translate(400 0) scale(-1 1)">${inner}</g>` : inner;
    };
    s += wrap("rightFoot", boot("rightFoot"));
    s += wrap("leftFoot", boot("leftFoot"));

    // Arms – defending (player's right = viewer left), passing (player's left, mirrored)
    const arm = k => {
      const sleeve = "M118 212 L140 204 L130 282 L86 292 Q90 246 118 212 Z";
      const fore = "M89 288 L127 279 L117 402 Q112 424 99 424 Q83 422 82 400 Z";
      const inner = on(k)
        ? `<path d="${fore}" fill="${skin}"/><circle cx="99" cy="428" r="15" fill="${skin}"/>
           <path d="${sleeve}" fill="${K.shirt}"/><path d="${sleeve}" fill="url(#pin)"/>
           <path d="M87 290 L130 280" stroke="${K.trim}" stroke-width="7" stroke-linecap="round"/>
           <path d="M89 284 L130 275" stroke="${gold}" stroke-width="2.5" stroke-linecap="round"/>`
        : `<path d="${fore}" ${GREY}/><circle cx="99" cy="428" r="15" ${GREY}/><path d="${sleeve}" ${GREY}/>`;
      return k === "passing" ? `<g transform="translate(400 0) scale(-1 1)">${inner}</g>` : inner;
    };
    s += wrap("defending", arm("defending"));
    s += wrap("passing", arm("passing"));

    // Neck (vision group, under the shirt)
    s += wrap("vision", `<rect x="183" y="156" width="34" height="42" rx="9" ${on("vision") ? `fill="${skin}"` : GREY}/>`);

    // Torso – stamina
    const torso = "M156 186 L244 186 L282 212 L270 405 L130 405 L118 212 Z";
    s += wrap("stamina", on("stamina")
      ? `<path d="${torso}" fill="${K.shirt}"/>
         <path d="${torso}" fill="url(#pin)"/>
         <path d="M244 186 L282 212 L270 405 L254 405 L258 228 Z" fill="${K.shirtShade}" opacity="0.45"/>
         <path d="M156 186 L118 212 L130 405 L146 405 L142 228 Z" fill="${K.shirtShade}" opacity="0.45"/>
         <path d="M170 189 L121 210 M230 189 L279 210" stroke="${K.trim}" stroke-width="4" stroke-linecap="round"/>
         <path d="M168 186 Q200 214 232 186" fill="none" stroke="${K.trim}" stroke-width="10" stroke-linecap="round"/>
         <path d="M173 193 Q200 216 227 193" fill="none" stroke="${gold}" stroke-width="2.5" stroke-linecap="round"/>
         ${chestGraphics()}`
      : `<path d="${torso}" ${GREY}/>`);

    // Head + eyes – vision, hair – heading
    const c = on("vision") ? `fill="${skin}"` : GREY;
    s += wrap("vision", `<ellipse cx="150" cy="115" rx="9" ry="15" ${c}/><ellipse cx="250" cy="115" rx="9" ry="15" ${c}/><ellipse cx="200" cy="110" rx="50" ry="60" ${c}/>`
      + (on("vision")
        ? `<path d="M170 92 Q182 86 193 91 M207 91 Q218 86 230 92" stroke="${hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
           <ellipse cx="182" cy="108" rx="6" ry="7.5" fill="#1b1b1b"/><ellipse cx="218" cy="108" rx="6" ry="7.5" fill="#1b1b1b"/>
           <circle cx="184" cy="105" r="2" fill="#fff"/><circle cx="220" cy="105" r="2" fill="#fff"/>
           <path d="M200 114 Q207 128 198 131" stroke="#b07a5a" stroke-width="3" fill="none" stroke-linecap="round"/>
           <path d="M185 143 Q200 153 215 143" stroke="#8a4a3a" stroke-width="4" fill="none" stroke-linecap="round"/>`
        : ""));
    const hairPath = "M149 104 Q144 44 200 40 Q256 44 251 104 Q247 74 222 68 Q200 78 178 68 Q153 74 149 104 Z";
    s += wrap("heading", on("heading") ? `<path d="${hairPath}" fill="${hair}"/>` : `<path d="${hairPath}" ${GREY}/>`);
    return `<g transform="translate(${PX} ${PY}) scale(${S})">${s}</g>`;
  }

  /* ---------- Full card ---------- */
  function cardSVG(opt = {}) {
    const mode = st.mode ? D.modes[st.mode] : null;
    const R = computeRating();
    const done = st.stage === "done";
    const label = k => (ATTRS.find(a => a.key === k) || {}).label || k;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial, Helvetica, sans-serif">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1430"/><stop offset="1" stop-color="#1c0812"/></linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${K.shirt}" stop-opacity="0.45"/><stop offset="1" stop-color="${K.shirt}" stop-opacity="0"/></radialGradient>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2d55"/><stop offset="1" stop-color="#8f0019"/></linearGradient>
        <pattern id="rh" width="64" height="38" patternUnits="userSpaceOnUse"><polygon points="32,1 63,19 32,37 1,19" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="2"/></pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#rh)"/>
      <circle cx="540" cy="700" r="460" fill="url(#glow)"/>`;

    // Header
    s += `<text x="44" y="78" font-size="26" font-weight="700" letter-spacing="7" fill="#ff8da1">BUILD YOUR</text>
      <text x="40" y="150" font-size="${fit(mode ? mode.title : "PLAYER", 780, 78)}" font-family="Arial Black, Arial, sans-serif" font-weight="900" fill="#fff">${esc(mode ? mode.title : "PLAYER")}</text>`;
    // Position (no name, no rating on the card)
    if (pos()) s += `<text x="44" y="200" font-size="34" font-style="italic" font-weight="700" fill="#ffd2da">${esc(pos().label)}</text>`;
    // Code in the yellow bar
    const code = done ? cardCode() : "";
    if (code) {
      const w = code.length * 26 + 44;
      s += `<rect x="44" y="220" width="${w}" height="50" rx="25" fill="#ffd34d"/>
        <text x="${44 + w / 2}" y="256" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="29" letter-spacing="5" fill="#3a2600">${esc(code)}</text>`;
    }

    // Player
    s += playerSVG(opt);

    // Callouts
    const block = (k, i, side, n) => {
      const top = 340, bottom = 1130;
      const y = top + i * ((bottom - top) / (n - 1));
      const p = st.picks[k] ? byId(st.picks[k]) : null;
      const [ax, ay] = toCard(...ANCHOR[k]);
      const x0 = side === "L" ? 40 : W - 40, anchor = side === "L" ? "start" : "end";
      const edge = side === "L" ? 300 : W - 300;
      const lineY = y + 2;
      const col = p ? "#ffffff" : "#56607c";
      let b = `<path d="M${edge} ${lineY} L${side === "L" ? edge + 22 : edge - 22} ${lineY} L${ax} ${ay}" fill="none" stroke="${col}" stroke-opacity="${p ? 0.55 : 0.5}" stroke-width="2" ${p ? "" : 'stroke-dasharray="5 6"'}/>
        <circle cx="${ax}" cy="${ay}" r="${p ? 7 : 5}" fill="${p ? "#fff" : "#56607c"}" ${p ? 'stroke="' + K.shirt + '" stroke-width="3"' : ""}/>
        <text x="${x0}" y="${y - 14}" text-anchor="${anchor}" font-size="19" font-weight="800" letter-spacing="4" fill="${p ? "#ff8da1" : "#6c7694"}">${esc(label(k).toUpperCase())}</text>`;
      if (p) {
        const fs = fit(p.short, 255, 36);
        b += `<text x="${x0}" y="${y + 22}" text-anchor="${anchor}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" fill="#fff">${esc(p.short)}</text>`;
      } else {
        b += `<text x="${x0}" y="${y + 22}" text-anchor="${anchor}" font-size="32" font-weight="900" fill="#4c5571">?</text>`;
      }
      return b;
    };
    LEFT_COL.forEach((k, i) => (s += block(k, i, "L", LEFT_COL.length)));
    RIGHT_COL.forEach((k, i) => (s += block(k, i, "R", RIGHT_COL.length)));

    // Footer
    s += `<line x1="40" y1="1262" x2="${W - 40}" y2="1262" stroke="#fff" stroke-opacity="0.15" stroke-width="2"/>
      <text x="40" y="1308" font-size="20" fill="#aab3cc">${esc(D.disclaimer)}</text>
      <text x="${W - 40}" y="1308" text-anchor="end" font-size="22" font-weight="800" fill="#fff">${esc(D.siteUrl)}</text>
    </svg>`;
    return s;
  }

  /* ---------- Panel UI ---------- */
  const $ = sel => document.querySelector(sel);
  const avatar = p => p.photo
    ? `<img class="av" src="${esc(p.photo)}" alt="" loading="lazy">`
    : `<span class="av">${esc(initials(p.name))}<small>${esc(p.number)}</small></span>`;
  const positionButtons = () => D.positions.map(p => {
    const keys = Object.entries(p.weights).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => ATTRS.find(a => a.key === k).label);
    return `<button class="pos${st.position === p.id ? " on" : ""}" data-pos="${p.id}" ${st.number === "" ? "disabled" : ""}><b>${esc(p.id)}</b><strong>${esc(p.label)}</strong><span>Key: ${esc(keys.join(", "))}</span></button>`;
  }).join("");

  const numberInput = () => `<label class="name">Enter the number of your player (0-99)
      <input id="num" type="text" inputmode="numeric" maxlength="2" placeholder="e.g. 10" value="${esc(st.number)}"></label>`;
  function bindNumber() {
    const el = $("#num"); if (!el) return;
    el.addEventListener("input", () => {
      const v = el.value.replace(/\D/g, "").slice(0, 2);
      el.value = v; st.number = v === "" ? "" : String(parseInt(v, 10));
      st.pop = null; $("#card").innerHTML = cardSVG();
      document.querySelectorAll("[data-pos]").forEach(b => (b.disabled = st.number === ""));
    });
  }

  function render() {
    $("#card").innerHTML = cardSVG();
    const panel = $("#panel");
    if (st.stage === "mode") {
      panel.innerHTML = `<h1>${esc(D.siteTitle)}</h1>
        <p class="lead">Pick one player for each part. Your player gets built piece by piece, then you get a card to share.</p>
        <div class="modes">${Object.entries(D.modes).map(([id, m]) => `
          <button class="mode" data-mode="${id}"><strong>${esc(m.label)}</strong><span>${esc(m.subtitle)} · ${m.players.length} players</span></button>`).join("")}
        </div>`;
    } else if (st.stage === "position") {
      panel.innerHTML = `<div class="top"><span class="step">Last step</span><button class="link" data-act="undo">Undo last pick</button></div>
        <div class="bar"><i style="width:100%"></i></div>
        <h2>Number &amp; position</h2><p class="lead">Your player is built. Give him a number, then choose where he plays.</p>
        ${numberInput()}
        <div class="positions">${positionButtons()}</div>`;
    } else if (st.stage === "build") {
      const i = stepIndex(), a = ATTRS[i];
      const opts = optionsFor(a.key);
      panel.innerHTML = `<div class="top"><span class="step">Step ${i + 1} / ${ATTRS.length}</span>
          <span><button class="link" data-act="undo" ${i ? "" : "disabled"}>Undo</button><button class="link" data-act="restart">Restart</button><button class="link" data-act="home">Change edition</button></span></div>
        <div class="bar"><i style="width:${(i / ATTRS.length) * 100}%"></i></div>
        <h2>${esc(a.label)}</h2><p class="lead">${esc(a.hint)}</p>
        <div class="opts">${opts.map(p => { const u = used(p.id); return `
          <button class="opt${u ? " used" : ""}" data-pick="${p.id}" ${u ? "disabled" : ""}>${avatar(p)}
            <span class="nm">${esc(p.name)}${u ? `<em>Used for ${esc(usedFor(p.id))}</em>` : ""}</span>
            ${D.showScores ? `<span class="sc"><i style="width:${p.stats[a.key]}%"></i><b>${p.stats[a.key]}</b></span>` : ""}
          </button>`; }).join("")}</div>`;
    } else if (st.stage === "done") {
      const code = cardCode();
      panel.innerHTML = `<div class="top"><span class="step">Your player is ready</span><button class="link" data-act="restart">Start over</button></div>
        <div class="result"><div class="code">${esc(code)}</div><div><strong>${esc(pos().label)}</strong>
          <span>Share your card and get your rating in the comments.</span></div></div>
        ${numberInput()}
        <details class="change"><summary>Try another position</summary><div class="positions">${positionButtons()}</div></details>
        <div class="actions">
          <button class="primary" data-act="share">Share image</button>
          <button data-act="download">Download PNG</button>
        </div>
        <div class="actions">
          <button data-act="again">Build another</button>
          <button data-act="home">Change edition</button>
        </div>
        <p class="note" id="msg"></p>`;
    }
    bindNumber();
    st.pop = null;
  }

  $("#panel").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.mode) { reset(b.dataset.mode); }
    else if (b.dataset.pos) { st.position = b.dataset.pos; st.stage = "done"; }
    else if (b.dataset.pick) {
      const k = ATTRS[stepIndex()].key;
      st.picks[k] = b.dataset.pick; st.history.push(k); st.pop = k;
      if (stepIndex() >= ATTRS.length) st.stage = "position";
      if (window.matchMedia("(max-width: 860px)").matches) $("#card").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      const act = b.dataset.act;
      if (act === "home") reset();
      if (act === "restart" || act === "again") reset(st.mode);
      if (act === "undo") {
        const k = st.history.pop(); delete st.picks[k];
        st.position = null; st.stage = "build";
      }
      if (act === "download" || act === "share") { await exportImage(act); return; }
    }
    render();
  });

  /* ---------- Export ---------- */
  async function renderPNG() {
    const svg = cardSVG({ exporting: true });
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(img, 0, 0, W, H);
    return new Promise(r => c.toBlob(r, "image/png"));
  }
  async function exportImage(how) {
    const msg = $("#msg");
    try {
      const blob = await renderPNG();
      const fname = "my-" + st.mode + "-" + cardCode().toLowerCase() + ".png";
      const file = new File([blob], fname, { type: "image/png" });
      if (how === "share" && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: D.siteTitle, text: `My ${pos().label}, code ${cardCode()}. What's my rating? Build yours: ${D.siteUrl}` });
        return;
      }
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
      if (how === "share") msg.textContent = "Sharing isn't supported on this device, so the image was downloaded instead.";
    } catch (err) {
      if (err && err.name === "AbortError") return;
      msg.textContent = "Couldn't create the image: " + (err && err.message ? err.message : err);
    }
  }

  document.title = D.siteTitle;
  render();
  window.__builder = { get state() { return st; }, renderPNG, cardCode, computeRating, setState: o => { Object.assign(st, o); render(); } };
})();
