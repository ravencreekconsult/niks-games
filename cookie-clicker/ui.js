/* =========================================================================
   NK Cookie Clicker — presentation / interaction layer.
   Talks ONLY to window.NK / window.NKData. Loaded after engine.js.
   ========================================================================= */
(function () {
"use strict";

/* ============================= shorthands ============================= */
var NK = window.NK, D = window.NKData;
function $(id) { return document.getElementById(id); }
function el(tag, cls, txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
}
function fmt(n) { return NK.fmt(n); }
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h > 0 ? h + ":" : "") + (m < 10 && h > 0 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

/* ============================= settings ============================= */
var MOTION_KEY = "nk-cc-motion", SOUND_KEY = "nk-cc-sound";
var motion, sound;
try {
  sound = localStorage.getItem(SOUND_KEY) !== "0";
  var storedMotion = localStorage.getItem(MOTION_KEY);
  if (storedMotion === null) {
    motion = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } else motion = storedMotion === "1";
} catch (e) { sound = true; motion = true; }
function setMotion(v) {
  motion = v;
  try { localStorage.setItem(MOTION_KEY, v ? "1" : "0"); } catch (e) {}
  document.body.classList.toggle("no-motion", !v);
  var b = $("btn-motion");
  if (b) { b.textContent = v ? "🎞️ Motion" : "🧘 Calm"; b.setAttribute("aria-pressed", v ? "true" : "false"); }
}
function setSound(v) {
  sound = v;
  try { localStorage.setItem(SOUND_KEY, v ? "1" : "0"); } catch (e) {}
  var b = $("btn-sound");
  if (b) { b.textContent = v ? "🔊 Sound" : "🔇 Muted"; b.setAttribute("aria-pressed", v ? "true" : "false"); }
}

/* ============================= sound (lazy WebAudio) ============================= */
var actx = null;
function beep(freq, dur, type, vol, delay) {
  if (!sound) return;
  try {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    var t = actx.currentTime + (delay || 0);
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.1));
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + (dur || 0.1) + 0.05);
  } catch (e) {}
}
var sfx = {
  tap:   function () { beep(520 + Math.random() * 80, 0.07, "triangle", 0.05); },
  crit:  function () { beep(880, 0.15, "square", 0.05); beep(1320, 0.18, "square", 0.04, 0.06); },
  buy:   function () { beep(440, 0.08, "sine", 0.05); beep(660, 0.1, "sine", 0.05, 0.07); },
  goldenUp: function () { beep(1040, 0.12, "sine", 0.04); beep(1560, 0.14, "sine", 0.03, 0.09); },
  goldenGot: function () { beep(660, 0.1, "sine", 0.05); beep(990, 0.1, "sine", 0.05, 0.08); beep(1320, 0.16, "sine", 0.05, 0.16); },
  ach:   function () { beep(523, 0.1, "sine", 0.05); beep(659, 0.1, "sine", 0.05, 0.09); beep(784, 0.18, "sine", 0.05, 0.18); },
  ascend: function () { beep(392, 0.15, "sine", 0.05); beep(523, 0.15, "sine", 0.05, 0.12); beep(659, 0.15, "sine", 0.05, 0.24); beep(784, 0.3, "sine", 0.05, 0.36); }
};

/* ============================= particles & floaters ============================= */
var MAX_PARTICLES = 40, liveParticles = 0;
var stage = null; // set in boot()

