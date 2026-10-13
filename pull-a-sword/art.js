/* PULL A SWORD - art.js : original vector art (SVG -> cached images). Worlds, hero, stone, swords, pets. */
(function () {
  'use strict';
  var RAR = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
  var RC = ['#9da7b3', '#3fb950', '#58a6ff', '#bc8cff', '#ffa657', '#ff4d4d'];
  function ri(n) { var i = RAR.indexOf(n); return i < 0 ? 0 : i; }
  function hx(h) { h = String(h || '').replace('#', ''); if (h.length !== 6) { return [128, 128, 128]; } return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function sh(hex, a) { var c = hx(hex), f = a < 0 ? 1 + a : 1, ad = a > 0 ? 255 * a : 0; return 'rgb(' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * f + ad))); }).join(',') + ')'; }
  function rnd(a, b) { var s = (a * 9301 + b * 49297) % 233280; return s / 233280; }
  var cache = {};
  function mk(key, svg, w, h, ox, oy, px) {
    if (cache[key]) { return cache[key]; }
    var im = new Image();
    var o = { img: im, w: w, h: h, ox: ox, oy: oy, ok: false };
    im.onload = function () { o.ok = true; };
    var pw = Math.round(w * px), ph = Math.round(h * px);
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + pw + '" height="' + ph + '" viewBox="0 0 ' + w + ' ' + h + '">' + svg + '</svg>');
    cache[key] = o; return o;
  }
  var DEFS = '<defs>' +
    '<filter id="b4"><feGaussianBlur stdDeviation="4"/></filter><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter>' +
    '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".5" stop-color="#f2b830"/><stop offset="1" stop-color="#b9780f"/></linearGradient>' +
    '<linearGradient id="lea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a5a34"/><stop offset="1" stop-color="#5a301a"/></linearGradient>' +
    '<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9b5"/><stop offset="1" stop-color="#e9a679"/></linearGradient>' +
    '<linearGradient id="stn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7bccb"/><stop offset=".5" stop-color="#808799"/><stop offset="1" stop-color="#4a4f60"/></linearGradient>' +
    '</defs>';
  function stars(n, w, h, col, seed, rm) { var o = ''; for (var i = 0; i < n; i++) { o += '<circle cx="' + (rnd(i, seed) * w).toFixed(0) + '" cy="' + (rnd(i + 99, seed) * h).toFixed(0) + '" r="' + (0.4 + rnd(i, seed + 7) * (rm || 1.4)).toFixed(1) + '" fill="' + col + '" opacity="' + (0.4 + rnd(i, seed + 3) * 0.6).toFixed(2) + '"/>'; } return o; }
  function lg(id, st, x2, y2) { var o = '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 0) + '" y2="' + (y2 === undefined ? 1 : y2) + '">'; for (var i = 0; i < st.length; i++) { o += '<stop offset="' + st[i][0] + '" stop-color="' + st[i][1] + '"/>'; } return o + '</linearGradient>'; }

  /* ---------- WORLD BACKGROUNDS (400x260; ground line ~236) ---------- */
  function bgWhisper() {
    var o = '<defs>' + lg('s', [[0, '#1c1450'], [.5, '#8a3f8f'], [.85, '#ff8a7a'], [1, '#ffd58a']]) + '</defs><rect width="400" height="260" fill="url(#s)"/>' + stars(40, 400, 110, '#fff', 1);
    o += '<circle cx="318" cy="52" r="34" fill="#ffe9a0" opacity=".25" filter="url(#b10)"/><circle cx="318" cy="52" r="20" fill="#fff3c0"/><circle cx="311" cy="48" r="4" fill="#f0d68a" opacity=".6"/><circle cx="324" cy="58" r="3" fill="#f0d68a" opacity=".6"/>';
    o += '<path d="M0,150 Q50,110 110,140 T230,128 T400,142 V260H0Z" fill="#5a3a8a"/><path d="M0,166 Q80,132 160,160 T320,150 L400,158 V260H0Z" fill="#46307a"/>';
    for (var i = 0; i < 10; i++) { var x = i * 44 - 10, h = 54 + rnd(i, 5) * 34; o += '<path d="M' + x + ',184 l20,-' + h + ' l20,' + h + 'z" fill="#2c2260"/><path d="M' + (x + 6) + ',184 l14,-' + (h * .7) + ' l14,' + (h * .7) + 'z" fill="#382a74"/>'; }
    o += '<g opacity=".25" fill="#fff3b0"><path d="M318,56 L170,236 L240,236Z"/><path d="M318,56 L250,236 L310,236Z"/></g>';
    o += '<path d="M0,196 Q100,170 200,194 T400,186 V260H0Z" fill="#2f6a4a"/><path d="M0,214 Q100,194 200,212 T400,206 V260H0Z" fill="#245a3e"/>';
    o += '<path d="M0,226 Q100,214 200,224 T400,220 V260H0Z" fill="#2d7a4a"/><path d="M0,240 Q100,230 200,238 T400,234 V260H0Z" fill="#1f5a38"/>';
    for (i = 0; i < 40; i++) { var gx = i * 10, gy = 226 + rnd(i, 2) * 30; o += '<path d="M' + gx + ',' + gy + ' q2,-9 5,-11 M' + (gx + 3) + ',' + gy + ' q4,-8 8,-8" stroke="#5fd080" stroke-width="1.6" fill="none"/>'; }
    var m = [[40, 232, '#5ff0ff'], [78, 246, '#b57bff'], [330, 238, '#5ff0ff'], [366, 250, '#ff7bd0']];
    for (i = 0; i < m.length; i++) { var q = m[i]; o += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="16" ry="7" fill="' + q[2] + '" opacity=".4" filter="url(#b4)"/><rect x="' + (q[0] - 2) + '" y="' + (q[1] - 7) + '" width="4" height="8" fill="#efe6d8"/><path d="M' + (q[0] - 9) + ',' + (q[1] - 7) + ' q9,-14 18,0z" fill="' + q[2] + '" stroke="#2a1a3a" stroke-width="1.4"/><circle cx="' + (q[0] - 2) + '" cy="' + (q[1] - 11) + '" r="1.5" fill="#fff"/>'; }
    o += '<path d="M-6,260 L-4,70 Q6,34 26,22 L36,20 Q22,60 24,100 L34,260Z" fill="#1a1230" stroke="#0a0818" stroke-width="2"/><path d="M406,260 L404,84 Q394,40 372,28 L400,24 V260Z" fill="#1a1230" stroke="#0a0818" stroke-width="2"/>';
    o += '<g fill="#4fa86a" stroke="#143a24" stroke-width="1.5"><ellipse cx="14" cy="36" rx="40" ry="18"/><ellipse cx="392" cy="40" rx="36" ry="18"/><ellipse cx="200" cy="4" rx="110" ry="12"/></g>';
    return o;
  }
  function bgEmber() {
    var o = '<defs>' + lg('s', [[0, '#12060e'], [.6, '#5a1218'], [1, '#ff6a1a']]) + lg('lv', [[0, '#ffe45a'], [.5, '#ff7a1a'], [1, '#c8200a']]) + lg('ob', [[0, '#4a3a52'], [1, '#14101c']]) + '</defs><rect width="400" height="260" fill="url(#s)"/>' + stars(50, 400, 120, '#ffb36b', 3, 1.4);
    o += '<path d="M140,196 L194,58 Q200,46 206,58 L262,196Z" fill="url(#ob)" stroke="#000" stroke-width="3"/><path d="M188,80 Q198,112 192,146 Q202,170 194,196" stroke="url(#lv)" stroke-width="6" fill="none" filter="url(#gl)"/><ellipse cx="200" cy="52" rx="26" ry="9" fill="#ff7a1a" opacity=".6" filter="url(#b4)"/>';
    o += '<g fill="#3a2a3a" opacity=".85"><ellipse cx="184" cy="30" rx="34" ry="12"/><ellipse cx="226" cy="20" rx="40" ry="14"/><ellipse cx="250" cy="42" rx="28" ry="10"/></g>';
    o += '<path d="M0,190 L36,152 L64,184 L98,148 L140,196 L190,160 L240,200 L290,150 L330,190 L366,150 L400,180 V260H0Z" fill="#241a2c" stroke="#000" stroke-width="3"/>';
    o += '<path d="M0,214 Q100,200 200,214 T400,206 V260H0Z" fill="url(#lv)"/><path d="M0,222 Q100,210 200,222 T400,214" stroke="#fff3a0" stroke-width="2" fill="none" opacity=".7"/>';
    o += '<path d="M0,236 Q100,226 200,236 T400,230 V260H0Z" fill="#2a2030" stroke="#000" stroke-width="3"/><path d="M0,250 Q100,242 200,250 T400,246 V260H0Z" fill="#1a1422" stroke="#000" stroke-width="3"/>';
    o += '<g fill="#ff9a3c" filter="url(#gl)">'; for (var i = 0; i < 30; i++) { o += '<circle cx="' + (rnd(i, 21) * 400).toFixed(0) + '" cy="' + (60 + rnd(i, 22) * 170).toFixed(0) + '" r="' + (0.8 + rnd(i, 23) * 1.8).toFixed(1) + '" opacity="' + (0.4 + rnd(i, 24) * 0.6).toFixed(2) + '"/>'; } o += '</g>';
    o += '<ellipse cx="200" cy="190" rx="100" ry="70" fill="#ff5a2a" opacity=".35" filter="url(#b10)"/>';
    return o;
  }
  function bgCloud() {
    var o = '<defs>' + lg('s', [[0, '#3a8af0'], [.6, '#8ad8ff'], [1, '#ffe9f8']]) + lg('is', [[0, '#8a6a4a'], [1, '#3a2a22']]) + '</defs><rect width="400" height="260" fill="url(#s)"/><circle cx="70" cy="50" r="40" fill="#fff6c0" opacity=".5" filter="url(#b10)"/><circle cx="70" cy="50" r="17" fill="#fffbe0"/>';
    function cloud(x, y, s) { return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" fill="#fff" stroke="#bfe0ff" stroke-width="1.5"><ellipse cx="0" cy="0" rx="40" ry="12"/><ellipse cx="-16" cy="-9" rx="20" ry="12"/><ellipse cx="12" cy="-12" rx="24" ry="14"/></g>'; }
    function isle(x, y, s, t) { return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" stroke="#2a1a14" stroke-width="2.4" stroke-linejoin="round"><path d="M-50,0 Q0,12 50,0 L34,32 L16,56 L0,72 L-12,48 L-34,28Z" fill="url(#is)"/><path d="M-52,0 Q-34,-12 0,-10 Q34,-12 52,0 Q0,12 -52,0Z" fill="#6fd870"/>' + (t ? '<rect x="14" y="-28" width="5" height="20" fill="#6a3a1a"/><circle cx="16" cy="-35" r="13" fill="#3fb060"/><circle cx="10" cy="-31" r="8" fill="#5fd080"/>' : '') + '</g>'; }
    o += cloud(330, 70, 1) + cloud(50, 130, .8) + cloud(300, 150, .7) + isle(70, 100, .8, true) + isle(340, 110, .7, true) + isle(290, 170, .5, false);
    o += '<path d="M-10,200 Q100,182 200,198 T410,190 V260H-10Z" fill="#7fe08a" stroke="#1a5a2a" stroke-width="2"/><path d="M-10,226 Q100,214 200,224 T410,218 V260H-10Z" fill="#4fc070" stroke="#1a5a2a" stroke-width="2"/>';
    for (var i = 0; i < 16; i++) { var x = 10 + i * 26, y = 214 + rnd(i, 3) * 30; o += '<g transform="translate(' + x + ',' + y + ')"><circle r="2.6" fill="#fff"/><circle cx="3.4" r="2" fill="#ffd0f0"/><path d="M0,2.6 v6" stroke="#2a8a40" stroke-width="1.6"/></g>'; }
    o += '<ellipse cx="200" cy="180" rx="100" ry="70" fill="#7fe8ff" opacity=".4" filter="url(#b10)"/>';
    return o;
  }
  function bgDesert() {
    var o = '<defs>' + lg('s', [[0, '#3a2a6a'], [.45, '#e0587a'], [.8, '#ffb060'], [1, '#ffe090']]) + lg('d1', [[0, '#e8a050'], [1, '#a05a2a']]) + lg('d2', [[0, '#f0b868'], [1, '#c07a3a']]) + '</defs><rect width="400" height="260" fill="url(#s)"/>' + stars(30, 400, 80, '#fff', 8);
    o += '<circle cx="90" cy="130" r="48" fill="#fff0b0" opacity=".45" filter="url(#b10)"/><circle cx="90" cy="130" r="26" fill="#fff6c8"/>';
    o += '<path d="M240,176 L290,60 L340,176Z" fill="#c8884a" stroke="#6a3a1a" stroke-width="2"/><path d="M290,60 L340,176 L300,176Z" fill="#8a5a2a"/><path d="M330,176 L360,112 L390,176Z" fill="#b87a3e" stroke="#6a3a1a" stroke-width="2"/>';
    o += '<path d="M0,170 Q80,140 170,168 T330,160 L400,170 V260H0Z" fill="url(#d1)"/><path d="M0,196 Q90,176 190,196 T400,190 V260H0Z" fill="url(#d2)"/><path d="M0,222 Q100,208 200,222 T400,216 V260H0Z" fill="#e8a458"/><path d="M0,242 Q100,232 200,242 T400,238 V260H0Z" fill="#c4803e"/>';
    o += '<path d="M20,240 q30,-10 60,0 M240,236 q30,-8 60,0 M120,250 q20,-6 44,0" stroke="#fff0c0" stroke-width="1.5" fill="none" opacity=".5"/>';
    o += '<g stroke="#2a5a2a" stroke-width="1.5" fill="#4a9a4a"><path d="M350,236 v-26 q-10,0 -10,-10 M350,226 q10,0 10,-8"/><rect x="346" y="196" width="8" height="40" rx="4"/><rect x="334" y="206" width="6" height="16" rx="3"/><rect x="360" y="210" width="6" height="14" rx="3"/></g>';
    return o;
  }
  function bgElder() {
    var o = '<defs>' + lg('s', [[0, '#04101a'], [.5, '#0f3a3a'], [1, '#2a8a6a']]) + '</defs><rect width="400" height="260" fill="url(#s)"/>' + stars(30, 400, 90, '#aaffdd', 5);
    o += '<g opacity=".28" fill="#9fffd8"><path d="M200,0 L120,236 L170,236Z"/><path d="M200,0 L250,236 L300,236Z"/></g>';
    for (var i = 0; i < 8; i++) { var x = i * 56 - 10; o += '<rect x="' + x + '" y="40" width="' + (16 + rnd(i, 4) * 10).toFixed(0) + '" height="200" fill="#0a2a2a" opacity=".8"/>'; }
    o += '<path d="M0,196 Q100,170 200,190 T400,180 V260H0Z" fill="#1a5a46"/><path d="M0,220 Q100,204 200,218 T400,210 V260H0Z" fill="#124a38"/><path d="M0,238 Q100,228 200,236 T400,232 V260H0Z" fill="#0c3a2c"/>';
    o += '<path d="M-10,260 L-4,0 L50,0 Q30,70 36,150 L46,260Z" fill="#0a1a18" stroke="#000" stroke-width="2"/><path d="M410,260 L404,0 L346,0 Q372,76 362,160 L352,260Z" fill="#0a1a18" stroke="#000" stroke-width="2"/>';
    var gl = [[60, 214, '#5fffd0'], [110, 240, '#ffd35a'], [300, 226, '#5fffd0'], [350, 244, '#b57bff']];
    for (i = 0; i < gl.length; i++) { var q = gl[i]; o += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="18" ry="8" fill="' + q[2] + '" opacity=".4" filter="url(#b4)"/><circle cx="' + q[0] + '" cy="' + (q[1] - 6) + '" r="4" fill="' + q[2] + '" filter="url(#gl)"/>'; }
    o += '<g fill="#8fffd0" filter="url(#gl)">'; for (i = 0; i < 26; i++) { o += '<circle cx="' + (rnd(i, 11) * 400).toFixed(0) + '" cy="' + (30 + rnd(i, 12) * 200).toFixed(0) + '" r="' + (0.8 + rnd(i, 13) * 1.4).toFixed(1) + '" opacity="' + (0.4 + rnd(i, 14) * 0.6).toFixed(2) + '"/>'; } o += '</g>';
    return o;
  }
  var BG = [bgWhisper, bgEmber, bgCloud, bgDesert, bgElder];
  var RUNE = ['#7ff3ff', '#ff9a3c', '#ffffff', '#ffe07a', '#8fffd0'];
  var MOSS = ['#4fb070', null, '#7fd080', null, '#3fa080'];
  function world(i) { i = Math.max(0, Math.min(4, i | 0)); return mk('bg' + i, DEFS + BG[i](), 400, 260, 0, 0, 2); }

  /* ---------- STONE (rune stone), anchor = bottom centre ---------- */
  function stone(i) {
    i = Math.max(0, Math.min(4, i | 0)); var rc = RUNE[i], mo = MOSS[i];
    var s = DEFS + '<g stroke-linejoin="round" transform="translate(100,60)"><ellipse cx="0" cy="3" rx="70" ry="10" fill="#000" opacity=".35"/>' +
      '<path d="M-62,0 Q-68,-30 -44,-40 Q-18,-54 8,-47 Q46,-47 58,-23 Q68,-5 62,0Z" fill="url(#stn)" stroke="#1d2030" stroke-width="2.6"/>' +
      '<path d="M-54,-22 Q-26,-46 8,-42" stroke="#e8edf8" stroke-width="2.6" fill="none" opacity=".6"/><path d="M-26,-17 l7,-12 l5,9 M26,-26 l-5,14" stroke="#2a2f40" stroke-width="1.6" fill="none"/>' +
      '<g fill="none" stroke="' + rc + '" stroke-width="2" filter="url(#gl)"><path d="M-40,-15 l5,-9 l5,9 M-3,-12 v-11 m-4,4 h8 M26,-14 q7,-9 11,0"/></g>' +
      (mo ? '<path d="M-64,-5 q9,-23 30,-30 q-5,9 7,11 q7,-7 17,-10 q-12,7 -9,14 q-15,0 -22,19z" fill="' + mo + '" stroke="#14301c" stroke-width="1.6"/>' : '') + '</g>';
    return mk('st' + i, s, 200, 80, 100, 60, 2);
  }

  /* ---------- HERO (chunky outlined adventurer), anchor = feet centre ---------- */
  var SHIRT = ['#e0508a', '#2fa86a', '#2f9bd6', '#8a4ad8', '#f0a030', '#e0303a'];
  function hero(rar) {
    rar = Math.max(0, Math.min(5, rar | 0));
    var cape = RC[rar], shirt = SHIRT[rar], hair = ['#5a3320', '#5a3320', '#3a2414', '#2a2a3a', '#c8782a', '#222'][rar];
    var o = DEFS + '<g transform="translate(60,92)" stroke-linejoin="round" stroke-linecap="round">' +
      '<ellipse cx="0" cy="46" rx="30" ry="6" fill="#000" opacity=".35"/>' +
      '<path d="M-20,-18 Q-46,10 -34,44 L-6,38 L6,-14Z" fill="' + sh(cape, -.25) + '" stroke="#1a1030" stroke-width="2.5"/><path d="M-20,-14 Q-38,10 -30,38" stroke="#fff" opacity=".25" stroke-width="3" fill="none"/>' +
      '<rect x="-14" y="22" width="12" height="22" rx="4" fill="#3a3a78" stroke="#1a1030" stroke-width="2.5"/><rect x="3" y="22" width="12" height="22" rx="4" fill="#3a3a78" stroke="#1a1030" stroke-width="2.5"/>' +
      '<path d="M-17,38 h18 v8 h-22z" fill="url(#lea)" stroke="#1a1030" stroke-width="2.5"/><path d="M1,38 h18 v8 h-14z" fill="url(#lea)" stroke="#1a1030" stroke-width="2.5"/>' +
      '<rect x="-17" y="-16" width="36" height="42" rx="12" fill="' + shirt + '" stroke="#1a1030" stroke-width="2.5"/><path d="M-17,14 h36" stroke="#2a1408" stroke-width="5"/><rect x="-4" y="11" width="9" height="7" rx="2" fill="url(#gold)"/><path d="M-12,-10 q8,-6 20,0" stroke="#fff" opacity=".35" stroke-width="3" fill="none"/>' +
      (rar >= 3 ? '<path d="M-20,-14 q4,-14 18,-12 l-2,14z" fill="' + RC[rar] + '" stroke="#1a1030" stroke-width="2.2"/>' : '') +
      (rar >= 4 ? '<path d="M-17,-2 h36 M-17,6 h36" stroke="url(#gold)" stroke-width="2.5" opacity=".9"/>' : '') +
      '<path d="M16,-8 Q34,-18 44,-34" stroke="#1a1030" stroke-width="12" fill="none"/><path d="M16,-8 Q34,-18 44,-34" stroke="url(#skin)" stroke-width="8" fill="none"/><circle cx="45" cy="-36" r="6" fill="url(#skin)" stroke="#1a1030" stroke-width="2"/>' +
      '<ellipse cx="0" cy="-38" rx="26" ry="25" fill="url(#skin)" stroke="#1a1030" stroke-width="2.8"/>' +
      '<path d="M-28,-40 Q-30,-70 -6,-68 L-2,-80 L6,-66 L18,-76 L18,-62 Q32,-56 28,-38 Q20,-52 0,-50 Q-18,-50 -28,-40Z" fill="' + hair + '" stroke="#1a1030" stroke-width="2.6"/><path d="M-18,-60 q8,-8 18,-4" stroke="#fff" opacity=".4" stroke-width="3" fill="none"/>' +
      (rar >= 2 ? '<path d="M-27,-46 Q0,-56 27,-46 L27,-40 Q0,-50 -27,-40Z" fill="' + RC[rar] + '" stroke="#1a1030" stroke-width="2"/>' : '') +
      (rar >= 4 ? '<path d="M-14,-66 l4,-14 l6,10 l4,-14 l4,14 l6,-10 l4,14z" fill="url(#gold)" stroke="#6a420a" stroke-width="1.6"/>' : '') +
      '<ellipse cx="-9" cy="-37" rx="5.5" ry="7.5" fill="#fff" stroke="#1a1030" stroke-width="1.6"/><ellipse cx="11" cy="-37" rx="5.5" ry="7.5" fill="#fff" stroke="#1a1030" stroke-width="1.6"/>' +
      '<circle cx="-8" cy="-36" r="4" fill="#2a7ad8"/><circle cx="12" cy="-36" r="4" fill="#2a7ad8"/><circle cx="-7" cy="-36" r="2" fill="#0a1a3a"/><circle cx="13" cy="-36" r="2" fill="#0a1a3a"/><circle cx="-9" cy="-39" r="1.6" fill="#fff"/><circle cx="11" cy="-39" r="1.6" fill="#fff"/>' +
      '<path d="M-15,-46 q6,-4 11,-1 M5,-47 q6,-3 12,1" stroke="#1a1030" stroke-width="2.4" fill="none"/><path d="M-4,-26 q5,5 10,0" stroke="#7a2a2a" stroke-width="2.2" fill="none"/>' +
      '</g>';
    return mk('hero' + rar, s0(o), 120, 150, 60, 138, 2.4);
  }
  function s0(x) { return x; }

  /* ---------- SWORD, anchor = crossguard centre ---------- */
  var BLADE = [['#8fa0b4', '#e8eef6'], ['#6ad08a', '#e8fff0'], ['#6aa8ff', '#eaf4ff'], ['#b48aff', '#f4eaff'], ['#ffc860', '#fff8e0'], ['#ff5a5a', '#ffe6e0']];
  function sword(rar) {
    rar = Math.max(0, Math.min(5, rar | 0)); var g = RC[rar], b = BLADE[rar], w = 7 + (rar >= 3 ? 3 : 0) + (rar >= 5 ? 2 : 0);
    var o = DEFS + '<defs><linearGradient id="bl" x1="0" x2="1"><stop offset="0" stop-color="' + sh(b[0], -.2) + '"/><stop offset=".45" stop-color="' + b[1] + '"/><stop offset=".55" stop-color="' + b[0] + '"/><stop offset="1" stop-color="' + sh(b[0], -.45) + '"/></linearGradient></defs><g transform="translate(60,128)"><g filter="url(#gl)">' +
      '<path d="M0,-118 L' + w + ',-94 L' + w + ',-4 L-' + w + ',-4 L-' + w + ',-94Z" fill="url(#bl)" stroke="#2a3550" stroke-width="2.2" stroke-linejoin="round"/><path d="M0,-112 V-6" stroke="' + sh(b[0], -.3) + '" stroke-width="2"/><path d="M-3,-96 L-3,-14" stroke="#fff" stroke-width="1.4" opacity=".8"/>' +
      (rar >= 2 ? '<g stroke="' + g + '" stroke-width="1.6" fill="none" opacity=".9"><path d="M-2,-80 l2,-4 2,4 M-2,-56 l2,-4 2,4 M-2,-32 l2,-4 2,4"/></g>' : '') +
      (rar >= 4 ? '<path d="M' + w + ',-94 q10,12 4,30 q-4,-12 -4,-12z M-' + w + ',-94 q-10,12 -4,30 q4,-12 4,-12z" fill="' + g + '" opacity=".7"/>' : '') +
      (rar === 0 ? '<path d="M-22,-4 h44 v8 h-44z" fill="url(#gold)" stroke="#6a420a" stroke-width="2"/>' :
        rar === 1 ? '<path d="M-26,-2 Q0,-16 26,-2 l-4,9 Q0,-1 -22,7z" fill="url(#gold)" stroke="#6a420a" stroke-width="2"/>' :
        rar === 2 ? '<path d="M-30,-10 L-12,-2 L0,-8 L12,-2 L30,-10 L24,6 L0,0 L-24,6z" fill="url(#gold)" stroke="#6a420a" stroke-width="2"/>' :
        rar === 3 ? '<path d="M-36,-18 Q-26,-2 -12,0 L0,-6 L12,0 Q26,-2 36,-18 Q34,6 12,10 L0,4 L-12,10 Q-34,6 -36,-18Z" fill="url(#gold)" stroke="#6a420a" stroke-width="2"/>' :
        rar === 4 ? '<path d="M-38,-20 L-26,-4 L-12,-8 L0,-14 L12,-8 L26,-4 L38,-20 L34,8 L12,12 L0,6 L-12,12 L-34,8z" fill="url(#gold)" stroke="#6a420a" stroke-width="2"/>' :
          '<path d="M-40,-26 L-28,-6 L-12,-10 L0,-18 L12,-10 L28,-6 L40,-26 L36,10 L12,14 L0,8 L-12,14 L-36,10z" fill="#2a1a2a" stroke="#ff4d4d" stroke-width="2.2"/>') +
      '<circle cx="0" cy="0" r="' + (rar >= 3 ? 5 : 3.4) + '" fill="' + g + '" stroke="#3a2a10" stroke-width="1.4"/>' +
      '<rect x="-5" y="8" width="10" height="26" rx="3" fill="url(#lea)" stroke="#3a1c0c" stroke-width="2"/><path d="M-5,14 h10 M-5,21 h10 M-5,28 h10" stroke="#2a1408" stroke-width="1.2"/><circle cx="0" cy="38" r="6" fill="url(#gold)" stroke="#6a420a" stroke-width="2"/><circle cx="0" cy="38" r="2.4" fill="' + g + '"/></g></g>';
    return mk('sw' + rar, o, 120, 190, 60, 128, 2.4);
  }

  /* ---------- PETS (chunky outlined creatures), anchor = feet centre ---------- */
  function pet(shape, col) {
    var c = col || '#c9a227', d = sh(c, -.4), l = sh(c, .35), k = 'pt' + shape + c;
    var E = function (x, y, r) { r = r || 5; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="#1a1030" stroke-width="1.8"/><circle cx="' + (x + 1) + '" cy="' + y + '" r="' + (r * .5) + '" fill="#111"/><circle cx="' + (x - 1) + '" cy="' + (y - 2) + '" r="' + (r * .22) + '" fill="#fff"/>'; };
    var ST = ' stroke="#1a1030" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
    var b = '<g transform="translate(50,80)"><ellipse cx="0" cy="4" rx="26" ry="5" fill="#000" opacity=".3"/>';
    if (shape === 'bird') {
      b += '<path d="M-16,-12 q-18,-6 -20,-26 q12,2 20,12z" fill="' + d + '"' + ST + '/><ellipse cx="0" cy="-16" rx="20" ry="18" fill="' + c + '"' + ST + '/><ellipse cx="2" cy="-8" rx="12" ry="9" fill="' + l + '"/>' +
        '<path d="M-14,-18 q-14,6 -10,20 q10,-2 18,-10z" fill="' + d + '"' + ST + '/><path d="M14,-18 q14,6 10,20 q-10,-2 -18,-10z" fill="' + d + '"' + ST + '/><circle cx="0" cy="-34" r="13" fill="' + c + '"' + ST + '/><path d="M-4,-45 l-2,-9 l7,5 l4,-8 l2,10z" fill="' + d + '"' + ST + '/>' + E(-5, -35, 4.5) + E(6, -35, 4.5) + '<path d="M-3,-28 l4,0 l-2,6z" fill="#ffb030"' + ST + '/><path d="M-6,3 l-2,5 M6,3 l2,5" stroke="#ffb030" stroke-width="3" stroke-linecap="round"/>';
    } else if (shape === 'dragon') {
      b += '<path d="M-14,-24 q-30,-16 -38,-40 q22,2 36,18z" fill="' + d + '"' + ST + '/><path d="M14,-24 q30,-16 38,-40 q-22,2 -36,18z" fill="' + d + '"' + ST + '/><path d="M18,-4 q26,6 30,-12 q-6,6 -14,2 q-8,-2 -16,-4z" fill="' + c + '"' + ST + '/>' +
        '<ellipse cx="0" cy="-16" rx="22" ry="18" fill="' + c + '"' + ST + '/><ellipse cx="0" cy="-8" rx="13" ry="10" fill="' + l + '"/><path d="M-4,-34 l-3,-8 l6,3 l3,-7 l3,8z" fill="' + d + '"' + ST + '/>' +
        '<circle cx="-2" cy="-36" r="13" fill="' + c + '"' + ST + '/><path d="M-12,-46 l-5,-12 l10,6z M8,-46 l5,-12 l-10,6z" fill="#ffe08a"' + ST + '/>' + E(-8, -36, 4.5) + E(4, -36, 4.5) + '<ellipse cx="-2" cy="-28" rx="7" ry="4" fill="' + l + '"' + ST + '/><circle cx="-5" cy="-28" r="1" fill="#1a1030"/><circle cx="1" cy="-28" r="1" fill="#1a1030"/>';
    } else if (shape === 'golem') {
      b += '<path d="M-24,0 L-26,-26 L-18,-44 L18,-44 L26,-26 L24,0Z" fill="' + c + '"' + ST + '/><path d="M-18,-44 L-8,-40 L-12,-30 L-22,-26Z" fill="' + l + '" opacity=".6"/><path d="M-14,-4 l6,-14 l8,6 M10,-30 l6,10" stroke="' + d + '" stroke-width="2" fill="none"/>' +
        '<rect x="-34" y="-34" width="12" height="22" rx="5" fill="' + c + '"' + ST + '/><rect x="22" y="-34" width="12" height="22" rx="5" fill="' + c + '"' + ST + '/><rect x="-14" y="-62" width="28" height="22" rx="8" fill="' + c + '"' + ST + '/><path d="M-12,-40 q6,-4 12,0 q6,-4 12,0" stroke="#4fb070" stroke-width="4" fill="none"/>' +
        '<rect x="-9" y="-54" width="7" height="6" rx="2" fill="#ffe65a"/><rect x="2" y="-54" width="7" height="6" rx="2" fill="#ffe65a"/>';
    } else if (shape === 'blob') {
      b += '<path d="M-26,0 Q-32,-26 -14,-40 Q0,-50 14,-40 Q32,-26 26,0Z" fill="' + c + '" opacity=".92"' + ST + '/><path d="M-16,-34 Q-8,-44 4,-42" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7" fill="none"/><ellipse cx="0" cy="-10" rx="14" ry="8" fill="' + l + '" opacity=".6"/>' + E(-9, -22, 6) + E(8, -22, 6) + '<path d="M-5,-12 q5,5 10,0" stroke="#1a1030" stroke-width="2" fill="none"/><path d="M-6,-48 q0,-8 6,-10 q-2,6 4,8" fill="' + l + '"' + ST + '/>';
    } else if (shape === 'bug') {
      b += '<path d="M-8,-30 q-12,-14 -6,-26 M8,-30 q12,-14 6,-26" stroke="#1a1030" stroke-width="2.4" fill="none"/><path d="M-22,-8 l-12,4 M-24,-16 l-12,-2 M22,-8 l12,4 M24,-16 l12,-2" stroke="#1a1030" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="-16" rx="24" ry="19" fill="' + c + '"' + ST + '/><path d="M0,-34 V2" stroke="#1a1030" stroke-width="2"/><ellipse cx="-9" cy="-24" rx="6" ry="9" fill="' + l + '" opacity=".6"/><circle cx="0" cy="-36" r="11" fill="' + d + '"' + ST + '/>' + E(-5, -37, 4) + E(5, -37, 4);
    } else { /* cat, pup, fox */
      var ears = shape === 'cat' ? '<path d="M-16,-46 l-4,-16 l13,8z M16,-46 l4,-16 l-13,8z" fill="' + c + '"' + ST + '/><path d="M-15,-49 l-2,-8 l6,4z M15,-49 l2,-8 l-6,4z" fill="#ffa0b0"/>' :
        shape === 'pup' ? '<path d="M-20,-52 q-12,4 -10,20 q10,-2 14,-12z M20,-52 q12,4 10,20 q-10,-2 -14,-12z" fill="' + d + '"' + ST + '/>' :
          '<path d="M-18,-46 l-6,-20 l16,10z M18,-46 l6,-20 l-16,10z" fill="' + c + '"' + ST + '/><path d="M-17,-49 l-3,-11 l8,5z M17,-49 l3,-11 l-8,5z" fill="' + d + '"/>';
      var tail = shape === 'fox' ? '<path d="M18,-8 Q50,-6 46,-34 Q36,-22 22,-22Z" fill="' + c + '"' + ST + '/><path d="M46,-34 Q40,-26 34,-24 Q42,-14 36,-12 Q48,-12 46,-34Z" fill="#fff"/>' :
        shape === 'cat' ? '<path d="M18,-6 q28,2 24,-26 q-4,12 -14,12 q-6,0 -10,2z" fill="' + c + '"' + ST + '/>' : '<path d="M18,-10 q18,-6 20,-18 q-10,6 -20,6z" fill="' + c + '"' + ST + '/>';
      b += tail + '<ellipse cx="0" cy="-14" rx="21" ry="16" fill="' + c + '"' + ST + '/><ellipse cx="2" cy="-8" rx="12" ry="8" fill="' + l + '"/><rect x="-14" y="-6" width="9" height="10" rx="4" fill="' + c + '"' + ST + '/><rect x="5" y="-6" width="9" height="10" rx="4" fill="' + c + '"' + ST + '/>' +
        ears + '<ellipse cx="0" cy="-34" rx="18" ry="15" fill="' + c + '"' + ST + '/>' + (shape === 'fox' ? '<path d="M-18,-30 Q-8,-22 0,-20 Q8,-22 18,-30 Q8,-34 0,-30 Q-8,-34 -18,-30Z" fill="#fff"/>' : '') + E(-7, -36, 5) + E(7, -36, 5) +
        '<ellipse cx="0" cy="-28" rx="4" ry="3" fill="' + (shape === 'fox' ? '#222' : '#ff9aa8') + '"' + ST.replace('2.4', '1.4') + '/><path d="M-4,-24 q4,4 8,0" stroke="#1a1030" stroke-width="1.6" fill="none"/>';
    }
    b += '</g>';
    return mk(k, DEFS + b, 100, 90, 50, 84, 2);
  }

  window.PAS_Art = { world: world, stone: stone, hero: hero, sword: sword, pet: pet, ri: ri, RC: RC, draw: function (ctx, a, x, y, k) { if (a && a.ok) { ctx.drawImage(a.img, x - a.ox * k, y - a.oy * k, a.w * k, a.h * k); } } };
})();
