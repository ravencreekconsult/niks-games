/* Critter Capture — battle scene. ALL rules come from the existing engine
   at ../rules/battle-rules.js. This file never computes damage/status/order
   itself: it builds intents, calls resolveTurn once per turn, and plays back
   the returned event array. */

import {
  MOVES, SPECIES, STRUGGLE_ID, getTypeEffect, ABILITIES,
  createBattle, beginBattle, defaultIntent, resolveTurn,
} from '../rules/battle-rules.js';
import { drawSprite, SPRITES, PAL } from './data/sprites.js';
import { rollIdentity } from './save.js';

let G = null;
let state = null;          // engine battle state (from createBattle/resolveTurn)
let phase = 'idle';        // idle | playback | menu | root | over
let queue = [];            // playback queue: {ev, dur}
let timer = 0;
let msg = '';
let fx = {};               // combatantId -> {flash:msLeft, shake:msLeft}
let dispHp = {};           // combatantId -> eased HP shown on the bar (drains smoothly)
let wildId = '', wildLevel = 1;
let endInfo = null;        // {winnerSide, rewards}
let resultMsg = '';
let overTimer = 0;
let caughtFlag = false;
let caughtJoinedParty = false;
let catchAnim = null;      // {targetId, success, shakes, t, total} — the ball throw + shakes
let wildIdentity = null;   // the rolled {ivs, nature} of this wild critter
const PLAYER_ID = 'c0_0';

/* Real identity for a party member from the save; never undefined. */
function memberIdentity(m) {
  if (m.ivs && typeof m.ivs === 'object' && m.nature) return { ivs: m.ivs, nature: m.nature };
  return rollIdentity(m.speciesId, 'fallback' + (m.level || 1));
}

function addEvs(m, gains) {
  if (!gains || typeof gains !== 'object') return;
  if (!m.evs || typeof m.evs !== 'object') m.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const keys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  let total = keys.reduce((s, k) => s + (m.evs[k] || 0), 0);
  for (const k of keys) {
    const want = (m.evs[k] || 0) + (gains[k] || 0);
    const room = Math.max(0, Math.min(252 - (m.evs[k] || 0), 510 - total));
    const add = Math.max(0, Math.min(want - (m.evs[k] || 0), room));
    m.evs[k] = (m.evs[k] || 0) + add;
    total += add;
  }
}
const VIEW_W = 240, VIEW_H = 160;

/* catch animation timeline (ms) — the engine already tells us how many shakes */
const CATCH_THROW = 460;   // ball flight from the player across to the wild critter
const CATCH_SHAKE = 300;   // one wobble of the resting ball
const CATCH_OPEN  = 420;   // final beat: the click (caught) or the burst (broke free)
const BALL_START  = { x: 58, y: 86 };
const BALL_END    = { x: 172, y: 42 };

