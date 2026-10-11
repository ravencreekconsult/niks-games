/* Critter Capture — core: error reporter, input (touch D-pad/A/B + keyboard),
   scene switcher (overworld <-> battle), main loop, startup self-check.
   AUDIO: intentionally not implemented in Phase 0. Add a WebAudio module
   started on first user gesture here later. */

import { MAPS } from './data/areas.js';
import { loadSave, saveGame, newSave, SAVE_VERSION, rollIdentity } from './save.js';
import * as ow from './overworld.js';
import * as battle from './battle.js';
import * as RULES from '../rules/battle-rules.js'; // imported to VERIFY it loads

/* ---------------- on-screen error reporter ---------------- */

const errbar = document.getElementById('errbar');
function showError(text) {
  if (!errbar) return;
  errbar.textContent = 'ERROR: ' + text;
  errbar.style.display = 'block';
}
window.onerror = function (m, src, line, col) {
  const file = String(src || '').split('/').pop();
  showError(m + ' (' + file + ':' + line + ')');
  return false;
};
window.addEventListener('unhandledrejection', function (e) {
  showError('Promise: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
});
window.addEventListener('error', function (e) {
  if (e.target && e.target.tagName === 'SCRIPT') {
    showError('A script file failed to load: ' + (e.target.src || 'unknown'));
  }
}, true);

/* ---------------- input: held directions + consumed A/B presses ---------------- */

const input = {
  heldDirs: { up: false, down: false, left: false, right: false },
  aQueued: 0, bQueued: 0,
  lastInput: 'none', lastInputAt: 0,
  held(d) { return !!this.heldDirs[d]; },
  consumeA() { if (this.aQueued > 0) { this.aQueued--; return true; } return false; },
  consumeB() { if (this.bQueued > 0) { this.bQueued--; return true; } return false; },
  pressA() { this.aQueued = Math.min(3, this.aQueued + 1); },
  pressB() { this.bQueued = Math.min(3, this.bQueued + 1); },
};

const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right',
};
window.addEventListener('keydown', function (e) {
  if (KEYMAP[e.key]) {
    // when a battle menu is open, arrows navigate it instead of walking
    if (menuItems && menuItems.length) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        menuIndex = (menuIndex + menuItems.length - 1) % menuItems.length; highlightMenu();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        menuIndex = (menuIndex + 1) % menuItems.length; highlightMenu();
      }
      e.preventDefault();
      return;
    }
    input.heldDirs[KEYMAP[e.key]] = true; noteInput('key ' + KEYMAP[e.key]); e.preventDefault();
  }
  else if (e.key === 'z' || e.key === 'Z' || e.key === ' ') { input.pressA(); noteInput('key A'); e.preventDefault(); }
  else if (e.key === 'x' || e.key === 'X') { input.pressB(); noteInput('key B'); e.preventDefault(); }
});
window.addEventListener('keyup', function (e) {
  if (KEYMAP[e.key]) input.heldDirs[KEYMAP[e.key]] = false;
});

/* ---------------- touch controls (PRIMARY input path) ----------------
   The pad is ONE generous touch zone: direction is computed from the finger
   position relative to the pad centre, updated on pointermove (drag follows
   the thumb). Per-pointer tracking via pointerId keeps multi-touch working. */

function noteInput(label) {
  input.lastInput = label;
  input.lastInputAt = performance.now();
}

const padEl = document.getElementById('dpad');
const btnA = document.getElementById('btnA');
const btnB = document.getElementById('btnB');

function padDir(el, e) {
  const r = el.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  const dead = r.width * 0.12; // dead zone at the pad centre
  if (Math.abs(dx) < dead && Math.abs(dy) < dead) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
  return dy >= 0 ? 'down' : 'up';
}

function dirHeldByOther(p, dir) {
  let still = false;
  padPointers.forEach(function (o) { if (o !== p && o.dir === dir) still = true; });
  return still;
}

const padPointers = new Map(); // pointerId -> { dir, t0, dragged }

