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
  '#....==========........#',
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

/* --- Frostwood Route (route 2), 28 wide x 20 tall --- */
const ROUTE2_ROWS = [
  '############################',
  '#..........................#',
  '#..TT..........TT..........#',
  '#..........................#',
  '#....ggggg.....ggggg.......#',
  '#....ggggg.....ggggg.......#',
  '#....ggggg.....ggggg.......#',
  '#..........................#',
  '#.........~~~~~............#',
  '#.........~~~~~............#',
  '#..........................#',
  '#...........ggggg..........#',
  '#...........ggggg..........#',
  '#...........ggggg..........#',
  '============================',
  '#..........................#',
  '#..TTT..........TTT........#',
  '#..........................#',
  '#....S.....................#',
  '############################',
];

/* --- Willowbrook (second town), 24 wide x 18 tall --- */
const TOWN2_ROWS = [
  '########################',
  '#......................#',
  '#..rrrrrr......rrrr....#',
  '#..rrrrrr......rrrr....#',
  '#..hhhDhh......hDDh....#',
  '#......................#',
  '#..........====........#',
  '#..........=...........#',
  '#..ff......=......ff...#',
  '#..........=...........#',
  '#..........====........#',
  '#......................#',
  '#..~~~~~~~~............#',
  '#..~~~~~~~~......S.....#',
  '========================',
  '#......................#',
  '#....TT........TT......#',
  '########################',
];

