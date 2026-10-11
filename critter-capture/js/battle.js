/* Critter Capture — battle scene. ALL rules come from the existing engine
   at ../rules/battle-rules.js. This file never computes damage/status/order
   itself: it builds intents, calls resolveTurn once per turn, and plays back
   the returned event array. */

import {
  MOVES, SPECIES, STRUGGLE_ID, getTypeEffect,
  createBattle, defaultIntent, resolveTurn,
} from '../rules/battle-rules.js';
import { drawSprite, SPRITES, PAL } from './data/sprites.js';

let G = null;
let state = null;          // engine battle state (from createBattle/resolveTurn)
let phase = 'idle';        // idle | playback | menu | root | over
let queue = [];            // playback queue: {ev, dur}
let timer = 0;
let msg = '';
let fx = {};               // combatantId -> {flash:msLeft, shake:msLeft}
let wildId = '', wildLevel = 1;
let endInfo = null;        // {winnerSide, rewards}
let resultMsg = '';
let overTimer = 0;
let caughtFlag = false;
const PLAYER_ID = 'c0_0';
const VIEW_W = 240, VIEW_H = 160;

function combatant(id) { return state.combatants.find(c => c.id === id); }
function activeOf(side) { return state.combatants.find(c => c.side === side && !c.fainted && c.active !== false) || state.combatants.find(c => c.side === side); }
function partyMon() { return G.save.party[0]; }

function addSeen(sp) {
  const dex = G.save.dex;
  if (dex.seen.indexOf(sp) === -1) dex.seen.push(sp);
}

/* ---------------- starting a battle ---------------- */

export function start(game, speciesId, level) {
  G = game;
  wildId = speciesId; wildLevel = level;
  const mon = partyMon();
  const level0 = Math.max(1, mon.level);
  const ivs = { hp: 10, atk: 12, def: 10, spa: 12, spd: 10, spe: 12 };
  state = createBattle({
    seed: (Date.now() & 0x7fffffff) | 1,
    teams: [
      [{ speciesId: mon.speciesId, level: level0, pid: 0, ivs, nature: mon.nature || 'hardy' }],
      [{ speciesId, level, pid: 1, ivs }],
    ],
  });
  // respect HP carried over from the overworld (never start below 1)
  const me = combatant(PLAYER_ID);
  const carryHp = (typeof mon.hp === 'number' && mon.hp > 0) ? Math.min(mon.hp, me.maxHp) : me.maxHp;
  me.hp = carryHp;
  mon.hp = carryHp;
  addSeen(mon.speciesId);
  addSeen(speciesId);
  fx = {};
  queue = [];
  msg = 'A wild ' + SPECIES[speciesId].name + ' appeared!';
  resultMsg = '';
  caughtFlag = false;
  endInfo = null;
  overTimer = 0;
  phase = 'playback';
  timer = 1100;
  G.setMenu(null);
}

/* ---------------- enemy AI: pick a sensible damaging move ---------------- */

function aiIntent() {
  const me = activeOf(1);
  if (!me) return defaultIntent({ state, pid: 1 });
  const target = activeOf(0);
  const defTypes = (SPECIES[target.speciesId] || {}).types || [];
  const myTypes = (SPECIES[me.speciesId] || {}).types || [];
  let best = null, bestScore = -1;
  for (const slot of me.moves) {
    if (slot.pp <= 0) continue;
    const mv = MOVES[slot.id];
    if (!mv) continue;
    let score = (mv.power || 0) * getTypeEffect(mv.type, defTypes);
    if (mv.type && myTypes.indexOf(mv.type) !== -1) score *= 1.5;
    if (score > bestScore) { bestScore = score; best = slot.id; }
  }
  if (best) {
    return { pid: 1, actorId: me.id, kind: 'move', moveId: best, targetId: activeOf(0).id };
  }
  return defaultIntent({ state, pid: 1 });
}

function playerMoveIntent(slot) {
  const me = activeOf(0);
  const foe = activeOf(1);
  const moveId = slot || STRUGGLE_ID;
  const mv = MOVES[moveId];
  const targetId = (mv && mv.target === 'self') ? me.id : (foe ? foe.id : me.id);
  return { pid: 0, actorId: me.id, kind: 'move', moveId, targetId };
}

function submit(mine) {
  const res = resolveTurn({
    state,
    intents: [mine, aiIntent()],
    participants: [{ pid: 0 }, { pid: 1 }],
    seed: state.rngState || 1,
  });
  state = res.state;
  endInfo = res.done ? { winnerSide: res.winnerSide, rewards: res.rewards } : null;
  queue = buildQueue(res.events);
  phase = 'playback';
  timer = 0;
  G.setMenu(null);
}