function spawnParticles(x, y, n) {
  if (!motion) return;
  var rect = stage.getBoundingClientRect();
  n = Math.min(n, MAX_PARTICLES - liveParticles);
  for (var i = 0; i < n; i++) {
    var p = el("span", "crumb");
    var a = Math.random() * Math.PI * 2, dist = 30 + Math.random() * 60;
    var dx = Math.cos(a) * dist, dy = Math.sin(a) * dist - 40;
    p.textContent = "🍪";
    p.style.left = (x - rect.left) + "px";
    p.style.top = (y - rect.top) + "px";
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");
    p.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
    p.addEventListener("animationend", function (ev) {
      liveParticles--;
      if (ev.currentTarget && ev.currentTarget.parentNode) ev.currentTarget.parentNode.removeChild(ev.currentTarget);
    });
    stage.appendChild(p);
    liveParticles++;
  }
}
function floatNumber(x, y, text, crit) {
  var rect = stage.getBoundingClientRect();
  var f = el("div", crit ? "float crit-float" : "float");
  f.textContent = text;
  f.style.left = (x - rect.left) + "px";
  f.style.top = (y - rect.top) + "px";
  f.addEventListener("animationend", function (ev) {
    if (ev.currentTarget && ev.currentTarget.parentNode) ev.currentTarget.parentNode.removeChild(ev.currentTarget);
  });
  stage.appendChild(f);
}

/* ============================= toasts & modal ============================= */
function toast(title, desc, ico, life) {
  var box = $("toasts");
  var t = el("div", "toast");
  var i = el("span", "toast-ico", ico || "🍪");
  var w = el("div", "toast-body");
  w.appendChild(el("div", "toast-title", title));
  if (desc) w.appendChild(el("div", "toast-desc", desc));
  t.appendChild(i); t.appendChild(w);
  box.appendChild(t);
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(function () {
    t.classList.add("out");
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
  }, life || 3500);
}
function showModal(html) {
  $("modal-text").innerHTML = html;
  $("modal").classList.add("show");
}
function hideModal() { $("modal").classList.remove("show"); }

/* ============================= HUD ============================= */
var shownCookies = 0;
var lastHudKey = "";
function updateHud() {
  var s = NK.state;
  // rolling counter: ease toward the real number, converge fast
  var real = s.cookies;
  var diff = real - shownCookies;
  if (!motion || Math.abs(diff) < Math.max(0.5, real * 1e-9)) shownCookies = real;
  else shownCookies += diff * 0.55;
  $("count").textContent = fmt(shownCookies);
  $("cpsline").textContent = fmt(NK.cps()) + " per second";
  $("cpcline").textContent = "+" + fmt(NK.cpc()) + " per tap";
  var rank = NK.rank();
  var key = rank.name;
  if (key !== lastHudKey) { $("rank").textContent = rank.name; lastHudKey = key; }
  // buff chips
  var buffs = s.buffs.filter(function (b) { return b.endsAt > Date.now(); });
  var bc = $("buffs");
  var sig = "";
  for (var i = 0; i < buffs.length; i++) sig += buffs[i].id + ",";
  if (sig !== bc.getAttribute("data-sig")) {
    bc.setAttribute("data-sig", sig);
    bc.innerHTML = "";
    for (var i = 0; i < buffs.length; i++) {
      var chip = el("span", "chip" + (buffs[i].mult < 1 ? " chip-bad" : ""));
      chip.appendChild(el("span", "chip-ico", buffs[i].ico));
      chip.appendChild(el("span", "chip-name", buffs[i].name));
      chip.appendChild(el("span", "chip-mult", "x" + buffs[i].mult));
      chip.appendChild(el("span", "chip-time"));
      bc.appendChild(chip);
    }
  }
  var tnow = Date.now();
  for (var j = 0; j < buffs.length && j < bc.children.length; j++) {
    var c = bc.children[j];
    var left = Math.max(0, (buffs[j].endsAt - tnow) / 1000);
    c.lastChild.textContent = Math.ceil(left) + "s";
  }
}

/* ============================= tabs ============================= */
var currentTab = "shop";
function setTab(name) {
  currentTab = name;
  var tabs = document.querySelectorAll(".tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle("on", tabs[i].getAttribute("data-tab") === name);
  }
  var panels = document.querySelectorAll(".panel");
  for (var p = 0; p < panels.length; p++) panels[p].classList.remove("active");
  var target = $("panel-" + name);
  if (target) target.classList.add("active");
  refreshPanel(name, true);
}

/* ============================= SHOP ============================= */
var qty = 1; // 1 | 10 | "max"
var shopRows = {}; // id -> {row, cnt, each, price, hint, btn}
var shopBuilt = false;