padEl.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  if (padPointers.has(e.pointerId)) return;
  if (padEl.setPointerCapture) { try { padEl.setPointerCapture(e.pointerId); } catch (err) {} }
  padEl.classList.add('pressed');
  const dir = padDir(padEl, e);
  const p = { dir: dir, t0: performance.now(), dragged: false };
  padPointers.set(e.pointerId, p);
  if (dir) { input.heldDirs[dir] = true; noteInput('hold ' + dir); }
});
padEl.addEventListener('pointermove', function (e) {
  const p = padPointers.get(e.pointerId);
  if (!p) return; // ignore hover moves from pointers we didn't capture
  e.preventDefault();
  const dir = padDir(padEl, e);
  if (dir === p.dir) return;
  if (p.dir && !dirHeldByOther(p, p.dir)) input.heldDirs[p.dir] = false;
  p.dir = dir;
  if (dir) { p.dragged = true; input.heldDirs[dir] = true; noteInput('drag ' + dir); }
});
function padEnd(e) {
  const p = padPointers.get(e.pointerId);
  if (!p) return;
  e.preventDefault();
  padPointers.delete(e.pointerId);
  const elapsed = performance.now() - p.t0;
  const wasTap = !p.dragged && elapsed < 250 && p.dir;
  if (p.dir && !dirHeldByOther(p, p.dir)) {
    if (wasTap) {
      // TAP: guarantee exactly one tile step even for a very fast tap —
      // keep the direction held briefly so the next update frame starts it,
      // then release (a 170ms tween completes on its own once started).
      input.heldDirs[p.dir] = true;
      const d = p.dir;
      setTimeout(function () {
        if (!dirHeldByOther(null, d)) input.heldDirs[d] = false;
      }, 80);
      noteInput('tap ' + d);
    } else {
      input.heldDirs[p.dir] = false;
    }
  }
  if (!padPointers.size) padEl.classList.remove('pressed');
}
padEl.addEventListener('pointerup', padEnd);
padEl.addEventListener('pointercancel', padEnd);
padEl.addEventListener('lostpointercapture', padEnd);

function bindButton(el, name, onDown, onUp) {
  if (!el) return;
  el.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (err) {} }
    el.classList.add('pressed');
    noteInput(name);
    onDown();
  });
  const up = function (e) {
    e.preventDefault();
    el.classList.remove('pressed');
    onUp();
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('lostpointercapture', up);
}

bindButton(btnA, 'A', () => input.pressA(), () => {});
bindButton(btnB, 'B', () => input.pressB(), () => {});

/* Never get stuck walking: release everything on blur / hide / global cancel. */
function releaseAllTouch() {
  padPointers.clear();
  input.heldDirs.up = input.heldDirs.down = input.heldDirs.left = input.heldDirs.right = false;
  padEl.classList.remove('pressed');
  [btnA, btnB].forEach(function (b) { if (b) b.classList.remove('pressed'); });
}
window.addEventListener('blur', releaseAllTouch);
document.addEventListener('visibilitychange', function () {
  if (document.hidden) releaseAllTouch();
});

/* Kill the remaining browser touch annoyances (zoom gestures, long-press menu). */
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

/* ---------------- scene switching ---------------- */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const menuEl = document.getElementById('menu');
const hudEl = document.getElementById('hud');
let scene = 'overworld';
let menuItems = null, menuIndex = 0;

const Game = {
  input,
  save: null,
  persist() { saveGame(this.save); },
  setMenu, // battle.js calls G.setMenu(...) — must be on the object, not just module scope
  onEncounter(speciesId, level) {
    scene = 'battle';
    try { battle.start(Game, speciesId, level); }
    catch (err) { showError('battle start: ' + err.message); scene = 'overworld'; }
  },
  endBattle() {
    scene = 'overworld';
    setMenu(null);
    ow.enter(Game, this.save.map, this.save.x, this.save.y, this.save.dir);
  },
};

