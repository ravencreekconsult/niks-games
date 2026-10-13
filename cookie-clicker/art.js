/* NKArt - original vector icons (storybook bakery style). No emoji, no external assets. */
(function () {
  var O = "#4a2a10";
  function svg(inner, vb) { return '<svg viewBox="' + (vb || "0 0 64 64") + '" width="100%" height="100%" aria-hidden="true" style="display:block;pointer-events:none">' + inner + '</svg>'; }
  function st(w) { return ' stroke="' + O + '" stroke-width="' + (w || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  var I = {};
  I.cursor = svg('<path d="M18 8 L18 46 L28 37 L35 53 L42 50 L35 34 L48 34 Z" fill="#fff8e8"' + st(3) + '/><path d="M22 18 L22 36 L28 31" fill="none" stroke="#e4d2ad" stroke-width="2.5" stroke-linecap="round"/>');
  I.grandma = svg('<circle cx="32" cy="16" r="8" fill="#e8e0d8"' + st() + '/><path d="M10 58 Q12 34 32 32 Q52 34 54 58 Z" fill="#e0709a"' + st() + '/><circle cx="32" cy="29" r="12" fill="#f6c9a0"' + st() + '/><path d="M20 26 Q32 10 44 26 Q40 18 32 18 Q24 18 20 26 Z" fill="#e8e0d8"' + st(2) + '/><circle cx="27" cy="29" r="4" fill="#fff" fill-opacity=".5"' + st(2) + '/><circle cx="37" cy="29" r="4" fill="#fff" fill-opacity=".5"' + st(2) + '/><path d="M28 36 Q32 39 36 36" fill="none"' + st(2) + '/>');
  I.farm = svg('<rect x="4" y="46" width="56" height="12" rx="4" fill="#7bbf55"' + st() + '/><path d="M12 46 L12 26 L32 12 L52 26 L52 46 Z" fill="#d9503c"' + st() + '/><path d="M8 28 L32 10 L56 28" fill="none" stroke="#8a2e22" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="24" y="32" width="16" height="14" fill="#f7e3c2"' + st(2) + '/><path d="M24 32 L40 46 M40 32 L24 46" stroke="' + O + '" stroke-width="2"/>');
  I.mine = svg('<path d="M4 58 L16 22 L30 14 L48 22 L60 58 Z" fill="#8b8f99"' + st() + '/><path d="M20 58 L20 38 Q32 28 44 38 L44 58 Z" fill="#2c2130"' + st() + '/><path d="M44 8 L56 20 M50 10 Q60 6 62 16 L52 14 Z" fill="#c9ccd4"' + st(2) + '/><path d="M52 14 L36 30" stroke="#a8683a" stroke-width="5" stroke-linecap="round"/><circle cx="26" cy="26" r="3" fill="#ffd27a"/><circle cx="50" cy="42" r="3" fill="#ffd27a"/>');
  I.factory = svg('<rect x="6" y="30" width="52" height="28" rx="3" fill="#a77b5a"' + st() + '/><path d="M6 30 L18 20 L18 30 L30 20 L30 30 L42 20 L42 30 Z" fill="#c99872"' + st(2) + '/><rect x="44" y="8" width="9" height="24" fill="#7a5238"' + st(2) + '/><circle cx="46" cy="6" r="5" fill="#e8e0d8" fill-opacity=".9"/><circle cx="54" cy="4" r="4" fill="#e8e0d8" fill-opacity=".7"/><rect x="12" y="38" width="8" height="8" fill="#ffd27a"' + st(2) + '/><rect x="26" y="38" width="8" height="8" fill="#ffd27a"' + st(2) + '/><rect x="42" y="42" width="10" height="16" fill="#4a2a10"/>');
  I.bank = svg('<path d="M6 24 L32 8 L58 24 Z" fill="#e8c46a"' + st() + '/><rect x="10" y="26" width="8" height="26" fill="#f7ecd8"' + st(2) + '/><rect x="28" y="26" width="8" height="26" fill="#f7ecd8"' + st(2) + '/><rect x="46" y="26" width="8" height="26" fill="#f7ecd8"' + st(2) + '/><rect x="4" y="52" width="56" height="8" rx="2" fill="#c9a24a"' + st() + '/><circle cx="32" cy="18" r="4" fill="#ffd27a"' + st(2) + '/>');
  I.temple = svg('<path d="M6 22 Q32 -2 58 22 Z" fill="#c0392b"' + st() + '/><path d="M12 32 Q32 12 52 32 Z" fill="#d9503c"' + st() + '/><rect x="14" y="32" width="36" height="22" fill="#f1d9a8"' + st() + '/><rect x="27" y="40" width="10" height="14" rx="5" fill="#4a2a10"/><rect x="6" y="54" width="52" height="6" rx="2" fill="#a77b5a"' + st() + '/><circle cx="32" cy="8" r="3" fill="#ffd27a"/>');
  I.portal = svg('<defs><radialGradient id="pg"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#9b7bff"/><stop offset="1" stop-color="#3d1f8a"/></radialGradient></defs><ellipse cx="32" cy="32" rx="22" ry="28" fill="url(#pg)"' + st(3) + '/><path d="M32 12 Q48 22 32 32 Q16 42 32 52" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle cx="24" cy="22" r="2" fill="#fff"/><circle cx="42" cy="44" r="2" fill="#fff"/>');
  I.timewarp = svg('<circle cx="32" cy="32" r="26" fill="#f7ecd8"' + st(3) + '/><circle cx="32" cy="32" r="21" fill="none" stroke="#c9a24a" stroke-width="2"/><path d="M32 16 L32 32 L44 38" fill="none"' + st(3.5) + '/><circle cx="32" cy="32" r="3" fill="' + O + '"/><path d="M52 14 Q60 22 56 32" fill="none" stroke="#7a5cff" stroke-width="3" stroke-linecap="round"/><path d="M58 28 L56 34 L51 29" fill="#7a5cff"/>');
  I.antimatter = svg('<g fill="none"' + st(3) + '><ellipse cx="32" cy="32" rx="26" ry="10" stroke="#4fd1c5"/><ellipse cx="32" cy="32" rx="26" ry="10" stroke="#4fd1c5" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="10" stroke="#4fd1c5" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="8" fill="#ff7ab0"' + st(2.5) + '/><circle cx="58" cy="32" r="3.5" fill="#fff"' + st(2) + '/>');
  I.prism = svg('<path d="M32 8 L58 54 L6 54 Z" fill="#cfeaff" fill-opacity=".85"' + st(3) + '/><path d="M2 36 L24 36" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M40 30 L62 22" stroke="#ff5a5a" stroke-width="3" stroke-linecap="round"/><path d="M42 36 L62 34" stroke="#ffd24a" stroke-width="3" stroke-linecap="round"/><path d="M44 42 L62 46" stroke="#5ac0ff" stroke-width="3" stroke-linecap="round"/>');
  I.chancemaker = svg('<rect x="8" y="12" width="40" height="40" rx="9" transform="rotate(-10 28 32)" fill="#fff8e8"' + st(3) + '/><g fill="' + O + '"><circle cx="20" cy="24" r="3.5"/><circle cx="36" cy="20" r="3.5"/><circle cx="28" cy="34" r="3.5"/><circle cx="20" cy="44" r="3.5"/><circle cx="36" cy="40" r="3.5"/></g><path d="M50 10 L52 16 L58 17 L53 21 L55 27 L50 23 L45 27 L47 21 L42 17 L48 16 Z" fill="#ffd24a"' + st(2) + '/>');
  /* UI icons */
  I.shop = svg('<path d="M10 20 L54 20 L50 54 L14 54 Z" fill="#e8b46a"' + st(3) + '/><path d="M22 28 Q22 10 32 10 Q42 10 42 28" fill="none"' + st(3.5) + '/>');
  I.upgrades = svg('<path d="M32 6 L54 32 L40 32 L40 56 L24 56 L24 32 L10 32 Z" fill="#7bd88f"' + st(3) + '/>');
  I.quests = svg('<rect x="12" y="6" width="40" height="52" rx="6" fill="#f7ecd8"' + st(3) + '/><path d="M20 20 L44 20 M20 30 L44 30 M20 40 L36 40" stroke="' + O + '" stroke-width="3" stroke-linecap="round"/><path d="M40 44 L46 50 L56 36" fill="none" stroke="#2faa4f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>');
  I.feats = svg('<path d="M18 8 L46 8 L44 30 Q40 40 32 40 Q24 40 20 30 Z" fill="#ffd24a"' + st(3) + '/><path d="M18 12 Q6 12 10 24 Q12 30 20 30 M46 12 Q58 12 54 24 Q52 30 44 30" fill="none"' + st(3) + '/><rect x="26" y="40" width="12" height="10" fill="#e0a82a"' + st(2.5) + '/><rect x="18" y="50" width="28" height="8" rx="3" fill="#c9852a"' + st(2.5) + '/>');
  I.stats = svg('<rect x="8" y="34" width="12" height="22" fill="#5ac0ff"' + st(2.5) + '/><rect x="26" y="20" width="12" height="36" fill="#7bd88f"' + st(2.5) + '/><rect x="44" y="8" width="12" height="48" fill="#ffb347"' + st(2.5) + '/>');
  I.ascend = svg('<path d="M32 4 L38 24 L58 24 L42 36 L48 56 L32 44 L16 56 L22 36 L6 24 L26 24 Z" fill="#ffd24a"' + st(3) + '/>');
  I.sound = svg('<path d="M8 24 L20 24 L34 12 L34 52 L20 40 L8 40 Z" fill="#f7ecd8"' + st(3) + '/><path d="M42 22 Q50 32 42 42 M48 14 Q62 32 48 50" fill="none"' + st(3) + '/>');
  I.motion = svg('<circle cx="22" cy="32" r="12" fill="#f7ecd8"' + st(3) + '/><path d="M40 20 L60 20 M44 32 L60 32 M40 44 L60 44" stroke="#f7ecd8" stroke-width="4" stroke-linecap="round"/>');
  I.reset = svg('<path d="M48 22 A20 20 0 1 0 52 34" fill="none" stroke="#f7ecd8" stroke-width="6" stroke-linecap="round"/><path d="M52 8 L50 24 L36 20 Z" fill="#f7ecd8"/>');
  I.gold = svg('<defs><radialGradient id="gg" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".6" stop-color="#ffc83a"/><stop offset="1" stop-color="#d98a10"/></radialGradient></defs><circle cx="32" cy="32" r="27" fill="url(#gg)"' + st(3) + '/><g fill="#a8620a"><ellipse cx="22" cy="24" rx="5" ry="4"/><ellipse cx="40" cy="22" rx="4" ry="3"/><ellipse cx="42" cy="40" rx="5" ry="4"/><ellipse cx="24" cy="42" rx="4" ry="3"/></g><path d="M14 18 Q22 8 34 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>');

  I.cookie = svg('<circle cx="32" cy="32" r="28" fill="#cf8b3e"' + st(3) + '/><g fill="#4a2a10"><ellipse cx="22" cy="22" rx="5" ry="4"/><ellipse cx="42" cy="26" rx="5" ry="4"/><ellipse cx="26" cy="42" rx="5.5" ry="4"/><ellipse cx="44" cy="44" rx="4" ry="3"/></g><path d="M14 20 Q22 8 34 8" fill="none" stroke="#ffe3a8" stroke-width="3" stroke-linecap="round" opacity=".6"/>');
  I.bolt = svg('<path d="M36 4 L14 36 L28 36 L24 60 L50 26 L34 26 Z" fill="#ffd24a"' + st(3) + '/>');
  I.moon = svg('<path d="M44 8 A26 26 0 1 0 56 40 A20 20 0 0 1 44 8 Z" fill="#cfd8ff"' + st(3) + '/><circle cx="46" cy="14" r="2.5" fill="#fff"/><circle cx="56" cy="26" r="2" fill="#fff"/>');
  I.medal = svg('<path d="M18 4 L30 28 L24 32 L12 8 Z M46 4 L34 28 L40 32 L52 8 Z" fill="#5ac0ff"' + st(2.5) + '/><circle cx="32" cy="42" r="16" fill="#ffd24a"' + st(3) + '/><path d="M32 33 L35 40 L42 41 L37 46 L38 53 L32 49 L26 53 L27 46 L22 41 L29 40 Z" fill="#e0a82a"/>');
  I.gem = svg('<path d="M16 10 L48 10 L60 26 L32 58 L4 26 Z" fill="#7ad7ff"' + st(3) + '/><path d="M4 26 L60 26 M24 10 L20 26 L32 58 M40 10 L44 26 L32 58" fill="none"' + st(2) + '/>');
  I.snow = svg('<g stroke="#cfeaff" stroke-width="5" stroke-linecap="round"><path d="M32 6 L32 58 M9 19 L55 45 M9 45 L55 19"/></g><circle cx="32" cy="32" r="6" fill="#fff"' + st(2) + '/>');
  I.heart = svg('<path d="M32 56 C6 36 6 14 22 12 C28 12 32 16 32 20 C32 16 36 12 42 12 C58 14 58 36 32 56 Z" fill="#ff6a8a"' + st(3) + '/>');
  var D = window.NKData, map = {};
  function bld(id) { return I[id] ? id : "shop"; }
  function forEffect(e) {
    if (!e) return "upgrades"; var k = e.kind;
    if (k === "tapAdd" || k === "tapMult") return "cursor";
    if (k === "buildingMult") return bld(e.id);
    if (k === "globalMult") return "cookie";
    if (k === "offlineRate" || k === "offlineCap") return "moon";
    if (k === "goldenFreq" || k === "goldenDur" || k === "frenzy" || k === "lucky" || k === "clickFrenzy") return "gold";
    if (k === "critChance") return "chancemaker";
    if (k === "crumbGain") return "gem";
    if (k === "costMult" || k === "clot") return "snow";
    if (k === "startBuilding") return "farm";
    return "upgrades";
  }
  function forCheck(c) {
    if (!c) return "medal"; var k = c.kind;
    if (k === "total") return "cookie"; if (k === "clicks") return "cursor";
    if (k === "building") return bld(c.id); if (k === "buildings") return "factory";
    if (k === "upgrades") return "upgrades"; if (k === "golden") return "gold";
    if (k === "ascensions") return "ascend"; if (k === "playtime") return "timewarp";
    if (k === "cps") return "bolt"; return "medal";
  }
  if (D) {
    var add = function (e, key) { if (e && !(e in map)) map[e] = key; };
    (D.BUILDINGS || []).forEach(function (b) { add(b.ico, b.id); });
    (D.UPGRADES || []).forEach(function (u) { add(u.ico, forEffect(u.effect)); });
    (D.HEAVENLY || []).forEach(function (h) { add(h.ico, forEffect(h.effect)); });
    (D.ACHIEVEMENTS || []).forEach(function (a2) { add(a2.ico, forCheck(a2.check)); });
    (D.GOLDEN_EFFECTS || []).forEach(function (g) { add(g.ico, forEffect({ kind: g.kind })); });
    map["\uD83C\uDF6A"] = "cookie"; map["\uD83C\uDF1F"] = "gold"; map["\uD83D\uDCDC"] = "quests"; map["\uD83C\uDFD7\uFE0F"] = "factory"; map["\u2728"] = "gold"; map["\uD83C\uDF81"] = "medal"; map["\uD83C\uDFC6"] = "feats"; map["\uD83E\uDD6E"] = "gem"; map["\uD83D\uDD25"] = "bolt"; map["\uD83D\uDC46"] = "cursor";
  }
  window.NKArt = { icons: I, map: map, get: function (id) { return I[id] || ""; }, byEmoji: function (e) { return map[e] ? I[map[e]] : ""; } };
})();
