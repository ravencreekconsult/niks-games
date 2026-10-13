/* tycoon.js - Bakery Tycoon layer: living bakery scene, customer orders, venues, reputation,
   cookie menu unlocked by rebirth, Market Day, and the working Ascend button. */
(function () {
  "use strict";
  var NK = window.NK, A = window.NKArt; if (!NK || !NK.state) return;
  function $(id) { return document.getElementById(id); }
  var fmt = NK.fmt;
  var TYPES = [
    { id: "choc", name: "Chocolate Chip", need: 0, m: 1.0, body: ["#f0b868", "#cf8b3e", "#9a5e26"], chip: "#4a2a10", deco: "chips" },
    { id: "oat", name: "Oatmeal Raisin", need: 1, m: 1.15, body: ["#e6c58c", "#c9a064", "#8f6a38"], chip: "#5a2f4a", deco: "raisins" },
    { id: "snick", name: "Snickerdoodle", need: 2, m: 1.3, body: ["#f4d9a4", "#e0b672", "#b98a48"], chip: "#b0642a", deco: "specks" },
    { id: "mac", name: "Macaron", need: 3, m: 1.5, body: ["#ffd1e4", "#f79ac0", "#d4619a"], chip: "#fff4f9", deco: "cream" },
    { id: "ginger", name: "Gingerbread", need: 4, m: 1.75, body: ["#c97a3c", "#a8602c", "#7a4018"], chip: "#fff8ee", deco: "icing" },
    { id: "rainbow", name: "Rainbow Sprinkle", need: 5, m: 2.0, body: ["#ffe0f0", "#ff9ccf", "#d95ea6"], chip: "#fff", deco: "sprinkles" }
  ];
  var VENUES = [
    { name: "Roadside Stand", cost: 0, slots: 2, gap: [12, 20], sky: "#bfe6ff", ground: "#8bc34a" },
    { name: "Farmers Market", cost: 25000, slots: 4, gap: [8, 14], sky: "#ffe2a8", ground: "#9bd05a" },
    { name: "Bakery Shop", cost: 3e6, slots: 5, gap: [6, 11], sky: "#ffd1c4", ground: "#c9a27a" },
    { name: "Cookie Cafe", cost: 5e9, slots: 6, gap: [5, 9], sky: "#d4c4ff", ground: "#b8a0e0" }
  ];
  var REP = [10, 30, 70, 150, 300, 600, 1200, 2500, 5000, 10000];
  var MARKET_LEN = 45000, MARKET_CD = 360000;
  function now() { return Date.now(); }
  function T() {
    var t = NK.state.tycoon;
    if (!t) t = NK.state.tycoon = { venue: 0, rep: 0, served: 0, sel: 0, orders: [], marketUntil: 0, marketReady: 0 };
    if (t.sel > maxType()) t.sel = maxType();
    return t;
  }
  function maxType() { var n = 0; for (var i = 0; i < TYPES.length; i++) if ((NK.state.ascensions || 0) >= TYPES[i].need) n = i; return n; }
  function repLevel() { var r = T().rep, l = 0; for (var i = 0; i < REP.length; i++) if (r >= REP[i]) l = i + 1; return l; }
  NK.extraMult = function () { var t = NK.state.tycoon; if (!t) return 1; return (1 + 0.03 * repLevel()) * (1 + 0.05 * (t.sel || 0)); };
  function marketOn() { return T().marketUntil > now(); }
  function slots() { return VENUES[T().venue].slots + (marketOn() ? 3 : 0); }

  /* ---------- art ---------- */
  function cookieSVG(ty, sz) {
    var b = ty.body, id = "g" + ty.id, d = "";
    var chips = [[62, 62], [132, 52], [150, 108], [86, 112], [55, 140], [116, 154], [170, 150]];
    if (ty.deco === "chips" || ty.deco === "raisins") chips.forEach(function (c, i) { d += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + (ty.deco === "raisins" ? 11 : 14 - (i % 3) * 2) + '" ry="' + (ty.deco === "raisins" ? 8 : 10) + '" fill="' + ty.chip + '" transform="rotate(' + (i * 25 - 40) + ' ' + c[0] + ' ' + c[1] + ')"/>'; });
    if (ty.deco === "specks") for (var i = 0; i < 26; i++) d += '<circle cx="' + (30 + (i * 37) % 140) + '" cy="' + (30 + (i * 53) % 140) + '" r="' + (2 + i % 3) + '" fill="' + ty.chip + '" opacity=".8"/>';
    if (ty.deco === "cream") d += '<circle cx="100" cy="100" r="62" fill="' + ty.chip + '" opacity=".9"/><circle cx="100" cy="100" r="62" fill="none" stroke="' + b[2] + '" stroke-width="4"/>';
    if (ty.deco === "icing") d += '<path d="M40 70 Q60 40 100 55 Q140 40 160 70 Q170 110 150 140 Q100 170 50 140 Q30 110 40 70 Z" fill="none" stroke="' + ty.chip + '" stroke-width="7" stroke-linecap="round"/><circle cx="78" cy="88" r="7" fill="' + ty.chip + '"/><circle cx="122" cy="88" r="7" fill="' + ty.chip + '"/><path d="M80 124 Q100 140 120 124" fill="none" stroke="' + ty.chip + '" stroke-width="6" stroke-linecap="round"/>';
    if (ty.deco === "sprinkles") { var cols = ["#ff5a5a", "#5ac0ff", "#ffd24a", "#7bd88f", "#9b7bff"]; for (var j = 0; j < 34; j++) { var x = 28 + (j * 47) % 144, y = 28 + (j * 71) % 144; d += '<rect x="' + x + '" y="' + y + '" width="14" height="5" rx="2.5" fill="' + cols[j % 5] + '" transform="rotate(' + (j * 37) + ' ' + x + ' ' + y + ')"/>'; } }
    return '<svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style="pointer-events:none;display:block"><defs><radialGradient id="' + id + sz + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + b[0] + '"/><stop offset=".6" stop-color="' + b[1] + '"/><stop offset="1" stop-color="' + b[2] + '"/></radialGradient></defs><circle cx="100" cy="100" r="94" fill="url(#' + id + sz + ')" stroke="#6b4018" stroke-width="5"/><path d="M30 70 Q60 20 120 18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>' + d + '</svg>';
  }
  function personSVG(lk) {
    return '<svg viewBox="0 0 40 60" width="100%" height="100%" aria-hidden="true" style="display:block;pointer-events:none"><path d="M6 60 Q6 34 20 32 Q34 34 34 60 Z" fill="' + lk.shirt + '" stroke="#4a2a10" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="20" r="10" fill="' + lk.skin + '" stroke="#4a2a10" stroke-width="2"/><path d="M10 18 Q12 7 20 8 Q29 7 30 18 Q26 12 20 12 Q14 12 10 18 Z" fill="' + lk.hair + '" stroke="#4a2a10" stroke-width="1.5"/>' + (lk.hat ? '<path d="M8 14 H32 L29 6 Q20 2 11 6 Z" fill="' + lk.hat + '" stroke="#4a2a10" stroke-width="1.5" stroke-linejoin="round"/>' : "") + '<circle cx="16.5" cy="21" r="1.4" fill="#2a1a0c"/><circle cx="23.5" cy="21" r="1.4" fill="#2a1a0c"/><path d="M17 25 Q20 27.5 23 25" fill="none" stroke="#2a1a0c" stroke-width="1.4" stroke-linecap="round"/></svg>';
  }
  function bgSVG(v) {
    var V = VENUES[v], s = '<rect width="400" height="96" fill="' + V.sky + '"/><rect y="70" width="400" height="26" fill="' + V.ground + '"/>';
    if (v === 0) s += '<rect x="130" y="40" width="140" height="34" rx="3" fill="#a8683a" stroke="#4a2a10" stroke-width="2.5"/><path d="M120 40 L130 14 H270 L280 40 Z" fill="#e0508a" stroke="#4a2a10" stroke-width="2.5"/><path d="M138 14 L148 40 M158 14 L168 40 M178 14 L188 40 M198 14 L208 40 M218 14 L228 40 M238 14 L248 40 M258 14 L268 40" stroke="#fff" stroke-width="7" opacity=".85"/>';
    if (v === 1) s += '<path d="M20 44 L60 14 L100 44 Z" fill="#e0508a" stroke="#4a2a10" stroke-width="2"/><rect x="26" y="44" width="68" height="28" fill="#c9852a" stroke="#4a2a10" stroke-width="2"/><path d="M150 44 L190 14 L230 44 Z" fill="#4fb0e0" stroke="#4a2a10" stroke-width="2"/><rect x="156" y="44" width="68" height="28" fill="#c9852a" stroke="#4a2a10" stroke-width="2"/><path d="M280 44 L320 14 L360 44 Z" fill="#7bd88f" stroke="#4a2a10" stroke-width="2"/><rect x="286" y="44" width="68" height="28" fill="#c9852a" stroke="#4a2a10" stroke-width="2"/>';
    if (v === 2) s += '<rect x="60" y="14" width="280" height="58" fill="#f1d9a8" stroke="#4a2a10" stroke-width="2.5"/><path d="M52 24 H348 V36 H52 Z" fill="#d9503c" stroke="#4a2a10" stroke-width="2.5"/><rect x="90" y="44" width="70" height="24" rx="3" fill="#bfe6ff" stroke="#4a2a10" stroke-width="2"/><rect x="240" y="44" width="70" height="24" rx="3" fill="#bfe6ff" stroke="#4a2a10" stroke-width="2"/><rect x="180" y="40" width="40" height="32" rx="3" fill="#6b4018" stroke="#4a2a10" stroke-width="2"/>';
    if (v === 3) s += '<rect x="30" y="10" width="340" height="62" fill="#fff4f9" stroke="#4a2a10" stroke-width="2.5"/><path d="M24 22 H376 V34 H24 Z" fill="#8a63d2" stroke="#4a2a10" stroke-width="2.5"/><circle cx="200" cy="52" r="14" fill="#ffd24a" stroke="#4a2a10" stroke-width="2"/><rect x="60" y="42" width="70" height="26" rx="3" fill="#bfe6ff" stroke="#4a2a10" stroke-width="2"/><rect x="270" y="42" width="70" height="26" rx="3" fill="#bfe6ff" stroke="#4a2a10" stroke-width="2"/>';
    s += '<rect y="76" width="400" height="8" fill="#6b4018" opacity=".35"/>';
    return '<svg viewBox="0 0 400 96" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style="display:block;position:absolute;inset:0">' + s + '</svg>';
  }

  /* ---------- orders ---------- */
  var nextSpawn = 0;
  var SKIN = ["#f6c9a0", "#e0a878", "#c58c5c", "#8d5a3a", "#fbd9c0"], HAIR = ["#3a2412", "#7a4a22", "#d9a441", "#222", "#a33", "#999"], SHIRT = ["#e0508a", "#4fb0e0", "#7bd88f", "#ffb347", "#9b7bff", "#ff6a5a"], HAT = [null, null, "#d9503c", "#3a7bd5", "#2f9e6a"];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function newOrder() {
    var t = T(), c = Math.max(40, NK.cps() * 20), ty = Math.floor(Math.random() * (maxType() + 1));
    var amt = Math.max(30, Math.round(c * (0.7 + Math.random() * 0.8)));
    return { id: now() + Math.random(), ty: ty, amt: amt, born: now(), pat: 50000 + Math.random() * 40000, lk: { skin: pick(SKIN), hair: pick(HAIR), shirt: pick(SHIRT), hat: pick(HAT) } };
  }
  function payout(o) { var t = T(); return Math.round(o.amt * (1 + 0.25 * TYPES[o.ty].m * (1 + 0.1 * t.venue) * (marketOn() ? 1.5 : 1))); }
  function spawnTick() {
    var t = T(); if (now() < nextSpawn) return;
    var V = VENUES[t.venue], g = V.gap, k = marketOn() ? 3 : 1;
    nextSpawn = now() + (g[0] + Math.random() * (g[1] - g[0])) * 1000 / k;
    if (t.orders.length < slots()) { t.orders.push(newOrder()); renderScene(); }
  }
  function expire() { var t = T(), n = now(), keep = t.orders.filter(function (o) { return n - o.born < o.pat; }); if (keep.length !== t.orders.length) { t.orders = keep; renderScene(); } }
  function serve(id) {
    var t = T(), o = null, i;
    for (i = 0; i < t.orders.length; i++) if (t.orders[i].id === id) { o = t.orders[i]; break; }
    if (!o) return;
    if (NK.state.cookies < o.amt) { flash("Need " + fmt(o.amt) + " cookies"); return; }
    var p = payout(o); NK.state.cookies += p - o.amt;
    t.orders.splice(i, 1); t.served++; t.rep += marketOn() ? 3 : 1;
    flash("+" + fmt(p - o.amt) + " cookies profit"); renderScene(); renderPanel();
    try { NK.emit("order:served", { n: 1 }); } catch (e) {}
  }
  var flashT = null;
  function flash(msg) { var f = $("scene-msg"); if (!f) return; f.textContent = msg; f.classList.add("on"); clearTimeout(flashT); flashT = setTimeout(function () { f.classList.remove("on"); }, 1400); }

  /* ---------- scene ---------- */
  var scene = document.createElement("div"); scene.id = "scene";
  scene.innerHTML = '<div id="scene-bg"></div><div id="scene-row"></div><div id="scene-msg"></div><div id="scene-tag"></div>';
  var hud = $("hud"), goal = $("goal"); (goal || hud).parentNode.insertBefore(scene, (goal || hud).nextSibling);
  var css = document.createElement("style");
  css.textContent = "#scene{position:relative;flex:0 0 auto;height:96px;margin:4px 12px 0;border-radius:14px;overflow:hidden;border:2px solid #5d3a16;box-shadow:0 3px 0 #00000055}" +
    "#scene-bg{position:absolute;inset:0}#scene-row{position:absolute;inset:0;display:flex;justify-content:space-around;align-items:flex-end;padding:0 4px}" +
    ".cust{position:relative;width:42px;height:58px;margin-bottom:2px;animation:custin .6s ease-out}.cust.can .bub{border-color:#2faa4f}.cust.cant .bub{opacity:.85}" +
    ".bub{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);background:#fffaf0;border:2px solid #4a2a10;border-radius:10px;padding:1px 5px 1px 3px;font-size:10px;font-weight:800;color:#4a2a10;white-space:nowrap;display:flex;align-items:center;gap:2px;z-index:2}" +
    ".bub i{display:block;width:13px;height:13px}.pat{position:absolute;left:4px;right:4px;bottom:-5px;height:3px;border-radius:2px;background:#0004;overflow:hidden}.pat b{display:block;height:100%;background:#7bd88f}" +
    "@keyframes custin{from{transform:translateX(70px);opacity:0}to{transform:none;opacity:1}}" +
    "#scene-msg{position:absolute;top:4px;left:50%;transform:translateX(-50%);background:#2b1d12ee;color:#ffd27a;font-size:12px;font-weight:800;padding:2px 10px;border-radius:10px;opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap}#scene-msg.on{opacity:1}" +
    "#scene-tag{position:absolute;top:3px;left:6px;font-size:10px;font-weight:800;color:#4a2a10;background:#fffaf0cc;border-radius:8px;padding:1px 6px}" +
    "body.no-motion .cust{animation:none}" +
    ".bk-card{background:#3a2815;border:2px solid #5d3a16;border-radius:14px;padding:10px;margin-bottom:8px;font-size:14px}.bk-card h3{font-size:15px;color:#ffd27a;margin-bottom:4px}.bk-card small{color:#cbb98f;font-size:12px}" +
    ".bk-btn{display:block;width:100%;min-height:46px;margin-top:8px;border-radius:12px;font-weight:800;background:linear-gradient(#ffd27a,#ffb400);color:#2b1d12;border:2px solid #fff1c4;box-shadow:0 3px 0 #8a5a00}.bk-btn:disabled{background:#2b1d12;color:#8d7a55;border-color:#5d3a16;box-shadow:none}" +
    ".bk-bar{height:10px;border-radius:6px;background:#1d1409;margin:6px 0;overflow:hidden}.bk-bar i{display:block;height:100%;background:linear-gradient(90deg,#7bd88f,#ffd27a)}" +
    ".mn{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:12px;border:2px solid #5d3a16;margin-top:6px;background:#2b1d12;width:100%;text-align:left}.mn.on{border-color:#ffb400;background:#4a3218}.mn.lock{opacity:.5}.mn .mi{width:38px;height:38px;flex:0 0 auto}.mn b{display:block;font-size:14px}.mn small{color:#cbb98f;font-size:11px}" +
    "#ovl{position:fixed;inset:0;z-index:70;background:#000000bb;display:none;align-items:center;justify-content:center;padding:16px}#ovl.on{display:flex}#ovl .box{background:#2b1d12;border:2px solid #b39bea;border-radius:16px;padding:16px;max-width:380px;width:100%;font-size:14px;line-height:1.5}#ovl h2{color:#ffd27a;margin-bottom:6px}#ovl .row{display:flex;gap:10px;margin-top:12px}#ovl .row button{flex:1;min-height:48px;border-radius:12px;font-weight:800}" +
    "@media (orientation:landscape) and (max-height:560px){#goal{display:none !important}#bigcookie{width:min(38vh,190px) !important;height:min(38vh,190px) !important}#scene{grid-column:1;grid-row:2;height:78px;margin:2px 8px 0}#stage{grid-row:3 !important}#crew{grid-row:4 !important}body{grid-template-rows:auto auto 1fr auto !important}#tabs{grid-row:1}.panel{grid-row:2 / span 2 !important}#bottom{grid-row:4 !important}}";
  document.head.appendChild(css);
  var lastSig = "";
  function renderScene() {
    var t = T(), row = $("scene-row"), sig = t.venue + ":" + t.orders.map(function (o) { return o.id; }).join(",") + ":" + (marketOn() ? 1 : 0);
    if (!$("scene-bg").getAttribute("data-v") || $("scene-bg").getAttribute("data-v") !== String(t.venue)) { $("scene-bg").innerHTML = bgSVG(t.venue); $("scene-bg").setAttribute("data-v", t.venue); }
    $("scene-tag").textContent = VENUES[t.venue].name + (marketOn() ? " - MARKET DAY!" : "");
    if (sig === lastSig) return; lastSig = sig;
    var html = "";
    t.orders.forEach(function (o) {
      var can = NK.state.cookies >= o.amt;
      html += '<div class="cust ' + (can ? "can" : "cant") + '" data-o="' + o.id + '">' + personSVG(o.lk) + '<div class="bub"><i>' + cookieSVG(TYPES[o.ty], "b") + "</i>" + fmt(o.amt) + '</div><div class="pat"><b></b></div></div>';
    });
    row.innerHTML = html;
    [].forEach.call(row.querySelectorAll(".cust"), function (c) { c.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); serve(parseFloat(c.getAttribute("data-o"))); }); });
  }
  function updatePatience() {
    var t = T(), n = now(), cs = $("scene-row").children;
    for (var i = 0; i < cs.length && i < t.orders.length; i++) {
      var o = t.orders[i], b = cs[i].querySelector(".pat b"); if (b) b.style.width = Math.max(0, 100 - (n - o.born) / o.pat * 100) + "%";
      var can = NK.state.cookies >= o.amt; cs[i].classList.toggle("can", can); cs[i].classList.toggle("cant", !can);
    }
  }

  /* ---------- big cookie follows the menu choice ---------- */
  function applyCookie() { var bc = $("bigcookie"); if (bc) bc.innerHTML = cookieSVG(TYPES[T().sel], "m"); }

  /* ---------- Bakery tab ---------- */
  var tabs = $("tabs"), tb = document.createElement("button");
  tb.className = "tab"; tb.setAttribute("data-tab", "bakery"); tb.innerHTML = '<span class="ti"></span>Bakery<span class="badge" id="badge-bakery"></span>';
  tabs.insertBefore(tb, tabs.querySelector('[data-tab="quests"]'));
  var ti = tb.querySelector(".ti"); if (A && A.icons.castle !== undefined) ti.innerHTML = A.icons.shop;
  var sec = document.createElement("section"); sec.className = "panel"; sec.id = "panel-bakery";
  document.body.insertBefore(sec, $("panel-quests") || $("panel-feats"));
  tb.addEventListener("click", function () {
    [].forEach.call(document.querySelectorAll(".tab"), function (x) { x.classList.toggle("on", x === tb); });
    [].forEach.call(document.querySelectorAll(".panel"), function (p) { p.classList.remove("active"); });
    sec.classList.add("active"); renderPanel(true);
  });
  [].forEach.call(tabs.querySelectorAll(".tab"), function (o) { if (o !== tb) o.addEventListener("click", function () { sec.classList.remove("active"); }); });
  var panelSig = "";
  function liveUpdate() {
    var t = T(), n = now(), up = $("bk-up"), nv = VENUES[t.venue + 1];
    if (up && nv) up.disabled = NK.state.cookies < nv.cost;
    var mk = $("bk-mkt");
    if (mk) { var left = t.marketReady - n, on = marketOn(); mk.disabled = on || left > 0; mk.textContent = on ? "Market is open! " + Math.ceil((t.marketUntil - n) / 1000) + "s" : left > 0 ? "Ready in " + Math.ceil(left / 1000) + "s" : "Open the stall"; }
  }
  function renderPanel(force) {
    if (!sec.classList.contains("active")) return;
    var t = T(), lvl = repLevel(), nxt = REP[lvl] || null, prev = lvl ? REP[lvl - 1] : 0, n = now();
    var nv0 = VENUES[t.venue + 1];
    var sig = [t.venue, t.rep, t.sel, t.served, marketOn() ? 1 : 0, NK.state.ascensions, (t.marketReady > n ? 1 : 0)].join("|");
    if (!force && sig === panelSig) { liveUpdate(); return; } panelSig = sig;
    var h = '<div class="bk-card"><h3>' + VENUES[t.venue].name + '</h3><small>' + slots() + ' customer spots, a new customer every ~' + Math.round((VENUES[t.venue].gap[0] + VENUES[t.venue].gap[1]) / 2) + 's. Tap a customer to serve their order: you hand over the cookies and get MORE back.</small>';
    var nv = VENUES[t.venue + 1];
    if (nv) { var ok = NK.state.cookies >= nv.cost; h += '<button class="bk-btn" id="bk-up"' + (ok ? "" : " disabled") + ">Open " + nv.name + " - " + fmt(nv.cost) + " cookies</button>"; } else h += "<small><br>Top venue reached. Rebirth to start a fresh, bigger run.</small>";
    h += "</div>";
    if (t.venue >= 1) { var left = t.marketReady - n, on = marketOn(); h += '<div class="bk-card"><h3>Market Day</h3><small>45 seconds: customers flood in 3x faster, 3 extra spots, 50% bigger bonus and triple reputation. Cooldown 6 minutes.</small><button class="bk-btn" id="bk-mkt"' + (on || left > 0 ? " disabled" : "") + ">" + (on ? "Market is open! " + Math.ceil((t.marketUntil - n) / 1000) + "s" : left > 0 ? "Ready in " + Math.ceil(left / 1000) + "s" : "Open the stall") + "</button></div>"; }
    h += '<div class="bk-card"><h3>Reputation level ' + lvl + "</h3><small>Every served order earns reputation. Each level gives +3% to all baking, forever (even through rebirth). Total bonus now: +" + (lvl * 3) + "%.</small>" + (nxt ? '<div class="bk-bar"><i style="width:' + Math.min(100, (t.rep - prev) / (nxt - prev) * 100).toFixed(0) + '%"></i></div><small>' + t.rep + " / " + nxt + " orders-points. Served so far: " + t.served + "</small>" : "<small><br>Max reputation!</small>") + "</div>";
    h += '<div class="bk-card"><h3>Cookie menu</h3><small>New cookie types unlock each time you rebirth (Ascend). Customers order any type you have. Your signature cookie gives +5% baking per tier and pays better on orders.</small>';
    TYPES.forEach(function (ty, i) { var un = (NK.state.ascensions || 0) >= ty.need; h += '<button class="mn' + (i === t.sel ? " on" : "") + (un ? "" : " lock") + '" data-ty="' + i + '"' + (un ? "" : " disabled") + '><span class="mi">' + cookieSVG(ty, "p") + "</span><span><b>" + ty.name + "</b><small>" + (un ? "Order payout x" + ty.m.toFixed(2) + (i === t.sel ? " - SIGNATURE" : " - tap to feature") : "Unlocks at rebirth " + ty.need) + "</small></span></button>"; });
    h += "</div>";
    sec.innerHTML = h;
    var up = $("bk-up"); if (up) up.onclick = function () { var v = VENUES[T().venue + 1]; if (v && NK.state.cookies >= v.cost) { NK.state.cookies -= v.cost; T().venue++; lastSig = ""; renderScene(); renderPanel(true); NK.save(); } };
    var mk = $("bk-mkt"); if (mk) mk.onclick = function () { var tt = T(); if (now() >= tt.marketReady && !marketOn()) { tt.marketUntil = now() + MARKET_LEN; tt.marketReady = now() + MARKET_LEN + MARKET_CD; nextSpawn = 0; lastSig = ""; renderScene(); renderPanel(true); } };
    [].forEach.call(sec.querySelectorAll(".mn"), function (b) { b.onclick = function () { T().sel = parseInt(b.getAttribute("data-ty"), 10); applyCookie(); renderPanel(true); }; });
  }

  /* ---------- ascend button + overlay ---------- */
  var ovl = document.createElement("div"); ovl.id = "ovl"; document.body.appendChild(ovl);
  function nextUnlock() { var a = (NK.state.ascensions || 0) + 1; for (var i = 0; i < TYPES.length; i++) if (TYPES[i].need === a) return TYPES[i]; return null; }
  function confirmAscend() {
    var g = NK.ascendGain(), nu = nextUnlock();
    ovl.innerHTML = '<div class="box"><h2>Rebirth your bakery?</h2><p>You gain <b>' + fmt(g) + " crumbs</b> (+1% baking each, forever).</p><p>Your cookies, buildings, upgrades and venue reset. You KEEP crumbs, heavenly upgrades, feats, reputation, and unlock " + (nu ? "a new cookie type: <b>" + nu.name + "</b>" : "your bigger bakery bonus") + '.</p><div class="row"><button id="ov-no" style="background:#3d2a15;border:2px solid #5d3a16">Not yet</button><button id="ov-yes" style="background:#8a63d2;border:2px solid #b39bea;color:#fff">Rebirth!</button></div></div>';
    ovl.classList.add("on");
    $("ov-no").onclick = function () { ovl.classList.remove("on"); };
    $("ov-yes").onclick = function () { ovl.classList.remove("on"); var r = NK.ascend(); if (!r) { flash("Not enough yet"); return; } var tt = T(); tt.venue = 0; tt.orders = []; tt.marketUntil = 0; tt.sel = maxType(); lastSig = ""; applyCookie(); renderScene(); renderPanel(true); NK.save(); };
  }
  var ab = $("asc-btn"); if (ab) ab.addEventListener("click", function () { if (!ab.disabled) confirmAscend(); });

  NK.on("tick", function () { try { expire(); spawnTick(); renderScene(); updatePatience(); renderPanel(); var b = $("badge-bakery"); if (b) { var can = T().orders.some(function (o) { return NK.state.cookies >= o.amt; }); b.textContent = can ? "!" : ""; b.classList.toggle("show", can); } var ag = $("asc-gain"); if (ag && NK.canAscend && !ag.getAttribute("data-t")) { } } catch (e) { } });
  var tabLbl = tabs.querySelectorAll(".tab"); [].forEach.call(tabLbl, function (x) { x.style.fontSize = "11px"; });
  applyCookie(); renderScene();
})();