function combatant(id) { return state.combatants.find(c => c.id === id); }
function activeOf(side) { return state.combatants.find(c => c.side === side && !c.fainted && c.active !== false) || state.combatants.find(c => c.side === side); }
function partySlotOf(id) { const m = /^c0_(\d+)$/.exec(String(id || '')); return m ? Number(m[1]) : -1; }
function partyMonOf(id) { const i = partySlotOf(id); return (i >= 0 && G.save.party[i]) ? G.save.party[i] : null; }
/* the save entry for the critter the player currently has on the field */
function activeMon() { const a = activeOf(0); return (a && partyMonOf(a.id)) || G.save.party[0]; }
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
  const battleSeed = (Date.now() & 0x7fffffff) | 1;
  // the whole party takes the field: member 0 leads, the others can be switched in
  const team0 = G.save.party.slice(0, 6).map((m) => {
    const id = memberIdentity(m);
    return {
      speciesId: m.speciesId,
      level: Math.max(1, m.level || 1),
      pid: 0,
      ivs: id.ivs,
      evs: m.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      nature: id.nature,
    };
  });
  if (!team0.length) {
    const id = memberIdentity(mon);
    team0.push({ speciesId: mon.speciesId, level: Math.max(1, mon.level || 1), pid: 0, ivs: id.ivs, evs: mon.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, nature: id.nature });
  }
  // the wild critter rolls its own identity, deterministic for this encounter
  wildIdentity = rollIdentity(speciesId, 'wild' + level + battleSeed);
  state = createBattle({
    seed: battleSeed,
    teams: [ team0, [{ speciesId, level, pid: 1, ivs: wildIdentity.ivs, nature: wildIdentity.nature }] ],
  });
  // respect the HP each member carried in from the overworld (never start below 1)
  G.save.party.slice(0, 6).forEach((m, i) => {
    const c = combatant('c0_' + i);
    if (!c) return;
    const carryHp = (typeof m.hp === 'number' && m.hp > 0) ? Math.min(m.hp, c.maxHp) : c.maxHp;
    c.hp = carryHp;
    m.hp = carryHp;
  });
  addSeen(mon.speciesId);
  addSeen(speciesId);
  fx = {};
  dispHp = {};
  /* Clear the PREVIOUS battle's result BEFORE buildQueue reads it. buildQueue
     awards xp and evGains whenever endInfo is set, so leaving the old one in
     place here applied them a second time on the next encounter. */
  endInfo = null;
  const battleEvents = beginBattle({ state }).events;
  // ability intros lead the very first playback queue, before the engine's own
  // entry messages — one line per ACTIVE combatant that has an ability
  const intro = [];
  const seenIntro = {};
  for (const c of state.combatants) {
    if (c.fainted || c.active === false || seenIntro[c.id]) continue;
    seenIntro[c.id] = true;
    const ab = ABILITIES[c.ability];
    if (!ab) continue;
    intro.push({ ev: { t: 'message', text: c.name + "'s " + ab.name + '!' }, dur: DUR.message });
  }
  queue = intro.concat(buildQueue(battleEvents));
  msg = 'A wild ' + SPECIES[speciesId].name + ' appeared!';
  resultMsg = '';
  caughtFlag = false;
  caughtJoinedParty = false;
  catchAnim = null;
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

function catchDuration(ev) {
  // a catch is not a fixed beat: it is a throw plus one wobble per shake
  return ev.t === 'catch'
    ? CATCH_THROW + (ev.shakes || 0) * CATCH_SHAKE + CATCH_OPEN
    : (DUR[ev.t] || 300);
}

