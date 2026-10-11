/* =========================================================================
   Critter Capture — battle rules (pure, deterministic, isomorphic)
   -------------------------------------------------------------------------
   This ONE file is the single source of truth for battle rules. It is loaded:
     (a) in the browser for single-player battles, and
     (b) inside the Cloudflare Worker for co-op multiplayer battles.

   HARD RULES for this file:
   - NO DOM, no document/window/fetch/timers. No Date.now, no Math.random.
   - All randomness comes from the seeded PRNG below (mulberry32 step).
   - Deterministic: same seed + same inputs => same output, every time.
   - Self-contained: no imports at all.
   - Works for any number of participants per side (2v2-ready).

   TURN RESOLUTION ORDER (implemented exactly, in resolveTurn):
     1. Missing intents are replaced by defaultIntent.
     2. Invalid intents are discarded and replaced by defaultIntent.
     3. Non-move actions resolve first: switch, item, run, catch.
     4. Move actions ordered by: priority -> effective Speed -> seeded tiebreak.
        ONE single order across ALL participants and both sides.
     5. Each action is skipped if the actor fainted or cannot act.
     6. Pre-move status checks: wake from slumber, thaw from chill,
        static may cost the turn, confusion may cause self-damage.
     7. Accuracy check vs move accuracy and acc/eva stages; miss => continue.
     8. Damage (formula below), then secondary effects.
     9. Faints are emitted as events the moment they happen.
    10. End-of-turn, fixed order: weather tick -> status damage (scorch,
        then blight) -> held-item effects (none active in v1) ->
        counters (weather turns; confusion is consumed pre-move) -> end check.
    11. A side with zero living critters loses. done=true + winnerSide set.

   DAMAGE FORMULA (standard modern form, every floor is a real truncation):
     base = floor( floor( floor(2*level/5 + 2) * power * Atk / Def ) / 50 ) + 2
     Atk/Def = attacker's attacking stat vs defender's defending stat
               (physical pair atk/def, special pair spa/spd), each already
               multiplied by its stat-stage multiplier.
     Modifier chain, IN THIS ORDER, truncating (floor) at each step:
       1. weather  (heatshimmer: ember x1.5, tide x0.5; cloudburst: reverse)
       2. critical hit x1.5 (crit chance 1/16)
       3. random roll x (85+n)/100, n = 0..15 from the seeded PRNG
       4. STAB x1.5 when move type is one of the attacker's types
       5. type effectiveness (product over the defender's types)
       6. scorch halves physical damage dealt by the afflicted critter
       7. final modifiers: ability type boosts, held-item boosts (screens
          are reserved for a later version; no screens exist in v1).
     A move that connects always deals at least 1 damage (unless the
     effectiveness is 0 — then the move simply has no effect).

   STAT CALCULATION:
     HP     = floor((2*base + iv + floor(ev/4)) * level/100) + level + 10
     others = floor((2*base + iv + floor(ev/4)) * level/100) + 5
     then nature: x1.1 raised stat, x0.9 lowered stat (never HP), floored.
     IVs clamped 0..31; EVs clamped 0..252 per stat AND 510 total (trimmed
     deterministically in the fixed stat order hp,atk,def,spa,spd,spe).

   STAT STAGES (-6..+6 on atk/def/spa/spd/spe/acc/eva):
     positive n: multiplier = (2 + n) / 2
     negative n: multiplier = 2 / (2 + |n|)
     Accuracy/evasion: hit chance scales by stageMult(acc)/stageMult(eva).

   STATUS INTERACTIONS (only ONE major status at a time; a new status
   simply fails if one is already present):
     - scorch : end-of-turn damage floor(maxHp/16); physical damage dealt
                is halved. Never expires on its own in v1.
     - blight : end-of-turn damage that escalates: floor(maxHp/16) times
                (1 + turns elapsed since inflicted).
     - static : 25% chance per turn to lose the turn; Speed halved while
                afflicted (affects move order and evasion-free speed only).
     - slumber: skips turns for 1-3 turns (set at infliction), then wakes.
     - chill  : each turn: 25% thaw chance; if not thawed, 40% chance to
                lose the turn. Takes extra ember damage via the type chart
                relationships (frost-type critters are the usual victims;
                ember does not get a bonus multiplier against the chill
                STATUS itself in v1 — documented judgement call).

   CONFUSION (volatile, stacks WITH a major status):
     lasts 2-5 turns; each turn 33% chance to hurt itself instead of acting
     (40-power, typeless, physical, no STAB/weather/roll modifiers).

   REWARDS: xp = round(xpBase * level / 7) per defeated critter, awarded to
   EVERY participant pid on the winning side (co-op consistent). evGains:
   +1 in the defeated critter's highest base stat, per winning pid.
   levelUps is always [] in v1 — the client applies xp to its own growth
   system (documented judgement call; the shape matches the contract).

   TYPE CHART DESIGN NOTES (our own chart, deliberately NOT Pokemon's):
     Themed triangles + counters, 12 types:
       ember > verdant/frost/iron ; tide > ember/stone/iron ;
       verdant > tide/stone/spark ; stone > ember/gale ;
       gale > verdant/wild ; spark > tide/gale ; frost > verdant/gale/wild ;
       shade > mind/wild ; radiance > shade/frost ; iron > frost/stone ;
       wild > mind/tide/radiance ; mind > shade/tide/radiance.
     Immunities are rare (exactly two): wild and shade both do NOTHING to
     iron. Every type has >=2 strengths and is weak to >=2 other types.
   ========================================================================= */

/* =====================================================================
   DATA SECTION — types, chart, moves, abilities, species, items, natures
   Add new content here; abilities need one small function (see ABILITIES).
   ===================================================================== */

export const TYPES = ['ember','tide','verdant','stone','gale','spark','frost','shade','radiance','iron','wild','mind'];

