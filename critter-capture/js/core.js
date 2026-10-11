/* Critter Capture — core: error reporter, input (touch D-pad/A/B + keyboard),
   scene switcher (overworld <-> battle), main loop, startup self-check.
   AUDIO: intentionally not implemented in Phase 0. Add a WebAudio module
   started on first user gesture here later. */

import { MAPS } from './data/areas.js';
import { loadSave, saveGame, newSave, SAVE_VERSION } from './save.js';
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
    if (menuItems && menuItems.length && scene === 'battle') {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        menuIndex = (menuIndex + menuItems.length - 1) % menuItems.length; highlightMenu();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        menuIndex = (menuIndex + 1) % menuItems.length; highlightMenu();
      }
      e.preventDefault();
      return;
    }
    input.heldDirs[KEYMAP[e.key]] = true; e.preventDefault();
  }
  else if (e.key === 'z' || e.key === 'Z' || e.key === ' ') { input.pressA(); e.preventDefault(); }
  else if (e.key === 'x' || e.key === 'X') { input.pressB(); e.preventDefault(); }
});
window.addEventListener('keyup', function (e) {
  if (KEYMAP[e.key]) input.heldDirs[KEYMAP[e.key]] = false;
});

function bindButton(el, onDown, onUp) {
  if (!el) return;
  el.addEventListener('pointerdown', function (e) { e.preventDefault(); el.setPointerCapture && el.setPointerCapture(e.pointerId); onDown(); });
  const up = function (e) { e.preventDefault(); onUp(); };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
}
bindButton(document.getElementById('dUp'), () => { input.heldDirs.up = true; }, () => { input.heldDirs.up = false; });
bindButton(document.getElementById('dDown'), () => { input.heldDirs.down = true; }, () => { input.heldDirs.down = false; });
bindButton(document.getElementById('dLeft'), () => { input.heldDirs.left = true; }, () => { input.heldDirs.left = false; });
bindButton(document.getElementById('dRight'), () => { input.heldDirs.right = true; }, () => { input.heldDirs.right = false; });
bindButton(document.getElementById('btnA'), () => input.pressA(), () => {});
bindButton(document.getElementById('btnB'), () => input.pressB(), () => {});

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
      ow.update(dt);
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
    const i = scene === 'battle' ? { map: 'battle', x: '-', y: '-' } : ow.info();
    hudEl.textContent = scene + ' | ' + i.map + ' | ' + i.x + ',' + i.y +
      ' | party Lv' + Game.save.party[0].level + ' | dex ' + Game.save.dex.caught.length;
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
