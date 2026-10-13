/* polish.js - swaps emoji for NKArt vectors, adds the Bakery Crew strip and Next Goal strip */
(function () {
  var D = window.NKData, A = window.NKArt;
  if (!D || !A || !window.NK) return;
  function $(i) { return document.getElementById(i); }
  var css = document.createElement("style");
  css.textContent =
    ".r-ico{width:42px !important;height:42px;display:block}.r-ico svg{filter:drop-shadow(0 2px 2px #0006)}" +
    ".tab .ti{width:22px;height:22px;margin:0 auto 1px;display:block}" +
    "#bottom-btns button .bi{display:inline-block;width:16px;height:16px;vertical-align:-3px;margin-right:4px}" +
    ".golden{font-size:0 !important;padding:0 !important;background:none !important;border:0 !important}.golden svg{filter:drop-shadow(0 0 10px #ffd24a)}" +
    "#goal{margin:4px 12px 0;padding:6px 10px;background:#00000040;border:1px solid #ffd27a44;border-radius:12px;font-size:12px;color:#e8d8b8;display:flex;align-items:center;gap:8px}" +
    "#goal .gi{width:26px;height:26px;flex:0 0 auto}#goal .gt{flex:1;min-width:0}#goal b{color:#ffd27a}" +
    "#goal .gb{height:6px;border-radius:4px;background:#1d1409;margin-top:3px;overflow:hidden}#goal .gb i{display:block;height:100%;background:linear-gradient(90deg,#7bd88f,#ffd27a);width:0}" +
    "#crew{flex:0 0 auto;display:flex;gap:8px;justify-content:center;padding:4px 8px 6px;overflow:hidden;min-height:0}#crew:empty{display:none}#bigcookie{width:min(46vmin,300px) !important;height:min(46vmin,300px) !important}" +
    ".cw{position:relative;width:34px;height:34px;animation:cwbob 2.4s ease-in-out infinite}.cw em{position:absolute;right:-4px;bottom:-4px;font-style:normal;font-size:10px;font-weight:800;background:#2b1d12;border:1px solid #ffd27a;border-radius:8px;padding:0 4px;color:#ffd27a}" +
    "@keyframes cwbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}" +
    ".panel{flex:0 0 auto !important;height:40dvh;max-height:40dvh}#stage{min-height:200px}body.no-motion .cw{animation:none}" + "@media (orientation:landscape) and (max-height:560px){body{display:grid !important;grid-template-columns:44% 56%;grid-template-rows:auto auto 1fr auto}#hud{grid-column:1;grid-row:1}#goal{grid-column:1;grid-row:2}#stage{grid-column:1;grid-row:3}#crew{grid-column:1;grid-row:4}#tabs{grid-column:2;grid-row:1}.panel{grid-column:2 !important;grid-row:2 / span 2;height:auto !important;max-height:none !important;min-height:0}#bottom{grid-column:2;grid-row:4}#bigcookie{width:min(52vh,260px) !important;height:min(52vh,260px) !important}#count{font-size:28px !important}}";
  var ck = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><circle cx='10' cy='10' r='9' fill='#cf8b3e' stroke='#6b4018' stroke-width='1.5'/><circle cx='7' cy='7' r='1.8' fill='#4a2a10'/><circle cx='13' cy='9' r='1.8' fill='#4a2a10'/><circle cx='8' cy='13' r='1.8' fill='#4a2a10'/></svg>";
  css.textContent += ".r-price::before{content:'';display:inline-block;width:14px;height:14px;margin-right:4px;vertical-align:-2px;background:url(\"data:image/svg+xml," + encodeURIComponent(ck) + "\") center/contain no-repeat}";
  document.head.appendChild(css);
  /* shop icons */
  var rows = document.querySelectorAll("#shop-list .shop-row");
  for (var i = 0; i < rows.length && i < D.BUILDINGS.length; i++) { var ic = rows[i].querySelector(".r-ico"); if (ic) ic.innerHTML = A.get(D.BUILDINGS[i].id); }
  /* tab icons */
  var tabs = document.querySelectorAll("#tabs .tab");
  for (var t = 0; t < tabs.length; t++) { var k = tabs[t].getAttribute("data-tab"), ti = tabs[t].querySelector(".ti"); if (ti && A.icons[k]) ti.innerHTML = A.icons[k]; }
  /* bottom buttons */
  var bm = { "btn-sound": "sound", "btn-motion": "motion", "btn-reset": "reset" };
  for (var id in bm) { var b = $(id); if (!b) continue; var tx = b.textContent.replace(/^[^A-Za-z]+/, ""); b.innerHTML = '<span class="bi">' + A.icons[bm[id]] + "</span>" + tx; }
  /* golden cookie art */
  var stage = $("stage");
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.classList && n.classList.contains("golden")) n.innerHTML = A.icons.gold; }); }); }).observe(stage, { childList: true });
  /* universal emoji -> vector swap for data-driven icons (rows, feats, toasts, chips, quests) */
  var SEL = ".r-ico,.feat-ico,.toast-ico,.chip-ico,.qico";
  var busy = false;
  function swap(root) {
    if (busy || !root.querySelectorAll) return; busy = true;
    var list = root.matches && root.matches(SEL) ? [root] : [].slice.call(root.querySelectorAll(SEL));
    list.forEach(function (n) { if (n.children.length) return; var s = A.byEmoji(n.textContent.trim()); if (s) { n.innerHTML = s; n.classList.add("vi"); } });
    busy = false;
  }
  swap(document.body);
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) swap(n); }); }); }).observe(document.body, { childList: true, subtree: true });
  css.textContent += ".vi{display:block}.feat-ico.vi{width:34px;height:34px;margin:0 auto}.toast-ico.vi{width:30px;height:30px}.chip-ico.vi{width:16px;height:16px;display:inline-block}.qico.vi{width:32px;height:32px}.r-ico.vi svg{width:100%;height:100%}";
  /* crew strip */
  var crew = document.createElement("div"); crew.id = "crew"; stage.parentNode.insertBefore(crew, $("tabs"));
  var lastKey = "";
  function renderCrew() {
    var s = NK.state, key = "", html = "";
    for (var i = 0; i < D.BUILDINGS.length; i++) { var n = (s.buildings && s.buildings[D.BUILDINGS[i].id]) || 0; key += n + ","; }
    if (key === lastKey) return; lastKey = key;
    for (i = 0; i < D.BUILDINGS.length; i++) { n = (s.buildings && s.buildings[D.BUILDINGS[i].id]) || 0; if (n > 0) html += '<div class="cw" style="animation-delay:-' + (i * 0.37).toFixed(2) + 's">' + A.get(D.BUILDINGS[i].id) + "<em>" + NK.fmt(n) + "</em></div>"; }
    crew.innerHTML = html;
  }
  /* next goal strip */
  var goal = document.createElement("div"); goal.id = "goal";
  goal.innerHTML = '<span class="gi"></span><div class="gt"><span class="gx"></span><div class="gb"><i></i></div></div>';
  var hud = $("hud"); hud.parentNode.insertBefore(goal, hud.nextSibling);
  function renderGoal() {
    var s = NK.state, best = null, bc = Infinity;
    for (var i = 0; i < D.BUILDINGS.length; i++) { var b = D.BUILDINGS[i], c = NK.buildingCost(b.id, 1); if (c > s.cookies && c < bc && (i === 0 || (s.buildings[D.BUILDINGS[i - 1].id] || 0) > 0)) { bc = c; best = b; } }
    var gx = goal.querySelector(".gx"), gi = goal.querySelector(".gi"), bar = goal.querySelector(".gb i");
    if (!best) { for (i = 0; i < D.BUILDINGS.length; i++) { b = D.BUILDINGS[i]; c = NK.buildingCost(b.id, 1); if (c <= s.cookies) { best = b; bc = c; } } if (!best) return; gx.innerHTML = "Ready to buy: <b>" + best.name + "</b> (" + NK.fmt(bc) + ")"; gi.innerHTML = A.get(best.id); bar.style.width = "100%"; return; }
    var cps = NK.cps(), eta = cps > 0 ? Math.ceil((bc - s.cookies) / cps) : 0;
    gx.innerHTML = "Next goal: <b>" + best.name + "</b> " + NK.fmt(bc) + (eta ? " (about " + (eta > 90 ? Math.round(eta / 60) + " min" : eta + "s") + ")" : "");
    gi.innerHTML = A.get(best.id); bar.style.width = Math.min(100, s.cookies / bc * 100).toFixed(1) + "%";
  }
  var acc = 0;
  NK.on("tick", function (e) { acc += e.dt || 0; if (acc > 0.5) { acc = 0; renderGoal(); renderCrew(); } });
  NK.on("buy", function () { renderGoal(); renderCrew(); });
  renderGoal(); renderCrew();
})();