/** attacker type -> { defenderType: multiplier }. Missing entries mean x1. */
export const TYPE_CHART = {
  ember:    { verdant:2, frost:2, iron:2, tide:0.5, stone:0.5, ember:0.5 },
  tide:     { ember:2, stone:2, iron:2, verdant:0.5, tide:0.5, spark:0.5 },
  verdant:  { tide:2, stone:2, spark:2, ember:0.5, verdant:0.5, gale:0.5, frost:0.5 },
  stone:    { ember:2, gale:2, verdant:0.5, iron:0.5 },
  gale:     { verdant:2, wild:2, iron:0.5, stone:0.5, spark:0.5 },
  spark:    { tide:2, gale:2, verdant:0.5, spark:0.5, iron:0.5 },
  frost:    { verdant:2, gale:2, wild:2, ember:0.5, tide:0.5, frost:0.5, iron:0.5 },
  shade:    { mind:2, wild:2, shade:0.5, radiance:0.5, iron:0 },
  radiance: { shade:2, frost:2, radiance:0.5, iron:0.5 },
  iron:     { frost:2, stone:2, ember:0.5, spark:0.5, gale:0.5 },
  wild:     { mind:2, tide:2, radiance:2, wild:0.5, frost:0.5, iron:0 },
  mind:     { shade:2, tide:2, radiance:2, mind:0.5 },
};

/** Product of effectiveness over all of a defender's types. */
export function getTypeEffect(moveType, defTypes) {
  if (!moveType) return 1;
  const row = TYPE_CHART[moveType] || {};
  let m = 1;
  for (const t of (defTypes || [])) m = m * (row[t] !== undefined ? row[t] : 1);
  return m;
}

export const STRUGGLE_ID = '__struggle';

/** Moves. cat: physical | special | status. target: self | one | allOthers.
    acc null = never misses. effects are optional. */
export const MOVES = {
  emberlash:   { name:'Ember Lash',   type:'ember',    cat:'physical', power:40, acc:100, pp:25, pri:0, target:'one' },
  cindercrash: { name:'Cinder Crash', type:'ember',    cat:'physical', power:80, acc:100, pp:15, pri:0, target:'one', effects:{ status:{ id:'scorch', chance:0.1 } } },
  sunspear:    { name:'Sun Spear',    type:'ember',    cat:'special',  power:90, acc:95,  pp:10, pri:0, target:'one' },
  tidepull:    { name:'Tide Pull',    type:'tide',     cat:'special',  power:40, acc:100, pp:25, pri:0, target:'one' },
  riptide:     { name:'Riptide',      type:'tide',     cat:'special',  power:85, acc:100, pp:12, pri:0, target:'one' },
  dewmist:     { name:'Dew Mist',     type:'tide',     cat:'status',   power:0,  acc:null, pp:10, pri:0, target:'self', effects:{ heal:0.5 } },
  vinewhip:    { name:'Vine Whip',    type:'verdant',  cat:'physical', power:45, acc:100, pp:25, pri:0, target:'one' },
  bloombarge:  { name:'Bloom Barge',  type:'verdant',  cat:'physical', power:25, acc:90,  pp:10, pri:0, target:'one', effects:{ multiHit:true } },
  sporecloud:  { name:'Spore Cloud',  type:'verdant',  cat:'status',   power:0,  acc:75,  pp:10, pri:0, target:'one',  effects:{ status:{ id:'slumber', chance:1 } } },
  stonethrow:  { name:'Stone Throw',  type:'stone',    cat:'physical', power:50, acc:100, pp:20, pri:0, target:'one' },
  boulderfall: { name:'Boulder Fall', type:'stone',    cat:'physical', power:90, acc:85,  pp:10, pri:0, target:'one' },
  gustlance:   { name:'Gust Lance',   type:'gale',     cat:'special',  power:60, acc:100, pp:20, pri:1, target:'one' },
  skydance:    { name:'Sky Dance',    type:'gale',     cat:'status',   power:0,  acc:null, pp:20, pri:0, target:'self', effects:{ stages:{ spe:2 } } },
  sparkjolt:   { name:'Spark Jolt',   type:'spark',    cat:'special',  power:45, acc:100, pp:25, pri:0, target:'one', effects:{ status:{ id:'static', chance:0.2 } } },
  thornshock:  { name:'Thorn Shock',  type:'spark',    cat:'special',  power:80, acc:100, pp:12, pri:0, target:'one', effects:{ status:{ id:'static', chance:0.15 } } },
  frostbite:   { name:'Frostbite',    type:'frost',    cat:'special',  power:55, acc:100, pp:20, pri:0, target:'one', effects:{ status:{ id:'chill', chance:0.1 } } },
  glacialhorn: { name:'Glacial Horn', type:'frost',    cat:'physical', power:85, acc:90,  pp:12, pri:0, target:'one' },
  shadowclaw:  { name:'Shadow Claw',  type:'shade',    cat:'physical', power:65, acc:100, pp:18, pri:0, target:'one' },
  gloomsip:    { name:'Gloom Sip',    type:'shade',    cat:'special',  power:60, acc:100, pp:12, pri:0, target:'one', effects:{ drain:0.5 } },
  lightlash:   { name:'Light Lash',   type:'radiance', cat:'special',  power:60, acc:100, pp:20, pri:0, target:'one' },
  dazzleburst: { name:'Dazzle Burst', type:'radiance', cat:'special',  power:90, acc:90,  pp:8,  pri:0, target:'one', effects:{ stages:{ spa:-1 }, chance:0.2 } },
  ironslam:    { name:'Iron Slam',    type:'iron',     cat:'physical', power:80, acc:90,  pp:12, pri:0, target:'one', effects:{ recoil:0.25 } },
  ironhide:    { name:'Iron Hide',    type:'iron',     cat:'status',   power:0,  acc:null, pp:20, pri:0, target:'self', effects:{ stages:{ def:2 } } },
  feralbite:   { name:'Feral Bite',   type:'wild',     cat:'physical', power:70, acc:100, pp:15, pri:0, target:'one' },
  mindpulse:   { name:'Mind Pulse',   type:'mind',     cat:'special',  power:65, acc:100, pp:20, pri:0, target:'one' },
  focuswill:   { name:'Focus Will',   type:'mind',     cat:'status',   power:0,  acc:null, pp:20, pri:0, target:'self', effects:{ stages:{ atk:1, spa:1 } } },
  /* Built-in fallback move, never taught: used when a critter has no PP. */
  __struggle:  { name:'Struggle',     type:null,       cat:'physical', power:40, acc:null, pp:1, pri:0, target:'one', unlimited:true, effects:{ recoil:0.25 } },
};