/* ---------------- playback queue ---------------- */

const DUR = {
  message: 1000, move: 380, damage: 480, miss: 550, heal: 420,
  status: 520, statusEnd: 250, stage: 420, weather: 520, faint: 700,
  catch: 1250, run: 650, switch: 500, end: 350,
};

function buildQueue(events) {
  const out = [];
  // level-up messages splice in before the end event
  const levelMsgs = [];
  if (endInfo && endInfo.winnerSide === 0 && endInfo.rewards && endInfo.rewards['0']) {
    levelMsgs.push.apply(levelMsgs, applyXp(endInfo.rewards['0'].xp));
  }
  for (const ev of events) {
    if (ev.t === 'end') {
      for (const text of levelMsgs) out.push({ ev: { t: 'message', text }, dur: DUR.message });
    }
    out.push({ ev, dur: DUR[ev.t] || 300 });
  }
  return out;
}

function applyFx(ev) {
  if (ev.t === 'damage' || ev.t === 'faint') {
    const f = fx[ev.targetId] || (fx[ev.targetId] = { flash: 0, shake: 0 });
    f.flash = 220; f.shake = 260;
  }
  if (ev.t === 'catch' && ev.success) {
    caughtFlag = true;
    const sp = combatant(ev.targetId);
    if (sp && G.save.dex.caught.indexOf(sp.speciesId) === -1) {
      G.save.dex.caught.push(sp.speciesId);
    }
  }
}

function stepPlayback(dtMs) {
  if (timer > 0) {
    timer -= dtMs;
    if (G.input.consumeA()) timer = 0; // A skips ahead
    if (timer > 0) return;
  }
  if (queue.length === 0) {
    if (endInfo) finishBattle();
    else showRootMenu();
    return;
  }
  const step = queue.shift();
  const ev = step.ev;
  if (ev.t === 'message') msg = ev.text; else if (ev.text === undefined) msg = '';
  applyFx(ev);
  timer = step.dur;
}

/* ---------------- xp / level ups (client-side growth) ---------------- */

function xpNeed(level) { return 15 + level * 10; }

function applyXp(gain) {
  const mon = partyMon();
  const msgs = [];
  mon.xp = (mon.xp || 0) + (gain || 0);
  while (mon.xp >= xpNeed(mon.level) && mon.level < 100) {
    mon.xp -= xpNeed(mon.level);
    mon.level += 1;
    const spName = (SPECIES[mon.speciesId] || { name: mon.speciesId }).name;
    msgs.push(spName + ' grew to level ' + mon.level + '!');
  }
  return msgs;
}

/* ---------------- battle end ---------------- */

function finishBattle() {
  const mon = partyMon();
  const me = combatant(PLAYER_ID);
  if (me && !me.caught) mon.hp = Math.max(0, me.hp);
  if (mon.hp <= 0) { mon.hp = null; resultMsg += ' It was rushed to rest and revived.'; }
  let outcome;
  if (caughtFlag) outcome = SPECIES[wildId].name + ' joined your dex!';
  else if (endInfo && endInfo.winnerSide === 0) outcome = 'You won the battle!';
  else if (endInfo && endInfo.winnerSide === 1) outcome = 'You were defeated...';
  else outcome = 'You got away safely.';
  resultMsg = (resultMsg ? resultMsg + ' ' : '') + outcome;
  msg = resultMsg;
  G.persist();
  phase = 'over';
  overTimer = 1600;
}

function queueWonByCatch() { return caughtFlag; }

/* ---------------- menus (rendered by core as big touch buttons) ---------------- */

function showRootMenu() {
  phase = 'root';
  msg = 'What will ' + (SPECIES[partyMon().speciesId] || {}).name + ' do?';
  G.setMenu([
    { label: 'FIGHT', cb: showMoveMenu },
    { label: 'CATCH', cb: () => submit({ pid: 0, actorId: activeOf(0).id, kind: 'catch', targetId: activeOf(1).id }) },
    { label: 'RUN', cb: () => submit({ pid: 0, actorId: activeOf(0).id, kind: 'run' }) },
  ]);
}