function buildQueue(events) {
  const out = [];
  // level-up messages splice in before the end event
  const levelMsgs = [];
  if (endInfo && endInfo.winnerSide === 0 && endInfo.rewards && endInfo.rewards['0']) {
    const rew = endInfo.rewards['0'];
    levelMsgs.push.apply(levelMsgs, applyXp(rew.xp));
    // EV growth goes to the critter that fought, clamped to a legal spread
    addEvs(activeMon(), rew.evGains);
  }
  for (const ev of events) {
    if (ev.t === 'end') {
      for (const text of levelMsgs) out.push({ ev: { t: 'message', text }, dur: DUR.message });
    }
    out.push({ ev, dur: catchDuration(ev) });
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
    const party = G.save.party;
    if (sp && party.length < 6) {
      const id = wildIdentity || { ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }, nature: 'hardy' };
      party.push({ speciesId: sp.speciesId, level: (sp.level || wildLevel || 1), xp: 0, hp: null,
        ivs: id.ivs, evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, nature: id.nature });
      caughtJoinedParty = true;
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
  catchAnim = null; // every new beat replaces the previous catch animation
  if (ev.t === 'message') msg = ev.text; // keep the last message otherwise
  else if (ev.t === 'catch') {
    catchAnim = { targetId: ev.targetId, success: !!ev.success, shakes: ev.shakes || 0, t: 0, total: step.dur };
    msg = 'You threw a Capture Ball!';
  }
  else if (ev.t === 'damage' && ev.crit) {
    // engine sends super-effective lines separately; only call out the crit here
    const c = combatant(ev.targetId);
    msg = (c ? c.name : 'It') + ' took ' + ev.amount + ' damage. A critical hit!';
  }
  else if (ev.t === 'heal') {
    const c = combatant(ev.targetId);
    if (c) msg = c.name + ' recovered ' + ev.amount + ' HP!';
  } else if (ev.t === 'run' && !ev.success) {
    msg = "Couldn't get away!";
  }
  applyFx(ev);
  timer = step.dur;
}

/* ---------------- xp / level ups (client-side growth) ---------------- */

function xpNeed(level) { return 15 + level * 10; }

/* Add xp to ONE critter and return the level-up messages it earns. */
function gainXp(mon, gain) {
  const msgs = [];
  if (!mon) return msgs;
  mon.xp = (mon.xp || 0) + (gain || 0);
  while (mon.xp >= xpNeed(mon.level) && mon.level < 100) {
    mon.xp -= xpNeed(mon.level);
    mon.level += 1;
    const spName = (SPECIES[mon.speciesId] || { name: mon.speciesId }).name;
    msgs.push(spName + ' grew to level ' + mon.level + '!');
  }
  checkEvolution(mon, msgs);
  return msgs;
}

/* A critter that reaches its species' evolveLevel becomes its evolved form.
   The change lands in the SAVE; the critter standing on the field is
   re-skinned so the sprite on screen changes with it. Battle stats stay as
   they were rolled for this battle, so the new form's stats apply from the
   next battle on. */
function checkEvolution(mon, msgs) {
  const sp = SPECIES[mon.speciesId];
  if (!sp || !sp.evolvesTo || !sp.evolveLevel) return;
  if (mon.level < sp.evolveLevel) return;
  const next = SPECIES[sp.evolvesTo];
  if (!next) return;
  const oldName = sp.name;
  mon.speciesId = sp.evolvesTo;
  const dex = G.save.dex || (G.save.dex = { seen: [], caught: [] });
  if (dex.seen.indexOf(mon.speciesId) === -1) dex.seen.push(mon.speciesId);
  if (dex.caught.indexOf(mon.speciesId) === -1) dex.caught.push(mon.speciesId);
  const i = G.save.party.indexOf(mon);
  if (i >= 0) {
    const c = combatant('c0_' + i);
    if (c) { c.speciesId = mon.speciesId; c.name = next.name; }
  }
  msgs.push('Congratulations! ' + oldName + ' evolved into ' + next.name + '!');
}

/* On a win, the critter that fought takes the full xp — and so does every
   other party member still standing, so a benched critter grows with the
   team (that is what the party screen is for: rest one, train another).
   A member that fainted in the battle earns nothing. */
function applyXp(gain) {
  const msgs = [];
  const g = gain || 0;
  const act = activeMon();
  msgs.push.apply(msgs, gainXp(act, g));
  G.save.party.forEach(function (m, i) {
    if (m === act) return;                       // the lead already got it
    const c = combatant('c0_' + i);
    if (!c || c.fainted || c.hp <= 0) return;    // downed members don't grow
    msgs.push.apply(msgs, gainXp(m, g));
  });
  return msgs;
}

/* ---------------- battle end ---------------- */

function finishBattle() {
  let revived = false;
  G.save.party.forEach((m, i) => {
    const c = combatant('c0_' + i);
    if (!c || c.caught) return;
    if (c.hp <= 0) { m.hp = null; revived = true; }   // fainted in battle: back at full outside it
    else m.hp = Math.max(0, c.hp);
  });
  if (revived) resultMsg += ' It was rushed to rest and revived.';
  let outcome;
  if (caughtFlag) {
    if (caughtJoinedParty) outcome = SPECIES[wildId].name + ' was caught and joined your party!';
    else outcome = SPECIES[wildId].name + ' was caught!';
  }
  else if (endInfo && endInfo.winnerSide === 0) outcome = 'You won the battle!';
  else if (endInfo && endInfo.winnerSide === 1) outcome = 'You were defeated...';
  else outcome = 'You got away safely.';
  resultMsg = (resultMsg ? resultMsg + ' ' : '') + outcome;
  msg = resultMsg;
  G.persist();
  catchAnim = null;
  phase = 'over';
  overTimer = 1600;
}

/* ---------------- menus (rendered by core as big touch buttons) ---------------- */

function showRootMenu() {
  phase = 'root';
  msg = 'What will ' + (SPECIES[activeMon().speciesId] || {}).name + ' do?';
  const buttons = [
    { label: 'FIGHT', cb: showMoveMenu },
    { label: 'CATCH', cb: () => submit({ pid: 0, actorId: activeOf(0).id, kind: 'catch', targetId: activeOf(1).id }) },
  ];
  if (switchableMembers().length) buttons.push({ label: 'SWITCH', cb: showSwitchMenu });
  buttons.push({ label: 'RUN', cb: () => submit({ pid: 0, actorId: activeOf(0).id, kind: 'run' }) });
  G.setMenu(buttons);
}

function switchableMembers() {
  const cur = activeOf(0);
  if (!cur) return [];
  return state.combatants.filter((c) => c.side === 0 && c.id !== cur.id && !c.fainted);
}

function showSwitchMenu() {
  phase = 'menu';
  const buttons = switchableMembers().map((c) => {
    const sp = SPECIES[c.speciesId] || { name: c.name };
    return {
      label: sp.name + ' Lv' + c.level + ' ' + Math.max(0, Math.round(c.hp)) + '/' + c.maxHp,
      cb: () => submit({ pid: 0, actorId: activeOf(0).id, kind: 'switch', toId: c.id }),
    };
  });
  buttons.push({ label: 'BACK', cb: showRootMenu });
  G.setMenu(buttons);
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
  if (catchAnim) {
    catchAnim.t += dt * 1000;
    if (catchAnim.t >= catchAnim.total) catchAnim.t = catchAnim.total;
  }
  for (const id in fx) {
    const f = fx[id];
    if (f.flash > 0) f.flash -= dt * 1000;
    if (f.shake > 0) f.shake -= dt * 1000;
  }
  // ease the displayed HP toward the real HP so the bar drains smoothly
  if (state) {
    for (const c of state.combatants) {
      const target = c.hp;
      const cur = (dispHp[c.id] === undefined) ? target : dispHp[c.id];
      dispHp[c.id] = (Math.abs(target - cur) < 0.5)
        ? target
        : cur + (target - cur) * Math.min(1, dt * 8);
    }
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
  // colour tiers: >1/2 green, >1/5 amber, otherwise red
  ctx.fillStyle = PAL.dark;
  ctx.fillRect(x, y, w, 5);
  const rw = Math.max(0, Math.round((w - 2) * Math.max(0, Math.min(1, ratio))));
  ctx.fillStyle = ratio > 0.5 ? PAL.grn : (ratio > 0.2 ? PAL.yell : PAL.red);
  ctx.fillRect(x + 1, y + 1, rw, 3);
}

function roundBox(ctx, x, y, w, h) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 4);
  else ctx.rect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.stroke();
}