function bulkTarget(id) {
  if (qty === "max") {
    var n = 0, spent = 0, s = NK.state;
    while (n < 500) {
      var c = NK.buildingCost(id, (s.buildings[id] || 0) + n);
      if (spent + c > s.cookies) break;
      spent += c; n++;
    }
    return Math.max(1, n);
  }
  return qty;
}
function rowVisible(b) {
  var owned = NK.state.buildings[b.id] || 0;
  return owned > 0 || NK.buildingCost(b.id) <= NK.state.cookies * 3;
}
function milestoneHint(owned) {
  if (owned % 25 >= 15 && owned % 25 < 25) {
    var next = (Math.floor(owned / 25) + 1) * 25;
    var mult = Math.pow(2, Math.min(Math.floor(owned / 25), 3));
    if (mult < 8) return next - owned + " more → x" + (mult * 2);
  }
  return "";
}
function buildShop() {
  var list = $("shop-list");
  list.innerHTML = "";
  shopRows = {};
  for (var i = 0; i < D.BUILDINGS.length; i++) (function (b) {
    var row = el("button", "shop-row");
    row.type = "button";
    var ico = el("span", "r-ico", b.ico);
    var mid = el("div", "r-mid");
    var top = el("div", "r-top");
    top.appendChild(el("span", "r-name", b.name));
    top.appendChild(el("span", "r-cnt"));
    mid.appendChild(top);
    mid.appendChild(el("div", "r-sub"));
    var right = el("div", "r-right");
    right.appendChild(el("div", "r-hint"));
    right.appendChild(el("div", "r-price"));
    row.appendChild(ico); row.appendChild(mid); row.appendChild(right);
    row.addEventListener("click", function () {
      var n = bulkTarget(b.id);
      var got = NK.buyBuilding(b.id, n);
      if (got > 0) { sfx.buy(); } else { beep(200, 0.08, "sine", 0.03); }
    });
    list.appendChild(row);
    shopRows[b.id] = { row: row, cnt: row.querySelector(".r-cnt"), sub: row.querySelector(".r-sub"),
                       price: row.querySelector(".r-price"), hint: row.querySelector(".r-hint") };
  })(D.BUILDINGS[i]);
  shopBuilt = true;
}
function updateShop() {
  var list = $("shop-list");
  for (var i = 0; i < D.BUILDINGS.length; i++) {
    var b = D.BUILDINGS[i];
    var r = shopRows[b.id];
    if (!r) continue;
    var vis = rowVisible(b);
    r.row.classList.toggle("hidden-row", !vis);
    if (!vis) continue;
    var owned = NK.state.buildings[b.id] || 0;
    var n = bulkTarget(b.id);
    var price = NK.buildingBulkCost(b.id, n);
    var afford = NK.state.cookies >= price;
    var cnt = (r.cnt.textContent !== (owned + "")) ? (r.cnt.textContent = owned + "") : r.cnt.textContent;
    var each = b.cps * Math.pow(2, Math.min(Math.floor(owned / 25), 3));
    var subTxt = (n > 1 ? "x" + n + "  ·  " : "") + "+" + fmt(each) + "/sec each";
    if (r.sub.textContent !== subTxt) r.sub.textContent = subTxt;
    var pTxt = "🍪 " + fmt(price);
    if (r.price.textContent !== pTxt) r.price.textContent = pTxt;
    var h = milestoneHint(owned);
    if (r.hint.textContent !== h) r.hint.textContent = h;
    r.row.classList.toggle("afford", afford);
    r.row.classList.toggle("poor", !afford);
  }
}
function refreshShop(full) {
  if (!shopBuilt || full) buildShop();
  updateShop();
}

