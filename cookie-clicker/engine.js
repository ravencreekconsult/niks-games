/* =========================================================================
   NK — Cookie Clicker engine. PURE SIMULATION, ZERO DOM ACCESS.
   The only browser APIs used: localStorage, performance, requestAnimationFrame,
   setInterval, and window.addEventListener for visibilitychange/pagehide.
   All rendering is ui.js's job; the engine only emits events.
   ========================================================================= */
(function () {
"use strict";

var NK = window.NK = {};
var D  = window.NKData;

var SAVE_KEY = "nk-cookie-clicker-v2";
var LEGACY_KEY = "nk-cookie-clicker-v1";

/* ============================= tiny emitter ============================= */
var _subs = {};
NK.on = function (ev, fn)   { (_subs[ev] = _subs[ev] || []).push(fn); };
NK.off = function (ev, fn)  { var a = _subs[ev]; if (a) { var i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } };
NK.emit = function (ev, data) {
  var a = _subs[ev]; if (!a) return;
  for (var i = 0; i < a.length; i++) { try { a[i](data); } catch (e) {} }
};

/* ============================= state ============================= */
NK.state = null;

function freshState() {
  return {
    cookies: 0, total: 0, totalAll: 0,
    clicks: 0,
    buildings: {}, upgrades: {}, tapUpgrades: 0,
    achievements: {},
    ascensions: 0, crumbs: 0, crumbsTotal: 0, heavenly: {},
    buffs: [],
    goldenClicked: 0,
    last: Date.now(), playSeconds: 0, startedAt: Date.now()
  };
}

/* ============================= helpers ============================= */
function now() { return Date.now(); }
function bDef(id) { for (var i = 0; i < D.BUILDINGS.length; i++) if (D.BUILDINGS[i].id === id) return D.BUILDINGS[i]; return null; }
function owned(id) { return NK.state.buildings[id] || 0; }
function totalBuildings() { var t = 0; for (var k in NK.state.buildings) t += NK.state.buildings[k]; return t; }
function achCount() { var t = 0; for (var k in NK.state.achievements) if (NK.state.achievements[k]) t++; return t; }

/* product of an effect kind across owned upgrades AND heavenly upgrades */
function factor(kind) {
  var f = 1, s = NK.state, i, e;
  for (i = 0; i < D.UPGRADES.length; i++) {
    if (s.upgrades[D.UPGRADES[i].id]) { e = D.UPGRADES[i].effect; if (e.kind === kind) f *= e.v; }
  }
  for (i = 0; i < D.HEAVENLY.length; i++) {
    if (s.heavenly[D.HEAVENLY[i].id]) { e = D.HEAVENLY[i].effect; if (e.kind === kind) f *= e.v; }
  }
  return f;
}
/* largest owned value of an absolute effect kind (offlineRate / offlineCap) */
function bestOf(kind, dflt) {
  var best = dflt, s = NK.state, i, e;
  for (i = 0; i < D.UPGRADES.length; i++) {
    if (s.upgrades[D.UPGRADES[i].id]) { e = D.UPGRADES[i].effect; if (e.kind === kind && e.v > best) best = e.v; }
  }
  for (i = 0; i < D.HEAVENLY.length; i++) {
    if (s.heavenly[D.HEAVENLY[i].id]) { e = D.HEAVENLY[i].effect; if (e.kind === kind && e.v > best) best = e.v; }
  }
  return best;
}

function milestoneMult(count) { return Math.pow(2, Math.min(Math.floor(count / 25), 3)); }

/* ============================= economy ============================= */
NK.buildingCost = function (id, n) {
  var b = bDef(id); if (!b) return Infinity;
  n = (n === undefined) ? owned(id) : n;
  return Math.floor(b.base * Math.pow(1.15, n) * factor("costMult"));
};

NK.buildingBulkCost = function (id, n) {
  var total = 0, have = owned(id);
  for (var i = 0; i < n; i++) total += NK.buildingCost(id, have + i);
  return total;
};

NK.buyBuilding = function (id, n) {
  var bought = 0, spent = 0;
  for (var i = 0; i < n; i++) {
    var c = NK.buildingCost(id, owned(id));
    if (NK.state.cookies < c) break;
    NK.state.cookies -= c; spent += c;
    NK.state.buildings[id] = owned(id) + 1;
    bought++;
  }
  if (bought > 0) NK.emit("buy", { kind: "building", id: id, n: bought, cost: spent });
  return bought;
};

/* buildingMult upgrades carry an `id`; only count ones matching this building */
function idFactor(id, kind) {
  var f = 1, s = NK.state, i, u;
  for (i = 0; i < D.UPGRADES.length; i++) {
    u = D.UPGRADES[i];
    if (s.upgrades[u.id] && u.effect.kind === kind && (!u.effect.id || u.effect.id === id)) f *= u.effect.v;
  }
  return f;
}

NK.cps = function () {
  var sum = 0, i, b, o;
  for (i = 0; i < D.BUILDINGS.length; i++) {
    b = D.BUILDINGS[i]; o = owned(b.id);
    if (o > 0) sum += o * b.cps * milestoneMult(o) * idFactor(b.id, "buildingMult");
  }
  return sum * factor("globalMult")
           * (1 + 0.01 * achCount())
           * (1 + 0.01 * NK.state.crumbsTotal)
           * buffMult("cps");
};

NK.cpc = function () {
  var add = 0, i, e;
  for (i = 0; i < D.UPGRADES.length; i++) {
    if (NK.state.upgrades[D.UPGRADES[i].id]) { e = D.UPGRADES[i].effect; if (e.kind === "tapAdd") add += e.v; }
  }
  return (1 + add + NK.state.tapUpgrades) * factor("tapMult") * buffMult("click");
};

NK.click = function (x, y) {
  var critChance = 0, i, e;
  for (i = 0; i < D.UPGRADES.length; i++) {
    if (NK.state.upgrades[D.UPGRADES[i].id]) { e = D.UPGRADES[i].effect; if (e.kind === "critChance") critChance += e.v; }
  }
  var crit = Math.random() < critChance;
  var amount = NK.cpc() * (crit ? 10 : 1);
  addCookies(amount);
  NK.state.clicks++;
  NK.emit("gain", { amount: amount, crit: crit, x: x, y: y });
  return amount;
};

function addCookies(n) {
  NK.state.cookies += n;
  NK.state.total += n;
  NK.state.totalAll += n;
}

/* ============================= buffs ============================= */
function buffMult(target) {
  var m = 1, t = now(), b, i;
  for (i = 0; i < NK.state.buffs.length; i++) {
    b = NK.state.buffs[i];
    if (b.target === target && b.endsAt > t) m *= b.mult;
  }
  return m;
}

function addBuff(buff) {
  buff.endsAt = now() + buff.secs * 1000;
  NK.state.buffs.push(buff);
  NK.emit("buff", { type: "add", buff: buff });
}

function pruneBuffs() {
  var t = now(), kept = [], i;
  for (i = 0; i < NK.state.buffs.length; i++) {
    if (NK.state.buffs[i].endsAt > t) kept.push(NK.state.buffs[i]);
    else NK.emit("buff", { type: "expire", buff: NK.state.buffs[i] });
  }
  NK.state.buffs = kept;
}

/* ============================= golden cookies ============================= */
var nextGoldenAt = 0, spawn = null;
NK.visible = true;

function goldenFreqFactor() { return factor("goldenFreq"); }
function goldenDurFactor() { return factor("goldenDur"); }

function scheduleGolden() {
  var wait = (90 + Math.random() * 210) * 1000 * goldenFreqFactor();
  nextGoldenAt = now() + wait;
}

function goldenTick() {
  var t = now();
  if (!NK.visible) { if (nextGoldenAt < t + 1000) nextGoldenAt = t + 1000; return; } // hold while hidden
  if (!spawn && t >= nextGoldenAt) {
    spawn = {
      x: 8 + Math.random() * 80,           // percent of screen
      y: 14 + Math.random() * 64,
      bornAt: t,
      secs: 13 * goldenDurFactor()
    };
    NK.emit("golden:spawn", { x: spawn.x, y: spawn.y, seconds: spawn.secs });
  }
  if (spawn && t > spawn.bornAt + spawn.secs * 1000) { spawn = null; scheduleGolden(); }
}

NK.goldenDue = function () { return spawn ? 0 : Math.max(0, nextGoldenAt - now()); };
NK.goldenReady = function () { return !!spawn; };
NK.goldenActive = function () { return spawn; };
NK.secondsUntilNextGolden = function () { return NK.goldenDue() / 1000; };

NK.collectGolden = function () {
  if (!spawn) return null;
  var list = D.GOLDEN_EFFECTS, totalW = 0, i;
  for (i = 0; i < list.length; i++) totalW += list[i].w;
  var roll = Math.random() * totalW, eff = list[0];
  for (i = 0; i < list.length; i++) { roll -= list[i].w; if (roll <= 0) { eff = list[i]; break; } }

  var gained = 0;
  if (eff.kind === "lucky") {
    gained = Math.max(NK.cps() * 90, NK.state.cookies * 0.15) * (eff.mult || 1);
    addCookies(gained);
  } else {
    var target = (eff.kind === "clickFrenzy") ? "click" : "cps";
    addBuff({ id: eff.id, kind: eff.kind, name: eff.name, ico: eff.ico,
              mult: eff.mult, secs: eff.secs * goldenDurFactor(), target: target });
  }
  NK.state.goldenClicked++;
  spawn = null;
  scheduleGolden();
  NK.emit("golden:collected", { effect: eff, gained: gained });
  return { effect: eff, gained: gained };
};

/* ============================= upgrades ============================= */
function findUpgrade(id) { for (var i = 0; i < D.UPGRADES.length; i++) if (D.UPGRADES[i].id === id) return D.UPGRADES[i]; return null; }

function reqMet(req) {
  var s = NK.state;
  switch (req.kind) {
    case "always":     return true;
    case "total":      return s.totalAll >= req.v;
    case "cps":        return NK.cps() >= req.v;
    case "clicks":     return s.clicks >= req.v;
    case "buildings":  return totalBuildings() >= req.v;
    case "building":   return owned(req.id) >= req.v;
    case "upgrades":   { var n = 0; for (var k in NK.state.upgrades) if (NK.state.upgrades[k]) n++; return n >= req.v; }
    case "golden":     return s.goldenClicked >= req.v;
    case "ascensions": return s.ascensions >= req.v;
    case "playtime":   return s.playSeconds >= req.v;
    default:           return false;
  }
}

NK.upgradeReqMet = function (u) { return reqMet(u.req); };
NK.upgradeVisible = function (u) { return !NK.state.upgrades[u.id] && NK.upgradeReqMet(u); };

NK.buyUpgrade = function (id) {
  var u = findUpgrade(id);
  if (!u || NK.state.upgrades[id] || !NK.upgradeReqMet(u) || NK.state.cookies < u.cost) return false;
  NK.state.cookies -= u.cost;
  NK.state.upgrades[id] = true;
  NK.emit("buy", { kind: "upgrade", id: id, cost: u.cost });
  return true;
};

/* ============================= achievements ============================= */
function findAch(id) { for (var i = 0; i < D.ACHIEVEMENTS.length; i++) if (D.ACHIEVEMENTS[i].id === id) return D.ACHIEVEMENTS[i]; return null; }
NK.achievementReqMet = function (a) { return reqMet(a.check); };

function checkAchievements() {
  var i, a;
  for (i = 0; i < D.ACHIEVEMENTS.length; i++) {
    a = D.ACHIEVEMENTS[i];
    if (!NK.state.achievements[a.id] && NK.achievementReqMet(a)) {
      NK.state.achievements[a.id] = true;
      NK.emit("achievement", { ach: a });
    }
  }
}

NK.rank = function () {
  var best = D.RANKS[0], i;
  for (i = 0; i < D.RANKS.length; i++) if (NK.state.totalAll >= D.RANKS[i].at) best = D.RANKS[i];
  return best;
};

/* ============================= prestige ============================= */
NK.ascendGain = function () {
  var g = Math.floor(Math.sqrt(NK.state.total / 1e10) * factor("crumbGain"));
  return g;
};
NK.canAscend = function () { return NK.ascendGain() >= 1; };

NK.ascend = function () {
  var gained = NK.ascendGain();
  if (gained < 1) return null;
  var s = NK.state, i, h, e;
  s.crumbs += gained;
  s.crumbsTotal += gained;
  s.ascensions++;
  s.cookies = 0; s.total = 0;
  s.buildings = {}; s.upgrades = {}; s.tapUpgrades = 0;
  s.buffs = [];
  spawn = null;
  scheduleGolden();
  // heavenly "startBuilding": begin the new run with free buildings
  for (i = 0; i < D.HEAVENLY.length; i++) {
    h = D.HEAVENLY[i];
    if (s.heavenly[h.id]) {
      e = h.effect;
      if (e.kind === "startBuilding") s.buildings[e.id] = (s.buildings[e.id] || 0) + e.v;
    }
  }
  s.last = now();
  NK.save();
  NK.emit("ascend", { gained: gained });
  return { gained: gained };
};

NK.heavenlyList = D.HEAVENLY;
NK.buyHeavenly = function (id) {
  var s = NK.state, i, h;
  for (i = 0; i < D.HEAVENLY.length; i++) {
    h = D.HEAVENLY[i];
    if (h.id === id && !s.heavenly[id] && s.crumbs >= h.cost) {
      s.crumbs -= h.cost;
      s.heavenly[id] = true;
      NK.emit("buy", { kind: "heavenly", id: id, cost: h.cost });
      return true;
    }
  }
  return false;
};

/* ============================= formatting ============================= */
var UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No",
             "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg"];

NK.fmt = function (n) {
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + NK.fmt(-n);
  if (n < 1000) return Math.floor(n).toString();
  var i = 0;
  while (n >= 1000 && i < UNITS.length - 1) { n /= 1000; i++; }
  if (n >= 1000) return n.toExponential(1).replace("e+", "e"); // beyond Vg: 1.2e36 style
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n).toString()) + UNITS[i];
};