function statBox(ctx, c, x, y, w, isFoe) {
  const sp = SPECIES[c.speciesId] || { name: c.name };
  const shown = (dispHp[c.id] !== undefined) ? dispHp[c.id] : c.hp;
  ctx.fillStyle = PAL.white;
  ctx.fillRect(x, y, w, 36);
  ctx.strokeStyle = PAL.dark;      // thin rounded outer border
  roundBox(ctx, x, y, w, 36);
  ctx.strokeStyle = PAL.slate;     // subtle inner line so the box reads as UI
  roundBox(ctx, x + 2, y + 2, w - 4, 32);
  ctx.textBaseline = 'top';
  // row 1: species name + level
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = PAL.ink;
  ctx.fillText(sp.name, x + 5, y + 3);
  ctx.fillText('Lv' + c.level, x + w - 30, y + 3);
  // row 2: hp bar (unchanged colours/tiers)
  hpBar(ctx, x + 5, y + 14, w - 10, shown / c.maxHp);
  // row 3: hp text left, ability name right (dropped first if row 4 overflows)
  const ab = ABILITIES[c.ability] || null;
  let abilityText = ab ? ab.name : '';
  ctx.font = '8px monospace';
  ctx.fillStyle = PAL.slate;
  ctx.fillText(Math.max(0, Math.round(shown)) + '/' + c.maxHp, x + 5, y + 21);
  // row 4: status chip + stat-stage marks, small enough to stay inside the box
  ctx.font = '6px monospace';
  const chipText = c.status ? String(c.status).toUpperCase() : '';
  const chipW = chipText ? Math.ceil(ctx.measureText(chipText).width) + 4 : 0;
  const marks = [];
  for (const k of ['atk', 'def', 'spa', 'spd', 'spe']) {
    const st = (c.stages && c.stages[k]) || 0;
    if (st !== 0) marks.push({ k: k.toUpperCase(), up: st > 0 });
  }
  const markW = (m) => 5 + 2 + Math.ceil(ctx.measureText(m.k).width) + 2;
  let rowW = chipW;
  const keep = [];
  for (const m of marks) {
    if (rowW + markW(m) <= w - 8) { keep.push(m); rowW += markW(m); }
  }
  if (keep.length < marks.length) abilityText = ''; // overflow: drop the ability name first
  if (abilityText) {
    ctx.font = '8px monospace';
    ctx.fillStyle = PAL.slate;
    ctx.fillText(abilityText, x + w - 5 - Math.ceil(ctx.measureText(abilityText).width), y + 21);
  }
  if (chipText || keep.length) {
    ctx.font = '6px monospace';
    let cx = x + 4;
    if (chipText) {
      ctx.fillStyle = PAL.dark;
      ctx.fillRect(cx, y + 29, chipW, 7);
      ctx.fillStyle = PAL.white;
      ctx.fillText(chipText, cx + 2, y + 30);
      cx += chipW + 2;
    }
    for (const m of keep) {
      ctx.fillStyle = m.up ? PAL.grn : PAL.red;
      ctx.beginPath();
      if (m.up) { ctx.moveTo(cx + 2.5, y + 29); ctx.lineTo(cx, y + 33); ctx.lineTo(cx + 5, y + 33); }
      else { ctx.moveTo(cx, y + 29); ctx.lineTo(cx + 5, y + 29); ctx.lineTo(cx + 2.5, y + 33); }
      ctx.closePath(); ctx.fill();
      ctx.fillText(m.k, cx + 7, y + 29);
      cx += markW(m);
    }
  }
}