function showMoveMenu() {
  phase = 'menu';
  const me = activeOf(0);
  const buttons = [];
  let anyUsable = false;
  for (const slot of me.moves) {
    const mv = MOVES[slot.id];
    if (!mv) continue;
    const usable = slot.pp > 0;
    if (usable) anyUsable = true;
    buttons.push({
      label: mv.name + (usable ? ' (' + slot.pp + ')' : ' (0)'),
      disabled: !usable,
      cb: usable ? () => submit(playerMoveIntent(slot.id)) : null,
    });
  }
  buttons.push({ label: 'BACK', cb: showRootMenu });
  if (!anyUsable) {
    // no PP anywhere: FIGHT commits Struggle instead
    buttons[0] = { label: 'STRUGGLE', cb: () => submit(playerMoveIntent(null)) };
  }
  G.setMenu(buttons);
}

/* ---------------- frame hooks ---------------- */

export function update(dt) {
  if (phase === 'playback') stepPlayback(dt * 1000);
  else if (phase === 'over') {
    overTimer -= dt * 1000;
    if (overTimer <= 0) { phase = 'idle'; G.endBattle(); }
  }
  for (const id in fx) {
    const f = fx[id];
    if (f.flash > 0) f.flash -= dt * 1000;
    if (f.shake > 0) f.shake -= dt * 1000;
  }
}

export function isOver() { return phase === 'over' || phase === 'idle'; }

/* ---------------- drawing ---------------- */

function wrap(ctx, text, maxW) {
  const words = String(text || '').split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function hpBar(ctx, x, y, w, ratio) {
  ctx.fillStyle = PAL.dark;
  ctx.fillRect(x, y, w, 5);
  const rw = Math.max(0, Math.round((w - 2) * Math.max(0, Math.min(1, ratio))));
  ctx.fillStyle = ratio > 0.5 ? PAL.grn : (ratio > 0.2 ? PAL.yell : PAL.red);
  ctx.fillRect(x + 1, y + 1, rw, 3);
}

function statBox(ctx, c, x, y, w, isFoe) {
  const sp = SPECIES[c.speciesId] || { name: c.name };
  ctx.fillStyle = PAL.white;
  ctx.fillRect(x, y, w, 30);
  ctx.strokeStyle = PAL.dark;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 29);
  ctx.fillStyle = PAL.ink;
  ctx.font = 'bold 8px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(sp.name, x + 4, y + 3);
  ctx.fillText('Lv' + c.level, x + w - 30, y + 3);
  hpBar(ctx, x + 4, y + 15, w - 8, c.hp / c.maxHp);
  ctx.fillStyle = PAL.slate;
  ctx.fillText(c.hp + '/' + c.maxHp, x + 4, y + 21);
}

export function draw(ctx) {
  if (!state) return;
  // backdrop
  ctx.fillStyle = PAL.ice; ctx.fillRect(0, 0, VIEW_W, 96);
  ctx.fillStyle = PAL.lgrn; ctx.fillRect(0, 96, VIEW_W, VIEW_H - 96);
  ctx.fillStyle = PAL.teal;
  ctx.beginPath(); ctx.ellipse(64, 108, 46, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(172, 56, 42, 12, 0, 0, Math.PI * 2); ctx.fill();

  const me = activeOf(0), foe = activeOf(1);
  const drawMon = (c, x, y, flip) => {
    if (!c) return;
    const f = fx[c.id] || {};
    const shk = f.shake > 0 ? ((Math.floor(f.shake / 40) % 2) ? 2 : -2) : 0;
    const gx = x + shk, gy = y;
    if (c.fainted) return;
    ctx.save();
    if (flip) { ctx.translate(gx + 32, gy); ctx.scale(-1, 1); drawSprite(ctx, SPRITES[c.speciesId] || SPRITES.sproutle, PAL, 0, 0, 2); }
    else drawSprite(ctx, SPRITES[c.speciesId] || SPRITES.sproutle, PAL, gx, gy, 2);
    ctx.restore();
    if (f.flash > 0) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = PAL.white;
      ctx.fillRect(gx, gy, 32, 32);
      ctx.globalAlpha = 1;
    }
  };
  drawMon(foe, 156, 24, false);
  drawMon(me, 30, 62, true);
  if (foe) statBox(ctx, foe, 8, 6, 96, true);
  if (me) statBox(ctx, me, 136, 78, 96, false);

  // message box
  ctx.fillStyle = PAL.white;
  ctx.fillRect(0, 118, VIEW_W, 42);
  ctx.strokeStyle = PAL.dark;
  ctx.strokeRect(0.5, 118.5, VIEW_W - 1, 41);
  ctx.fillStyle = PAL.ink;
  ctx.font = '8px monospace';
  ctx.textBaseline = 'top';
  const lines = wrap(ctx, msg || '', 224);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    ctx.fillText(lines[i], 6, 122 + i * 12);
  }
}