/* ============================= news ============================= */
var lastNews = "";
NK.newsNext = function () {
  var line, guard = 0;
  do { line = D.NEWS[Math.floor(Math.random() * D.NEWS.length)]; } while (line === lastNews && ++guard < 10);
  lastNews = line;
  return line;
};

/* ============================= save / load / migrate ============================= */
NK.save = function () {
  NK.state.last = now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(NK.state)); } catch (e) {}
};

function load() {
  NK.state = freshState();
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      var d = JSON.parse(raw);
      for (var k in NK.state) if (d[k] !== undefined) NK.state[k] = d[k];
      NK.state.buildings = (d && d.buildings) || {};
      NK.state.upgrades = (d && d.upgrades) || {};
      NK.state.achievements = (d && d.achievements) || {};
      NK.state.heavenly = (d && d.heavenly) || {};
      NK.state.buffs = (d && d.buffs) || [];
    } else {
      migrateLegacy();
    }
  } catch (e) { NK.state = freshState(); migrateLegacy(); }
  pruneBuffs();
}

/* Carry an old v1 save over so the player loses NOTHING. */
function migrateLegacy() {
  try {
    var raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    var v1 = JSON.parse(raw);
    if (!v1 || typeof v1 !== "object") return;
    var s = NK.state;
    s.cookies = Number(v1.cookies) || 0;
    s.total = Number(v1.total) || 0;
    s.totalAll = s.total;
    s.clicks = Number(v1.clicks) || 0;
    s.buildings = {};
    if (v1.buildings) {
      for (var k in v1.buildings) {
        if (bDef(k)) s.buildings[k] = Math.max(0, Math.floor(Number(v1.buildings[k]) || 0));
      }
    }
    s.tapUpgrades = Math.max(0, Math.floor(Number(v1.tapUpgrades) || 0));
    s.last = Number(v1.last) || now();
  } catch (e) {}
}