/* ============================= UPGRADES ============================= */
var upgSig = null;
function buildUpgrades() {
  var list = $("upg-list");
  list.innerHTML = "";
  var vis = D.UPGRADES.filter(function (u) { return NK.upgradeVisible(u); });
  var owned = 0;
  for (var i = 0; i < D.UPGRADES.length; i++) if (NK.state.upgrades[D.UPGRADES[i].id]) owned++;
  $("upg-count").textContent = "upgrades owned: " + owned + " / " + D.UPGRADES.length;
  if (vis.length === 0) {
    var warm = el("div", "empty-note", "Nothing to buy right now! Keep tapping, buy more helpers and bake more cookies — new upgrades will appear here. ✨");
    list.appendChild(warm);
    return;
  }
  for (var j = 0; j < vis.length; j++) (function (u) {
    var row = el("button", "upg-row");
    row.type = "button";
    row.appendChild(el("span", "r-ico", u.ico));
    var mid = el("div", "r-mid");
    mid.appendChild(el("div", "r-name", u.name));
    mid.appendChild(el("div", "r-sub", u.desc));
    var right = el("div", "r-right");
    right.appendChild(el("div", "r-price", "🍪 " + fmt(u.cost)));
    row.appendChild(mid); row.appendChild(right);
    row.addEventListener("click", function () {
      if (NK.buyUpgrade(u.id)) { sfx.buy(); } else { beep(200, 0.08, "sine", 0.03); }
    });
    row.setAttribute("data-upg", u.id);
    list.appendChild(row);
  })(vis[j]);
}
function updateUpgrades() {
  var rows = document.querySelectorAll("#upg-list .upg-row");
  for (var i = 0; i < rows.length; i++) {
    var u = null;
    for (var k = 0; k < D.UPGRADES.length; k++) if (D.UPGRADES[k].id === rows[i].getAttribute("data-upg")) u = D.UPGRADES[k];
    if (!u) continue;
    var afford = NK.state.cookies >= u.cost;
    rows[i].classList.toggle("afford", afford);
    rows[i].classList.toggle("poor", !afford);
  }
}
function refreshUpgrades() {
  var vis = D.UPGRADES.filter(function (u) { return NK.upgradeVisible(u); });
  var owned = 0;
  for (var i = 0; i < D.UPGRADES.length; i++) if (NK.state.upgrades[D.UPGRADES[i].id]) owned++;
  var sig = vis.map(function (u) { return u.id; }).join(",") + "|" + owned;
  var list = $("upg-list");
  if (sig !== upgSig || list.childElementCount === 0) { upgSig = sig; buildUpgrades(); }
  updateUpgrades();
  // badge: how many visible AND affordable
  var n = 0;
  for (var j = 0; j < vis.length; j++) if (NK.state.cookies >= vis[j].cost) n++;
  setBadge("badge-upg", n);
}

/* ============================= FEATS (achievements) ============================= */
var featsBuilt = false;
function buildFeats() {
  var grid = $("feat-grid");
  grid.innerHTML = "";
  for (var i = 0; i < D.ACHIEVEMENTS.length; i++) (function (a) {
    var tile = el("div", "feat");
    tile.appendChild(el("div", "feat-ico", a.ico));
    tile.appendChild(el("div", "feat-name", a.name));
    tile.appendChild(el("div", "feat-desc", a.desc));
    grid.appendChild(tile);
  })(D.ACHIEVEMENTS[i]);
  featsBuilt = true;
}
function updateFeats() {
  var earned = 0;
  for (var i = 0; i < D.ACHIEVEMENTS.length; i++) {
    var got = !!NK.state.achievements[D.ACHIEVEMENTS[i].id];
    if (got) earned++;
    var tile = $("feat-grid").children[i];
    if (tile) tile.classList.toggle("earned", got);
  }
  $("feat-count").textContent = earned + " / " + D.ACHIEVEMENTS.length + " earned — each one gives +1% to everything you bake.";
  setBadge("badge-feats", earned);
}