/**
 * Abilities. Data + small hook functions. Adding ability #13 = one entry
 * here (plus, if new behaviour is needed, one tiny helper). Hooks receive
 * a ctx object: { s, self, ev, msg, roll, applyStatus, raiseStages,
 * heal, setWeather, clearWeather }. Flags (read by the engine):
 *   blockStatus    — this critter cannot gain a major status
 *   typeBoost      — {type, mult} damage boost with that type's moves
 *   priorityBoost  — {type, amt} priority bonus for that type's moves
 */
export const ABILITIES = {
  kindleheart: {
    name:'Kindle Heart', desc:'Summons heat shimmer on entry.',
    hooks:{ onEntry(ctx){ ctx.setWeather('heatshimmer', 5); } },
  },
  stormcall: {
    name:'Storm Call', desc:'Summons cloudburst rain on entry.',
    hooks:{ onEntry(ctx){ ctx.setWeather('cloudburst', 5); } },
  },
  droughtbane: {
    name:'Drought Bane', desc:'Clears any weather on entry.',
    hooks:{ onEntry(ctx){ ctx.clearWeather(); } },
  },
  thornskin: {
    name:'Thorn Skin', desc:'20% chance to scorch attackers that hit it.',
    hooks:{ onHit(ctx){
      if (ctx.attacker && !ctx.attacker.fainted && ctx.roll() < 0.2) ctx.applyStatus(ctx.attacker, 'scorch');
    } },
  },
  stoneguard: {
    name:'Stone Guard', desc:'Defense rises when it is hit.',
    hooks:{ onHit(ctx){ ctx.raiseStages(ctx.self, { def:1 }); } },
  },
  moonmend: {
    name:'Moon Mend', desc:'Heals a little at every turn end.',
    hooks:{ onTurnEnd(ctx){ ctx.heal(ctx.self, Math.max(1, Math.floor(ctx.self.maxHp / 16))); } },
  },
  purehide: {
    name:'Pure Hide', desc:'Cannot be afflicted by any status.', blockStatus:true,
  },
  flameaura: {
    name:'Flame Aura', desc:'Ember moves deal 30% more damage.', typeBoost:{ type:'ember', mult:1.3 },
  },
  riptideheart: {
    name:'Riptide Heart', desc:'Tide moves deal 30% more damage.', typeBoost:{ type:'tide', mult:1.3 },
  },
  galewing: {
    name:'Gale Wing', desc:'Gale moves strike first.', priorityBoost:{ type:'gale', amt:1 },
  },
  laststand: {
    name:'Last Stand', desc:'Once, when HP first drops low, Attack rises sharply.',
    hooks:{ onLowHp(ctx){
      if (!ctx.self.volatile.laststand) { ctx.self.volatile.laststand = true; ctx.raiseStages(ctx.self, { atk:2 }); }
    } },
  },
  greedfang: {
    name:'Greed Fang', desc:'Heals a fraction of damage it deals.',
    hooks:{ onDealDamage(ctx){ if (ctx.damage > 0) ctx.heal(ctx.self, Math.floor(ctx.damage / 8)); } },
  },
};

/** Critter species. learnset: move ids available from that level on. */
export const SPECIES = {
  cinderpup: { name:'Cinderpup', types:['ember'], baseStats:{ hp:45, atk:60, def:40, spa:60, spd:45, spe:65 }, ability:'kindleheart', xpBase:64, catchRate:190,
    learnset:[ { lv:1, id:'emberlash' }, { lv:1, id:'cindercrash' }, { lv:7, id:'focuswill' }, { lv:12, id:'sunspear' } ] },
  brookfin:  { name:'Brookfin', types:['tide'], baseStats:{ hp:55, atk:50, def:55, spa:60, spd:55, spe:50 }, ability:'riptideheart', xpBase:66, catchRate:180,
    learnset:[ { lv:1, id:'tidepull' }, { lv:1, id:'frostbite' }, { lv:8, id:'riptide' }, { lv:13, id:'dewmist' } ] },
  sproutle:  { name:'Sproutle', types:['verdant'], baseStats:{ hp:60, atk:62, def:55, spa:50, spd:55, spe:55 }, ability:'moonmend', xpBase:64, catchRate:190,
    learnset:[ { lv:1, id:'vinewhip' }, { lv:1, id:'sporecloud' }, { lv:8, id:'bloombarge' }, { lv:12, id:'focuswill' } ] },
  cragmite:  { name:'Cragmite', types:['stone'], baseStats:{ hp:50, atk:65, def:75, spa:35, spd:50, spe:35 }, ability:'stoneguard', xpBase:70, catchRate:160,
    learnset:[ { lv:1, id:'stonethrow' }, { lv:1, id:'ironhide' }, { lv:9, id:'boulderfall' }, { lv:14, id:'ironslam' } ] },
  zephyrik:  { name:'Zephyrik', types:['gale'], baseStats:{ hp:55, atk:55, def:45, spa:60, spd:50, spe:75 }, ability:'galewing', xpBase:68, catchRate:170,
    learnset:[ { lv:1, id:'gustlance' }, { lv:1, id:'skydance' }, { lv:9, id:'lightlash' }, { lv:13, id:'frostbite' } ] },
  voltling:  { name:'Voltling', types:['spark'], baseStats:{ hp:50, atk:45, def:45, spa:70, spd:55, spe:80 }, ability:'stormcall', xpBase:68, catchRate:170,
    learnset:[ { lv:1, id:'sparkjolt' }, { lv:1, id:'thornshock' }, { lv:10, id:'focuswill' }, { lv:14, id:'gustlance' } ] },
  gloamkitty:{ name:'Gloamkitty', types:['shade'], baseStats:{ hp:55, atk:60, def:50, spa:65, spd:55, spe:60 }, ability:'greedfang', xpBase:70, catchRate:150,
    learnset:[ { lv:1, id:'shadowclaw' }, { lv:1, id:'mindpulse' }, { lv:9, id:'gloomsip' }, { lv:14, id:'feralbite' } ] },
  lussette:  { name:'Lussette', types:['radiance'], baseStats:{ hp:60, atk:50, def:55, spa:70, spd:60, spe:50 }, ability:'purehide', xpBase:72, catchRate:140,
    learnset:[ { lv:1, id:'lightlash' }, { lv:1, id:'dewmist' }, { lv:10, id:'dazzleburst' }, { lv:14, id:'focuswill' } ] },
};