NK.hardReset = function () {
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(LEGACY_KEY); } catch (e) {}
  NK.state = freshState();
  spawn = null;
  scheduleGolden();
  NK.emit("reset", {});
};

/* ============================= offline gains ============================= */
function offlineGains() {
  var away = Math.min((now() - (NK.state.last || now())) / 1000, bestOf("offlineCap", 4 * 3600));
  var rate = bestOf("offlineRate", 0.5);
  var gained = NK.cps() * away * rate;
  if (gained > 1) {
    addCookies(gained);
    NK.emit("welcome", { seconds: away, gained: gained });
  }
}

/* ============================= loop ============================= */
var lastTick = 0, lastAchCheck = 0, running = false, rafId = 0, saveTimer = 0;

function tick() {
  var t = now();
  var dt = Math.min((t - lastTick) / 1000, 0.25); // clamp: backgrounded tab must not jump
  lastTick = t;
  if (dt > 0) {
    var per = NK.cps() * dt;
    if (per > 0) addCookies(per);
    NK.state.playSeconds += dt;
  }
  pruneBuffs();
  goldenTick();
  if (t - lastAchCheck >= 250) { lastAchCheck = t; checkAchievements(); }
  NK.emit("tick", { dt: dt });
  rafId = requestAnimationFrame(tick);
}

NK.init = function () {
  if (running) return;
  load();
  scheduleGolden();
  offlineGains();
  running = true;
  lastTick = now();
  rafId = requestAnimationFrame(tick);
  saveTimer = setInterval(NK.save, 5000);
  window.addEventListener("visibilitychange", function (e) {
    var hidden = e.target && e.target.hidden;
    NK.visible = !hidden;
    if (hidden) NK.save();
  });
  window.addEventListener("pagehide", function () { NK.save(); });
};

NK.stop = function () { // tests / embedding only
  if (!running) return;
  running = false;
  cancelAnimationFrame(rafId);
  clearInterval(saveTimer);
};

})();
