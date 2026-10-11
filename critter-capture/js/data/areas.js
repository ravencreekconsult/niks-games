/* Critter Capture — world data: two maps (town + route), warps, encounters.
   Maps are DATA: rows of tile codes + a legend. 24x18 town, 28x20 route. */

export const LEGEND = {
  '.': { tile: 'grass' },
  '=': { tile: 'path' },
  'g': { tile: 'tall', encounter: true },
  '#': { tile: 'wall', solid: true },
  'T': { tile: 'tree', solid: true },
  '~': { tile: 'water', solid: true },
  'r': { tile: 'roof', solid: true },
  'h': { tile: 'hwall', solid: true },
  'D': { tile: 'door', solid: true },
  'f': { tile: 'flower' },
  'o': { tile: 'rock', solid: true },
  'S': { tile: 'sign', solid: true },
  'F': { tile: 'fence', solid: true },
};

/* --- Rivenmoor (town), 24 wide x 18 tall --- */
const TOWN_ROWS = [
  '########################',
  '#......................#',
  '#..rrrr........rrrr....#',
  '#..rrrr........rrrr....#',
  '#..hDh.........hDh.....#',
  '#......................#',
  '#....==========..........#',
  '#....=......=..........#',
  '#..rr=......=...ff.....#',
  '#..rr=..~~..=...ff.....#',
  '#..hD=..~~..=..........#',
  '#....=......=====......#',
  '#....======....=.......#',
  '#..............=...S...#',
  '#....ff........=======.=',
  '#......................#',
  '#...........F....F.....#',
  '########################',
];

/* --- Route 1, 28 wide x 20 tall --- */
const ROUTE_ROWS = [
  '############################',
  '#..........................#',
  '#..TT........TTT...........#',
  '#..........................#',
  '#....gggg......gggg........#',
  '#....gggg......gggg........#',
  '#....gggg......gggg........#',
  '#..........................#',
  '#..........~~~~............#',
  '#..........~~~~............#',
  '#..........................#',
  '#....gggg..................#',
  '#....gggg..................#',
  '#....gggg..................#',
  '============================',
  '#..........................#',
  '#..TTT..........TTT........#',
  '#..........................#',
  '#....S.....................#',
  '############################',
];

export const MAPS = {
  town: {
    id: 'town', name: 'Rivenmoor', w: 24, h: 18,
    rows: TOWN_ROWS,
    legend: LEGEND,
    spawn: { x: 5, y: 13 },
    warps: [
      { x: 23, y: 14, to: 'route1', tx: 1, ty: 14 },
    ],
    encounters: null,
  },
  route1: {
    id: 'route1', name: 'Wander Route', w: 28, h: 20,
    rows: ROUTE_ROWS,
    legend: LEGEND,
    spawn: { x: 1, y: 14 },
    warps: [
      { x: 0, y: 14, to: 'town', tx: 22, ty: 14 },
    ],
    encounters: {
      rate: 0.13,
      table: [
        { speciesId: 'sproutle', min: 2, max: 4, weight: 3 },
        { speciesId: 'cinderpup', min: 2, max: 4, weight: 3 },
        { speciesId: 'zephyrik', min: 2, max: 4, weight: 2 },
        { speciesId: 'cragmite', min: 3, max: 5, weight: 2 },
        { speciesId: 'voltling', min: 3, max: 5, weight: 1 },
        { speciesId: 'gloamkitty', min: 4, max: 6, weight: 1 },
      ],
    },
  },
};

/** Parse a map into a grid of legend entries; validates row widths. */
export function parseMap(map) {
  const grid = [];
  for (let y = 0; y < map.h; y++) {
    const row = map.rows[y];
    if (!row || row.length !== map.w) {
      throw new Error('Map "' + map.id + '" row ' + y + ' has width ' +
        (row ? row.length : 'none') + ', expected ' + map.w);
    }
    const cells = [];
    for (let x = 0; x < map.w; x++) {
      const def = map.legend[row[x]];
      if (!def) throw new Error('Map "' + map.id + '" unknown tile code "' + row[x] + '" at ' + x + ',' + y);
      cells.push(def);
    }
    grid.push(cells);
  }
  return grid;
}
