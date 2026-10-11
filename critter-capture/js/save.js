/* Critter Capture — versioned localStorage save. Never crashes if storage
   is unavailable; the game just runs without persisting. */

const KEY = 'critter-capture-save';
export const SAVE_VERSION = 1;

export function newSave() {
  return {
    version: SAVE_VERSION,
    map: 'town',
    x: 5, y: 13, dir: 'down',
    party: [
      { speciesId: 'sproutle', level: 5, xp: 0, hp: null, nature: 'hardy' },
    ],
    dex: { seen: [], caught: [] },
  };
}

/* Migration chain: each step upgrades exactly one version. Add real
   migrations here as the schema evolves; older saves are carried forward,
   never wiped. */
const MIGRATIONS = {
  // 1 -> 2 placeholder: (data) => { ... return data; }
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