/* ---------------- the catch animation: throw, wobble, click or burst -------------- */

function catchProgress() {
  if (!catchAnim) return null;
  const t = catchAnim.t;
  if (t < CATCH_THROW) return { stage: 'throw', p: t / CATCH_THROW, targetId: catchAnim.targetId };
  const after = t - CATCH_THROW;
  const shakes = (catchAnim.shakes || 0) * CATCH_SHAKE;
  if (after < shakes) {
    return {
      stage: 'shake', targetId: catchAnim.targetId,
      i: Math.floor(after / CATCH_SHAKE), p: (after % CATCH_SHAKE) / CATCH_SHAKE,
    };
  }
  return { stage: 'open', targetId: catchAnim.targetId, p: Math.min(1, (after - shakes) / CATCH_OPEN) };
}

/* The Capture Ball, drawn in code like everything else. `rot` tips it from its base. */
function drawBall(ctx, x, y, rot, scale) {
  scale = scale || 1;
  const R = 8 * scale;
  ctx.save();
  ctx.translate(x, y + R * 0.6);
  if (rot) ctx.rotate(rot);
  ctx.translate(0, -R * 0.6);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = PAL.white; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, Math.PI, 0); ctx.clip();
  ctx.fillStyle = PAL.red; ctx.fillRect(-R, -R, R * 2, R);   // upper half
  ctx.restore();
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(-R, -Math.max(1, R * 0.16), R * 2, Math.max(2, R * 0.32)); // the band
  ctx.beginPath(); ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = Math.max(1, 1.5 * scale); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, Math.max(1.5, R * 0.3), 0, Math.PI * 2);
  ctx.fillStyle = PAL.white; ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function drawSparks(ctx, x, y, p) {
  const n = 6, d = 6 + p * 16;
  ctx.fillStyle = PAL.yell;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.4;
    const sx = Math.round(x + Math.cos(a) * d);
    const sy = Math.round(y + Math.sin(a) * d);
    ctx.fillRect(sx - 1, sy - 1, 3, 3);
  }
}