/* ============================= STATS ============================= */
function updateStats() {
  var s = NK.state, B = D.BUILDINGS, U = D.UPGRADES;
  var bTotal = 0;
  for (var k in s.buildings) bTotal += s.buildings[k];
  var uTotal = 0;
  for (var k2 in s.upgrades) if (s.upgrades[k2]) uTotal++;
  set("st-run", fmt(s.total));
  set("st-all", fmt(s.totalAll));
  set("st-cps", fmt(NK.cps()));
  set("st-cpc", fmt(NK.cpc()));
  set("st-taps", fmt(s.clicks));
  set("st-bld", fmt(bTotal));
  set("st-upg", uTotal + " / " + U.length);
  set("st-gold", fmt(s.goldenClicked));
  set("st-asc", s.ascensions + "");
  set("st-crumbs", fmt(s.crumbs) + " (all-time " + fmt(s.crumbsTotal) + ")");
  set("st-time", fmtTime(s.playSeconds));
  set("st-rank", NK.rank().name);
  var g = NK.goldenActive();
  set("st-golden", g ? "ONE IS ON SCREEN! 🌟" : "in ~" + fmtTime(NK.secondsUntilNextGolden()));
  function set(id, v) { var e = $(id); if (e && e.textContent !== v) e.textContent = v; }
}

/* ============================= ASCEND ============================= */
var heavenBuilt = false;
function buildHeaven() {
  var list = $("heaven-list");
  list.innerHTML = "";
  for (var i = 0; i < NK.heavenlyList.length; i++) (function (h) {
    var row = el("div", "heaven-row");
    row.appendChild(el("span", "r-ico", h.ico));
    var mid = el("div", "r-mid");
    mid.appendChild(el("div", "r-name", h.name));
    mid.appendChild(el("div", "r-sub", h.desc));
    var right = el("div", "r-right");
    var btn = el("button", "mini-btn");
    btn.type = "button";
    btn.textContent = "🥮 " + h.cost;
    right.appendChild(btn);
    row.appendChild(mid); row.appendChild(right);
    btn.addEventListener("click", function () {
      if (NK.buyHeavenly(h.id)) { sfx.buy(); toast("Heavenly!", h.name + " — " + h.desc, h.ico); }
      else beep(200, 0.08, "sine", 0.03);
    });
    row.setAttribute("data-heaven", h.id);
    list.appendChild(row);
  })(NK.heavenlyList[i]);
  heavenBuilt = true;
}
function updateAscend() {
  var gain = NK.ascendGain(), can = NK.canAscend();
  var btn = $("asc-btn");
  set("asc-gain", can ? ("You would gain " + fmt(gain) + " crumbs 🥮") : "Not enough cookies baked this run yet — keep baking!");
  btn.disabled = !can;
  if (!can) {
    set("asc-reason", gain === 0 ? "Bake a lot more first (ascension unlocks once a run is big enough)." : "Something went wrong — try reloading.");
  } else set("asc-reason", "It resets your cookies and helpers, but the crumbs are yours forever.");
  var rows = $("heaven-list").children;
  for (var i = 0; i < rows.length; i++) {
    var id = rows[i].getAttribute("data-heaven");
    var owned = !!NK.state.heavenly[id];
    rows[i].classList.toggle("owned", owned);
    var b = rows[i].querySelector(".mini-btn");
    var cost = 0, def = null;
    for (var k = 0; k < NK.heavenlyList.length; k++) if (NK.heavenlyList[k].id === id) def = NK.heavenlyList[k];
    if (!def) continue;
    cost = def.cost;
    if (owned) { b.textContent = "✓ owned"; b.disabled = true; }
    else {
      b.textContent = "🥮 " + cost;
      b.disabled = NK.state.crumbs < cost;
    }
  }
  function set(id2, v) { var e = $(id2); if (e && e.textContent !== v) e.textContent = v; }
}
function refreshAscend() {
  if (!heavenBuilt) buildHeaven();
  updateAscend();
}

/* ============================= panel refresh dispatch ============================= */
function refreshPanel(name, full) {
  if (name === "shop") refreshShop(full);
  else if (name === "upgrades") refreshUpgrades();
  else if (name === "feats") { if (!featsBuilt || full) buildFeats(); updateFeats(); }
  else if (name === "stats") updateStats();
  else if (name === "ascend") refreshAscend();
}
function setBadge(id, n) {
  var b = $(id);
  if (!b) return;
  b.textContent = n > 0 ? (n > 99 ? "99+" : n + "") : "";
  b.classList.toggle("show", n > 0);
}

