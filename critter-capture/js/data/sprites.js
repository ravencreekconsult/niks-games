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
};

export const SPRITES = {
  playerDown, playerUp, playerSide,
};
for (const k in SPRITE_GRIDS) SPRITES[k] = SPRITE_GRIDS[k];

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