function drawCatch(ctx, cp) {
  if (!cp) return;
  if (cp.stage === 'throw') {
    // an arc across the screen, growing slightly as it travels away from us
    const p = cp.p;
    const x = BALL_START.x + (BALL_END.x - BALL_START.x) * p;
    const y = BALL_START.y + (BALL_END.y - BALL_START.y) * p - Math.sin(Math.PI * p) * 26;
    drawBall(ctx, x, y, p * Math.PI * 3, 0.55 + 0.45 * p);
    return;
  }
  const x = BALL_END.x, y = BALL_END.y;
  if (cp.stage === 'shake') {
    // one wobble per shake the engine rolled — 1-3 means it broke free, 4 means caught
    const wobble = Math.sin(cp.p * Math.PI) * ((cp.i % 2) ? -0.5 : 0.5);
    const hop = Math.sin(cp.p * Math.PI) * 2;
    drawBall(ctx, x, y - hop, wobble, 1);
    return;
  }
  if (catchAnim.success) {
    drawBall(ctx, x, y, 0, 1);
    if (cp.p > 0.2) drawSparks(ctx, x, y, cp.p);
  } else {
    // it burst open — a shockwave ring, and the critter comes back out
    if (cp.p < 0.55) drawBall(ctx, x, y, 0, 1);
    if (cp.p < 1) {
      ctx.strokeStyle = PAL.white; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 5 + cp.p * 20, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

export function draw(ctx) {
  if (!state) return;
  // backdrop
  ctx.fillStyle = PAL.ice; ctx.fillRect(0, 0, VIEW_W, 96);
  ctx.fillStyle = PAL.lgrn; ctx.fillRect(0, 96, VIEW_W, VIEW_H - 96);
  ctx.fillStyle = PAL.teal;
  ctx.beginPath(); ctx.ellipse(64, 98, 46, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(172, 56, 42, 12, 0, 0, Math.PI * 2); ctx.fill();

  // weather banner: a small pill in the top-right, behind nothing important
  const wthr = state.field && state.field.weather;
  if (wthr) {
    const label = wthr.id === 'heatshimmer' ? 'HEAT SHIMMER'
      : (wthr.id === 'cloudburst' ? 'CLOUDBURST'
        : String(wthr.id || '').toUpperCase().replace(/_/g, ' '));
    ctx.font = '6px monospace';
    const pw = Math.ceil(ctx.measureText(label).width) + 6;
    const px = 234 - pw;
    ctx.fillStyle = PAL.dark;
    ctx.fillRect(px, 2, pw, 10);
    ctx.fillStyle = PAL.white;
    ctx.textBaseline = 'top';
    ctx.fillText(label, px + 3, 4);
  }

  const me = activeOf(0), foe = activeOf(1);
  const cp = catchProgress();
  const SPR_W = 16; // critter grids are 8 cells wide at scale 2
  const drawMon = (c, x, y, flip, force) => {
    if (!c) return;
    const f = fx[c.id] || {};
    const shk = f.shake > 0 ? ((Math.floor(f.shake / 40) % 2) ? 2 : -2) : 0;
    const gx = x + shk, gy = y;
    if (c.fainted && !force) return;
    ctx.save();
    if (flip) { ctx.translate(gx + 24, gy); ctx.scale(-1, 1); drawSprite(ctx, SPRITES[c.speciesId] || SPRITES.sproutle, PAL, 0, 0, 2); }
    else drawSprite(ctx, SPRITES[c.speciesId] || SPRITES.sproutle, PAL, gx + (32 - SPR_W) / 2, gy, 2);
    ctx.restore();
    if (f.flash > 0) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = PAL.white;
      ctx.fillRect(gx, gy, 32, 32);
      ctx.globalAlpha = 1;
    }
  };
  // the wild critter is marked fainted the instant a catch succeeds, but it must stay
  // on screen through the throw and pop back out if the catch fails
  const inBall = cp && foe && cp.targetId === foe.id &&
    (cp.stage === 'shake' || (cp.stage === 'open' && catchAnim.success));
  if (!inBall) drawMon(foe, 156, 24, false, !!cp);
  drawMon(me, 30, 62, true);
  drawCatch(ctx, cp);
  // once the critter is inside the ball its HP box must not sit there as if it were still out:
  // fade it out over the first ~100ms of the wobble, and fade it straight back in on a broken catch
  if (foe) {
    let a = 1;
    if (inBall) a = (cp.stage === 'shake' && cp.i === 0) ? 1 - 0.8 * Math.min(1, cp.p * 3) : 0.2;
    ctx.globalAlpha = a;
    statBox(ctx, foe, 8, 6, 96, true);
    ctx.globalAlpha = 1;
  }
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
