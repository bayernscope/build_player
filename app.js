/* Build Your Player – game logic. You normally only need to edit data.js */
(function () {
  "use strict";
  const D = window.BUILDER_DATA;
  const K = D.kit;
  const ATTRS = D.attributes;
  const STAT_KEYS = ATTRS.map(a => a.key).filter(k => k !== "face");

  /* ---------- Card geometry (1080 x 1350, Instagram 4:5) ---------- */
  const W = 1080, H = 1350, PX = 320, PY = 262, S = 1.1;
  const toCard = (x, y) => [PX + x * S, PY + y * S];
  const LEFT_COL = ["heading", "vision", "stamina", "defending", "shooting", "rightFoot"];
  const RIGHT_COL = ["face", "passing", "pace", "dribbling", "leftFoot"];
  const ANCHOR = {
    heading: [172, 60], vision: [166, 92], stamina: [150, 300], defending: [98, 360],
    shooting: [40, 700], rightFoot: [140, 742], face: [252, 132], passing: [302, 360],
    pace: [258, 480], dribbling: [232, 630], leftFoot: [262, 742]
  };
  const GREY = 'fill="#39415a" stroke="#5f6b8a" stroke-width="2" stroke-dasharray="6 5"';

  /* ---------- State ---------- */
  let st;
  function reset(mode) {
    st = { stage: mode ? "position" : "mode", mode: mode || null, position: null,
           history: [], picks: {}, options: {}, name: "", nameEdited: false, pop: null };
  }
  reset();

  const players = () => (st.mode ? D.modes[st.mode].players : []);
  const byId = id => players().find(p => p.id === id);
  const used = id => Object.values(st.picks).includes(id);
  const stepIndex = () => st.history.length;
  const pos = () => D.positions.find(p => p.id === st.position);

  /* ---------- Helpers ---------- */
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const fit = (text, maxW, base) => Math.min(base, Math.floor(maxW / (String(text).length * 0.6)));

  function optionsFor(key) {
    const idx = stepIndex();
    if (st.options[idx]) return st.options[idx].map(byId);
    const free = players().filter(p => !(D.oneUsePerPlayer && used(p.id)));
    let list;
    if (key === "face") {
      list = free.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else {
      const sorted = free.slice().sort((a, b) => b.stats[key] - a.stats[key]);
      const n = D.optionsPerStep;
      const top = sorted.slice(0, Math.min(3, n));
      const rest = shuffle(sorted.slice(top.length)).slice(0, n - top.length);
      list = top.concat(rest).sort((a, b) => b.stats[key] - a.stats[key]);
    }
    st.options[idx] = list.map(p => p.id);
    return list;
  }

  /* ---------- Rating ---------- */
  function computeRating() {
    const p = pos(); if (!p) return null;
    let sum = 0, wsum = 0;
    STAT_KEYS.forEach(k => {
      if (!st.picks[k]) return;
      const w = p.weights[k] || 1;
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
    return { value: Math.max(1, Math.min(99, Math.round(r - penalty + bonus))), penalty, badges };
  }
  function earnedBadges() {
    const ids = [...new Set(Object.values(st.picks))];
    return D.badges.filter(b => ids.filter(id => (byId(id).tags || []).includes(b.tag)).length >= b.min);
  }
  const tierFor = v => (D.tiers.find(t => v >= t.min) || {}).label || "";

  function autoName() {
    const f = st.picks.face && byId(st.picks.face);
    const s = st.picks.shooting && byId(st.picks.shooting);
    if (!f) return "";
    const a = f.short.split(" ").pop(), b = (s || f).short.split(" ").pop();
    if (a === b) return a;
    const name = a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2)).toLowerCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /* ---------- Cartoon player (local coords 400 x 780) ---------- */
  function playerSVG(opt) {
    const on = k => !!st.picks[k];
    const wrap = (k, inner) => `<g class="part${!opt.exporting && st.pop === k ? " pop" : ""}">${inner}</g>`;
    const P = k => (st.picks[k] ? byId(st.picks[k]) : null);
    const skin = (P("face") && P("face").skin) || K.skin;
    const hair = (P("heading") && P("heading").hair) || K.hair;
    const photo = P("face") && P("face").photo ? (opt.photos && opt.photos[P("face").id]) || (opt.exporting ? null : P("face").photo) : null;
    const number = P("stamina") ? P("stamina").number : "";
    let s = `<ellipse cx="200" cy="760" rx="175" ry="20" fill="#ffffff" opacity="0.07"/>`;

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
         <path d="M121 490 L192 495 M279 490 L208 495" stroke="${K.trim}" stroke-width="5"/>`
      : thighs(GREY) + `<path d="${shortsPath}" ${GREY}/>`);

    // Socks – dribbling
    const sock = x => on("dribbling")
      ? `<rect x="${x}" y="553" width="40" height="166" rx="10" fill="${K.socks}"/><rect x="${x}" y="572" width="40" height="12" fill="${K.sockBand}"/><rect x="${x}" y="590" width="40" height="5" fill="${K.sockBand}"/>`
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
           <path d="${sleeve}" fill="${K.shirt}"/><path d="M87 290 L130 280" stroke="${K.trim}" stroke-width="6" stroke-linecap="round"/>`
        : `<path d="${fore}" ${GREY}/><circle cx="99" cy="428" r="15" ${GREY}/><path d="${sleeve}" ${GREY}/>`;
      return k === "passing" ? `<g transform="translate(400 0) scale(-1 1)">${inner}</g>` : inner;
    };
    s += wrap("defending", arm("defending"));
    s += wrap("passing", arm("passing"));

    // Neck (face group, under the shirt)
    s += wrap("face", `<rect x="183" y="156" width="34" height="42" rx="9" ${on("face") ? `fill="${skin}"` : GREY}/>`);

    // Torso – stamina
    const torso = "M156 186 L244 186 L282 212 L270 405 L130 405 L118 212 Z";
    s += wrap("stamina", on("stamina")
      ? `<path d="${torso}" fill="${K.shirt}"/>
         <path d="M244 186 L282 212 L270 405 L252 405 L258 228 Z" fill="${K.shirtShade}"/>
         <path d="M156 186 L118 212 L130 405 L148 405 L142 228 Z" fill="${K.shirtShade}"/>
         <path d="M176 186 L200 216 L224 186" fill="none" stroke="${K.trim}" stroke-width="8" stroke-linejoin="round"/>
         <path d="M130 398 L270 398" stroke="${K.trim}" stroke-width="4" opacity="0.7"/>
         <text x="200" y="330" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="84" fill="${K.numberColor}">${esc(number)}</text>`
      : `<path d="${torso}" ${GREY}/>`);

    // Head – face
    if (on("face") && photo) {
      s += wrap("face", `<defs><clipPath id="headClip"><ellipse cx="200" cy="105" rx="56" ry="66"/></clipPath></defs>
        <ellipse cx="200" cy="105" rx="59" ry="69" fill="#fff"/>
        <image href="${esc(photo)}" x="140" y="36" width="120" height="140" preserveAspectRatio="xMidYMid slice" clip-path="url(#headClip)"/>`);
    } else {
      const c = on("face") ? `fill="${skin}"` : GREY;
      s += wrap("face", `<ellipse cx="150" cy="115" rx="9" ry="15" ${c}/><ellipse cx="250" cy="115" rx="9" ry="15" ${c}/><ellipse cx="200" cy="110" rx="50" ry="60" ${c}/>`);
      // Hair – heading
      const hairPath = "M149 104 Q144 44 200 40 Q256 44 251 104 Q247 74 222 68 Q200 78 178 68 Q153 74 149 104 Z";
      s += wrap("heading", on("heading") ? `<path d="${hairPath}" fill="${hair}"/>` : `<path d="${hairPath}" ${GREY}/>`);
      // Eyes – vision
      s += wrap("vision", on("vision")
        ? `<path d="M170 92 Q182 86 193 91 M207 91 Q218 86 230 92" stroke="${hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
           <ellipse cx="182" cy="108" rx="6" ry="7.5" fill="#1b1b1b"/><ellipse cx="218" cy="108" rx="6" ry="7.5" fill="#1b1b1b"/>
           <circle cx="184" cy="105" r="2" fill="#fff"/><circle cx="220" cy="105" r="2" fill="#fff"/>`
        : `<ellipse cx="182" cy="108" rx="6" ry="7.5" ${GREY}/><ellipse cx="218" cy="108" rx="6" ry="7.5" ${GREY}/>`);
      if (on("face")) s += wrap("face", `<path d="M200 114 Q207 128 198 131" stroke="#b07a5a" stroke-width="3" fill="none" stroke-linecap="round"/>
           <path d="M185 143 Q200 153 215 143" stroke="#8a4a3a" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    }
    return `<g transform="translate(${PX} ${PY}) scale(${S})">${s}</g>`;
  }

  /* ---------- Full card ---------- */
  function cardSVG(opt = {}) {
    const mode = st.mode ? D.modes[st.mode] : null;
    const R = computeRating();
    const done = stepIndex() >= ATTRS.length;
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
    const nm = st.name || (done ? autoName() : "");
    const posLabel = pos() ? pos().label : "";
    s += `<text x="44" y="200" font-size="34" font-style="italic" font-weight="700" fill="#ffd2da">${nm ? "“" + esc(nm) + "”" : ""}${nm && posLabel ? "  ·  " : ""}${esc(posLabel)}</text>`;
    if (R && R.badges.length) {
      let bx = 44;
      R.badges.forEach(b => {
        const w = b.label.length * 11 + 34;
        s += `<rect x="${bx}" y="220" width="${w}" height="34" rx="17" fill="#ffd34d"/><text x="${bx + w / 2}" y="243" text-anchor="middle" font-size="18" font-weight="800" fill="#3a2600">★ ${esc(b.label.toUpperCase())}</text>`;
        bx += w + 10;
      });
    }

    // Rating circle
    s += `<circle cx="950" cy="128" r="94" fill="url(#ring)" stroke="#fff" stroke-width="6"/>
      <text x="950" y="${R ? 158 : 150}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${R ? 92 : 64}" fill="#fff">${R ? R.value : "--"}</text>
      <text x="950" y="196" text-anchor="middle" font-size="24" font-weight="800" letter-spacing="3" fill="#ffe1e6">${esc(st.position || "OVR")}</text>`;
    if (R) { const t = (done ? tierFor(R.value) : "LIVE RATING").toUpperCase();
      s += `<text x="${W - 40}" y="262" text-anchor="end" font-size="${fit(t, 300, 22)}" font-weight="800" letter-spacing="1" fill="#ffd34d">${esc(t)}</text>`; }

    // Player
    s += playerSVG(opt);

    // Callouts
    const block = (k, i, side, n) => {
      const top = side === "L" ? 300 : 340, bottom = 1150;
      const y = top + i * ((bottom - top) / (n - 1));
      const p = st.picks[k] ? byId(st.picks[k]) : null;
      const [ax, ay] = toCard(...ANCHOR[k]);
      const x0 = side === "L" ? 40 : W - 40, anchor = side === "L" ? "start" : "end";
      const edge = side === "L" ? 300 : W - 300;
      const lineY = y + 2;
      const col = p ? "#ffffff" : "#56607c";
      let b = `<path d="M${edge} ${lineY} L${side === "L" ? edge + 22 : edge - 22} ${lineY} L${ax} ${ay}" fill="none" stroke="${col}" stroke-opacity="${p ? 0.55 : 0.5}" stroke-width="2" ${p ? "" : 'stroke-dasharray="5 6"'}/>
        <circle cx="${ax}" cy="${ay}" r="${p ? 7 : 5}" fill="${p ? "#fff" : "#56607c"}" ${p ? 'stroke="' + K.shirt + '" stroke-width="3"' : ""}/>
        <text x="${x0}" y="${y - 22}" text-anchor="${anchor}" font-size="19" font-weight="800" letter-spacing="4" fill="${p ? "#ff8da1" : "#6c7694"}">${esc(label(k).toUpperCase())}</text>`;
      if (p) {
        const fs = fit(p.short, 255, 36);
        b += `<text x="${x0}" y="${y + 16}" text-anchor="${anchor}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" fill="#fff">${esc(p.short)}</text>`;
        if (k !== "face") {
          const px = side === "L" ? x0 : x0 - 70;
          b += `<rect x="${px}" y="${y + 30}" width="70" height="34" rx="17" fill="${K.shirt}" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
            <text x="${px + 35}" y="${y + 55}" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">${p.stats[k]}</text>`;
        } else {
          b += `<text x="${x0}" y="${y + 52}" text-anchor="${anchor}" font-size="20" font-weight="700" fill="#ffd2da">#${esc(p.number)}</text>`;
        }
      } else {
        b += `<text x="${x0}" y="${y + 16}" text-anchor="${anchor}" font-size="32" font-weight="900" fill="#4c5571">?</text>`;
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
    ? `<img class="av" src="${esc(p.photo)}" alt="">`
    : `<span class="av">${esc(initials(p.name))}<small>${esc(p.number)}</small></span>`;

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
      panel.innerHTML = `<div class="top"><button class="link" data-act="home">← Back</button></div>
        <h2>Choose a position</h2><p class="lead">The position decides which attributes count most in the rating.</p>
        <div class="positions">${D.positions.map(p => {
          const keys = Object.entries(p.weights).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => ATTRS.find(a => a.key === k).label);
          return `<button class="pos" data-pos="${p.id}"><b>${esc(p.id)}</b><strong>${esc(p.label)}</strong><span>Key: ${esc(keys.join(", "))}</span></button>`;
        }).join("")}</div>`;
    } else if (st.stage === "build") {
      const i = stepIndex(), a = ATTRS[i];
      const opts = optionsFor(a.key);
      panel.innerHTML = `<div class="top"><span class="step">Step ${i + 1} / ${ATTRS.length}</span>
          <span><button class="link" data-act="undo" ${i ? "" : "disabled"}>Undo</button><button class="link" data-act="restart">Restart</button></span></div>
        <div class="bar"><i style="width:${(i / ATTRS.length) * 100}%"></i></div>
        <h2>${esc(a.label)}</h2><p class="lead">${esc(a.hint)}</p>
        <div class="opts ${a.key === "face" ? "faces" : ""}">${opts.map(p => `
          <button class="opt" data-pick="${p.id}">${avatar(p)}
            <span class="nm">${esc(p.name)}</span>
            ${a.key !== "face" && D.showScores ? `<span class="sc"><i style="width:${p.stats[a.key]}%"></i><b>${p.stats[a.key]}</b></span>` : ""}
          </button>`).join("")}</div>`;
    } else if (st.stage === "done") {
      const R = computeRating();
      if (!st.nameEdited) st.name = autoName();
      panel.innerHTML = `<div class="top"><span class="step">Your player is ready</span><button class="link" data-act="undo">Undo last pick</button></div>
        <div class="result"><div class="big">${R.value}</div><div><strong>${esc(tierFor(R.value))}</strong>
          <span>${esc(pos().label)}${R.penalty ? ` · weak foot −${R.penalty}` : ""}${R.badges.map(b => ` · ${esc(b.label)} +${b.bonus}`).join("")}</span></div></div>
        <label class="name">Name your player<input id="nm" maxlength="22" value="${esc(st.name)}"></label>
        <div class="actions">
          <button class="primary" data-act="share">Share image</button>
          <button data-act="download">Download PNG</button>
        </div>
        <div class="actions">
          <button data-act="again">Build another</button>
          <button data-act="home">Change edition</button>
        </div>
        <p class="note" id="msg"></p>`;
      $("#nm").addEventListener("input", e => { st.name = e.target.value; st.nameEdited = true; st.pop = null; $("#card").innerHTML = cardSVG(); });
    }
    st.pop = null;
  }

  $("#panel").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.mode) { reset(b.dataset.mode); }
    else if (b.dataset.pos) { st.position = b.dataset.pos; st.stage = "build"; }
    else if (b.dataset.pick) {
      const k = ATTRS[stepIndex()].key;
      st.picks[k] = b.dataset.pick; st.history.push(k); st.pop = k;
      if (stepIndex() >= ATTRS.length) st.stage = "done";
      if (window.matchMedia("(max-width: 860px)").matches) $("#card").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      const act = b.dataset.act;
      if (act === "home") reset();
      if (act === "restart" || act === "again") { const m = st.mode, p = st.position; reset(m); st.position = p; st.stage = act === "again" ? "position" : "build"; }
      if (act === "undo") {
        const k = st.history.pop(); delete st.picks[k];
        Object.keys(st.options).forEach(i => { if (+i > stepIndex()) delete st.options[i]; });
        st.stage = "build"; if (!st.nameEdited) st.name = "";
      }
      if (act === "download" || act === "share") { await exportImage(act); return; }
    }
    render();
  });

  /* ---------- Export ---------- */
  async function toDataURL(url) {
    try {
      const blob = await (await fetch(url)).blob();
      return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    } catch (e) { return null; }
  }
  async function renderPNG() {
    const photos = {};
    const f = st.picks.face && byId(st.picks.face);
    if (f && f.photo) photos[f.id] = await toDataURL(f.photo);
    const svg = cardSVG({ exporting: true, photos });
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
      const fname = (st.name || "my-player").replace(/[^\w-]+/g, "-").toLowerCase() + ".png";
      const file = new File([blob], fname, { type: "image/png" });
      const R = computeRating();
      if (how === "share" && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: D.siteTitle, text: `My ${R.value}-rated ${pos().label}: “${st.name}”. Build yours: ${D.siteUrl}` });
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
  window.__builder = { get state() { return st; }, renderPNG };
})();
