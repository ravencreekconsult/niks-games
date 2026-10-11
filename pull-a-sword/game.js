/* PULL A SWORD — game.js
   Logic + DOM UI. Canvas decoration lives in scene.js (optional — game runs without it).
   All scene access goes through scene() which is safe when PAS_Scene is absent. */
(function () {
  'use strict';

  var D = window.PAS_Data || { RARITY: [], WORLDS: [], PETS: [], EGG_WEIGHTS: [], CODES: {}, INDEX_SLOTS: [] };

  /* ---------- element cache ---------- */
  var IDS = ['strengthFmt','level','wins','rebirths','world','equipped','strength','cv','hint',
    'tapFmt','dpsFmt','petMultFmt','luckFmt','rebirthFmt','pullFill','pullHintTxt','pityTxt','pullsTxt',
    'worldName2','swordList','eggWins','eggList','petsInfo','petsPanel','indexInfo','indexGrid','slotInfo',
    'worldList','codeInput','redeemBtn','rebirthBtn','restartBtn','trainBtn','pullBtn','bossBtn',
    'msg','msgTitle','msgText','msgBtn','reveal','revealRarity','revealName','revealMult','revealText','revealOk',
    'hatch','hatchTitle','hatchEgg','hatchText','hatchBtn1','hatchBtn5','hatchClose',
    'bossOverlay','bossName','bossHpFill','bossHpText','playerHpFill','playerHpText','bossDps','attackBtn','fleeBtn',
    'victory','victoryBtn','toast'];
  var el = {};
  for (var ii = 0; ii < IDS.length; ii++) { el[IDS[ii]] = document.getElementById(IDS[ii]); }

  /* ---------- safe scene bridge ---------- */
  function scene(fn, a, b, c) {
    try {
      if (window.PAS_Scene && typeof window.PAS_Scene[fn] === 'function') {
        return window.PAS_Scene[fn](a, b, c);
      }
    } catch (e) { /* scene must never break the game */ }
    return undefined;
  }

  /* ---------- number formatter ---------- */
  var UNITS = ['','K','M','B','T','Q','Qn','Sx','Sp','Oc','No','Dc'];
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) { return '0'; }
    if (n < 0) { return '-' + fmt(-n); }
    if (n < 1000) { return String(Math.floor(n)); }
    var tier = Math.floor(Math.log(n) / Math.LN10 / 3);
    if (tier > UNITS.length - 1) { tier = UNITS.length - 1; }
    var scaled = n / Math.pow(1000, tier);
    var s;
    if (scaled >= 100) { s = scaled.toFixed(0); }
    else if (scaled >= 10) { s = scaled.toFixed(1); }
    else { s = scaled.toFixed(2); }
    s = s.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');
    return s + UNITS[tier];
  }
  function pct(x) {
    if (x >= 10) { return x.toFixed(1) + '%'; }
    if (x >= 1) { return x.toFixed(2) + '%'; }
    if (x >= 0.1) { return x.toFixed(2) + '%'; }
    if (x <= 0) { return '0%'; }
    return (x < 0.01 ? x.toFixed(3) : x.toFixed(2)) + '%';
  }

  /* ---------- save / load ---------- */
  var KEY = 'pas_save_v2';
  var OLD_KEY = 'pas_save_v1';
  function defaultState() {
    return {
      strength: 0, level: 1, xp: 0, wins: 0, rebirths: 0, world: 0,
      owned: {}, equipped: null,
      pets: [], petCounts: {}, equipPets: [],
      codes: {}, luckBonus: 0,
      pulls: 0, bestPull: null, pity: 0
    };
  }
  function migrateV1(old) {
    var s = defaultState();
    if (!old || typeof old !== 'object') { return s; }
    var keys = ['strength','level','xp','wins','rebirths','world','owned','equipped','pets','equipPets','codes'];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (old[k] !== undefined) { s[k] = old[k]; }
    }
    if (!s.petCounts) {
      s.petCounts = {};
      var pl = s.pets || [];
      for (var p = 0; p < pl.length; p++) { s.petCounts[pl[p]] = 1; }
    }
    var lm = typeof old.luckMult === 'number' ? old.luckMult : 1;
    s.luckBonus = Math.max(0, lm - 1);
    s.pulls = 0; s.bestPull = null; s.pity = 0;
    return s;
  }
  function load() {
    var s = null;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { s = JSON.parse(raw); }
    } catch (e) { s = null; }
    if (!s || typeof s !== 'object') {
      try {
        var oldRaw = localStorage.getItem(OLD_KEY);
        if (oldRaw) { s = migrateV1(JSON.parse(oldRaw)); }
      } catch (e2) { s = null; }
    }
    if (!s || typeof s !== 'object') { s = defaultState(); }
    /* fill any missing fields from the default so old/partial saves still run */
    var d = defaultState();
    for (var k in d) { if (s[k] === undefined) { s[k] = d[k]; } }
    if (typeof s.strength !== 'number' || !isFinite(s.strength) || s.strength < 0) { s.strength = 0; }
    if (typeof s.level !== 'number' || s.level < 1) { s.level = 1; }
    if (typeof s.world !== 'number' || !isFinite(s.world)) { s.world = 0; }
    s.world = Math.max(0, Math.min(D.WORLDS.length - 1, Math.floor(s.world) || 0));
    return s;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage may be blocked */ }
  }

  /* ---------- game state ---------- */
  var S = load();

  /* ---------- derived numbers ---------- */
  function rarityIdx(r) {
    for (var i = 0; i < D.RARITY.length; i++) { if (D.RARITY[i].k === r) { return i; } }
    return 0;
  }
  function rarityCol(r) {
    var i = rarityIdx(r);
    return D.RARITY[i] ? D.RARITY[i].c : '#9da7b3';
  }
  function findSword(name) {
    for (var w = 0; w < D.WORLDS.length; w++) {
      var arr = D.WORLDS[w].swords;
      for (var i = 0; i < arr.length; i++) { if (arr[i].n === name) { return arr[i]; } }
    }
    return null;
  }
  function equippedSword() {
    if (!S.equipped) { return null; }
    return findSword(S.equipped);
  }
  function swordMult() {
    var sw = equippedSword();
    return sw ? sw.m : 1;
  }
  function petMult() {
    var sum = 0;
    for (var i = 0; i < S.equipPets.length; i++) {
      var p = petByName(S.equipPets[i]);
      if (p) { sum += p.m; }
    }
    return Math.max(1, sum);
  }
  function petByName(name) {
    for (var i = 0; i < D.PETS.length; i++) { if (D.PETS[i].n === name) { return D.PETS[i]; } }
    return null;
  }
  function luckBonus() {
    var b = (typeof S.luckBonus === 'number' ? S.luckBonus : 0);
    for (var i = 0; i < S.equipPets.length; i++) {
      var p = petByName(S.equipPets[i]);
      if (p && p.luck) { b += p.luck; }
    }
    return b;
  }
  function rebirthMult() { return Math.pow(1.25, S.rebirths); }
  function tapPower() {
    return (1 + 0.15 * S.level) * swordMult() * petMult() * rebirthMult() * (1 + luckBonus());
  }
  function xpNeed() { return Math.max(8, Math.floor(15 * Math.pow(S.level, 1.5))); }
  function petSlots() {
    var n = S.pets.length, slots = 3;
    for (var i = 0; i < D.INDEX_SLOTS.length; i++) {
      if (n >= D.INDEX_SLOTS[i].at) { slots = D.INDEX_SLOTS[i].slots; }
    }
    return slots;
  }
  function curWorld() { return D.WORLDS[S.world]; }

  /* ---------- toast & message ---------- */
  var toastTimer = null;
  function toast(txt) {
    if (!el.toast) { return; }
    el.toast.textContent = txt;
    el.toast.style.opacity = '1';
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { el.toast.style.opacity = '0'; }, 1800);
  }
  function showMsg(title, text, btnLabel, cb) {
    el.msgTitle.textContent = title;
    el.msgText.textContent = text;
    el.msgBtn.textContent = btnLabel || 'OK';
    el.msgBtn.onclick = function () {
      el.msg.style.display = 'none';
      el.msgBtn.onclick = null;
      if (cb) { cb(); }
    };
    el.msg.style.display = 'flex';
  }

  /* ---------- strength / xp / level ---------- */
  var lastEligKey = '';
  function addStrength(v, opts) {
    opts = opts || {};
    S.strength += v;
    var xpGain = (opts.xp === undefined) ? (1 + Math.floor(S.world / 2)) : opts.xp;
    S.xp += xpGain;
    var leveled = false;
    while (S.xp >= xpNeed()) {
      S.xp -= xpNeed();
      S.level++;
      leveled = true;
    }
    if (leveled) {
      toast('Level up! You are level ' + S.level + ' — tap power went up!');
      scene('burst', 0.5, 0.35, '#00e5ff', 14);
      scene('shake', 4);
    }
    if (opts.quiet !== true) {
      scene('burst', 0.5, 0.6, opts.col || '#7c5cff', opts.burst || 6);
    }
    updateHUD();
    renderSwordsIfChanged();
  }

  /* ---------- HUD ---------- */
  function updateHUD() {
    el.strengthFmt.textContent = fmt(S.strength);
    el.strength.textContent = String(Math.floor(S.strength));
    el.level.textContent = String(S.level);
    el.wins.textContent = fmt(S.wins);
    el.rebirths.textContent = String(S.rebirths);
    el.world.textContent = curWorld() ? curWorld().name : '—';
    var sw = equippedSword();
    el.equipped.textContent = sw ? sw.n : 'None';
    el.tapFmt.textContent = fmt(tapPower());
    el.dpsFmt.textContent = fmt(tapPower());
    el.petMultFmt.textContent = 'x' + fmt(petMult());
    el.luckFmt.textContent = 'x' + (1 + luckBonus()).toFixed(2);
    el.rebirthFmt.textContent = 'x' + rebirthMult().toFixed(2);
    el.pityTxt.textContent = 'Lucky streak: ' + S.pity + ' / 20 pulls until a guaranteed new sword';
    el.pullsTxt.textContent = 'Total pulls: ' + fmt(S.pulls) +
      (S.bestPull ? ' · Best pull: ' + S.bestPull : '');
  }

  /* ---------- sword list with LIVE odds ---------- */
  function pullWeights() {
    var world = curWorld();
    if (!world) { return { list: [], w: [] }; }
    var eligible = [], weights = [];
    var lb = 1 + luckBonus();
    for (var i = 0; i < world.swords.length; i++) {
      var sw = world.swords[i];
      if (S.strength >= sw.req) {
        eligible.push(sw);
        weights.push(D.RARITY[i].w * Math.pow(lb, i));
      }
    }
    return eligible.length ? { list: eligible, w: weights } : { list: [], w: [] };
  }
  function normalise(weights) {
    var total = 0, i;
    for (i = 0; i < weights.length; i++) { total += weights[i]; }
    var out = [];
    for (i = 0; i < weights.length; i++) { out.push(total > 0 ? (weights[i] / total) * 100 : 0); }
    return out;
  }
  function renderSwords() {
    el.worldName2.textContent = D.WORLDS[S.world].name;
    var world = curWorld();
    if (!world) { return; }
    var pw = pullWeights();
    var pcts = normalise(pw.w);
    var pctByName = {};
    for (var j = 0; j < pw.list.length; j++) { pctByName[pw.list[j].n] = pcts[j]; }
    var html = '';
    for (var i = 0; i < world.swords.length; i++) {
      var sw = world.swords[i];
      var ri = rarityIdx(sw.r);
      var col = D.RARITY[ri] ? D.RARITY[ri].c : '#9da7b3';
      var owned = S.owned[sw.n] ? true : false;
      var eq = S.equipped === sw.n;
      var classes = 'sword' + (owned ? ' owned' : '') + (eq ? ' eq' : '') + (!owned && S.strength < sw.req ? ' locked' : '');
      var right;
      if (pctByName[sw.n] !== undefined) {
        right = '<span class="rq">' + pct(pctByName[sw.n]) + ' chance</span>';
      } else {
        right = '<span class="rq">needs ' + fmt(sw.req) + ' strength</span>';
      }
      html += '<div class="' + classes + '">' +
        '<span class="nm" style="color:' + col + '">' + (owned ? '✔ ' : '') + sw.n + '</span>' +
        '<span class="ml" style="color:' + col + '">x' + fmt(sw.m) + '</span>' +
        right + '</div>';
    }
    el.swordList.innerHTML = html;
    lastEligKey = eligKey();
  }
  function eligKey() {
    var world = curWorld();
    var k = S.world + ':' + Math.floor(S.strength) + ':' + luckBonus().toFixed(3) + ':' + S.equipped;
    if (!world) { return k; }
    for (var i = 0; i < world.swords.length; i++) {
      if (S.strength >= world.swords[i].req) { k += ':1'; } else { k += ':0'; }
    }
    return k;
  }
  function renderSwordsIfChanged() {
    var k = eligKey();
    if (k !== lastEligKey) { renderSwords(); }
  }

  /* ---------- worlds list ---------- */
  function renderWorlds() {
    var html = '';
    for (var w = 0; w < D.WORLDS.length; w++) {
      var wd = D.WORLDS[w];
      var reached = w <= S.world;
      html += '<div class="sword' + (reached ? ' owned' : ' locked') + '">' +
        '<span class="nm">' + wd.name + (reached ? '' : ' 🔒') + '</span>' +
        '<span class="ml">' + (reached ? 'Boss: ' + wd.boss : 'Beat the previous boss') + '</span>' +
        '<span class="rq">' + (reached ? (w === S.world ? 'here now' : 'cleared') : 'locked') + '</span>' +
        '</div>';
    }
    el.worldList.innerHTML = html;
  }

  /* ---------- THE PULL ---------- */
  var pulling = false;
  var pullT = 1;          /* 0..1, 1 = idle/ready */
  var pullTimer = null;
  var PITY_AT = 20;

  function rollSword() {
    var pw = pullWeights();
    if (!pw.list.length) { return null; }
    /* pity: guaranteed rarest ELIGIBLE sword he does not own */
    var rarest = null;
    for (var i = pw.list.length - 1; i >= 0; i--) {
      if (!S.owned[pw.list[i].n]) { rarest = pw.list[i]; break; }
    }
    if (S.pity >= PITY_AT && rarest) { return rarest; }
    var pcts = normalise(pw.w);
    var roll = Math.random() * 100, acc = 0;
    for (var j = 0; j < pw.list.length; j++) {
      acc += pcts[j];
      if (roll < acc) { return pw.list[j]; }
    }
    return pw.list[pw.list.length - 1];
  }

  function doPull() {
    if (pulling) { return; }
    var pw = pullWeights();
    if (!pw.list.length) {
      var first = curWorld().swords[0];
      showMsg('Too weak to pull!', 'You need at least ' + fmt(first.req) +
        ' strength to pull the first sword. Tap TRAIN to get stronger!');
      return;
    }
    var sw = rollSword();
    if (!sw) { return; }
    var ri = rarityIdx(sw.r);
    var col = D.RARITY[ri] ? D.RARITY[ri].c : '#9da7b3';
    pulling = true;
    el.pullBtn.disabled = true;
    pullT = 0;
    var t0 = Date.now(), DUR = 850;
    if (pullTimer) { clearInterval(pullTimer); }
    pullTimer = setInterval(function () {
      var f = Math.min(1, (Date.now() - t0) / DUR);
      pullT = f;
      el.pullFill.style.width = (f * 100).toFixed(1) + '%';
      el.pullHintTxt.textContent = 'Pulling the sword...';
      if (f >= 1) {
        clearInterval(pullTimer);
        pullTimer = null;
        el.pullHintTxt.textContent = 'Pull ready.';
      }
    }, 120);

    function onReveal() {
      pulling = false;
      el.pullBtn.disabled = false;
      applyPull(sw);
    }
    var played = scene('pull', col, sw.n, onReveal);
    if (!played) { setTimeout(onReveal, 850); }
  }

  function applyPull(sw) {
    var ri = rarityIdx(sw.r);
    var col = D.RARITY[ri] ? D.RARITY[ri].c : '#9da7b3';
    var isNew = !S.owned[sw.n];
    S.pulls++;
    S.pity = isNew ? 0 : (S.pity + 1);
    if (!S.bestPull || rarityIdx(sw.r) > rarityIdx(S.bestPull)) { S.bestPull = sw.n; }
    var text, autoEq = false;
    if (isNew) {
      S.owned[sw.n] = 1;
      S.wins += 1 + S.world;
      var cur = equippedSword();
      if (!cur || sw.m > cur.m) {
        S.equipped = sw.n;
        autoEq = true;
      }
      text = 'BRAND NEW sword! +' + fmt(1 + S.world) + ' wins.' +
        (autoEq ? ' It is now your equipped sword!' : '');
      scene('flash', col);
      scene('shake', 8);
      scene('burst', 0.5, 0.4, col, 24);
    } else {
      var bonus = tapPower() * 15 + sw.req;
      S.strength += bonus;
      S.wins += 1 + S.world;
      text = 'Duplicate! You kept pulling the same sword — but you gain ' + fmt(bonus) +
        ' strength and ' + fmt(1 + S.world) + ' wins!';
      scene('burst', 0.5, 0.4, col, 10);
    }
    el.revealRarity.textContent = sw.r.toUpperCase();
    el.revealRarity.className = 'rarity r-' + sw.r;
    el.revealRarity.style.color = col;
    el.revealName.textContent = sw.n;
    el.revealMult.textContent = 'x' + fmt(sw.m) + ' power' + (autoEq ? ' — EQUIPPED!' : '');
    el.revealText.textContent = text;
    el.reveal.style.setProperty('--rc', col);
    el.reveal.style.display = 'flex';
    updateHUD();
    renderSwords();
    renderEggs();
    renderWorlds();
    save();
  }

  /* ---------- EGGS / HATCHING ---------- */
  var hatchWorld = 0;
  var hatching = false;

  function renderEggs() {
    el.eggWins.textContent = 'Your wins: ' + fmt(S.wins) + ' (every pull pays wins!)';
    var html = '';
    for (var w = 0; w <= S.world && w < D.WORLDS.length; w++) {
      var wd = D.WORLDS[w];
      var egg = wd.egg;
      var can = S.wins >= egg.cost;
      html += '<div class="sword' + (can ? ' owned' : ' locked') + '">' +
        '<span class="nm">' + egg.name + '</span>' +
        '<span class="ml" style="color:#ffd700">' + fmt(egg.cost) + ' wins</span>' +
        '<button class="btn small" data-egg="' + w + '"' + (can ? '' : ' disabled') + '>HATCH</button>' +
        '</div>';
    }
    el.eggList.innerHTML = html;
    var btns = el.eggList.querySelectorAll('button[data-egg]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.onclick = function () { openHatch(parseInt(b.getAttribute('data-egg'), 10)); };
      })(btns[i]);
    }
  }

  function openHatch(w) {
    var wd = D.WORLDS[w];
    if (!wd) { return; }
    hatchWorld = w;
    hatching = false;
    el.hatchTitle.textContent = wd.egg.name;
    el.hatchText.textContent = 'Wins: ' + fmt(S.wins) + ' · 1 hatch = ' + fmt(wd.egg.cost) + ' wins';
    el.hatchEgg.className = '';
    el.hatchBtn1.disabled = S.wins < wd.egg.cost;
    el.hatchBtn5.disabled = S.wins < wd.egg.cost * 5;
    el.hatch.style.display = 'flex';
  }

  function rollPet(w) {
    var lb = 1 + luckBonus();
    var weights = [], i;
    for (i = 0; i < D.EGG_WEIGHTS.length; i++) {
      weights.push(D.EGG_WEIGHTS[i] * Math.pow(lb, i));
    }
    var total = 0;
    for (i = 0; i < weights.length; i++) { total += weights[i]; }
    var roll = Math.random() * total, acc = 0, tier = 0;
    for (i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (roll < acc) { tier = i; break; }
    }
    /* find pets of that tier in this world; step down a tier if none exists */
    var wd = D.WORLDS[w];
    while (tier >= 0) {
      var want = D.RARITY[tier] ? D.RARITY[tier].k : 'Common';
      var pool = [];
      for (var p = 0; p < D.PETS.length; p++) {
        if (D.PETS[p].world === w && D.PETS[p].r === want) { pool.push(D.PETS[p]); }
      }
      if (pool.length) { return pool[Math.floor(Math.random() * pool.length)]; }
      tier--;
    }
    /* absolute fallback: any pet of this world */
    var any = [];
    for (var q = 0; q < D.PETS.length; q++) { if (D.PETS[q].world === w) { any.push(D.PETS[q]); } }
    return any.length ? any[Math.floor(Math.random() * any.length)] : D.PETS[0];
  }

  function givePet(pet, results) {
    var isNew = !S.petCounts[pet.n];
    if (isNew) {
      S.petCounts[pet.n] = 1;
      if (S.pets.indexOf(pet.n) === -1) { S.pets.push(pet.n); }
      results.newPets.push(pet.n);
      results.lines.push('NEW ' + pet.r + ': ' + pet.n + '!');
    } else {
      S.petCounts[pet.n] = (S.petCounts[pet.n] || 0) + 1;
      var bonus = tapPower() * 10 + pet.m * 50;
      var winBonus = 5 + S.world * 3;
      S.strength += bonus;
      S.wins += winBonus;
      results.dupCount = (results.dupCount || 0) + 1;
      results.lines.push('Duplicate ' + pet.n + ': +' + fmt(bonus) + ' strength, +' + fmt(winBonus) + ' wins');
    }
    results.counts[pet.r] = (results.counts[pet.r] || 0) + 1;
    if (isNew && S.pets.length && S.pets.length <= petSlots() && S.equipPets.indexOf(pet.n) === -1) {
      S.equipPets.push(pet.n); /* auto-equip new pets while there is room */
    }
  }

  function doHatch(n) {
    if (hatching) { return; }
    var wd = D.WORLDS[hatchWorld];
    var cost = wd.egg.cost * n;
    if (S.wins < cost) { toast('Not enough wins yet — keep pulling swords!'); return; }
    S.wins -= cost;
    hatching = true;
    el.hatchBtn1.disabled = true;
    el.hatchBtn5.disabled = true;
    el.hatchEgg.className = 'wobble';
    el.hatchText.textContent = 'The egg is shaking...';
    setTimeout(function () {
      var results = { counts: {}, lines: [], newPets: [], dupCount: 0 };
      var bestRi = -1, bestPet = null;
      for (var i = 0; i < n; i++) {
        var pet = rollPet(hatchWorld);
        givePet(pet, results);
        var r = rarityIdx(pet.r);
        if (r > bestRi) { bestRi = r; bestPet = pet; }
      }
      el.hatchEgg.className = 'wobble crack';
      var txt;
      if (n === 1) {
        var col = rarityCol(bestPet.r);
        txt = (results.newPets.length ? '✨ NEW PET! ✨\n' : '') +
          bestPet.n + ' (' + bestPet.r + ') — x' + fmt(bestPet.m) + ' power';
        if (results.lines.length > 1) { txt += '\n' + results.lines[1]; }
        scene('burst', 0.5, 0.5, col, 18);
        scene('flash', col);
      } else {
        var parts = [];
        for (var k = 0; k < D.RARITY.length; k++) {
          if (results.counts[D.RARITY[k].k]) {
            parts.push(results.counts[D.RARITY[k].k] + 'x ' + D.RARITY[k].k);
          }
        }
        txt = parts.join(' · ') + '\nBest: ' + bestPet.n + ' (' + bestPet.r + ', x' + fmt(bestPet.m) + ')';
        if (results.newPets.length) { txt += '\n✨ NEW: ' + results.newPets.join(', ') + '!'; }
        scene('burst', 0.5, 0.5, rarityCol(bestPet.r), 22);
      }
      el.hatchText.textContent = txt;
      hatching = false;
      el.hatchBtn1.disabled = S.wins < wd.egg.cost;
      el.hatchBtn5.disabled = S.wins < wd.egg.cost * 5;
      updateHUD();
      renderEggs();
      renderPets();
      renderIndex();
      save();
    }, 700);
  }

  /* ---------- PETS panel + INDEX ---------- */
  var SHAPE_EMOJI = { cat: '🐱', pup: '🐶', bird: '🐦', fox: '🦊', dragon: '🐉', golem: '🗿', bug: '🐛', blob: '🟢' };
  function petEmoji(p) { return SHAPE_EMOJI[p.shape] || '⭐'; }

  function renderPets() {
    var slots = petSlots();
    var html = '';
    for (var i = 0; i < slots; i++) {
      var name = S.equipPets[i];
      if (name) {
        var p = petByName(name);
        if (p) {
          html += '<div class="petslot on" data-pet="' + p.n.replace(/"/g, '&quot;') + '">' +
            '<span class="pe">' + petEmoji(p) + '</span>' +
            '<span class="pn">' + p.n + '</span>' +
            '<span class="pm">x' + fmt(p.m) + '</span>' +
            '<span class="r-' + p.r + '">' + p.r + '</span>' +
            '</div>';
          continue;
        }
      }
      html += '<div class="petslot"><span class="pe">➕</span><span>tap a pet in the index</span></div>';
    }
    el.petsPanel.innerHTML = html;
    var tiles = el.petsPanel.querySelectorAll('[data-pet]');
    for (var j = 0; j < tiles.length; j++) {
      (function (t) {
        t.onclick = function () { toggleEquip(t.getAttribute('data-pet')); };
      })(tiles[j]);
    }
    el.petsInfo.textContent = 'equipped ' + S.equipPets.length + '/' + slots +
      ' · indexed ' + S.pets.length + '/28';
  }

  function toggleEquip(name) {
    var idx = S.equipPets.indexOf(name);
    if (idx !== -1) {
      S.equipPets.splice(idx, 1);
      toast(name + ' sent to rest.');
    } else {
      if (S.equipPets.length >= petSlots()) {
        toast('All pet slots are full! Index more pets to unlock more slots.');
        return;
      }
      if (S.pets.indexOf(name) === -1) { return; }
      S.equipPets.push(name);
      toast(name + ' equipped!');
    }
    updateHUD();
    renderPets();
    renderIndex();
    renderSwords(); /* luck may change with equipped pets */
    save();
  }

  function nextSlotMilestone() {
    for (var i = 0; i < D.INDEX_SLOTS.length; i++) {
      var ms = D.INDEX_SLOTS[i];
      if (S.pets.length < ms.at) {
        return 'index ' + ms.at + ' pets to unlock a ' + ms.slots + 'th slot';
      }
    }
    return 'all slots unlocked — you can equip ' + petSlots() + ' pets!';
  }

  function renderIndex() {
    var ownedCount = S.pets.length;
    el.indexInfo.textContent = ownedCount + ' / ' + D.PETS.length + ' collected';
    var html = '';
    for (var i = 0; i < D.PETS.length; i++) {
      var p = D.PETS[i];
      var owned = S.petCounts[p.n] ? true : false;
      var src = p.world === -1 ? 'Special' : D.WORLDS[p.world].egg.name;
      if (owned) {
        var eq = S.equipPets.indexOf(p.n) !== -1;
        html += '<div class="itile owned" data-idxpet="' + i + '" style="border-color:' + p.col + '">' +
          '<span class="ie">' + petEmoji(p) + '</span>' +
          '<span class="in">' + p.n + (eq ? ' ★' : '') + '</span>' +
          '<span class="r-' + p.r + '">x' + fmt(p.m) + ' · ' + p.r + '</span>' +
          '<span>' + (S.petCounts[p.n] > 1 ? 'x' + S.petCounts[p.n] : '') + '</span>' +
          '</div>';
      } else {
        html += '<div class="itile locked">' +
          '<span class="ie">❓</span>' +
          '<span class="in">???</span>' +
          '<span class="r-' + p.r + '">' + p.r + '</span>' +
          '<span>' + src + '</span>' +
          '</div>';
      }
    }
    el.indexGrid.innerHTML = html;
    var tiles = el.indexGrid.querySelectorAll('[data-idxpet]');
    for (var j = 0; j < tiles.length; j++) {
      (function (t) {
        t.onclick = function () {
          var p = D.PETS[parseInt(t.getAttribute('data-idxpet'), 10)];
          if (p && S.petCounts[p.n]) { toggleEquip(p.n); }
        };
      })(tiles[j]);
    }
    el.slotInfo.textContent = nextSlotMilestone();
  }

  /* ---------- BOSS FIGHT ---------- */
  var boss = null;
  function openBoss() {
    var world = curWorld();
    var top = world.swords[world.swords.length - 1];
    var hp = top.m * 25;
    boss = { hp: hp, max: hp, php: hp + 2000, pmax: hp + 2000, dmg: Math.ceil(hp / 70) };
    el.bossName.textContent = world.boss;
    renderBossBars();
    el.bossDps.textContent = 'Your attack per tap: ' + fmt(tapPower()) + ' · Boss hits for ' + fmt(boss.dmg);
    el.attackBtn.disabled = false;
    el.bossOverlay.style.display = 'flex';
  }
  function renderBossBars() {
    el.bossHpFill.style.width = Math.max(0, (boss.hp / boss.max) * 100) + '%';
    el.bossHpText.textContent = 'Boss HP: ' + fmt(Math.max(0, boss.hp)) + ' / ' + fmt(boss.max);
    el.playerHpFill.style.width = Math.max(0, (boss.php / boss.pmax) * 100) + '%';
    el.playerHpText.textContent = 'Your HP: ' + fmt(Math.max(0, boss.php)) + ' / ' + fmt(boss.pmax);
  }
  function bossAttack() {
    if (!boss) { return; }
    boss.hp -= tapPower();
    boss.php -= boss.dmg;
    scene('shake', 6);
    scene('burst', 0.7, 0.4, '#ff4d4d', 8);
    renderBossBars();
    if (boss.hp <= 0) { winBoss(); return; }
    if (boss.php <= 0) {
      el.bossOverlay.style.display = 'none';
      boss = null;
      showMsg('So close!', 'The ' + curWorld().boss + ' won this round. Train up, pull stronger swords, and try again — you can retry right now!', 'RETRY', openBoss);
      return;
    }
    el.bossDps.textContent = 'Your attack per tap: ' + fmt(tapPower()) + ' · Boss hits for ' + fmt(boss.dmg);
  }
  function winBoss() {
    var world = curWorld();
    var winGain = 40 * (world + 1);
    var strGain = tapPower() * 25 + boss.max * 0.5;
    S.wins += winGain;
    S.strength += strGain;
    el.bossOverlay.style.display = 'none';
    boss = null;
    if (S.world < D.WORLDS.length - 1) {
      S.world++;
      showMsg('BOSS DEFEATED!', 'You beat the ' + world.boss + '! +' + fmt(winGain) + ' wins, +' + fmt(strGain) +
        ' strength.\nWelcome to ' + D.WORLDS[S.world].name + ' — new swords and the ' + D.WORLDS[S.world].egg.name + ' are waiting!', 'ONWARD!');
      scene('flash', '#ffd700');
      scene('burst', 0.5, 0.4, '#ffd700', 30);
    } else {
      el.victory.style.display = 'flex';
      scene('flash', '#ffd700');
      scene('burst', 0.5, 0.4, '#ffd700', 40);
    }
    updateHUD();
    renderSwords();
    renderEggs();
    renderWorlds();
    save();
  }

  /* ---------- CODES ---------- */
  function redeemCode() {
    var code = (el.codeInput.value || '').trim().toUpperCase();
    if (!code) { toast('Type a code first!'); return; }
    var def = D.CODES[code];
    if (!def) { toast('Unknown code: ' + code); return; }
    if (S.codes[code]) { toast('You already used ' + code + '!'); return; }
    S.codes[code] = 1;
    if (def.t === 'strength') {
      S.strength += def.v;
      toast('Code ' + code + ': +' + fmt(def.v) + ' strength!');
    } else if (def.t === 'luck') {
      S.luckBonus += def.v;
      toast('Code ' + code + ': permanent +25% luck!');
    } else if (def.t === 'pet') {
      var pet = petByName(def.v);
      if (pet && !S.petCounts[pet.n]) {
        S.petCounts[pet.n] = 1;
        if (S.pets.indexOf(pet.n) === -1) { S.pets.push(pet.n); }
        if (S.equipPets.length < petSlots()) { S.equipPets.push(pet.n); }
      }
      toast('Code ' + code + ': you got ' + def.v + '!');
    }
    el.codeInput.value = '';
    updateHUD();
    renderPets();
    renderIndex();
    renderSwords();
    save();
  }

  /* ---------- REBIRTH / RESTART ---------- */
  var restartArmed = false;
  function doRebirth() {
    if (S.level < 10) {
      showMsg('Not yet!', 'You need to be level 10 to rebirth. You are level ' + S.level +
        '. Keep training and pulling!');
      return;
    }
    showMsg('REBIRTH?', 'This resets your strength, level, world and swords — but you KEEP all pets, codes and luck, and gain a permanent +25% power. Rebirths so far: ' + S.rebirths + '.', 'REBIRTH!', function () {
      S.rebirths++;
      S.strength = 0;
      S.level = 1;
      S.xp = 0;
      S.world = 0;
      S.owned = {};
      S.equipped = null;
      S.pity = 0;
      toast('REBIRTH! Permanent power x' + rebirthMult().toFixed(2) + ' — pets kept!');
      scene('flash', '#00e5ff');
      scene('burst', 0.5, 0.4, '#00e5ff', 30);
      updateHUD();
      renderSwords();
      renderEggs();
      renderWorlds();
      save();
    });
  }
  function doRestart() {
    if (!restartArmed) {
      restartArmed = true;
      showMsg('RESTART EVERYTHING?', 'This wipes ALL progress — strength, swords, pets, everything — and starts a brand new game. Are you sure?', 'YES, WIPE IT', function () {
        restartArmed = false;
        S = defaultState();
        try { localStorage.removeItem(KEY); localStorage.removeItem(OLD_KEY); } catch (e) { }
        updateHUD();
        renderSwords();
        renderEggs();
        renderPets();
        renderIndex();
        renderWorlds();
        save();
        toast('Fresh start! Tap TRAIN, then PULL!');
      });
      /* re-arm the safety: if he closes without confirming, un-arm */
      var oldClick = el.msgBtn.onclick;
      el.msgBtn.onclick = function () {
        el.msg.style.display = 'none';
        el.msgBtn.onclick = null;
        restartArmed = false;
        if (oldClick) { oldClick(); }
      };
      return;
    }
    restartArmed = false;
  }

  /* ---------- TRAIN / input ---------- */
  function train() {
    addStrength(tapPower(), { col: '#00e5ff' });
    saveSoon();
  }

  /* ---------- idle + autosave loop ---------- */
  var tickCount = 0;
  setInterval(function () {
    tickCount++;
    if (S.pets.length > 0 || S.wins > 0) {
      addStrength(tapPower() * 0.5, { quiet: true, xp: 0 });
      renderSwordsIfChanged();
    }
    if (tickCount % 5 === 0) { save(); }
  }, 1000);
  var saveTimer = null;
  function saveSoon() {
    if (saveTimer) { return; }
    saveTimer = setTimeout(function () { saveTimer = null; save(); }, 2000);
  }

  /* ---------- snapshot for the renderer ---------- */
  function snapshot() {
    var sw = equippedSword();
    var pets = [];
    for (var i = 0; i < S.equipPets.length; i++) {
      var p = petByName(S.equipPets[i]);
      if (p) { pets.push({ n: p.n, col: p.col, shape: p.shape, r: p.r }); }
    }
    return {
      strength: S.strength,
      world: S.world,
      worldName: curWorld() ? curWorld().name : '',
      sword: sw ? { n: sw.n, c: rarityCol(sw.r) } : null,
      pets: pets,
      pullT: pullT
    };
  }

  /* ---------- wire up ---------- */
  function bind() {
    el.trainBtn.onclick = train;
    el.pullBtn.onclick = doPull;
    el.bossBtn.onclick = openBoss;
    el.revealOk.onclick = function () { el.reveal.style.display = 'none'; };
    el.hatchBtn1.onclick = function () { doHatch(1); };
    el.hatchBtn5.onclick = function () { doHatch(5); };
    el.hatchClose.onclick = function () { el.hatch.style.display = 'none'; };
    el.attackBtn.onclick = bossAttack;
    el.fleeBtn.onclick = function () {
      el.bossOverlay.style.display = 'none';
      boss = null;
      toast('You fled — the boss waits for you.');
    };
    el.victoryBtn.onclick = function () { el.victory.style.display = 'none'; };
    el.redeemBtn.onclick = redeemCode;
    el.codeInput.onkeydown = function (e) { if (e && e.key === 'Enter') { redeemCode(); } };
    el.rebirthBtn.onclick = doRebirth;
    el.restartBtn.onclick = doRestart;
    if (el.cv) {
      el.cv.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        train();
        scene('burst',
          e.clientX && window.innerWidth ? e.clientX / window.innerWidth : 0.5,
          e.clientY && window.innerHeight ? e.clientY / window.innerHeight : 0.6,
          '#00e5ff', 5);
      }, { passive: false });
    }
  }

  /* ---------- section open/closed memory ---------- */
  var SECTION_IDS = ['sec-power','sec-swords','sec-eggs','sec-pets','sec-index','sec-worlds','sec-codes','sec-rebirth'];
  function wireSections() {
    var map = null;
    try { map = JSON.parse(localStorage.getItem('pas_sections') || 'null'); } catch (e) { map = null; }
    for (var i = 0; i < SECTION_IDS.length; i++) {
      (function (id) {
        var d = document.getElementById(id);
        if (!d) { return; }
        try {
          if (map && typeof map === 'object' && typeof map[id] === 'boolean') { d.open = map[id]; }
          d.addEventListener('toggle', function () {
            try {
              var m = {};
              for (var j = 0; j < SECTION_IDS.length; j++) {
                var other = document.getElementById(SECTION_IDS[j]);
                if (other) { m[SECTION_IDS[j]] = !!other.open; }
              }
              localStorage.setItem('pas_sections', JSON.stringify(m));
            } catch (e2) { /* storage may be blocked */ }
          });
        } catch (e3) { /* details unsupported — leave HTML default */ }
      })(SECTION_IDS[i]);
    }
  }

  /* ---------- boot ---------- */
  bind();
  wireSections();
  updateHUD();
  renderSwords();
  renderEggs();
  renderPets();
  renderIndex();
  renderWorlds();
  save();
  scene('start', { get: snapshot });

  /* ---------- debug hook (?debug=1) ---------- */
  if (/[?&]debug=1/.test(window.location.search)) {
    window.PAS_Debug = {
      state: function () { return S; },
      give: function (n) { S.strength += n; updateHUD(); renderSwords(); },
      win: function (n) { S.wins += n; updateHUD(); renderEggs(); },
      saveNow: save
    };
  }
})();
