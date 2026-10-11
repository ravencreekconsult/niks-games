/* Critter Capture — versioned localStorage save. Never crashes if storage
   is unavailable; the game just runs without persisting. */

const KEY = 'critter-capture-save';
export const SAVE_VERSION = 5;

/* Deterministic per-critter identity: a tiny 32-bit string hash drives both
   the IV roll and the nature pick, so the same (speciesId, seed) always
   yields the same critter. No Math.random — identities must be stable. */
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const NATURE_KEYS = ['hardy', 'lonely', 'adamantine', 'modest', 'timid', 'calm', 'brash', 'reckless', 'stoic', 'stubborn', 'guarded', 'rooted', 'steadfast', 'dreamy', 'fervent', 'deliberate', 'curious', 'patient', 'grounded', 'watchful', 'placid', 'skittish', 'lively', 'restless', 'eager'];
const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export function rollIdentity(speciesId, seed) {
  let h = hash32(String(speciesId) + '|' + String(seed));
  const ivs = {};
  for (const k of STAT_KEYS) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    ivs[k] = h % 32;
  }
  h = Math.imul(h ^ (h >>> 15), 0x2545f491) >>> 0;
  return { ivs, nature: NATURE_KEYS[h % NATURE_KEYS.length] };
}

function zeroEvs() {
  return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

export function newSave() {
  const start = rollIdentity('sproutle', 'starter');
  return {
    version: SAVE_VERSION,
    map: 'town',
    x: 5, y: 13, dir: 'down',
    party: [
      { speciesId: 'sproutle', level: 5, xp: 0, hp: null,
        ivs: start.ivs, evs: zeroEvs(), nature: start.nature },
    ],
    dex: { seen: [], caught: [] },
    flags: {},
    money: 0,
    bag: {},
    time: 480,
  };
}

/* Migration chain: each step upgrades exactly one version. Add real
   migrations here as the schema evolves; older saves are carried forward,
   never wiped. */
const MIGRATIONS = {
  // 1 -> 2: give every party member a real identity (ivs / evs / nature).
  // Safe to run on a save that already has any of these fields.
  1: function (data) {
    if (!data || !Array.isArray(data.party)) return data;
    data.party.forEach(function (m, i) {
      if (!m) return;
      if (!m.ivs || typeof m.ivs !== 'object') {
        m.ivs = rollIdentity(m.speciesId, 'mig' + i).ivs;
      }
      if (!m.evs || typeof m.evs !== 'object') m.evs = zeroEvs();
      if (!m.nature) m.nature = rollIdentity(m.speciesId, 'mig' + i).nature;
    });
    return data;
  },
  // 2 -> 3: add the world-flag store NPC dialogue remembers you by.
  // Touches ONLY flags; party, dex and position pass through untouched.
  2: function (data) {
    if (!data || typeof data !== 'object') return data;
    if (!data.flags || typeof data.flags !== 'object' || Array.isArray(data.flags)) {
      data.flags = {};
    }
    return data;
  },
  // 3 -> 4: add the item bag (an { itemId: count } object).
  // Touches ONLY bag; party, dex, flags, money and position pass through untouched.
  3: function (data) {
    if (!data || typeof data !== 'object') return data;
    if (!data.bag || typeof data.bag !== 'object' || Array.isArray(data.bag)) {
      data.bag = {};
    }
    return data;
  },
  // 4 -> 5: add the in-game clock (minutes since midnight, 0..1439).
  // Touches ONLY time; party, dex, flags, money, bag and position pass through untouched.
  4: function (data) {
    if (!data || typeof data !== 'object') return data;
    if (typeof data.time !== 'number' || !isFinite(data.time)) {
      data.time = 480;
    }
    return data;
  },
};

export function migrate(data) {
  let v = typeof data.version === 'number' ? data.version : 0;
  if (v > SAVE_VERSION) return null; // save from a newer build: refuse
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    data = step ? step(data) : data;
    v += 1;
    data.version = v;
  }
  return data;
}

export function saveGame(data) {
  try {
    data.version = SAVE_VERSION;
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; } // private mode / full quota: keep playing
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    if (!migrated || !migrated.party || !migrated.party.length) return null;
    return migrated;
  } catch (e) { return null; }
}