/** Held items. heldBoost applies in damage step 7; useHeal is an in-battle
    usable item (heals a fraction of max HP). */
export const ITEMS = {
  embercharm: { name:'Ember Charm', heldBoost:{ type:'ember', mult:1.2 } },
  tidecharm:  { name:'Tide Charm',  heldBoost:{ type:'tide', mult:1.2 } },
  ironband:   { name:'Iron Band',   heldBoost:{ cat:'physical', mult:1.1 } },
  healsalve:  { name:'Heal Salve',  useHeal:0.5 },
};

/** Natures: {up, down} stat pair, or null for neutral. */
export const NATURES = {
  hardy:     { up:null,  down:null },
  lonely:    { up:'atk', down:'def' },
  adamantine:{ up:'atk', down:'spa' },
  modest:    { up:'spa', down:'atk' },
  timid:     { up:'spe', down:'atk' },
  calm:      { up:'spd', down:'atk' },
};

/* =====================================================================
   PRNG — mulberry32 single step. Deterministic, state carried in
   state.rngState so turn N+1 continues the exact same stream.
   ===================================================================== */

/** Returns { value in [0,1), state: next rngState }. Never uses Math.random. */
export function nextRandom(rngState) {
  let t = (rngState + 0x6D2B79F5) >>> 0;
  let x = t;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  const value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  return { value, state: t };
}

/* =====================================================================
   STAT CALCULATION
   ===================================================================== */

const STAT_KEYS = ['hp','atk','def','spa','spd','spe'];

function clampIvsEvs(ivsIn, evsIn) {
  const ivs = {}, evs = {};
  let total = 0;
  for (const k of STAT_KEYS) {
    ivs[k] = Math.max(0, Math.min(31, Math.floor(Number(ivsIn && ivsIn[k]) || 0)));
    evs[k] = Math.max(0, Math.min(252, Math.floor(Number(evsIn && evsIn[k]) || 0)));
    total += evs[k];
  }
  for (const k of STAT_KEYS) { // enforce 510 total, deterministically
    if (total <= 510) break;
    const over = total - 510;
    const cut = Math.min(evs[k], over);
    evs[k] -= cut; total -= cut;
  }
  return { ivs, evs };
}

/**
 * calcStats({ baseStats, ivs, evs, level, nature })
 * nature: {up, down} object, a NATURES key string, or null.
 */
export function calcStats(opts) {
  const base = opts.baseStats;
  const level = Math.max(1, Math.min(100, Math.floor(Number(opts.level) || 1)));
  const { ivs, evs } = clampIvsEvs(opts.ivs, opts.evs);
  let nat = opts.nature || null;
  if (typeof nat === 'string') nat = NATURES[nat] || null;
  const out = {};
  for (const k of STAT_KEYS) {
    const raw = Math.floor((2 * base[k] + ivs[k] + Math.floor(evs[k] / 4)) * level / 100);
    let v = (k === 'hp') ? raw + level + 10 : raw + 5;
    if (k !== 'hp' && nat) {
      if (nat.up === k) v = Math.floor(v * 1.1);
      else if (nat.down === k) v = Math.floor(v * 0.9);
    }
    out[k] = Math.max(1, v);
  }
  return out;
}

/** Stat-stage multiplier: positive (2+n)/2, negative 2/(2+|n|). */
export function stageMult(n) {
  n = Math.max(-6, Math.min(6, n | 0));
  return n >= 0 ? (2 + n) / 2 : 2 / (2 + Math.abs(n));
}

/* =====================================================================
   BATTLE FACTORY
   ===================================================================== */

/**
 * createBattle({ seed, teams })
 * teams: array (length 2 in v1) of arrays of member descriptors:
 *   { speciesId, level, pid?, ivs?, evs?, nature?, moves?, ability?, item?, name? }
 * Moves default to the species learnset moves available at that level,
 * capped at 4. The first member of each side starts active.
 * NOTE: onEntry abilities do NOT fire at creation (they fire when a
 * critter becomes active during resolveTurn); fire them client-side if
 * you want entry announcements before turn 1.
 */
export function createBattle({ seed = 1, teams = [] }) {
  const combatants = [];
  teams.forEach((team, side) => {
    (team || []).forEach((m, slot) => {
      const sp = SPECIES[m && m.speciesId];
      if (!sp) return; // skip invalid entries silently
      const level = Math.max(1, Math.min(100, Math.floor(Number(m.level) || 5)));
      const learned = (sp.learnset || []).filter(e => e.lv <= level).map(e => e.id).slice(0, 4);
      const moveIds = (m.moves && m.moves.length ? m.moves : learned).slice(0, 4);
      const moves = moveIds.filter(id => MOVES[id]).map(id => ({ id, pp: MOVES[id].pp, maxPp: MOVES[id].pp }));
      const stats = calcStats({ baseStats: sp.baseStats, ivs: m.ivs, evs: m.evs, level, nature: m.nature });
      combatants.push({
        id: 'c' + side + '_' + slot,
        pid: (m.pid !== undefined ? m.pid : side),
        side, slot,
        active: slot === 0,
        speciesId: m.speciesId, level,
        name: m.name || sp.name,
        maxHp: stats.hp, hp: stats.hp,
        stats,
        baseStats: sp.baseStats, ivs: {}, evs: {}, nature: m.nature || null,
        stages: { atk:0, def:0, spa:0, spd:0, spe:0, acc:0, eva:0 },
        status: null, statusTurns: 0,
        moves,
        ability: m.ability || sp.ability,
        item: m.item || null,
        fainted: false, caught: false,
        volatile: {},
      });
    });
  });
  return { turn: 0, rngState: seed, seed, field: { weather: null, turnCount: 0 }, combatants };
}

/* =====================================================================
   DEFAULT INTENT — must ALWAYS return something usable.
   ===================================================================== */

/**
 * defaultIntent({ state, pid }) -> intent
 * ALWAYS returns a usable intent object for ANY state, and NEVER throws:
 *  - if pid has a combatant (living and active preferred), return its best
 *    usable move (highest power with PP left), or Struggle when it has no
 *    move with PP > 0 (or no moves at all);
 *  - a fainted or otherwise unable-to-act combatant still yields a
 *    syntactically valid Struggle intent (the resolver skips fainted
 *    actors, so this is safe for the server's idle-player auto-submit);
 *  - only a pid with NO combatant at all yields { kind:'skip' }.
 */
