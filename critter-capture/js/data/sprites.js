/* Critter Capture — procedural art: palette, sprite grids, tile painters.
   No image assets. Everything drawn in code from ONE limited palette. */

/* The palette (18 colours, Game-Boy-Colour-ish). EVERYTHING uses only these. */
export const PAL = {
  ink:   '#1a1c2c',
  plum:  '#5d275d',
  red:   '#b13e53',
  orang: '#ef7d57',
  yell:  '#ffcd75',
  lgrn:  '#a7f070',
  grn:   '#38b764',
  teal:  '#257179',
  navy:  '#29366f',
  blue:  '#3b5dc9',
  sky:   '#41a6f6',
  ice:   '#73eff7',
  white: '#f4f4f4',
  gray:  '#94b0c2',
  slate: '#566c86',
  dark:  '#333c57',
  brown: '#7a4841',
  tan:   '#e8b796',
};

/* Sprite grid chars -> palette key ('.' = transparent). */
export const CHARMAP = {
  '.': null,
  k: 'ink', p: 'plum', r: 'red', o: 'orang', y: 'yell',
  L: 'lgrn', g: 'grn', t: 'teal', n: 'navy', b: 'blue',
  c: 'sky', i: 'ice', w: 'white', e: 'gray', E: 'slate',
  d: 'dark', m: 'brown', s: 'tan',
};

/* Critter grids are authored as COMPLETE 8-wide sprites (8x16 pixels).
   Do NOT mirror them — mirroring duplicates the whole critter side by side. */

/** Draw a string-grid sprite. Each cell = 1 unit pixel, scaled by `scale`. */
export function drawSprite(ctx, grid, pal, x, y, scale) {
  scale = scale || 1;
  for (let ry = 0; ry < grid.length; ry++) {
    const row = grid[ry];
    for (let rx = 0; rx < row.length; rx++) {
      const key = CHARMAP[row[rx]];
      if (!key) continue;
      ctx.fillStyle = pal[key];
      ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
    }
  }
}

/* ---------------- the player (16x16, three facings) ---------------- */

const playerDown = [
  '................',
  '.....rrrrrr.....',
  '....rrrrrrrr....',
  '....rrrrrrrr....',
  '....ssssssss....',
  '....skssssks....',
  '....ssssssss....',
  '.....ssssss.....',
  '....bbbbbbbb....',
  '...bbbwwbbbb....',
  '...bbbbbbbbbb...',
  '....bbbbbbbb....',
  '....nn....nn....',
  '....nn....nn....',
  '...mmm....mmm...',
  '................',
];
const playerUp = [
  '................',
  '.....rrrrrr.....',
  '....rrrrrrrr....',
  '....rrrrrrrr....',
  '....rrrrrrrr....',
  '....rrrrrrrr....',
  '....ssssssss....',
  '.....ssssss.....',
  '....bbbbbbbb....',
  '...bbbbbbbbbb...',
  '...bbbbbbbbbb...',
  '....bbbbbbbb....',
  '....nn....nn....',
  '....nn....nn....',
  '...mmm....mmm...',
  '................',
];
const playerSide = [
  '................',
  '.....rrrrrr.....',
  '....rrrrrrrr....',
  '....rrrrrrrr....',
  '....ssssssss....',
  '....sssksss.....',
  '....ssssssss....',
  '.....ssssss.....',
  '....bbbbbbbb....',
  '....bbbbbbbb....',
  '....bbbbbbbb....',
  '....bbbbbbbb....',
  '.....nn..nn.....',
  '.....nn..nn.....',
  '....mmm..mmm....',
  '................',
];

/* ---------------- critters (8x16 grids, complete sprites) ---------------- */