function setMenu(items) {
  menuItems = items;
  menuIndex = 0;
  input.aQueued = 0; // stale presses must not trigger the new menu
  menuEl.textContent = '';
  if (!items || !items.length) { menuEl.style.display = 'none'; return; }
  menuEl.style.display = 'flex';
  items.forEach(function (it, i) {
    const b = document.createElement('button');
    b.className = 'mbtn';
    b.textContent = it.label;
    if (it.sub) {
      const s = document.createElement('span');
      s.className = 'sub';
      s.textContent = it.sub;
      b.appendChild(s);
    }
    if (it.disabled) b.disabled = true;
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (!it.disabled && it.cb) { menuIndex = i; it.cb(); }
    });
    menuEl.appendChild(b);
  });
  highlightMenu();
}
function highlightMenu() {
  const btns = menuEl.querySelectorAll('.mbtn');
  btns.forEach(function (b, i) {
    b.classList.toggle('sel', i === menuIndex);
  });
}
menuEl.addEventListener('keydown', function () {}); // no-op; keyboard handled below

/* ---------------- dialogue box (overworld NPCs + signs) ----------------
   A real DOM element so it is testable. Only lives while scene==='overworld':
   A advances line by line, B closes immediately, and while it is open the
   player cannot walk and A never reaches anything else. The battle's own A
   handling is untouched — this code sits in the overworld branch of frame(). */

const dlgEl = document.getElementById('dialog');
const dlgName = document.getElementById('dlgName');
const dlgText = document.getElementById('dlgText');
let dlgSteps = null, dlgIndex = 0, dlgOpen = false, dlgChoice = false, dlgTarget = null;
let dlgOnClose = null; // optional one-shot callback fired when the box closes

function flagsOf() {
  if (!Game.save.flags || typeof Game.save.flags !== 'object') Game.save.flags = {};
  return Game.save.flags;
}

function openDialog(t, onClose) {
  dlgOnClose = (typeof onClose === 'function') ? onClose : null;
  dlgOpen = true;
  dlgTarget = t || null;
  dlgSteps = (t && t.steps) || [];
  dlgIndex = 0;
  dlgChoice = false;
  if (dlgName) dlgName.textContent = t.name || '';
  if (dlgEl) dlgEl.style.display = 'flex';
  showDlgStep();
  input.aQueued = 0; // the press that opened it must not also advance a line
  input.bQueued = 0;
}
function showDlgStep() {
  const step = dlgSteps[dlgIndex];
  if (step && step.ask) {
    // a yes/no question: the DOM menu (big 44px+ buttons) takes over here.
    // Movement is already locked (dlgOpen) and A activates the menu item.
    dlgChoice = true;
    if (dlgText) dlgText.textContent = step.ask;
    setMenu([
      { label: 'YES', cb: function () { answerDlg(step, true); } },
      { label: 'NO', cb: function () { answerDlg(step, false); } },
    ]);
  } else if (dlgText) {
    dlgText.textContent = step || '';
  }
}
function answerDlg(step, yes) {
  if (!dlgOpen || !dlgSteps) return; // box closed while the choice was pending
  setMenu(null); // close the choice before the follow-up line
  dlgChoice = false;
  flagsOf()[yes ? step.flagYes : step.flagNo] = true;
  Game.persist();
  dlgSteps[dlgIndex] = yes ? step.yesLine : step.noLine; // the follow-up line
  showDlgStep();
}
function advanceDialog() {
  if (dlgChoice) return; // a pending question must be answered via the menu
  dlgIndex++;
  if (dlgIndex >= dlgSteps.length) { closeDialog(); return; }
  showDlgStep();
}
function closeDialog() {
  dlgOpen = false;
  if (dlgChoice) setMenu(null); // never leave a stranded YES/NO behind
  dlgChoice = false;
  // the NPC remembers you: set its visit flag so it says `again` next time
  if (dlgTarget && dlgTarget.npc && dlgTarget.npc.flag) {
    flagsOf()[dlgTarget.npc.flag] = true;
    Game.persist();
  }
  dlgSteps = null;
  dlgTarget = null;
  if (dlgEl) dlgEl.style.display = 'none';
  input.aQueued = 0; // nothing may leak through when the box closes
  input.bQueued = 0;
  const cb = dlgOnClose;
  dlgOnClose = null; // clear BEFORE calling: it can never double-fire
  if (typeof cb === 'function') cb();
}