export function defaultIntent({ state, pid }) {
  try {
    const all = ((state && state.combatants) || []).filter(c => c && c.pid === pid);
    const c = all.find(x => !x.fainted && x.active !== false)
           || all.find(x => !x.fainted)
           || all[0];
    if (!c) return { pid, actorId: null, kind: 'skip' };
    const usable = (c.moves || [])
      .filter(m => m && m.pp > 0 && MOVES[m.id] && !MOVES[m.id].unlimited)
      .sort((a, b) => (MOVES[b.id].power || 0) - (MOVES[a.id].power || 0));
    const moveId = usable.length ? usable[0].id : STRUGGLE_ID;
    const foes = ((state.combatants) || []).filter(o => o && o.side !== c.side && !o.fainted);
    const targetId = (MOVES[moveId] && MOVES[moveId].target === 'self')
      ? c.id
      : (foes[0] ? foes[0].id : c.id);
    return { pid, actorId: c.id, kind: 'move', moveId, targetId };
  } catch (e) {
    return { pid, actorId: null, kind: 'skip' };
  }
}

/* =====================================================================
   TURN RESOLVER
   ===================================================================== */

/**
 * resolveTurn({ state, intents, participants, seed })
 *   intents:      array of { pid, actorId, kind:'move'|'switch'|'item'|'run'|'catch'|'skip', moveId, targetId, itemId, toId }
 *   participants: metadata list of human participants (informational in v1;
 *                 idle humans are covered by defaultIntent substitution).
 *   seed:         numeric seed used when state.rngState is absent.
 * Returns { state, events, rewards, done, winnerSide }.
 * NEVER throws: bad intents are replaced by defaults; an internal error is
 * reported as a message event and the turn still resolves.
 */