/* ============================= golden cookie ============================= */
var goldenEl = null;
function spawnGolden(x, y, secs) {
  removeGolden(true);
  var g = el("button", "golden");
  g.type = "button";
  g.setAttribute("aria-label", "Golden cookie! Tap it!");
  g.textContent = "🌟";
  g.style.left = x + "%";
  g.style.top = y + "%";
  g.style.setProperty("--life", secs + "s");
  g.addEventListener("pointerdown", function (ev) {
    ev.stopPropagation();
    NK.collectGolden(); // 'golden:collected' event shows the result toast + sound
    removeGolden(true);
  });
  stage.appendChild(g);
  goldenEl = g;
  sfx.goldenUp();
}
function removeGolden(instant) {
  if (!goldenEl) return;
  var g = goldenEl;
  goldenEl = null;
  if (instant || !motion) { if (g.parentNode) g.parentNode.removeChild(g); }
  else {
    g.classList.add("fade");
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 500);
  }
}
function showGoldenResult(res) {
  var eff = res.effect, desc;
  if (eff.kind === "lucky") desc = "+" + fmt(res.gained) + " cookies, just like that!";
  else if (eff.mult < 1) desc = "x" + eff.mult + " baking for " + eff.secs + "s... ouch!";
  else desc = "x" + eff.mult + " " + (eff.kind === "clickFrenzy" ? "taps" : "baking") + " for " + eff.secs + "s!";
  toast(eff.name, desc, eff.ico, 4000);
  sfx.goldenGot();
}

/* ============================= events ============================= */
NK.on("tick", function () {
  // never touch the DOM here directly at 60fps — the throttle loop below owns text
});

NK.on("gain", function (d) {
  floatNumber(d.x, d.y, (d.crit ? "CRIT! x10  +" : "+") + fmt(d.amount), d.crit);
  spawnParticles(d.x, d.y, d.crit ? 6 : 3);
  if (d.crit) sfx.crit(); else sfx.tap();
  // immediate cookie pop
  var cookie = $("bigcookie");
  if (cookie && motion) {
    cookie.classList.remove("pop");
    void cookie.offsetWidth; // restart animation
    cookie.classList.add("pop");
  }
});

NK.on("buy", function (d) {
  if (currentTab === "shop" && d.kind === "building") updateShop();
  if (currentTab === "upgrades" && d.kind === "upgrade") refreshUpgrades();
});

NK.on("buff", function (d) {
  if (d.type === "add") toast(d.buff.name, "x" + d.buff.mult + " " + (d.buff.target === "click" ? "taps" : "baking") + " for " + d.buff.secs + "s!", d.buff.ico);
});

NK.on("golden:spawn", function (d) { spawnGolden(d.x, d.y, d.seconds); });
NK.on("golden:collected", showGoldenResult);

NK.on("achievement", function (d) {
  toast("Feat earned: " + d.ach.name + "!", d.ach.desc, d.ach.ico, 4500);
  sfx.ach();
  setBadge("badge-feats", (function () { var n = 0; for (var k in NK.state.achievements) if (NK.state.achievements[k]) n++; return n; })());
  if (currentTab === "feats") updateFeats();
});

NK.on("ascend", function (d) {
  sfx.ascend();
  toast("Ascended! 🌠", "+" + fmt(d.gained) + " crumbs — every future run bakes faster!", "🥮", 6000);
  if (motion) {
    document.body.classList.remove("flash");
    void document.body.offsetWidth;
    document.body.classList.add("flash");
  }
  upgSig = null; shopBuilt = false; heavenBuilt = false;
  refreshPanel(currentTab, true);
});

NK.on("welcome", function (d) {
  showModal("<h2>Welcome back! 👋</h2><p>While you were away for <b>" + fmtTime(d.seconds) +
    "</b>, your bakery made <b>🍪 " + fmt(d.gained) + "</b> cookies all on its own!</p>");
});