/* Tap on the canvas: talk to an NPC you touch, or advance the open dialogue.
   The canvas is integer-scaled, so map client coords back through the scale. */
canvas.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  if (scene !== 'overworld') return;
  if (menuItems && menuItems.length) return; // a choice menu owns taps right now
  const r = canvas.getBoundingClientRect();
  const vx = (e.clientX - r.left) / r.width * 240;
  const vy = (e.clientY - r.top) / r.height * 160;
  if (dlgOpen) { advanceDialog(); return; }
  const t = ow.tapTarget(vx, vy);
  if (t) openDialog(t);
});


/* ---------------- party screen (overworld) ------------------------------
   Opened from the on-screen PARTY button. It lists the party and tapping a
   member makes it the LEAD (swaps it with slot 0). The lead is the critter
   that walks out first in a battle, so reordering is the whole point: send
   the healthy one in, rest the hurt one. */

const partyBtn = document.getElementById('partyBtn');

/* A party member's identity, from the save when present, rolled otherwise. */
function identityOf(m) {
  if (m.ivs && typeof m.ivs === 'object' && m.nature) return { ivs: m.ivs, nature: m.nature };
  return rollIdentity(m.speciesId, 'fallback' + (m.level || 1));
}

function statsOf(m) {
  const sp = RULES.SPECIES[m.speciesId];
  if (!sp) return null;
  return RULES.calcStats({
    baseStats: sp.baseStats,
    ivs: identityOf(m).ivs,
    evs: m.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    level: Math.max(1, m.level || 1),
    nature: identityOf(m).nature,
  });
}

function maxHpOf(m) {
  const st = statsOf(m);
  return st ? st.hp : 1;
}

function openPartyMenu() {
  const party = Game.save.party;
  const items = [{ label: 'PARTY (' + party.length + ')', disabled: true }];
  party.forEach(function (m, i) {
    const sp = RULES.SPECIES[m.speciesId] || { name: m.speciesId };
    const max = maxHpOf(m);
    const hp = (typeof m.hp === 'number' && m.hp > 0) ? Math.min(m.hp, max) : max;
    items.push({
      label: (i === 0 ? '* ' : '') + sp.name + ' Lv' + (m.level || 1) + ' ' + Math.round(hp) + '/' + max,
      cb: function () { openDetailCard(i); },
    });
  });
  items.push({ label: 'ABILITIES', cb: function () { openAbilityList(); } });
  items.push({ label: 'TYPE CHART', cb: function () { openTypeList(); } });
  items.push({ label: 'CLOSE', cb: function () { setMenu(null); } });
  setMenu(items);
}

/* The abilities screens: one disabled info row per ability — name, desc, and
   which species carry it (scanned live from SPECIES) — then BACK. */
function openAbilityList() {
  const items = [{ label: 'ABILITIES (' + Object.keys(RULES.ABILITIES).length + ')', disabled: true }];
  Object.keys(RULES.ABILITIES).forEach(function (id) {
    const ab = RULES.ABILITIES[id];
    if (!ab) return;
    const holders = [];
    Object.keys(RULES.SPECIES).forEach(function (sid) {
      const sp = RULES.SPECIES[sid];
      if (sp && sp.ability === id) holders.push(sp.name);
    });
    items.push({ label: ab.name, sub: ab.desc + (holders.length ? ' — ' + holders.join(', ') : ''), disabled: true });
  });
  items.push({ label: 'BACK', cb: openPartyMenu });
  setMenu(items);
}

/* The type-chart screens: one button per type, then that type's matchup rows
   built live from RULES.TYPE_CHART (a missing entry means x1). */