export function resolveTurn({ state, intents = [], participants = [], seed = 1 }) {
  const ev = [];
  let s;
  try {
    s = JSON.parse(JSON.stringify(state || {})); // pure: never mutate input
  } catch (e) {
    s = { turn: 0, field: { weather: null, turnCount: 0 }, combatants: [] };
  }
  if (!Array.isArray(s.combatants)) s.combatants = [];
  if (!s.field) s.field = { weather: null, turnCount: 0 };
  if (s.field.weather === undefined) s.field.weather = null;

  let rng = (typeof s.rngState === 'number') ? s.rngState : (typeof seed === 'number' ? seed : 1);
  const roll = () => { const r = nextRandom(rng); rng = r.state; return r.value; };
  const msg = (text) => ev.push({ t:'message', text });

  const finish = (winnerSide, done) => {
    s.rngState = rng;
    const rewards = (done && winnerSide !== null && winnerSide !== undefined) ? computeRewards(s, winnerSide) : {};
    if (done) ev.push({ t:'end', winnerSide: (winnerSide === undefined ? null : winnerSide) });
    return { state: s, events: ev, rewards, done: !!done, winnerSide: (done ? (winnerSide === undefined ? null : winnerSide) : null) };
  };

  try {
    s.turn = (s.turn | 0) + 1;
    s.field.turnCount = (s.field.turnCount | 0) + 1;

    /* ---- shared helpers (closures over s / ev / roll / msg) ---- */

    const living = (side) => s.combatants.filter(c => c.side === side && !c.fainted);
    const oppAlive = (c) => s.combatants.find(o => o.side !== c.side && !o.fainted && o.active !== false) || null;

    const effStat = (c, stat) => {
      let v = c.stats[stat] * stageMult(c.stages[stat] || 0);
      if (stat === 'spe' && c.status === 'static') v = v * 0.5;
      return Math.max(1, Math.floor(v));
    };

    /* Every ability hook gets the FULL documented ctx contract (see the
       ABILITIES comment): { s, self, ev, msg, roll, applyStatus,
       raiseStages, heal, setWeather, clearWeather } + per-hook extras. */
    const ctxFor = (extra) => Object.assign({
      s, ev, msg, roll, applyStatus, raiseStages, heal, setWeather, clearWeather,
    }, extra || {});
    const fireEntry = (c) => {
      const ab = ABILITIES[c.ability];
      if (ab && ab.hooks && ab.hooks.onEntry) ab.hooks.onEntry(ctxFor({ self:c }));
    };
    const fireOnHit = (target, attacker, mv, dealt) => {
      const ab = ABILITIES[target.ability];
      if (ab && ab.hooks && ab.hooks.onHit) ab.hooks.onHit(ctxFor({ self:target, attacker, move:mv, damage:dealt }));
    };
    const fireOnDealDamage = (attacker, target, dealt) => {
      const ab = ABILITIES[attacker.ability];
      if (ab && ab.hooks && ab.hooks.onDealDamage) ab.hooks.onDealDamage(ctxFor({ self:attacker, target, damage:dealt }));
    };
    const fireOnTurnEnd = (c) => {
      const ab = ABILITIES[c.ability];
      if (ab && ab.hooks && ab.hooks.onTurnEnd) ab.hooks.onTurnEnd(ctxFor({ self:c }));
    };
    const fireOnLowHp = (c) => {
      const ab = ABILITIES[c.ability];
      if (ab && ab.hooks && ab.hooks.onLowHp && !c.volatile.lowFired && c.hp > 0 && c.hp * 3 <= c.maxHp) {
        c.volatile.lowFired = true;
        ab.hooks.onLowHp(ctxFor({ self:c }));
      }
    };

    const applyStatus = (target, status) => {
      if (!target || target.fainted || !status) return false;
      if (target.status) return false; // only one major status at a time
      const ab = ABILITIES[target.ability];
      if (ab && ab.blockStatus) { msg(target.name + ' shrugged it off!'); return false; }
      target.status = status;
      target.statusTurns = (status === 'slumber') ? 1 + Math.floor(roll() * 3) : 0;
      ev.push({ t:'status', targetId:target.id, status });
      const verb = { scorch:'was scorched!', blight:'was blighted!', static:'went static!', slumber:'fell into a deep slumber!', chill:'was chilled to the bone!' };
      msg(target.name + ' ' + (verb[status] || 'was afflicted!'));
      return true;
    };

    const clearStatus = (target) => {
      if (target.status) { ev.push({ t:'statusEnd', targetId:target.id, status:target.status }); target.status = null; target.statusTurns = 0; }
    };

    const raiseStages = (target, stages) => {
      for (const k of Object.keys(stages)) {
        const before = target.stages[k] || 0;
        const after = Math.max(-6, Math.min(6, before + stages[k]));
        if (after !== before) {
          target.stages[k] = after;
          ev.push({ t:'stage', targetId:target.id, stat:k, delta:after - before });
          msg(target.name + "'s " + k + (stages[k] > 0 ? ' rose!' : ' fell!'));
        }
      }
    };

    /** Returns the ACTUAL hp gained (integer, clamped to maxHp); 0 on a
        fainted target or a non-positive request. Emits a 'heal' event with
        hpAfter so clients never recompute HP. */
    const heal = (target, amount) => {
      if (!target || target.fainted) return 0;
      amount = Math.floor(Number(amount) || 0);
      if (!(amount > 0)) return 0;
      const before = target.hp;
      target.hp = Math.min(target.maxHp, before + amount);
      const gained = target.hp - before;
      if (gained > 0) ev.push({ t:'heal', targetId:target.id, amount: gained, hpAfter: target.hp });
      return gained;
    };

    const setWeather = (id, turns) => {
      s.field.weather = { id, turnsLeft: turns };
      ev.push({ t:'weather', weather:id, turnsLeft:turns });
      msg(id === 'heatshimmer' ? 'Heat shimmer fills the air!' : 'Clouds burst and rain pours down!');
    };
    const clearWeather = () => {
      if (s.field.weather) { s.field.weather = null; ev.push({ t:'weather', weather:null }); msg('The weather calmed.'); }
    };

    const faint = (c) => {
      c.fainted = true; c.hp = 0; c.status = null; c.statusTurns = 0; c.volatile = {};
      ev.push({ t:'faint', targetId:c.id });
      msg(c.name + ' fainted!');
      autoSend();
    };

    const autoSend = () => {
      for (const side of [0, 1]) {
        const alive = living(side);
        if (alive.length && !alive.some(c => c.active !== false)) {
          const next = alive[0];
          next.active = true;
          msg(next.name + ' leapt into battle!');
          fireEntry(next);
        }
      }
    };

    const applyDamage = (attacker, target, amount, info) => {
      amount = Math.max(0, Math.floor(amount));
      target.hp = Math.max(0, target.hp - amount);
      ev.push({ t:'damage', targetId:target.id, amount, hpAfter:target.hp, effectiveness:(info && info.effectiveness) || 1, crit:!!(info && info.crit) });
      if (amount > 0) msg(target.name + ' took ' + amount + ' damage.');
      if (target.hp === 0) { faint(target); }
      else { fireOnHit(target, attacker, info && info.move, amount); fireOnLowHp(target); }
    };

    /* ---- damage core ---- */

    const computeDamage = (mv, atkC, defC) => {
      if (!mv.power) return { dmg:0, eff:1, crit:false };
      const physical = mv.cat === 'physical';
      const atk = effStat(atkC, physical ? 'atk' : 'spa');
      const def = effStat(defC, physical ? 'def' : 'spd');
      const lvlTerm = Math.floor(2 * atkC.level / 5 + 2);
      let dmg = Math.floor(Math.floor(lvlTerm * mv.power * atk / Math.max(1, def)) / 50) + 2;
      // 1. weather
      if (s.field.weather && mv.type) {
        const w = s.field.weather.id;
        if (w === 'heatshimmer') { if (mv.type === 'ember') dmg = Math.floor(dmg * 1.5); else if (mv.type === 'tide') dmg = Math.floor(dmg * 0.5); }
        if (w === 'cloudburst')  { if (mv.type === 'tide')  dmg = Math.floor(dmg * 1.5); else if (mv.type === 'ember') dmg = Math.floor(dmg * 0.5); }
      }
      // 2. critical hit
      const crit = roll() < (1 / 16);
      if (crit) dmg = Math.floor(dmg * 1.5);
      // 3. random roll 85..100
      dmg = Math.floor(dmg * (85 + Math.floor(roll() * 16)) / 100);
      // 4. STAB
      const sp = SPECIES[atkC.speciesId];
      if (mv.type && sp && sp.types.indexOf(mv.type) !== -1) dmg = Math.floor(dmg * 1.5);
      // 5. type effectiveness
      const dsp = SPECIES[defC.speciesId];
      const eff = getTypeEffect(mv.type, dsp ? dsp.types : []);
      dmg = Math.floor(dmg * eff);
      // 6. scorch halves physical damage dealt
      if (physical && atkC.status === 'scorch') dmg = Math.floor(dmg * 0.5);
      // 7. final modifiers: ability type boost, held item
      const ab = ABILITIES[atkC.ability];
      if (ab && ab.typeBoost && ab.typeBoost.type === mv.type) dmg = Math.floor(dmg * ab.typeBoost.mult);
      const item = atkC.item && ITEMS[atkC.item];
      if (item && item.heldBoost) {
        const hb = item.heldBoost;
        if ((hb.type && hb.type === mv.type) || (hb.cat && hb.cat === mv.cat)) dmg = Math.floor(dmg * hb.mult);
      }
      if (eff === 0) return { dmg:0, eff:0, crit };
      return { dmg: Math.max(1, dmg), eff, crit };
    };

    const hitTarget = (actor, target, mv) => {
      const first = computeDamage(mv, actor, target);
      if (first.eff === 0) { msg('It has no effect on ' + target.name + '...'); return 0; }
      const hits = (mv.effects && mv.effects.multiHit) ? 2 + Math.floor(roll() * 4) : 1;
      let dealt = 0, landed = 0;
      for (let h = 0; h < hits; h++) {
        if (target.fainted) break;
        const one = computeDamage(mv, actor, target);
        if (one.eff === 0) break;
        applyDamage(actor, target, one.dmg, { effectiveness: one.eff, crit: one.crit, move: mv });
        if (one.eff >= 2) msg("It's super effective!");
        else if (one.eff <= 0.5) msg("It's not very effective...");
        dealt += one.dmg; landed++;
      }
      if (landed > 1) msg('Hit ' + landed + ' times!');
      return dealt;
    };

    /* ---- non-move actions ---- */

    const doSwitch = (c, it) => {
      const to = s.combatants.find(x => x.id === it.toId);
      c.active = false; to.active = true;
      ev.push({ t:'switch', pid:c.pid, side:c.side, outId:c.id, inId:to.id });
      msg(to.name + ' leapt in!');
      fireEntry(to);
    };

    const useItem = (c, it) => {
      const item = ITEMS[it.itemId];
      if (item && item.useHeal) {
        const amount = Math.floor(c.maxHp * item.useHeal);
        ev.push({ t:'message', text: c.name + ' used ' + item.name + '.' });
        heal(c, amount);
      }
    };

    const doCatch = (c, it) => {
      const target = s.combatants.find(x => x.id === it.targetId);
      if (!target || target.fainted) { msg('Nothing to capture there.'); return false; }
      const rate = (SPECIES[target.speciesId] && SPECIES[target.speciesId].catchRate) || 150;
      const p = Math.min(0.9, Math.max(0.05, ((3 * target.maxHp - 2 * target.hp) / (3 * target.maxHp)) * (rate / 255)));
      const r = roll();
      const success = r < p;
      const shakes = success ? 4 : Math.min(3, Math.floor(r / 0.25));
      ev.push({ t:'catch', targetId:target.id, success, shakes });
      if (success) {
        target.caught = true; target.fainted = true; target.hp = 0;
        target.status = null; target.volatile = {};
        msg('Gotcha! ' + target.name + ' was captured!');
      } else {
        msg(target.name + ' broke free!');
      }
      return success;
    };

    /* ---- move execution ---- */

    const movePriorityFor = (c, mv) => {
      let p = mv.pri || 0;
      const ab = ABILITIES[c.ability];
      if (ab && ab.priorityBoost && mv.type === ab.priorityBoost.type) p += ab.priorityBoost.amt;
      return p;
    };

    const executeMove = (actor, intent) => {
      if (actor.fainted) return;
      const mv = (intent.moveId === STRUGGLE_ID) ? MOVES[STRUGGLE_ID] : (MOVES[intent.moveId] || MOVES[STRUGGLE_ID]);

      // pre-move status gates
      if (actor.status === 'slumber') {
        actor.statusTurns--;
        if (actor.statusTurns <= 0) { clearStatus(actor); msg(actor.name + ' woke up!'); }
        else { msg(actor.name + ' is fast asleep.'); return; }
      }
      if (actor.status === 'chill') {
        if (roll() < 0.25) { clearStatus(actor); msg(actor.name + ' thawed out!'); }
        else if (roll() < 0.4) { msg(actor.name + ' is shivering too hard to move!'); return; }
      }
      if (actor.status === 'static') {
        if (roll() < 0.25) { msg(actor.name + ' crackled with static and could not move!'); return; }
      }
      const conf = actor.volatile.confusion | 0;
      if (conf > 0) {
        actor.volatile.confusion = conf - 1;
        if (roll() < 0.33) {
          msg(actor.name + ' is confused and hurt itself!');
          const lvl = Math.floor(2 * actor.level / 5 + 2);
          let d = Math.floor(Math.floor(lvl * 40 * actor.stats.atk / Math.max(1, actor.stats.def)) / 50) + 2;
          applyDamage(actor, actor, Math.max(1, d), { effectiveness:1, crit:false, move:null });
          return;
        }
        if (actor.volatile.confusion === 0) msg(actor.name + ' snapped out of confusion!');
      }

      // onBeforeMove hook (may cancel)
      const ab = ABILITIES[actor.ability];
      if (ab && ab.hooks && ab.hooks.onBeforeMove) {
        const r = ab.hooks.onBeforeMove(ctxFor({ self:actor, move:mv }));
        if (r && r.cancel) { msg(actor.name + ' held back!'); return; }
      }

      // consume PP (struggle has none to consume)
      if (intent.moveId !== STRUGGLE_ID) {
        const slot = actor.moves.find(m => m.id === intent.moveId);
        if (slot && slot.pp > 0) slot.pp--;
      }

      const targetId = mv.target === 'self' ? actor.id : intent.targetId;
      ev.push({ t:'move', actorId:actor.id, moveId:intent.moveId, targetId });
      msg(actor.name + ' used ' + mv.name + '!');

      // resolve targets
      let targets;
      if (mv.target === 'self') targets = [actor];
      else if (mv.target === 'allOthers') targets = s.combatants.filter(o => o.side !== actor.side && !o.fainted && o.active !== false);
      else {
        let t = s.combatants.find(x => x.id === targetId);
        if (!t || t.fainted || t.side === actor.side) t = oppAlive(actor);
        targets = t ? [t] : [];
      }
      if (!targets.length) { msg('But there was no target...'); return; }

      // accuracy (self moves with acc null always hit)
      if (mv.acc !== null && mv.acc !== undefined && mv.target !== 'self') {
        const chance = Math.max(0, Math.min(100, mv.acc * (stageMult(actor.stages.acc || 0) / stageMult(targets[0].stages.eva || 0))));
        if (roll() * 100 >= chance) {
          ev.push({ t:'miss', actorId:actor.id, targetId:targets[0].id });
          msg(actor.name + "'s attack missed!");
          return;
        }
      }

      for (const target of targets) {
        if (target.fainted) continue;
        const fx = mv.effects || {};
        let dealt = 0;
        if (mv.power > 0) dealt = hitTarget(actor, target, mv);
        else {
          // pure status move: it connected (accuracy already checked)
        }
        // secondary effects
        if (fx.drain && dealt > 0) heal(actor, Math.max(1, Math.floor(dealt * fx.drain)));
        if (fx.recoil && dealt > 0) {
          const r = Math.max(1, Math.floor(dealt * fx.recoil));
          msg(actor.name + ' is hurt by recoil!');
          applyDamage(actor, actor, r, { effectiveness:1, crit:false, move:null });
        }
        if (fx.heal) heal(actor, Math.floor(actor.maxHp * fx.heal));
        if (!target.fainted && mv.target !== 'self') {
          if (fx.status && roll() < fx.status.chance) applyStatus(target, fx.status.id);
          if (fx.stages && roll() < (fx.chance !== undefined ? fx.chance : 1)) raiseStages(target, fx.stages);
        }
        if (dealt > 0) {
          fireOnDealDamage(actor, target, dealt);
          if (actor.fainted) break; // recoil faint stops the move
        }
      }
    };

    /* ---- 1 & 2: gather + validate intents ---- */

    const isValidIntent = (c, it) => {
      if (!it || typeof it !== 'object') return false;
      if (it.kind === 'skip') return true;
      if (it.kind === 'move') {
        const mv = MOVES[it.moveId];
        if (!mv) return false;
        if (it.moveId !== STRUGGLE_ID) {
          const slot = c.moves.find(m => m.id === it.moveId);
          if (!slot || slot.pp <= 0) return false;
        }
        if (mv.target === 'self') return true;
        const t = it.targetId ? s.combatants.find(x => x.id === it.targetId) : null;
        return !!t && !t.fainted && t.side !== c.side;
      }
      if (it.kind === 'switch') {
        const to = it.toId ? s.combatants.find(x => x.id === it.toId) : null;
        return !!to && !to.fainted && to.side === c.side && to.pid === c.pid && to.id !== c.id;
      }
      if (it.kind === 'item') {
        const item = ITEMS[it.itemId];
        return !!item && !!item.useHeal;
      }
      if (it.kind === 'run') return true;
      if (it.kind === 'catch') {
        const t = it.targetId ? s.combatants.find(x => x.id === it.targetId) : null;
        return !!t && !t.fainted && t.side !== c.side;
      }
      return false;
    };

    const actions = [];
    for (const c of s.combatants) {
      if (c.fainted || c.active === false) continue;
      let it = intents.find(i => i && i.actorId === c.id && (i.pid === undefined || i.pid === c.pid));
      if (!it) it = intents.find(i => i && i.pid === c.pid);
      if (!isValidIntent(c, it)) it = defaultIntent({ state:s, pid:c.pid });
      if (!it) it = { pid:c.pid, actorId:c.id, kind:'skip' };
      actions.push({ c, it });
    }

    /* ---- 3: non-move actions first ---- */
    const moveActions = [];
    for (const a of actions) {
      const it = a.it;
      if (it.kind === 'switch') doSwitch(a.c, it);
      else if (it.kind === 'item') useItem(a.c, it);
      else if (it.kind === 'run') {
        const ok = roll() < 0.8;
        ev.push({ t:'run', pid:a.c.pid, success:ok });
        if (ok) { msg('Got away safely!'); return finish(null, true); }
      }
      else if (it.kind === 'catch') {
        if (doCatch(a.c, it)) return finish(a.c.side, true);
      }
      else if (it.kind === 'move') moveActions.push(a);
      // 'skip' does nothing
    }

    /* ---- 4: order moves: priority, effective speed, seeded tiebreak ---- */
    const keyed = moveActions.map(a => {
      const mv = (a.it.moveId === STRUGGLE_ID) ? MOVES[STRUGGLE_ID] : (MOVES[a.it.moveId] || MOVES[STRUGGLE_ID]);
      return { a, pri: movePriorityFor(a.c, mv), spe: effStat(a.c, 'spe'), tie: roll() };
    });
    keyed.sort((x, y) => {
      if (y.pri !== x.pri) return y.pri - x.pri;
      if (y.spe !== x.spe) return y.spe - x.spe;
      return x.tie - y.tie;
    });

    /* ---- 5-9: execute moves in order ---- */
    for (const k of keyed) {
      const c = k.a.c;
      if (c.fainted) continue;             // fainted actors skip
      executeMove(c, k.a.it);
    }

    /* ---- 10: end of turn, fixed order ---- */
    // weather tick
    if (s.field.weather) {
      s.field.weather.turnsLeft--;
      if (s.field.weather.turnsLeft <= 0) clearWeather();
    }
    // status damage: scorch first, then blight (combatant order within each)
    for (const c of s.combatants) {
      if (c.fainted || c.status !== 'scorch') continue;
      msg(c.name + ' is hurt by its scorch!');
      applyDamage(null, c, Math.max(1, Math.floor(c.maxHp / 16)), { effectiveness:1, crit:false, move:null });
    }
    for (const c of s.combatants) {
      if (c.fainted || c.status !== 'blight') continue;
      c.statusTurns++;
      const dmg = Math.max(1, Math.floor(c.maxHp / 16) * c.statusTurns);
      msg(c.name + ' is hurt by the worsening blight!');
      applyDamage(null, c, dmg, { effectiveness:1, crit:false, move:null });
    }
    // held-item effects: v1 items are passive boosts only — nothing here.
    // ability onTurnEnd hooks (e.g. Moon Mend)
    for (const c of s.combatants) {
      if (!c.fainted) fireOnTurnEnd(c);
    }
    // counter decrement notes: weather above; slumber counted down pre-move;
    // confusion consumed pre-move; chill/static persist until cured.

    /* ---- 11: battle end? ---- */
    const alive0 = living(0).length, alive1 = living(1).length;
    if (alive0 === 0 && alive1 === 0) return finish(null, true);
    if (alive0 === 0) return finish(1, true);
    if (alive1 === 0) return finish(0, true);
    return finish(null, false);
  } catch (err) {
    ev.push({ t:'message', text:'Internal rules error: ' + (err && err.message ? err.message : String(err)) });
    return finish(null, false);
  }
}

/* ---- rewards ---- */

function computeRewards(s, winnerSide) {
  const rewards = {};
  const winners = {};
  for (const c of s.combatants) {
    if (c.side === winnerSide && !c.fainted) winners[c.pid] = true;
  }
  const defeated = s.combatants.filter(c => c.side !== winnerSide && c.fainted && !c.caught);
  for (const pid of Object.keys(winners)) {
    let xp = 0;
    const evGains = {};
    for (const d of defeated) {
      const sp = SPECIES[d.speciesId] || { xpBase:64, baseStats:{} };
      xp += Math.round((sp.xpBase || 64) * (d.level || 1) / 7);
      let best = 'hp', bestV = -1;
      for (const k of STAT_KEYS) {
        if ((sp.baseStats[k] || 0) > bestV) { bestV = sp.baseStats[k]; best = k; }
      }
      evGains[best] = (evGains[best] || 0) + 1;
    }
    rewards[pid] = { xp, levelUps: [], evGains };
  }
  return rewards;
}