NK.on("reset", function () {
  shownCookies = 0; upgSig = null; shopBuilt = false; featsBuilt = false; heavenBuilt = false;
  removeGolden(true);
  hideModal();
  refreshPanel(currentTab, true);
  updateHud();
});

/* ============================= throttle loop (rAF, ~10 Hz text) ============================= */
var lastUpdate = 0;
function loop(t) {
  if (t - lastUpdate >= 100) {
    lastUpdate = t;
    updateHud();
    // golden expiry check
    if (goldenEl && !NK.goldenActive()) removeGolden(false);
    refreshPanel(currentTab, false);
    // badges stay live even when their tab is hidden
    if (currentTab !== "upgrades") {
      var n = 0, vis = D.UPGRADES.filter(function (u) { return NK.upgradeVisible(u); });
      for (var i = 0; i < vis.length; i++) if (NK.state.cookies >= vis[i].cost) n++;
      setBadge("badge-upg", n);
    }
    if (currentTab !== "feats") {
      var m = 0;
      for (var k in NK.state.achievements) if (NK.state.achievements[k]) m++;
      setBadge("badge-feats", m);
    }
  }
  requestAnimationFrame(loop);
}

/* ============================= boot ============================= */
function boot() {
  stage = $("stage");

  // cookie
  var cookie = $("bigcookie");
  cookie.setAttribute("aria-label", "The big cookie — tap it to bake cookies");
  cookie.addEventListener("pointerdown", function (ev) {
    NK.click(ev.pageX, ev.pageY);
  });
  cookie.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // tabs
  var tabs = document.querySelectorAll(".tab");
  for (var i = 0; i < tabs.length; i++) (function (tb) {
    tb.addEventListener("click", function () { setTab(tb.getAttribute("data-tab")); beep(700, 0.05, "sine", 0.03); });
  })(tabs[i]);

  // shop quantity selector
  var qs = document.querySelectorAll("#qty-sel button");
  for (var q = 0; q < qs.length; q++) (function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-qty");
      qty = (v === "max") ? "max" : parseInt(v, 10);
      for (var z = 0; z < qs.length; z++) qs[z].classList.toggle("on", qs[z] === btn);
      updateShop();
    });
  })(qs[q]);

  // toggles
  $("btn-sound").addEventListener("click", function () { setSound(!sound); });
  $("btn-motion").addEventListener("click", function () { setMotion(!motion); });
  $("btn-reset").addEventListener("click", function () {
    if (window.confirm("Start a brand new game? ALL cookies, helpers, upgrades and feats will be erased. (Crumbs from ascending are lost too!)")) {
      NK.hardReset();
    }
  });

  // modal
  $("modal-btn").addEventListener("click", hideModal);
  $("modal").addEventListener("pointerdown", function (e) { if (e.target === $("modal")) hideModal(); });

  // settings initial state
  setSound(sound); setMotion(motion);

  // first visit? (no save and no legacy save)
  var firstVisit = false;
  try { firstVisit = !localStorage.getItem("nk-cookie-clicker-v2") && !localStorage.getItem("nk-cookie-clicker-v1"); } catch (e) {}

  // start engine, then UI
  buildFeats();
  NK.init();
  updateHud();
  setTab("shop");
  requestAnimationFrame(loop);
  setInterval(function () {
    var n = $("news");
    n.textContent = "📰 " + NK.newsNext();
  }, 12000);
  $("news").textContent = "📰 " + NK.newsNext();

  if (firstVisit) {
    showModal("<h2>Welcome to your bakery! 🍪</h2><p><b>1.</b> Tap the big cookie to bake cookies.<br><b>2.</b> Spend them in the <b>Shop</b> on helpers that bake for you.<br><b>3.</b> Watch for shiny <b>golden cookies 🌟</b> — they're worth grabbing!</p>");
  }
}

/* init: DOM already exists (scripts at end of body) */
boot();

})();
