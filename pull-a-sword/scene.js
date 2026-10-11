/* PULL A SWORD — scene.js
   Canvas renderer: night sky, moon, mountains, the stone, the sword in it,
   and the EQUIPPED PETS drawn as animated little creatures.
   Exposes window.PAS_Scene: start / burst / shake / flash / pull.
   Vanilla ES5, no shadowBlur, no libraries. */
(function () {
  'use strict';

  /* ---------- constants ---------- */
  var LW = 400, LH = 260;           /* logical draw space */
  var STEEL = '#c8d1de';
  var OUTLINE = '#111a26';
  var GROUND_Y = 236;               /* ground line in logical space */

  var cv = document.getElementById('cv');
  var wrap = document.getElementById('cvwrap');
  var ctx = cv ? cv.getContext('2d') : null;
  if (!cv || !ctx) { return; }

  /* ---------- sizing / cache ---------- */
  var dpr = 1, cssW = 0, cssH = 0, scale = 1, ox = 0, oy = 0;
  var rect = { left: 0, top: 0, w: 0, h: 0 };

  function resize() {
    try {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cssH = Math.round(Math.max(140, Math.min(230, window.innerHeight * 0.24)));
      cv.style.height = cssH + 'px';
      cssW = wrap && wrap.clientWidth ? wrap.clientWidth : cv.clientWidth || 300;
      if (cssW < 50) { cssW = 300; }
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssH * dpr);
      scale = Math.min(cv.width / LW, cv.height / LH);
      ox = Math.round((cv.width - LW * scale) / 2);
      oy = Math.round((cv.height - LH * scale) / 2);
      rect = cv.getBoundingClientRect();
      buildLayers();
    } catch (e) { /* keep looping even if sizing fails */ }
  }

  /* ---------- helpers ---------- */
  function shade(hex, amt) {
    /* hex like #rrggbb, amt -1..1 (negative darkens, positive lightens) */
    var h = String(hex || '').replace('#', '');
    if (h.length !== 6) { return hex; }
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) { return hex; }
    var f = amt < 0 ? (1 + amt) : 1;
    var add = amt > 0 ? 255 * amt : 0;
    r = Math.max(0, Math.min(255, Math.round(r * f + add)));
    g = Math.max(0, Math.min(255, Math.round(g * f + add)));
    b = Math.max(0, Math.min(255, Math.round(b * f + add)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  var UNITS2 = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) { return '0'; }
    if (n < 0) { return '-' + fmt(-n); }
    if (n < 1000) { return String(Math.floor(n)); }
    var tier = Math.floor(Math.log(n) / Math.LN10 / 3);
    if (tier > UNITS2.length - 1) { tier = UNITS2.length - 1; }
    var s = n / Math.pow(1000, tier);
    var str = s >= 100 ? s.toFixed(0) : (s >= 10 ? s.toFixed(1) : s.toFixed(2));
    str = str.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');
    return str + UNITS2[tier];
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------- offscreen cached layers ---------- */
  var starL = null, ridgeL = null, groundL = null, stoneL = null, glowL = null;

  function makeOff(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function buildGlow() {
    var c = makeOff(128, 128), g = c.getContext('2d');
    var grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.32)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    glowL = c;
  }

  function buildStars() {
    var c = makeOff(LW * 2, LH * 2), g = c.getContext('2d');
    g.scale(2, 2);
    /* sky gradient */
    var sky = g.createLinearGradient(0, 0, 0, LH);
    sky.addColorStop(0, '#050810');
    sky.addColorStop(0.55, '#0b1322');
    sky.addColorStop(0.85, '#15203a');
    sky.addColorStop(1, '#233049');
    g.fillStyle = sky;
    g.fillRect(0, 0, LW, LH);
    /* ~90 stars, varied radius/alpha */
    var i, x, y, r, a;
    for (i = 0; i < 90; i++) {
      x = rnd(0, LW); y = rnd(0, LH * 0.72); r = rnd(0.4, 1.5); a = rnd(0.25, 0.95);
      g.globalAlpha = a;
      g.fillStyle = i % 9 === 0 ? '#bfe6ff' : '#ffffff';
      g.beginPath();
      g.arc(x, y, r, 0, 6.2832);
      g.fill();
    }
    g.globalAlpha = 1;
    /* moon with soft halo (concentric translucent circles, no shadowBlur) */
    var mx = 330, my = 52;
    g.fillStyle = 'rgba(220,230,255,0.05)';
    g.beginPath(); g.arc(mx, my, 34, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(220,230,255,0.08)';
    g.beginPath(); g.arc(mx, my, 25, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(220,235,255,0.12)';
    g.beginPath(); g.arc(mx, my, 18, 0, 6.2832); g.fill();
    g.fillStyle = '#e8eefc';
    g.beginPath(); g.arc(mx, my, 12.5, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(180,195,225,0.45)';
    g.beginPath(); g.arc(mx - 4, my - 3, 2.6, 0, 6.2832); g.fill();
    g.beginPath(); g.arc(mx + 4, my + 4, 1.8, 0, 6.2832); g.fill();
    g.beginPath(); g.arc(mx + 2, my - 5, 1.2, 0, 6.2832); g.fill();
    starL = c;
  }

  function buildRidges() {
    var c = makeOff(LW * 2, LH * 2), g = c.getContext('2d');
    g.scale(2, 2);
    /* far ridge */
    g.fillStyle = '#131c2e';
    g.beginPath();
    g.moveTo(-10, 200);
    var i, x;
    for (i = 0; i <= 8; i++) {
      x = -10 + (410 / 8) * i;
      g.lineTo(x, 150 + (i % 2 === 0 ? -26 : 8) + (i % 3) * 6);
    }
    g.lineTo(410, 200);
    g.closePath();
    g.fill();
    /* mid ridge */
    g.fillStyle = '#0e1626';
    g.beginPath();
    g.moveTo(-10, 215);
    for (i = 0; i <= 6; i++) {
      x = -10 + (410 / 6) * i;
      g.lineTo(x, 180 + (i % 2 === 0 ? -20 : 4));
    }
    g.lineTo(410, 215);
    g.closePath();
    g.fill();
    /* near ridge */
    g.fillStyle = '#0a101c';
    g.beginPath();
    g.moveTo(-10, 236);
    for (i = 0; i <= 5; i++) {
      x = -10 + (410 / 5) * i;
      g.lineTo(x, 208 + (i % 2 === 0 ? -16 : 2));
    }
    g.lineTo(410, 236);
    g.closePath();
    g.fill();
    ridgeL = c;
  }

  function buildGround() {
    var c = makeOff(LW * 2, LH * 2), g = c.getContext('2d');
    g.scale(2, 2);
    var gr = g.createLinearGradient(0, GROUND_Y - 2, 0, LH);
    gr.addColorStop(0, '#171f2e');
    gr.addColorStop(1, '#0a0e16');
    g.fillStyle = gr;
    g.fillRect(0, GROUND_Y, LW, LH - GROUND_Y);
    g.fillStyle = 'rgba(120,150,190,0.18)';
    g.fillRect(0, GROUND_Y, LW, 1.4);
    groundL = c;
  }

  function buildStone() {
    var c = makeOff(LW * 2, LH * 2), g = c.getContext('2d');
    g.scale(2, 2);
    /* dark base slab */
    g.fillStyle = '#1d2432';
    g.beginPath();
    g.moveTo(158, 232); g.lineTo(242, 232); g.lineTo(234, 244); g.lineTo(166, 244);
    g.closePath(); g.fill();
    /* chunky trapezoid body with bevel */
    var gr = g.createLinearGradient(0, 178, 0, 234);
    gr.addColorStop(0, '#3a4456');
    gr.addColorStop(1, '#232b3a');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(164, 234); g.lineTo(172, 186); g.lineTo(228, 186); g.lineTo(236, 234);
    g.closePath(); g.fill();
    /* bevel highlight (left/top) */
    g.fillStyle = 'rgba(170,190,220,0.22)';
    g.beginPath();
    g.moveTo(172, 186); g.lineTo(228, 186); g.lineTo(232, 194); g.lineTo(176, 194);
    g.closePath(); g.fill();
    g.fillStyle = 'rgba(150,175,210,0.14)';
    g.beginPath();
    g.moveTo(172, 186); g.lineTo(176, 194); g.lineTo(170, 234); g.lineTo(164, 234);
    g.closePath(); g.fill();
    /* cracks */
    g.strokeStyle = 'rgba(10,14,22,0.55)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(190, 196); g.lineTo(196, 210); g.lineTo(192, 222); g.stroke();
    g.beginPath(); g.moveTo(214, 200); g.lineTo(210, 214); g.stroke();
    /* rune marks */
    g.strokeStyle = 'rgba(124,92,255,0.65)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(178, 214); g.lineTo(186, 214); g.lineTo(182, 224); g.lineTo(178, 220);
    g.stroke();
    g.beginPath();
    g.moveTo(216, 214); g.lineTo(222, 220); g.moveTo(222, 214); g.lineTo(216, 220);
    g.stroke();
    /* socket where the blade enters */
    g.fillStyle = '#141a26';
    g.beginPath();
    g.ellipse(200, 190, 13, 4.5, 0, 0, 6.2832);
    g.fill();
    stoneL = c;
  }

  function buildLayers() {
    if (!glowL) { buildGlow(); }
    buildStars();
    buildRidges();
    buildGround();
    buildStone();
  }

  /* ---------- scene state ---------- */
  var get = null;
  var safeSnap = { strength: 0, world: 0, worldName: '', sword: null, pets: [], pullT: 1 };
  var raf = 0, lastT = 0, tSec = 0;
  var started = false, listenersOn = false;
  var shakeMag = 0, shakeT0 = -10;
  var flashCol = '#ffffff', flashT0 = -10, flashDur = 0.3;
  var parts = [];
  var motes = [];
  var displayStrength = 0;
  var twinkles = [];

  /* pull animation state */
  var pullState = null; /* { t0, col, fired, cb, name } */
  var swordUp = 0; /* 0..1 how far the sword is lifted out (animated, settles back) */
  var swordUpTarget = 0;

  function safeGet() {
    try {
      if (get && typeof get === 'function') {
        var s = get();
        if (s && typeof s === 'object') { return s; }
      }
    } catch (e) { /* fall through */ }
    return safeSnap;
  }

  /* ---------- burst ---------- */
  function burst(x, y, color, n) {
    try {
      if (!isFinite(x)) { x = 0.5; }
      if (!isFinite(y)) { y = 0.5; }
      n = Math.max(1, Math.min(60, Math.round(n || 6)));
      var px = x * LW, py = y * LH;
      for (var i = 0; i < n; i++) {
        if (parts.length >= 200) { break; }
        var ang = rnd(0, 6.2832), sp = rnd(20, 130);
        parts.push({
          x: px, y: py,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 30,
          life: rnd(0.45, 0.95), age: 0,
          r: rnd(1.2, 3.2), col: color || '#ffffff'
        });
      }
    } catch (e) { /* never break the game */ }
  }

  /* ---------- shake / flash ---------- */
  function shake(mag) {
    try {
      shakeMag = Math.max(shakeMag, Math.max(1, Math.min(30, mag || 4)));
      shakeT0 = tSec;
    } catch (e) { }
  }
  function flash(colorHex) {
    try {
      flashCol = colorHex || '#ffffff';
      flashT0 = tSec;
    } catch (e) { }
  }

  /* ---------- PULL ANIMATION ---------- */
  function pull(colorHex, swordName, onReveal) {
    try {
      pullState = {
        t0: Date.now(),
        col: colorHex || '#7c5cff',
        name: swordName || '',
        cb: typeof onReveal === 'function' ? onReveal : null,
        fired: false
      };
      swordUpTarget = 1;
      return true;
    } catch (e) {
      /* could not start the animation — reveal immediately so game.js proceeds */
      try { if (typeof onReveal === 'function') { onReveal(); } } catch (e2) { }
      return true;
    }
  }
  function revealOnce() {
    if (!pullState || pullState.fired) { return; }
    pullState.fired = true;
    var cb = pullState.cb;
    pullState.cb = null;
    try { if (cb) { cb(); } } catch (e) { /* game.js guards too, but never propagate */ }
  }

  /* ---------- pets ---------- */
  function drawPet(x, y, size, pet, tt) {
    var g = ctx;
    var col = pet.col || '#7c5cff';
    var dark = shade(col, -0.55);
    var light = shade(col, 0.25);
    var s = size;
    /* rarity glow behind */
    var glowScale = s * (pet.r === 'Legendary' || pet.r === 'Mythic' ? 2.2 : 1.7);
    g.globalAlpha = pet.r === 'Legendary' || pet.r === 'Mythic' ? 0.5 : 0.32;
    g.drawImage(glowL, x - glowScale / 2, y - glowScale / 2, glowScale, glowScale);
    g.globalAlpha = 1;
    /* body base circle (most shapes) */
    var bob = Math.sin(tt * 2 + x * 0.3) * s * 0.06;
    var cy = y - s * 0.55 + bob;
    var breathe = 1 + Math.sin(tt * 3 + y) * 0.03;

    g.lineWidth = Math.max(1, s * 0.08);
    g.strokeStyle = OUTLINE;
    g.lineJoin = 'round';
    g.lineCap = 'round';

    function eye(ex, ey, er) {
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(ex, ey, er, 0, 6.2832); g.fill();
      g.fillStyle = OUTLINE;
      g.beginPath(); g.arc(ex + er * 0.28, ey + er * 0.1, er * 0.5, 0, 6.2832); g.fill();
    }

    var shape = pet.shape;
    var half = s / 2;

    if (shape === 'cat') {
      /* ears */
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x - half * 0.55, cy - half * 0.7); g.lineTo(x - half * 0.25, cy - half * 1.35); g.lineTo(x - half * 0.05, cy - half * 0.75); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + half * 0.55, cy - half * 0.7); g.lineTo(x + half * 0.25, cy - half * 1.35); g.lineTo(x + half * 0.05, cy - half * 0.75); g.closePath(); g.fill(); g.stroke();
      /* body */
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x, cy + half * 0.15, half * 0.85 * breathe, half * 0.8 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      /* tail */
      g.beginPath(); g.moveTo(x + half * 0.8, cy + half * 0.3);
      g.quadraticCurveTo(x + half * 1.5, cy + Math.sin(tt * 4) * half * 0.4, x + half * 1.2, cy - half * 0.7);
      g.stroke();
      eye(x - half * 0.3, cy, s * 0.07); eye(x + half * 0.3, cy, s * 0.07);
      g.beginPath(); g.moveTo(x, cy + half * 0.2); g.lineTo(x, cy + half * 0.3); g.stroke();

    } else if (shape === 'pup') {
      /* floppy ears */
      g.fillStyle = dark;
      g.beginPath(); g.ellipse(x - half * 0.75, cy - half * 0.45, half * 0.28, half * 0.55, 0.4, 0, 6.2832); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(x + half * 0.75, cy - half * 0.45, half * 0.28, half * 0.55, -0.4, 0, 6.2832); g.fill(); g.stroke();
      /* body */
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x, cy + half * 0.15, half * 0.85 * breathe, half * 0.75 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      /* wagging tail */
      g.beginPath(); g.moveTo(x + half * 0.75, cy + half * 0.25);
      g.quadraticCurveTo(x + half * 1.4, cy + half * 0.1 + Math.sin(tt * 6) * half * 0.5, x + half * 1.3, cy - half * 0.3 + Math.sin(tt * 6) * half * 0.5);
      g.stroke();
      eye(x - half * 0.3, cy, s * 0.07); eye(x + half * 0.3, cy, s * 0.07);
      g.fillStyle = OUTLINE;
      g.beginPath(); g.ellipse(x, cy + half * 0.25, half * 0.14, half * 0.1, 0, 0, 6.2832); g.fill();

    } else if (shape === 'bird') {
      /* body */
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x, cy + half * 0.1, half * 0.6 * breathe, half * 0.75 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      /* beak */
      g.fillStyle = '#ffb03a';
      g.beginPath(); g.moveTo(x - half * 0.55, cy - half * 0.1); g.lineTo(x - half * 1.05, cy); g.lineTo(x - half * 0.55, cy + half * 0.12); g.closePath(); g.fill(); g.stroke();
      /* flapping wing */
      var wf = Math.sin(tt * 8) * half * 0.5;
      g.fillStyle = light;
      g.beginPath();
      g.moveTo(x + half * 0.1, cy);
      g.quadraticCurveTo(x + half * 0.9, cy - half * 0.6 + wf, x + half * 0.9, cy + half * 0.1 + wf * 0.4);
      g.closePath(); g.fill(); g.stroke();
      eye(x - half * 0.28, cy - half * 0.12, s * 0.06);
      /* little legs */
      g.strokeStyle = OUTLINE;
      g.beginPath(); g.moveTo(x - half * 0.15, cy + half * 0.85); g.lineTo(x - half * 0.15, y - 2); g.moveTo(x + half * 0.15, cy + half * 0.85); g.lineTo(x + half * 0.15, y - 2); g.stroke();

    } else if (shape === 'bug') {
      /* round shell */
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x, cy + half * 0.2, half * 0.85 * breathe, half * 0.75 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      /* shell split line + spots */
      g.strokeStyle = OUTLINE;
      g.beginPath(); g.moveTo(x, cy - half * 0.55); g.lineTo(x, cy + half * 0.95); g.stroke();
      g.fillStyle = light;
      g.beginPath(); g.arc(x - half * 0.4, cy + half * 0.1, half * 0.16, 0, 6.2832); g.fill();
      g.beginPath(); g.arc(x + half * 0.4, cy + half * 0.3, half * 0.16, 0, 6.2832); g.fill();
      /* antennae */
      g.beginPath(); g.moveTo(x - half * 0.2, cy - half * 0.5); g.lineTo(x - half * 0.45, cy - half * 1.05);
      g.moveTo(x + half * 0.2, cy - half * 0.5); g.lineTo(x + half * 0.45, cy - half * 1.05); g.stroke();
      /* legs */
      g.beginPath();
      g.moveTo(x - half * 0.6, cy + half * 0.7); g.lineTo(x - half * 0.8, cy + half * 1.0);
      g.moveTo(x + half * 0.6, cy + half * 0.7); g.lineTo(x + half * 0.8, cy + half * 1.0);
      g.stroke();
      eye(x - half * 0.18, cy - half * 0.15, s * 0.06); eye(x + half * 0.18, cy - half * 0.15, s * 0.06);

    } else if (shape === 'fox') {
      /* pointed snout: body is a wedge-ish ellipse, snout triangle */
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x + half * 0.15, cy + half * 0.1, half * 0.8 * breathe, half * 0.7 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x - half * 0.55, cy - half * 0.15); g.lineTo(x - half * 1.2, cy + half * 0.1); g.lineTo(x - half * 0.55, cy + half * 0.35); g.closePath(); g.fill(); g.stroke();
      /* pointed ears */
      g.beginPath(); g.moveTo(x - half * 0.15, cy - half * 0.5); g.lineTo(x - half * 0.05, cy - half * 1.3); g.lineTo(x + half * 0.3, cy - half * 0.6); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + half * 0.45, cy - half * 0.5); g.lineTo(x + half * 0.6, cy - half * 1.25); g.lineTo(x + half * 0.85, cy - half * 0.45); g.closePath(); g.fill(); g.stroke();
      /* bushy tail */
      g.fillStyle = light;
      g.beginPath();
      g.ellipse(x + half * 1.05, cy + half * 0.3 + Math.sin(tt * 3) * half * 0.15, half * 0.55, half * 0.3, -0.5, 0, 6.2832);
      g.fill(); g.stroke();
      eye(x - half * 0.15, cy - half * 0.05, s * 0.06); eye(x + half * 0.25, cy - half * 0.05, s * 0.06);

    } else if (shape === 'dragon') {
      /* long neck: body low, head high */
      var hw = Math.sin(tt * 5) * half * 0.25;
      g.fillStyle = col;
      /* tail */
      g.beginPath(); g.moveTo(x + half * 0.6, cy + half * 0.5);
      g.quadraticCurveTo(x + half * 1.5, cy + half * 0.4 + hw, x + half * 1.3, cy - half * 0.1 + hw);
      g.lineWidth = Math.max(1.2, s * 0.1); g.strokeStyle = OUTLINE; g.stroke();
      /* body */
      g.lineWidth = Math.max(1, s * 0.08);
      g.beginPath(); g.ellipse(x + half * 0.2, cy + half * 0.5, half * 0.75 * breathe, half * 0.5 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      /* neck + head */
      g.beginPath(); g.moveTo(x - half * 0.2, cy + half * 0.4); g.lineTo(x - half * 0.35, cy - half * 0.75); g.lineTo(x - half * 0.05, cy - half * 0.75); g.lineTo(x + half * 0.05, cy + half * 0.4); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(x - half * 0.3, cy - half * 0.95, half * 0.35, half * 0.22, -0.3, 0, 6.2832); g.fill(); g.stroke();
      /* wings */
      var dwf = Math.sin(tt * 6) * half * 0.35;
      g.fillStyle = light;
      g.beginPath(); g.moveTo(x + half * 0.1, cy + half * 0.25);
      g.quadraticCurveTo(x + half * 0.9, cy - half * 0.7 + dwf, x + half * 1.0, cy + half * 0.3 + dwf * 0.3);
      g.closePath(); g.fill(); g.stroke();
      eye(x - half * 0.38, cy - half * 0.95, s * 0.055);

    } else if (shape === 'golem') {
      /* blocky body */
      g.fillStyle = col;
      g.fillRect(x - half * 0.7, cy - half * 0.2, half * 1.4, half * 1.1);
      g.strokeRect(x - half * 0.7, cy - half * 0.2, half * 1.4, half * 1.1);
      /* blocky head */
      g.fillRect(x - half * 0.45, cy - half * 0.95, half * 0.9, half * 0.75);
      g.strokeRect(x - half * 0.45, cy - half * 0.95, half * 0.9, half * 0.75);
      /* arms */
      var arm = Math.sin(tt * 2.5) * half * 0.12;
      g.fillRect(x - half * 1.1, cy - half * 0.05 + arm, half * 0.35, half * 0.8);
      g.strokeRect(x - half * 1.1, cy - half * 0.05 + arm, half * 0.35, half * 0.8);
      g.fillRect(x + half * 0.75, cy - half * 0.05 - arm, half * 0.35, half * 0.8);
      g.strokeRect(x + half * 0.75, cy - half * 0.05 - arm, half * 0.35, half * 0.8);
      /* rune on chest */
      g.strokeStyle = OUTLINE;
      g.beginPath(); g.moveTo(x, cy + half * 0.1); g.lineTo(x, cy + half * 0.5); g.moveTo(x - half * 0.15, cy + half * 0.25); g.lineTo(x + half * 0.15, cy + half * 0.25); g.stroke();
      eye(x - half * 0.22, cy - half * 0.6, s * 0.055); eye(x + half * 0.22, cy - half * 0.6, s * 0.055);

    } else {
      /* blob (and unknown shapes) */
      g.fillStyle = col;
      g.beginPath(); g.ellipse(x, cy + half * 0.25, half * 0.9 * breathe, half * 0.8 * breathe, 0, 0, 6.2832); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.beginPath(); g.arc(x - half * 0.3, cy, half * 0.22, 0, 6.2832); g.fill();
      eye(x - half * 0.25, cy - half * 0.05, s * 0.09); eye(x + half * 0.25, cy - half * 0.05, s * 0.09);
      g.strokeStyle = OUTLINE;
      g.beginPath(); g.arc(x, cy + half * 0.25, half * 0.22, 0.3, 2.8); g.stroke();
    }

    /* sparkle for Legendary / Mythic */
    if (pet.r === 'Legendary' || pet.r === 'Mythic') {
      var sp2 = (tt * 2 + x * 0.7) % 1;
      var sx = x + Math.sin(tt * 1.7 + x) * s * 0.8;
      var sy = cy - s * 0.6 - Math.cos(tt * 1.3 + y) * s * 0.3;
      g.globalAlpha = 0.5 + 0.5 * Math.sin(tt * 6 + x);
      g.fillStyle = '#ffffff';
      var sr = s * 0.07 * (1 - sp2 * 0.4);
      g.beginPath();
      g.moveTo(sx, sy - sr * 2); g.lineTo(sx + sr, sy); g.lineTo(sx, sy + sr * 2); g.lineTo(sx - sr, sy);
      g.closePath(); g.fill();
      g.globalAlpha = 1;
    }
  }

  /* ---------- per-frame draw ---------- */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!ctx) { return; }
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;
    tSec = now / 1000;

    var snap = safeGet();
    var swCol = (snap.sword && snap.sword.c) ? snap.sword.c : STEEL;
    var pets = (snap.pets && snap.pets.length) ? snap.pets.slice(0, 6) : [];
    var str = (typeof snap.strength === 'number' && isFinite(snap.strength)) ? snap.strength : 0;

    /* display strength eases toward real value */
    displayStrength += (str - displayStrength) * Math.min(1, dt * 6);
    if (Math.abs(str - displayStrength) < 1) { displayStrength = str; }

    /* pull progress: local animation clock wins; snapshot pullT fills gaps */
    var pLocal = 1;
    if (pullState) {
      pLocal = Math.min(1, (Date.now() - pullState.t0) / 850);
      if (pLocal >= 0.999) {
        revealOnce(); /* guaranteed at/after 850ms — guarded by fired flag */
      }
      if (pLocal >= 1 && swordUp <= 0.001 && !pullState.settling) {
        pullState.settling = true;
      }
      /* keep the pull alive until the settle-back finishes */
      if (pullState.fired && swordUp <= 0.001) { pullState = null; }
    } else {
      var snapT = typeof snap.pullT === 'number' ? snap.pullT : 1;
      pLocal = 1 - Math.max(0, Math.min(1, 1 - snapT)); /* 1 = idle */
    }
    swordUp += (swordUpTarget - swordUp) * Math.min(1, dt * 8);
    if (swordUpTarget === 1 && swordUp > 0.98) { swordUpTarget = 0; }
    var pullingNow = !!pullState && !pullState.settling;

    /* ---- transform ---- */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    var shakeA = 0;
    var st = tSec - shakeT0;
    if (st < 0.25 && shakeMag > 0) {
      shakeA = shakeMag * (1 - st / 0.25);
    }
    ctx.setTransform(scale, 0, 0, scale,
      ox + Math.sin(now * 0.09) * shakeA * scale,
      oy + Math.cos(now * 0.11) * shakeA * 0.6 * scale);

    /* ---- 1-2. sky + stars (with a few cheap twinkles) ---- */
    if (starL) { ctx.drawImage(starL, 0, 0, LW, LH); }
    if (!twinkles.length) {
      for (var tw = 0; tw < 5; tw++) { twinkles.push({ x: rnd(20, 380), y: rnd(10, 150), ph: rnd(0, 6.28) }); }
    }
    for (var ti = 0; ti < twinkles.length; ti++) {
      var tq = twinkles[ti];
      ctx.globalAlpha = 0.35 + 0.6 * (0.5 + 0.5 * Math.sin(tSec * 2 + tq.ph));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(tq.x, tq.y, 1.1, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* ---- 4. ridges with subtle parallax ---- */
    var par = Math.sin(tSec * 0.4) * 2;
    if (pullingNow) { par += (1 - pLocal) * 3; }
    if (ridgeL) { ctx.drawImage(ridgeL, par, 0, LW, LH); }
    /* ---- 5. ground ---- */
    if (groundL) { ctx.drawImage(groundL, 0, 0, LW, LH); }

    /* ---- 6. ambient motes ---- */
    if (!motes.length) {
      for (var mi = 0; mi < 12; mi++) { motes.push({ x: rnd(0, LW), y: rnd(40, 220), v: rnd(3, 9), ph: rnd(0, 6.28) }); }
    }
    ctx.fillStyle = 'rgba(160,190,230,0.28)';
    for (var mj = 0; mj < motes.length; mj++) {
      var mo = motes[mj];
      mo.y -= mo.v * dt;
      if (mo.y < 30) { mo.y = 225; mo.x = rnd(0, LW); }
      var mxp = mo.x + Math.sin(tSec * 0.6 + mo.ph) * 5;
      ctx.beginPath(); ctx.arc(mxp, mo.y, 1, 0, 6.2832); ctx.fill();
    }

    /* ---- pull beat 0-300ms: rumble + light build + inward particles ---- */
    var lightT = 0;
    if (pullingNow && pLocal < 0.353) {
      var b0 = pLocal / 0.353;
      var rum = Math.sin(now * 0.05) * b0 * 1.6;
      if (stoneL) { ctx.drawImage(stoneL, rum, 0, LW, LH); }
      lightT = b0 * 0.5;
    } else if (stoneL) {
      ctx.drawImage(stoneL, 0, 0, LW, LH);
    }
    if (pullingNow && pLocal < 0.353) {
      /* motes drawn inward toward the blade socket */
      ctx.fillStyle = pullState ? pullState.col : '#ffffff';
      for (var iw = 0; iw < 6; iw++) {
        var ia = (iw / 6) * 6.2832 + tSec * 3;
        var ir = 60 * (1 - pLocal / 0.353);
        ctx.beginPath(); ctx.arc(200 + Math.cos(ia) * ir, 170 + Math.sin(ia) * ir * 0.6, 1.4, 0, 6.2832); ctx.fill();
      }
    }

    /* ---- 9. PETS on a shallow arc in front of the stone ---- */
    var pn = pets.length;
    if (pn > 0) {
      var spanX = Math.min(300, 70 + pn * 36);
      for (var pi = 0; pi < pn; pi++) {
        var fx = pn === 1 ? 0.5 : 0.15 + (0.7 / (pn - 1)) * pi;
        var px = fx * LW;
        var py = GROUND_Y + 10 - Math.pow((fx - 0.5) * 2, 2) * 6; /* shallow arc, ends slightly higher */
        var ps = 30 + (pi % 2) * 2;
        var look = pullingNow && pLocal < 0.5 ? 1 : 0; /* pets look at the stone during beat 1 */
        drawPet(px + look * (200 - px) * 0.04, py, ps, pets[pi], tSec);
        /* name label */
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = '#9da7b3';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        try { ctx.fillText(pets[pi].n, px, py + 9); } catch (e2) { }
        ctx.globalAlpha = 1;
      }
    }

    /* ---- 8. sword in the stone ---- */
    var bladeX = 200, socketY = 190;
    var lift = swordUp * 62;
    var tilt = -0.08 + swordUp * 0.1 + Math.sin(tSec * 1.6) * 0.01;
    var bob = Math.sin(tSec * 1.6) * 1.2;
    /* glow behind sword */
    var gAmt = 0.55 + lightT + (pullingNow ? Math.sin(tSec * 8) * 0.1 : 0);
    ctx.globalAlpha = Math.min(1, gAmt);
    ctx.drawImage(glowL, bladeX - 46, socketY - 40 + bob - lift * 0.5, 92, 92);
    ctx.globalAlpha = 1;
    /* light beam column during beat 2 */
    if (pullingNow && pLocal >= 0.353 && pLocal < 0.8) {
      var b2 = (pLocal - 0.353) / 0.447;
      ctx.globalAlpha = 0.35 * b2;
      var gcol = pullState ? pullState.col : '#ffffff';
      ctx.fillStyle = gcol;
      var bw = 16 + 10 * b2;
      ctx.beginPath();
      ctx.moveTo(bladeX - bw, 186); ctx.lineTo(bladeX + bw, 186);
      ctx.lineTo(bladeX + bw * 2.2, 30); ctx.lineTo(bladeX - bw * 2.2, 30);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.save();
    ctx.translate(bladeX, socketY + bob - lift);
    ctx.rotate(tilt);
    drawSword(swCol);
    ctx.restore();

    /* ---- beat 3: radial flash + ring of particles ---- */
    if (pullingNow && pLocal >= 0.8 && pLocal < 1) {
      var b3 = (pLocal - 0.8) / 0.2;
      var rcol = pullState ? pullState.col : '#ffffff';
      ctx.globalAlpha = (1 - b3) * 0.55;
      ctx.drawImage(glowL, bladeX - 160, 150 - 160, 320, 320);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = rcol;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 1 - b3;
      ctx.beginPath();
      ctx.arc(bladeX, 155, 10 + b3 * 90, 0, 6.2832);
      ctx.stroke();
      ctx.globalAlpha = 1;
      /* spawn ring particles once at the start of beat 3 */
      if (pullState && !pullState.ringDone) {
        pullState.ringDone = true;
        for (var ri = 0; ri < 16; ri++) {
          var ra = (ri / 16) * 6.2832;
          parts.push({ x: bladeX, y: 155, vx: Math.cos(ra) * 110, vy: Math.sin(ra) * 70 - 20, life: 0.7, age: 0, r: 2, col: rcol });
        }
        flash(rcol);
        shake(6);
      }
    }

    /* ---- 10. particles ---- */
    for (var pi2 = parts.length - 1; pi2 >= 0; pi2--) {
      var p2 = parts[pi2];
      p2.age += dt;
      if (p2.age >= p2.life) { parts.splice(pi2, 1); continue; }
      p2.vy += 160 * dt;
      p2.x += p2.vx * dt;
      p2.y += p2.vy * dt;
      var lf = 1 - p2.age / p2.life;
      ctx.globalAlpha = lf;
      ctx.fillStyle = p2.col;
      ctx.beginPath(); ctx.arc(p2.x, p2.y, p2.r * lf + 0.3, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    while (parts.length > 200) { parts.shift(); }

    /* ---- 13. strength readout ---- */
    var strTxt = fmt(displayStrength);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glowL, 4, 4, 60, 26); /* soft glow patch behind the number */
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#9d7cff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    try { ctx.fillText(strTxt, 10, 21); } catch (e3) { }
    ctx.fillStyle = 'rgba(157,124,255,0.5)';
    ctx.font = '7px sans-serif';
    try { ctx.fillText('STRENGTH', 10, 30); } catch (e4) { }

    /* ---- 12. flash wash (screen space) ---- */
    var ft = tSec - flashT0;
    if (ft >= 0 && ft < flashDur) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.55 * (1 - ft / flashDur);
      ctx.fillStyle = flashCol;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = 1;
    }
  }

  function drawSword(col) {
    var g = ctx;
    g.lineWidth = 1;
    g.strokeStyle = OUTLINE;
    g.lineJoin = 'round';
    /* blade: tapered, fuller line, tip at y=-96, hilt bottom at y=+34 */
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(-4.5, 0);
    g.lineTo(-3, -70);
    g.lineTo(0, -96);
    g.lineTo(3, -70);
    g.lineTo(4.5, 0);
    g.closePath();
    g.fill();
    g.stroke();
    /* fuller line */
    g.strokeStyle = shade(col, -0.45);
    g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -84); g.stroke();
    g.strokeStyle = OUTLINE;
    /* crossguard */
    g.fillStyle = shade(col, -0.25);
    g.beginPath();
    g.moveTo(-13, 0); g.lineTo(13, 0); g.lineTo(11, 6); g.lineTo(-11, 6);
    g.closePath(); g.fill(); g.stroke();
    /* wrapped grip */
    g.fillStyle = '#5a4632';
    g.beginPath();
    g.moveTo(-3.4, 6); g.lineTo(3.4, 6); g.lineTo(2.6, 26); g.lineTo(-2.6, 26);
    g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(20,20,30,0.8)';
    g.beginPath();
    g.moveTo(-3, 10); g.lineTo(3, 12);
    g.moveTo(-3, 15); g.lineTo(3, 17);
    g.moveTo(-3, 20); g.lineTo(3, 22);
    g.stroke();
    /* pommel */
    g.strokeStyle = OUTLINE;
    g.fillStyle = shade(col, -0.25);
    g.beginPath(); g.arc(0, 30, 4.2, 0, 6.2832); g.fill(); g.stroke();
  }

  /* ---------- start ---------- */
  function start(cfg) {
    if (cfg && typeof cfg.get === 'function') { get = cfg.get; }
    started = true;
    resize();
    if (raf) { cancelAnimationFrame(raf); }
    lastT = 0;
    raf = requestAnimationFrame(frame);
    if (!listenersOn) {
      listenersOn = true;
      try {
        window.addEventListener('resize', resize);
        if (typeof ResizeObserver === 'function' && wrap) {
          var ro = new ResizeObserver(function () { resize(); });
          ro.observe(wrap);
        }
      } catch (e) { /* observers optional */ }
    }
  }

  /* Safety net: if this file is ever loaded after a caller that already tried to start
     us (or if nobody calls start at all), boot the renderer anyway so the canvas is
     never blank. A later start(cfg) simply attaches the real snapshot getter. */
  if (!started) { start(null); }

  /* ---------- exports ---------- */
  window.PAS_Scene = {
    start: start,
    burst: burst,
    shake: shake,
    flash: flash,
    pull: pull
  };
})();
