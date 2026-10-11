/* Daily Quests: four goals per calendar day, claim cookie rewards, streak counter. */
(function () {
  "use strict";
  var NK = window.NK; if (!NK || !NK.state) return;
  function $(id) { return document.getElementById(id); }
  function dayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var DEFS = [
    { k: "taps",   ico: "👆", txt: "Tap the big cookie {n} times" },
    { k: "baked",  ico: "🍪", txt: "Bake {n} cookies" },
    { k: "buys",   ico: "🏗️", txt: "Buy {n} buildings" },
    { k: "golden", ico: "✨", txt: "Catch {n} golden cookies" }
  ];
  var last = { clicks: NK.state.clicks || 0, all: NK.state.totalAll || 0 };
  function cps() { try { return NK.cps(); } catch (e) { return 0; } }
  function make() {
    var c = cps();
    var q = NK.state.quests && NK.state.quests.day ? NK.state.quests : null;
    var streak = q ? q.streak || 0 : 0;
    var missed = q && q.day !== dayKey() && !q.allDone;
    if (missed) streak = 0;
    NK.state.quests = { day: dayKey(), streak: streak, allDone: false, list: [
      { k: "taps",   need: 150, have: 0, claimed: false },
      { k: "baked",  need: Math.max(3000, Math.round(c * 900)), have: 0, claimed: false },
      { k: "buys",   need: 12, have: 0, claimed: false },
      { k: "golden", need: 2, have: 0, claimed: false }
    ] };
  }
  function ensure() { if (!NK.state.quests || NK.state.quests.day !== dayKey()) make(); }
  function reward() { return Math.max(750, Math.round(cps() * 600)); }
  function bump(k, n) { ensure(); var l = NK.state.quests.list; for (var i = 0; i < l.length; i++) if (l[i].k === k && l[i].have < l[i].need) l[i].have = Math.min(l[i].need, l[i].have + n); }
  function claim(i) {
    ensure(); var q = NK.state.quests, it = q.list[i];
    if (it.claimed || it.have < it.need) return;
    it.claimed = true; var r = reward(); NK.state.cookies += r;
    note("Quest complete!", "+" + NK.fmt(r) + " cookies", "🎁");
    var all = true; for (var j = 0; j < q.list.length; j++) if (!q.list[j].claimed) all = false;
    if (all && !q.allDone) { q.allDone = true; q.streak = (q.streak || 0) + 1; var b = Math.round(cps() * 3600) + 5000; NK.state.cookies += b; note("ALL DAILIES DONE!", "+" + NK.fmt(b) + " bonus cookies · streak " + q.streak, "🏆"); }
    NK.save(); render();
  }
  function note(t, d, ico) { try { var box = $("toasts"); var n = document.createElement("div"); n.className = "toast"; n.innerHTML = '<span class="toast-ico">' + ico + '</span><div class="toast-body"><b>' + t + "</b><div>" + d + "</div></div>"; box.appendChild(n); setTimeout(function () { n.remove(); }, 4200); } catch (e) {} }
  function render() {
    var box = $("quest-list"); if (!box) return; ensure();
    var q = NK.state.quests, html = "";
    for (var i = 0; i < q.list.length; i++) {
      var it = q.list[i], d = DEFS[i], p = Math.floor(100 * it.have / it.need), ready = it.have >= it.need && !it.claimed;
      html += '<div class="qrow' + (it.claimed ? " done" : "") + '"><span class="qico">' + d.ico + '</span><div class="qbody"><b>' + d.txt.replace("{n}", NK.fmt(it.need)) + '</b><div class="qbar"><i style="width:' + p + '%"></i></div><small>' + NK.fmt(it.have) + " / " + NK.fmt(it.need) + " · reward " + NK.fmt(reward()) + ' 🍪</small></div><button class="qbtn' + (ready ? " ready" : "") + '" data-q="' + i + '"' + (ready ? "" : " disabled") + ">" + (it.claimed ? "DONE" : "CLAIM") + "</button></div>";
    }
    box.innerHTML = html;
    var bs = box.querySelectorAll("button[data-q]");
    for (var b = 0; b < bs.length; b++) bs[b].onclick = function () { claim(parseInt(this.getAttribute("data-q"), 10)); };
    var s = $("quest-streak"); if (s) s.textContent = "🔥 Daily streak: " + (q.streak || 0) + " · finish all 4 for a big bonus";
    var ready = 0; for (var k = 0; k < q.list.length; k++) if (q.list[k].have >= q.list[k].need && !q.list[k].claimed) ready++;
    var bd = $("badge-quests"); if (bd) { bd.textContent = ready || ""; bd.classList.toggle("show", ready > 0); }
  }
  /* UI: tab + panel + styles */
  var st = document.createElement("style");
  st.textContent = ".tab{font-size:12px !important;padding:4px 2px !important;line-height:1.15} .tab .ti{display:block;font-size:17px}" +
    ".qrow{display:flex;gap:10px;align-items:center;background:#3a2815;border:2px solid #5d3a16;border-radius:14px;padding:10px;margin-bottom:8px;box-shadow:0 3px 0 #00000055}.qrow.done{opacity:.55}" +
    ".qico{font-size:26px}.qbody{flex:1;min-width:0;font-size:14px}.qbody small{color:#cbb98f;font-size:11px}.qbar{height:10px;border-radius:6px;background:#1d1409;margin:5px 0;overflow:hidden}.qbar i{display:block;height:100%;background:linear-gradient(90deg,#7bd88f,#ffd27a)}" +
    ".qbtn{min-width:78px;min-height:44px;border-radius:12px;font-weight:800;background:#2b1d12;color:#8d7a55;border:2px solid #5d3a16}.qbtn.ready{background:linear-gradient(#ffd27a,#ffb400);color:#2b1d12;border-color:#fff1c4;box-shadow:0 3px 0 #8a5a00}" +
    "#quest-streak{font-weight:700;color:#ffd27a;margin:4px 0 10px}";
  document.head.appendChild(st);
  var tabs = $("tabs"), tb = document.createElement("button");
  tb.className = "tab"; tb.setAttribute("data-tab", "quests"); tb.innerHTML = '<span class="ti">📜</span>Quests<span class="badge" id="badge-quests"></span>';
  var feats = tabs.querySelector('[data-tab="feats"]'); tabs.insertBefore(tb, feats);
  var sec = document.createElement("section"); sec.className = "panel"; sec.id = "panel-quests";
  sec.innerHTML = '<div class="section-title">Daily Quests</div><div id="quest-streak"></div><div id="quest-list"></div><div class="section-title" style="margin-top:10px">Quests reset every day at midnight.</div>';
  document.body.insertBefore(sec, $("panel-feats"));
  /* existing tab handler in ui.js was bound before this tab existed, so bind ours */
  tb.addEventListener("click", function () {
    var all = document.querySelectorAll(".tab"); for (var i = 0; i < all.length; i++) all[i].classList.toggle("on", all[i] === tb);
    var ps = document.querySelectorAll(".panel"); for (var p = 0; p < ps.length; p++) ps[p].classList.remove("active");
    sec.classList.add("active"); render();
  });
  var others = tabs.querySelectorAll(".tab");
  for (var o = 0; o < others.length; o++) if (others[o] !== tb) others[o].addEventListener("click", function () { sec.classList.remove("active"); });
  /* tab labels: icon on top */
  for (var t = 0; t < others.length; t++) { var m = others[t].firstChild; if (m && m.nodeType === 3) { var parts = m.nodeValue.trim().split(" "); var icon = parts.shift(); var span = document.createElement("span"); span.className = "ti"; span.textContent = icon; others[t].insertBefore(span, m); m.nodeValue = parts.join(" "); } }
  NK.on("buy", function (e) { if (e.kind === "building") { bump("buys", e.n || 1); } });
  NK.on("golden:collected", function () { bump("golden", 1); });
  var acc = 0;
  NK.on("tick", function (e) {
    var s = NK.state, dc = (s.clicks || 0) - last.clicks; last.clicks = s.clicks || 0;
    var da = (s.totalAll || 0) - last.all; last.all = s.totalAll || 0;
    if (dc > 0 && dc < 1000) bump("taps", dc); if (da > 0) bump("baked", da);
    acc += e.dt || 0; if (acc > 1) { acc = 0; render(); }
  });
  NK.on("ascend", function () { last.all = NK.state.totalAll || 0; });
  ensure(); render();
})();