function openTypeList() {
  const items = [{ label: 'TYPES', disabled: true }];
  RULES.TYPES.forEach(function (t) {
    items.push({ label: t.toUpperCase(), cb: function () { openTypeDetail(t); } });
  });
  items.push({ label: 'BACK', cb: openPartyMenu });
  setMenu(items);
}

function openTypeDetail(type) {
  const row = RULES.TYPE_CHART[type] || {};
  const strong = [], weak = [], none = [];
  RULES.TYPES.forEach(function (t) {
    const m = row[t];
    if (m === 2) strong.push(t.toUpperCase());
    else if (m === 0.5) weak.push(t.toUpperCase());
    else if (m === 0) none.push(t.toUpperCase());
  });
  const items = [{ label: type.toUpperCase() + ' MATCHUPS', disabled: true }];
  items.push({ label: 'STRONG vs: ' + (strong.join('  ') || '—'), disabled: true });
  items.push({ label: 'WEAK vs: ' + (weak.join('  ') || '—'), disabled: true });
  if (none.length) items.push({ label: 'NO EFFECT vs: ' + none.join('  '), disabled: true });
  items.push({ label: 'Everything else: x1', disabled: true });
  items.push({ label: 'BACK', cb: openTypeList });
  setMenu(items);
}

/* A member's detail card: identity, ability and real stats. Pure-information
   lines render as disabled buttons so they cannot be tapped. */
function openDetailCard(i) {
  const m = Game.save.party[i];
  if (!m) { openPartyMenu(); return; }
  const sp = RULES.SPECIES[m.speciesId] || { name: m.speciesId };
  const id = identityOf(m);
  const st = statsOf(m) || { hp: 1, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const max = st.hp;
  const hp = (typeof m.hp === 'number' && m.hp > 0) ? Math.min(m.hp, max) : max;
  const types = (sp.types || []).map(function (t) { return String(t).toUpperCase(); }).join('/');
  const natureName = String(id.nature).charAt(0).toUpperCase() + String(id.nature).slice(1);
  const ab = RULES.ABILITIES[sp.ability] || null;
  const items = [];
  items.push({ label: sp.name + ' Lv' + (m.level || 1) + '  ' + types, disabled: true });
  items.push({ label: 'HP ' + Math.round(hp) + '/' + max, disabled: true });
  items.push({ label: 'Nature: ' + natureName, disabled: true });
  if (ab) {
    items.push({ label: 'Ability: ' + ab.name, disabled: true });
    items.push({ label: '  ' + ab.desc, disabled: true });
  }
  items.push({ label: 'Atk ' + st.atk + '  Def ' + st.def + '  SpA ' + st.spa + '  SpD ' + st.spd + '  Spe ' + st.spe, disabled: true });
  if (i > 0) items.push({ label: 'MAKE LEAD', cb: function () { makeLead(i); } });
  items.push({ label: 'BACK', cb: openPartyMenu });
  setMenu(items);
}

/* Swap a party member into slot 0. HP travels with the critter, never the slot. */
function makeLead(i) {
  const party = Game.save.party;
  if (i > 0 && i < party.length) {
    const lead = party[0];
    party[0] = party[i];
    party[i] = lead;
    Game.persist();
  }
  openPartyMenu(); // re-render so the * lead marker moves
}

if (partyBtn) {
  partyBtn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    partyBtn.classList.add('pressed');
    if (menuItems && menuItems.length) setMenu(null); // tapping it again closes
    else openPartyMenu();
  });
  partyBtn.addEventListener('pointerup', function () { partyBtn.classList.remove('pressed'); });
  partyBtn.addEventListener('pointercancel', function () { partyBtn.classList.remove('pressed'); });
  partyBtn.addEventListener('lostpointercapture', function () { partyBtn.classList.remove('pressed'); });
}

/* ---------------- resize: integer pixel scale ---------------- */