/* --- Willowbrook Healing Centre (interior), 12 wide x 9 tall --- */
const HEAL_ROWS = [
  '############',
  '#..........#',
  '#..........#',
  '#..======..#',
  '#..........#',
  '#..........#',
  '#..........#',
  '#..........#',
  '#####DD#####',
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
    npcs: [
      { x: 8, y: 7, dir: 'down', sprite: 'npcKid', name: 'Mara', flag: 'metMara', lines: [
        'Hi! Welcome to Rivenmoor.',
        'The tall grass on Route 1 is full of wild critters.',
        'A strong team sticks together out there!',
      ], again: [
        'Back again! Say hi to a wild critter for me.',
      ] },
      { x: 16, y: 10, dir: 'down', sprite: 'npcElder', name: 'Old Fen', flag: 'metFen', lines: [
        'Ah, a new critter catcher!',
        'Stand facing someone or a sign, then press the green button.',
        'The pond is deep. Critters love it — people can\'t swim it.',
        'Now, one thing every catcher should know...',
        { ask: 'Want the quick lesson on weakening a critter before you catch it?',
          flagYes: 'fenCoached', flagNo: 'fenDeclined',
          yesLine: 'BATTLE it until its HP bar drops low — THEN throw the pouch. A weak critter stays caught!',
          noLine: 'No rush. Ask me any time and I will gladly repeat it.',
        },
      ], again: {
        check: 'fenCoached',
        ifTrue: [
          'My catching student! Weaken first, then throw — you know the way.',
        ],
        ifFalse: [
          'The lesson still stands, whenever you want it: weaken first, then throw.',
        ],
      } },
    ],
    signs: [
      { x: 19, y: 13, lines: [
        'RIVENMOOR TOWN',
        'Small town, big hearts.',
        'Route 1 is east — watch the tall grass!',
      ] },
    ],
    trainers: [
      { x: 20, y: 14, dir: 'left', sight: 3, sprite: 'npcKid', name: 'Rook', flag: 'beatRook',
        party: [{ speciesId: 'gloamkitty', level: 3 }], reward: 120,
        lines: [
          'Hey! I\'m Rook — best young catcher in town!',
          'My gloamkitty and I have been training ALL morning.',
          'Let\'s see what you\'ve got!',
        ],
        winLine: 'Wow, you\'re strong! Great battle — take this, you earned it.',
        loseLine: 'Told you we practiced! Come back for a rematch any time.' },
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
      { x: 27, y: 14, to: 'town2', tx: 1, ty: 14 },
    ],
    npcs: [
      { x: 3, y: 12, dir: 'down', sprite: 'npcScout', name: 'Scout Pip', flag: 'metPip', lines: [
        'Whoa, hi! I\'m counting critters today.',
        'So far: sproutle, cinderpup... and one gloamkitty!',
        'If your team gets hurt, rest up in town first.',
      ], again: [
        'The gloamkitty count is up to two! What have YOU caught?',
      ] },
    ],
    signs: [],
    trainers: [
      { x: 13, y: 14, dir: 'left', sight: 3, sprite: 'npcScout', name: 'Fenn', flag: 'beatFenn',
        party: [{ speciesId: 'cragmite', level: 4 }, { speciesId: 'gloamkitty', level: 4 }], reward: 200,
        lines: [
          'Hold it right there! You walked right into my lookout.',
          'I\'m Fenn, and my two partners never lose on this road.',
          'Ready? Let\'s have a friendly battle!',
        ],
        winLine: 'That was awesome! You beat BOTH of us — here\'s your prize.',
        loseLine: 'My team pulled through! Rest up and try me again soon.' },
      { x: 8, y: 10, dir: 'down', sight: 2, sprite: 'npcElder', name: 'Roz', flag: 'beatRoz',
        party: [{ speciesId: 'gloamkitty', level: 5 }], reward: 150,
        lines: [
          'A keen eye! You spotted me before I spotted you... almost.',
          'I\'m Roz. I raise one patient little gloamkitty.',
          'Care to test your team against mine?',
        ],
        winLine: 'Splendid! Patience and kindness — that\'s a real catcher. Your prize.',
        loseLine: 'The old trick still works! Come find me again, young catcher.' },
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
      // Nocturnal shift: after dark the diurnal critters sleep and the
      // night ones come out. Levels keep each species' daytime range.
      night: {
        rate: 0.16,
        table: [
          { speciesId: 'gloamkitty', min: 4, max: 6, weight: 3 },
          { speciesId: 'voltling', min: 3, max: 5, weight: 3 },
          { speciesId: 'cragmite', min: 3, max: 5, weight: 2 },
          { speciesId: 'zephyrik', min: 2, max: 4, weight: 1 },
        ],
      },
    },
  },
  town2: {
    id: 'town2', name: 'Willowbrook', w: 24, h: 18,
    rows: TOWN2_ROWS,
    legend: LEGEND,
    spawn: { x: 1, y: 14 },
    warps: [
      { x: 0, y: 14, to: 'route1', tx: 26, ty: 14 },
      { x: 6, y: 4, to: 'heal_centre', tx: 5, ty: 7 },
    ],
    npcs: [
      { x: 5, y: 7, dir: 'down', sprite: 'npcKid', name: 'Bram', flag: 'metBram', lines: [
        'Welcome to Willowbrook!',
        'Our healing centre is free — just walk in and talk to Nurse Hazel.',
        'Route 1 runs east, back to Rivenmoor.',
      ], again: [
        'Nurse Hazel will patch up your whole team. She never charges a coin.',
      ] },
      { x: 12, y: 8, dir: 'left', sprite: 'npcScout', name: 'Mira', flag: 'metMira', shop: true, lines: [
        'Welcome to my little shop!',
        'I sell supplies for tired critters.',
        'Take a look — everything heals a hurt friend right up.',
      ], again: [
        'Back for more supplies? Take a look!',
      ] },
    ],
    signs: [
      { x: 17, y: 13, lines: [
        'WILLOWBROOK TOWN',
        'Tired critters, rest easy.',
        'The healing centre has a green roof — north-west of here.',
      ] },
    ],
    trainers: [],
    encounters: null,
  },
  heal_centre: {
    id: 'heal_centre', name: 'Healing Centre', w: 12, h: 9,
    rows: HEAL_ROWS,
    legend: LEGEND,
    spawn: { x: 5, y: 7 },
    warps: [
      { x: 5, y: 8, to: 'town2', tx: 6, ty: 5 },
      { x: 6, y: 8, to: 'town2', tx: 6, ty: 5 },
    ],
    npcs: [
      { x: 6, y: 2, dir: 'down', sprite: 'npcNurse', name: 'Nurse Hazel', flag: 'metHazel', heal: true, lines: [
        'Welcome to the Willowbrook Healing Centre!',
        'Let me take a look at your whole team...',
        'There — every one of them is rested and back to full strength!',
      ], again: [
        'Come back any time. Your critters always get the best care here.',
      ] },
    ],
    signs: [],
    trainers: [],
    encounters: null,
  },
};

/** Parse a map into a grid of legend entries; validates row widths and tile codes.
 *  Collects ALL problems and throws once with every issue listed, one per line,
 *  in y order. Return value for valid maps is unchanged. */
export function parseMap(map) {
  const problems = [];
  const grid = [];
  for (let y = 0; y < map.h; y++) {
    const row = map.rows[y];
    if (!row || row.length !== map.w) {
      problems.push('Map "' + map.id + '" row ' + y + ' has width ' +
        (row ? row.length : 'none') + ', expected ' + map.w);
      continue;
    }
    const cells = [];
    for (let x = 0; x < map.w; x++) {
      const def = map.legend[row[x]];
      if (!def) problems.push('Map "' + map.id + '" unknown tile code "' + row[x] + '" at ' + x + ',' + y);
      cells.push(def);
    }
    grid.push(cells);
  }
  if (problems.length > 0) {
    throw new Error(problems.join('\n'));
  }
  return grid;
}