const SPRITE_GRIDS = {
  /* Cinderpup — orange, pointed ears */
  cinderpup: [
    '........',
    '...kk...',
    '..koKk..',
    '..kook..',
    '.kooook.',
    '.kooook.',
    '.kokook.',
    'koooooo.',
    'kooodoo.',
    'koooooo.',
    '.koooook',
    '.koooook',
    '...kok..',
    '...kok..',
    '..kkkkk.',
    '........',
  ],
  /* Brookfin — blue fish, dorsal fin */
  brookfin: [
    '........',
    '........',
    '...kk...',
    '..kbbk..',
    '..kbbk..',
    '.kbbbbk.',
    'kbbwbbbk',
    'kbbkbbbk',
    'kbbbbbbk',
    'kbbbibbk',
    '.kbbbbk.',
    '.kbbbbk.',
    '..kbbk..',
    '...kk...',
    '........',
    '........',
  ],
  /* Sproutle — green, leaf on head */
  sproutle: [
    '........',
    '...LL...',
    '..kLLk..',
    '...kk...',
    '..kggk..',
    '.kggggk.',
    '.kgkggk.',
    'kggggggk',
    'kggggggk',
    'kggddggk',
    'kggggggk',
    '.kggggk.',
    '..kggk..',
    '..kgggk.',
    '..kkkk..',
    '........',
  ],
  /* Cragmite — grey rock body, dark cracks */
  cragmite: [
    '........',
    '........',
    '..kkkk..',
    '.keeeek.',
    'keeEeeek',
    'keeEEEek',
    'keeeeeek',
    'kedkdeek',
    'keeeeeek',
    'keeEeeek',
    'keeeecek',
    '.keeeek.',
    '..kkkk..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
  /* Zephyrik — sky-blue bird, white wing bars */
  zephyrik: [
    '........',
    '...kk...',
    '..kcck..',
    '..kcck..',
    '.kccccck'.slice(0, 8),
    '.kcwcck.',
    'kccwwcck',
    'kcccckk.',
    'kccccck.',
    'koycccck',
    '.kcccck.',
    '.kcccck.',
    '..kcck..',
    '..kokk..',
    '...kk...',
    '........',
  ],
  /* Voltling — yellow round body, zigzag mark */
  voltling: [
    '........',
    '...kk...',
    '..kyyk..',
    '.kyyyyk.',
    '.kykyyk.',
    'kyyyyyyk',
    'kyyoyoyk',
    'kyyyyyyk',
    'kyoyyoyk',
    'kyyyyyyk',
    '.kyyyyk.',
    '.kyyyyk.',
    '..kyyk..',
    '..kyky..',
    '..kkkk..',
    '........',
  ],
  /* Gloamkitty — dark plum cat, yellow eyes */
  gloamkitty: [
    '........',
    '..k..k..',
    '..kpkpk.'.slice(0, 8),
    '..kppk..',
    '.kppppk.',
    '.kppppk.',
    '.kpyppk.',
    'kppppppk',
    'kppppppk',
    'kpddppdk',
    'kppppppk',
    '.kppppk.',
    '..kppk..',
    '..kppk..',
    '..kkkk..',
    '........',
  ],
  /* Lussette — white with gold trim */
  lussette: [
    '........',
    '...kk...',
    '..kwyk..',
    '..kwwk..',
    '.kwwwwk.',
    '.kwwkwk.',
    'kwwwwwwk',
    'kwwkkwwk',
    'kwwwwwwk',
    'kwwyywwk',
    '.kwwwwk.',
    '.kwwwwk.',
    '..kwwk..',
    '..kwkw..',
    '..kkkk..',
    '........',
  ],
  /* Blazefang — bigger ember cat with flame crest and red mane */
  blazefang: [
    '........',
    '...yy...',
    '..koyk..',
    '.krook..',
    'krokoook',
    'krokoook',
    'kroooook',
    'krorrook',
    'krorrook',
    'kroooook',
    '.koooook',
    '.koooook',
    '..kokok.',
    '..kokok.',
    '..kkkkk.',
    '........',
  ],
  /* Tidalisk — bigger blue fish, tall dorsal fin, ice fins */
  tidalisk: [
    '........',
    '..kbbk..',
    '..kbbk..',
    '.kbbbbk.',
    'kbbwbbbk',
    'kbbkbbbk',
    'kbbbbibk',
    'kbbbbbbk',
    'kbbwbbbk',
    'kibbbbik',
    '.kbbbbk.',
    '.kbbbbk.',
    '..kbbk..',
    '..kbbk..',
    '...kk...',
    '........',
  ],
  /* Verdantor — bigger green brute with leaf crest */
  verdantor: [
    '...LL...',
    '..kLLk..',
    '...kk...',
    '.kggggk.',
    'kgkggggk',
    'kgkggggk',
    'kggggggk',
    'kggddggk',
    'kggggggk',
    'kgLggLgk',
    'kggggggk',
    '.kggggk.',
    '..kggk..',
    '..kggk..',
    '..kkkkk.',
    '........',
  ],
  /* Boulderox — grey boulder beast with a slate horn */
  boulderox: [
    '...Ek...',
    '..kEk...',
    '.keeeek.',
    'keEeeeek',
    'kekdkeek',
    'keeeeeek',
    'keeddeek',
    'keeeeeek',
    'keeEeeek',
    'keeEEEek',
    'keeddeek',
    '.keeeek.',
    '..kkkk..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
  /* Galewraith — sky-blue raptor with spread white wings */
  galewraith: [
    '..kwk...',
    '..kcck..',
    '.kcccck.',
    'kcckccck',
    'kcccccck',
    'kcwwccck',
    'kwwcccck',
    'kwwcccck',
    'kwwwccck',
    '.kwcccck',
    '..kcck..',
    '..kcck..',
    '..kcck..',
    '...kk...',
    '...kk...',
    '........',
  ],
  /* Stormrike — bigger yellow beast with a lightning horn */
  stormrike: [
    '...ky...',
    '..kyyk..',
    '.kyyyyk.',
    'kykyyyyk',
    'kyyyyyyk',
    'kyyoyoyk',
    'kyyyyyyk',
    'kyoyyoyk',
    'kyyyyyyk',
    'kyyyyyyk',
    '.kyyyyk.',
    '.kyyyyk.',
    '..kyyk..',
    '..kykyk.',
    '..kkkkk.',
    '........',
  ],
  /* Umbralynx — bigger plum cat, tall ears and wide mane */
  umbralynx: [
    '..k..k..',
    '..kpkpk.',
    '..kppk..',
    'kppppppk',
    'kpyppypk',
    'kppppppk',
    'kpddppdk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    '.kppppk.',
    '.kppppk.',
    '..kppk..',
    '..kppk..',
    '..kkkkk.',
    '........',
  ],
  /* Aurelisse — white and gold with a halo */
  aurelisse: [
    '..yyy...',
    '...kk...',
    '..kwyk..',
    '.kwwwwk.',
    'kwkwwwwk',
    'kwwwwwwk',
    'kwwkkwwk',
    'kwwwwwwk',
    'kwyywwyk',
    'kwwwwwwk',
    '.kwwwwk.',
    '.kwwwwk.',
    '..kwwk..',
    '..kwkw..',
    '..kkkkk.',
    '........',
  ],
  /* Frostfox — ice-blue fox, pointed ears, white chest */
  frostfox: [
    '........',
    '.k....k.',
    '.kk..kk.',
    '.kcccck.',
    '.kkiikk.',
    'kiiwwiik',
    'kiiwwiik',
    '.kiiiik.',
    'kiwwwwik',
    'kiwwwwik',
    'kiiwwiik',
    '.kiiiik.',
    '..k..k..',
    '..k..k..',
    '..kkkk..',
    '........',
  ],
  /* Glacierine — bigger icier fox with a white ice horn */
  glacierine: [
    '...ww...',
    '..kwwk..',
    '.kcccck.',
    'kcckccck',
    'kiccccik',
    'kiwwwwik',
    '.kwwwwk.',
    'kiccccik',
    'kccwwcck',
    'kccwwcck',
    'kiccccik',
    '.kcccck.',
    '.kcccck.',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
  ],
  /* Ironmite — small round iron mite, slate plates and a bolt eye */
  ironmite: [
    '........',
    '........',
    '........',
    '..kkkk..',
    '.keeeek.',
    'keeEEEek',
    'kekdkeek',
    'keddddek',
    'keeEEEek',
    'keeddeek',
    '.keeeek.',
    '..kkkk..',
    '..k..k..',
    '.kk..kk.',
    '........',
    '........',
  ],
  /* Ferroclad — heavy armoured iron beast, broad slate shoulders */
  ferroclad: [
    '........',
    '..kkkk..',
    '.kddddk.',
    '.kdkddk.',
    'kEEEEEEk',
    'kEEEEEEk',
    'kEeddeEk',
    'kEEEEEEk',
    'kEEEEEEk',
    'kEeEEeEk',
    '.kEEEEk.',
    '.kEEEEk.',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
  /* Brushbuck — tan/brown buck with small antlers and a leafy tuft */
  brushbuck: [
    '.L....L.',
    '.m....m.',
    '.kssssk.',
    '.kskssk.',
    'kssssssk',
    'kssmmmsk',
    'kssmmmsk',
    '.kssssk.',
    'kmmssmmk',
    'kmmmmmmk',
    'kmmmmmmk',
    '.kmmmmk.',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
  /* Sunmane — gold-maned lion, bright yellow mane around a tan face */
  sunmane: [
    '........',
    '..yyyy..',
    '.yyyyyy.',
    'kyssssyk',
    'kyskksyk',
    'kyssssyk',
    'kysmmmsk',
    '.kyyyyk.',
    '.kyyyyk.',
    'kyyyyyyk',
    'kyyyyyyk',
    '.kyyyyk.',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
  /* Thistlekin — small green thorny sprout with prickles */
  thistlekin: [
    '........',
    '.k.kk.k.',
    '.kkggkk.',
    'kgLggLgk',
    'kggggggk',
    'kgkggggk',
    'kggggggk',
    'kgLggLgk',
    '.kggggk.',
    '.kggggk.',
    '..kggk..',
    '..kggk..',
    '..kkkk..',
    '........',
    '........',
    '........',
  ],
  /* Bramblewraith — darker thorny wraith, teal-green, tattered and fierce */
  bramblewraith: [
    '........',
    '........',
    '..k..k..',
    '.ktggkt.',
    'kgttttgk',
    'kgkggggk',
    'kggggggk',
    'kgLggggk',
    'kggggggk',
    '.kggggk.',
    'kggggggk',
    'kgkggkgk',
    '.kg..gk.',
    '..k..k..',
    '........',
    '........',
  ],
  /* Coalclaw — dark ember claw, orange glow eyes and claws */
  coalclaw: [
    '........',
    '..kkkk..',
    '.kddddk.',
    'kdoddddk',
    'kddddddk',
    'kdrdddrk',
    'kddddddk',
    'kdrddddk',
    'kddddddk',
    'kddddddk',
    '.kddddk.',
    '.kddddk.',
    '.ko..ok.',
    '.kk..kk.',
    '........',
    '........',
  ],
  /* Magmaclaw — bigger magma claw, red and orange molten cracks */
  magmaclaw: [
    '........',
    '..kkkk..',
    '.krrrrk.',
    'kryrrrrk',
    'krrrrrrk',
    'krorrork',
    'krrrrrrk',
    'krorrork',
    'krrrrrrk',
    'krorrork',
    '.krrrrk.',
    '.krrrrk.',
    '.ko..ok.',
    '.kk..kk.',
    '........',
    '........',
  ],
  /* Psykit — plum mind-kitten with one large white eye */
  psykit: [
    '........',
    '..k..k..',
    '..kpkpk.',
    '..kppk..',
    '.kppppk.',
    '.kwwwpk.',
    '.kwwwpk.',
    '.kppppk.',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    '.kppppk.',
    '..kppk..',
    '..kkkk..',
    '........',
  ],
  /* Mindweaver — bigger mind creature, plum with a broad pale forehead crown */
  mindweaver: [
    '........',
    '..wwww..',
    '.kwwwwk.',
    '.kppppk.',
    'kpwwpppk',
    'kpwwpppk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    '.kppppk.',
    '.kppppk.',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
  /* Tidefry — small blue-teal fish with a pale belly */
  tidefry: [
    '........',
    '........',
    '...kk...',
    '..kbtk..',
    '.kbttbk.',
    'kbbkttbk',
    'kbwwwtbk',
    'kbwwwwbk',
    '.kbwwbk.',
    '..kbbk..',
    '..kbbk..',
    '...kk...',
    '........',
    '........',
    '........',
    '........',
  ],
  /* Abyssfrost — big deep-navy frost fish with ice fins */
  abyssfrost: [
    '........',
    '..knnk..',
    '..knnk..',
    '.knnnnk.',
    'kinknnik',
    'knnnnnnk',
    'knnnnnnk',
    'kniwwink',
    'knnwwnnk',
    '.knnnnk.',
    '.knnnnk.',
    '..knnk..',
    '..knnk..',
    '...kk...',
    '........',
    '........',
  ],
  /* Skyfin — sky-blue fish standing on a tall sky fin */
  skyfin: [
    '........',
    '...kk...',
    '..kcck..',
    '.kcccck.',
    'kcckccck',
    'kcwwccck',
    'kcwwwwck',
    '.kcccck.',
    '..kcck..',
    '..kcck..',
    '..kcck..',
    '..kcck..',
    '..kcck..',
    '.kc..ck.',
    '.kk..kk.',
    '........',
  ],
  /* Aurorwing — winged sky-and-white creature with a gold crest */
  aurorwing: [
    '...yy...',
    '..kcck..',
    '.kwccwk.',
    'kwwcccck',
    'kwkcccck',
    'kwwcccck',
    'kwwbbbck',
    '.kbbbbk.',
    '..kcck..',
    '..kcck..',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
    '........',
    '........',
    '........',
  ],
  /* Gravelurk — grey shade lurker, slate body sunk low, glinting eye */
  gravelurk: [
    '........',
    '........',
    '........',
    '........',
    '..kkkk..',
    '.kEEEEk.',
    'kEkyEEEk',
    'kEEEEEEk',
    'kEdEEEdk',
    'kEEEEEEk',
    'kEEdEEdk',
    '.kEEEEk.',
    '.kEEEEk.',
    'kkkkkkkk',
    '........',
    '........',
  ],
  /* Tombclaw — dark stone claw, navy-slate with heavy bone claws */
  tombclaw: [
    '........',
    '..kkkk..',
    '.knnnnk.',
    'knwnnnnk',
    'knnnnnnk',
    'knEEnEnk',
    'knnnnnnk',
    'knEnnnnk',
    'knnnnnnk',
    '.knnnnk.',
    '.knnnnk.',
    '.kwnnwk.',
    '.kw..wk.',
    '.kk..kk.',
    '........',
    '........',
  ],
  /* Zapcog — yellow cog creature with a spark zigzag */
  zapcog: [
    '........',
    '.k.kk.k.',
    '.kyyyyk.',
    'kyyeeyyk',
    'kyyykyyk',
    'kyykyyyk',
    'kykyyyyk',
    'kyyyyyyk',
    '.kyyyyk.',
    '.kyyyyk.',
    '.k.kk.k.',
    '..kkkk..',
    '........',
    '........',
    '........',
    '........',
  ],
  /* Voltronic — big iron-and-spark beast, yellow lightning crown on slate body */
  voltronic: [
    '........',
    '.y..y..y',
    '.kyyyyk.',
    '.kEEEEk.',
    'kEkeEEEk',
    'kEEEEEEk',
    'kEoEEEok',
    'kEEEEEEk',
    'kEeEEEek',
    'kEEEEEEk',
    '.kEEEEk.',
    '.kEEEEk.',
    '..k..k..',
    '..k..k..',
    '.kk..kk.',
    '........',
  ],
};

/* ---------------- townsfolk (16x16, drawn on the static map layer) ---------------- */

const npcKid = [
  '................',
  '.....mmmmmm.....',
  '....mmmmmmmm....',
  '....ssssssss....',
  '....skssssks....',
  '....ssssssss....',
  '.....ssssss.....',
  '....gggggggg....',
  '...gggwwgggg....',
  '...gggggggggg...',
  '....gggggggg....',
  '....nn....nn....',
  '....nn....nn....',
  '...mmm....mmm...',
  '................',
  '................',
];
const npcElder = [
  '................',
  '.....wwwwww.....',
  '....wwwwwwww....',
  '....ssssssss....',
  '....skssssks....',
  '....ssssssss....',
  '.....ssssss.....',
  '....pppppppp....',
  '...pppwwpppp....',
  '...pppppppppp...',
  '....pppppppp....',
  '....dd....dd....',
  '....dd....dd....',
  '...mmm....mmm...',
  '................',
  '................',
];
const npcScout = [
  '................',
  '.....kkkkkk.....',
  '....kkkkkkkk....',
  '....ssssssss....',
  '....skssssks....',
  '....ssssssss....',
  '.....ssssss.....',
  '....oooooooo....',
  '...ooowwoooo....',
  '...oooooooooo...',
  '....oooooooo....',
  '....dd....dd....',
  '....dd....dd....',
  '...mmm....mmm...',
  '................',
  '................',
];

const npcNurse = [
  '................',
  '.....wwwwww.....',
  '....wwwwwwww....',
  '....ssssssss....',
  '....skssssks....',
  '....ssssssss....',
  '.....ssssss.....',
  '....wwwwwwww....',
  '...wwwrrrrww....',
  '...wwwrwwrww....',
  '...wwwrrrrww....',
  '....ww....ww....',
  '....ww....ww....',
  '...mmm....mmm...',
  '................',
  '................',
];

export const SPRITES = {
  playerDown, playerUp, playerSide,
  npcKid, npcElder, npcScout, npcNurse,
};
for (const k in SPRITE_GRIDS) SPRITES[k] = SPRITE_GRIDS[k];

/* Interim (Phase 3 slice 1a): a species without its own grid falls back to a sprite chosen by
   primary type, so a new critter never renders as an unrelated one. Slice 1b replaces this. */
const TYPE_FALLBACK = {
  ember:'cinderpup', tide:'brookfin', verdant:'sproutle', stone:'cragmite',
  gale:'zephyrik', spark:'voltling', shade:'gloamkitty', radiance:'lussette',
  frost:'brookfin', iron:'cragmite', wild:'cinderpup', mind:'gloamkitty',
};
export function speciesSprite(speciesId, primaryType) {
  return SPRITES[speciesId] || SPRITES[TYPE_FALLBACK[primaryType]] || SPRITES.sproutle;
}

/* ---------------- tiles (16x16 painters, cached to canvases) ---------------- */

const tileCache = {};

function px(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w || 1, h || 1);
}

const PAINTERS = {
  grass(c) {
    px(c, PAL.grn, 0, 0, 16, 16);
    px(c, PAL.teal, 3, 5); px(c, PAL.teal, 11, 9); px(c, PAL.teal, 7, 13);
    px(c, PAL.lgrn, 5, 2); px(c, PAL.lgrn, 13, 12); px(c, PAL.lgrn, 1, 11);
  },
  tall(c) {
    px(c, PAL.teal, 0, 0, 16, 16);
    for (let i = 0; i < 4; i++) {
      const bx = 1 + i * 4;
      px(c, PAL.grn, bx, 4, 2, 12);
      px(c, PAL.lgrn, bx, 2, 1, 3);
      px(c, PAL.lgrn, bx + 1, 3, 1, 2);
    }
    px(c, PAL.ink, 0, 15, 16, 1);
  },
  path(c) {
    px(c, PAL.tan, 0, 0, 16, 16);
    px(c, PAL.orang, 4, 3); px(c, PAL.orang, 12, 8); px(c, PAL.orang, 2, 12);
    px(c, PAL.brown, 9, 5); px(c, PAL.brown, 6, 10);
  },
  tree(c) {
    px(c, PAL.grn, 0, 0, 16, 16);
    px(c, PAL.teal, 2, 0, 12, 11);
    px(c, PAL.teal, 1, 2, 14, 8);
    px(c, PAL.grn, 4, 2, 8, 7);
    px(c, PAL.lgrn, 5, 3, 2, 2); px(c, PAL.lgrn, 9, 5, 2, 1);
    px(c, PAL.ink, 3, 10, 2, 2); px(c, PAL.ink, 11, 10, 2, 2);
    px(c, PAL.brown, 6, 11, 4, 5);
    px(c, PAL.dark, 6, 11, 1, 5);
  },
  water(c) {
    px(c, PAL.blue, 0, 0, 16, 16);
    px(c, PAL.sky, 2, 3, 4, 1); px(c, PAL.sky, 9, 7, 4, 1); px(c, PAL.sky, 4, 12, 4, 1);
    px(c, PAL.navy, 8, 2, 3, 1); px(c, PAL.navy, 1, 9, 3, 1); px(c, PAL.navy, 11, 13, 3, 1);
  },
  wall(c) { /* town hedge border */
    px(c, PAL.dark, 0, 0, 16, 16);
    px(c, PAL.teal, 1, 1, 3, 2); px(c, PAL.teal, 8, 4, 3, 2); px(c, PAL.teal, 3, 9, 3, 2); px(c, PAL.teal, 11, 12, 3, 2);
    px(c, PAL.ink, 0, 15, 16, 1); px(c, PAL.ink, 15, 0, 1, 16);
  },
  roof(c) {
    px(c, PAL.red, 0, 0, 16, 16);
    px(c, PAL.plum, 0, 4, 16, 1); px(c, PAL.plum, 0, 9, 16, 1); px(c, PAL.plum, 0, 14, 16, 1);
    px(c, PAL.orang, 0, 0, 16, 1);
  },
  hwall(c) {
    px(c, PAL.tan, 0, 0, 16, 16);
    px(c, PAL.brown, 0, 0, 16, 1); px(c, PAL.brown, 0, 15, 16, 1);
    px(c, PAL.brown, 0, 0, 1, 16); px(c, PAL.brown, 15, 0, 1, 16);
    px(c, PAL.brown, 7, 1, 1, 15);
  },
  door(c) {
    px(c, PAL.tan, 0, 0, 16, 16);
    px(c, PAL.brown, 3, 2, 10, 14);
    px(c, PAL.dark, 3, 2, 10, 1); px(c, PAL.dark, 3, 2, 1, 14); px(c, PAL.dark, 12, 2, 1, 14);
    px(c, PAL.yell, 10, 9, 2, 2);
  },
  flower(c) {
    PAINTERS.grass(c);
    px(c, PAL.red, 4, 4, 2, 2); px(c, PAL.yell, 4, 4); px(c, PAL.yell, 11, 9, 2, 2); px(c, PAL.white, 11, 9);
  },
  rock(c) {
    PAINTERS.grass(c);
    px(c, PAL.slate, 3, 6, 10, 7);
    px(c, PAL.gray, 4, 6, 8, 2); px(c, PAL.gray, 4, 8, 3, 3);
    px(c, PAL.ink, 3, 12, 10, 1);
  },
  sign(c) {
    PAINTERS.grass(c);
    px(c, PAL.brown, 7, 8, 2, 7);
    px(c, PAL.tan, 2, 2, 12, 7);
    px(c, PAL.brown, 2, 2, 12, 1); px(c, PAL.brown, 2, 8, 12, 1);
    px(c, PAL.dark, 4, 4, 8, 1); px(c, PAL.dark, 4, 6, 6, 1);
  },
  fence(c) {
    PAINTERS.grass(c);
    px(c, PAL.brown, 2, 4, 2, 10); px(c, PAL.brown, 12, 4, 2, 10);
    px(c, PAL.tan, 0, 5, 16, 2); px(c, PAL.tan, 0, 9, 16, 2);
  },
};

/** Get (and cache) a 16x16 canvas for a tile name. */
export function getTileCanvas(name) {
  if (tileCache[name]) return tileCache[name];
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16;
  const c = cv.getContext('2d');
  (PAINTERS[name] || PAINTERS.grass)(c);
  tileCache[name] = cv;
  return cv;
}