function resize() {
  const stage = document.getElementById('stage');
  const rect = stage.getBoundingClientRect();
  const scale = Math.max(1, Math.floor(Math.min(rect.width / 240, rect.height / 160)));
  canvas.style.width = (240 * scale) + 'px';
  canvas.style.height = (160 * scale) + 'px';
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

/* ---------------- startup self-check ---------------- */

function selfCheck() {
  const problems = [];
  if (!canvas) problems.push('the game canvas was not found in the page');
  if (typeof RULES.createBattle !== 'function' || !RULES.SPECIES || !RULES.resolveTurn) {
    problems.push('the battle rules engine (rules/battle-rules.js) did not load');
  }
  if (!MAPS.town || !MAPS.route1) problems.push('the world maps failed to load');
  if (!MAPS.town || MAPS.town.rows.length !== MAPS.town.h) problems.push('the town map data is malformed');
  if (!MAPS.route1 || MAPS.route1.rows.length !== MAPS.route1.h) problems.push('the route map data is malformed');
  if (!ow) problems.push('the overworld module failed to load');
  if (problems.length) {
    showError('Startup failed - ' + problems.join('; ') + '. Please reload the page.');
    return false;
  }
  return true;
}

/* ---------------- main loop ---------------- */

let last = 0, hudTick = 0;
function frame(ts) {
  if (!last) last = ts;
  const dt = Math.min(0.05, (ts - last) / 1000);
  last = ts;
  try {
    if (scene === 'battle') {
      battle.update(dt);
      battle.draw(ctx);
    } else {
      // dialogue first: while the box is open it owns A and B, and walking is paused
      if (dlgOpen && (menuItems && menuItems.length)) {
        // a yes/no choice is pending: the menu below owns A (and taps)
      } else if (dlgOpen) {
        if (input.consumeB()) closeDialog();
        else {
          while (dlgOpen && input.aQueued > 0) {
            input.consumeA();
            advanceDialog();
          }
        }
      } else if (input.consumeA()) {
        const t = ow.facingTarget(); // NPC or sign ahead? open the box
        if (t) openDialog(t);
      }
      if (!(menuItems && menuItems.length) && !dlgOpen) ow.update(dt); // menu OR dialogue pauses walking
      ow.draw(ctx);
    }
  } catch (err) {
    showError(err.message + ' (' + (err.stack || '').split('\n')[1] + ')');
    last = 0; // avoid dt spike on the next frame
  }
  // menu keyboard navigation (arrow + Z), only when a menu is open
  if (menuItems && menuItems.length) {
    if (input.consumeB() && scene === 'battle') { /* B reserved for later */ }
    // arrow keys move the highlight; A activates (reuse queued presses)
    while (input.aQueued > 0) {
      input.consumeA();
      const it = menuItems[menuIndex];
      if (it && !it.disabled && it.cb) it.cb();
    }
    highlightMenu();
  }
  // HUD status line
  hudTick += dt;
  if (hudTick > 0.25) {
    hudTick = 0;
    if (partyBtn) partyBtn.style.display = (scene === 'overworld') ? 'flex' : 'none';
    const i = scene === 'battle' ? { map: 'battle', x: '-', y: '-' } : ow.info();
    const inAge = performance.now() - input.lastInputAt;
    const inLabel = (input.lastInputAt > 0 && inAge < 2000) ? input.lastInput : 'none';
    hudEl.textContent = scene + ' | ' + i.map + ' | ' + i.x + ',' + i.y +
      ' | party ' + Game.save.party.length + ' Lv' + Game.save.party[0].level + ' | dex ' + Game.save.dex.caught.length +
      ' | in: ' + inLabel;
  }
  requestAnimationFrame(frame);
}

/* ---------------- boot ---------------- */

try {
  window.__CC_OK = false;
  if (!selfCheck()) throw new Error('self-check failed');
  Game.save = loadSave() || newSave();
  saveGame(Game.save);
  ow.enter(Game, Game.save.map, Game.save.x, Game.save.y, Game.save.dir);
  setMenu(null);
  resize();
  window.__CC_OK = true;
  requestAnimationFrame(frame);
} catch (err) {
  showError('Could not start: ' + err.message);
}
