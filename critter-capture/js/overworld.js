/* Critter Capture — overworld: tile maps, grid movement with smooth tweening,
   collision, tall-grass encounters, warps. Renders from ONE pre-rendered
   static layer per map (built once, blitted every frame). */

import { MAPS, parseMap } from './data/areas.js';
import { getTileCanvas, drawSprite, SPRITES, PAL } from './data/sprites.js';

export const TILE = 16;
const MOVE_MS = 170;      // ms per tile step
const VIEW_W = 240, VIEW_H = 160;

let G = null;             // injected core object { input, save, hooks... }
let map = null, grid = null, staticCv = null;
let ptx = 0, pty = 0;     // player tile
let fx = 0, fy = 0;       // player pixel position (tweened)
let dir = 'down';
let moving = false, mFromX = 0, mFromY = 0, mT = 0;
let persistTimer = 0;     // debounced position save (see persistSoon)
let npcTiles = null;      // Set of "x,y" for NPC tiles (solid + interactable)

/* Position changes are worth saving, but a save per tile would fire ~6x a second
   while walking. Coalesce them: one save shortly after the player stops moving. */
function persistSoon() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(function () {
    persistTimer = 0;
    if (G && G.persist) G.persist();
  }, 500);
}

function prerender() {
  staticCv = document.createElement('canvas');
  staticCv.width = map.w * TILE;
  staticCv.height = map.h * TILE;
  const c = staticCv.getContext('2d');
  for (let y = 0; y < map.h; y++) {
    for (let x = 0; x < map.w; x++) {
      c.drawImage(getTileCanvas(grid[y][x].tile), x * TILE, y * TILE);
    }
  }
  // NPCs live on the static layer too — they never move.
  for (const n of (map.npcs || [])) {
    drawSprite(c, SPRITES[n.sprite] || SPRITES.npcKid, PAL, n.x * TILE, n.y * TILE - 2, 1);
  }
}

/** Enter (or re-enter) a map at a tile position. */
export function enter(game, mapId, tx, ty, newDir) {
  G = game;
  map = MAPS[mapId];
  if (!map) throw new Error('Unknown map: ' + mapId);
  grid = parseMap(map);
  npcTiles = new Set((map.npcs || []).map(n => n.x + ',' + n.y));
  prerender();
  ptx = Math.max(0, Math.min(map.w - 1, tx));
  pty = Math.max(0, Math.min(map.h - 1, ty));
  dir = newDir || 'down';
  fx = ptx * TILE; fy = pty * TILE;
  moving = false;
}

function pickEncounter() {
  const enc = map.encounters;
  if (!enc || !enc.table || !enc.table.length) return null;
  let total = 0;
  for (const e of enc.table) total += e.weight;
  let r = Math.random() * total;
  for (const e of enc.table) {
    r -= e.weight;
    if (r <= 0) {
      const lvl = e.min + Math.floor(Math.random() * (e.max - e.min + 1));
      return { speciesId: e.speciesId, level: lvl };
    }
  }
  const last = enc.table[enc.table.length - 1];
  return { speciesId: last.speciesId, level: last.min };
}

function arrive() {
  moving = false;
  fx = ptx * TILE; fy = pty * TILE;
  const def = grid[pty][ptx];
  // warp check first (standing on a warp tile always warps)
  for (const wp of map.warps) {
    if (wp.x === ptx && wp.y === pty) {
      G.save.map = wp.to;
      G.save.x = wp.tx; G.save.y = wp.ty; G.save.dir = dir;
      G.persist();
      enter(G, wp.to, wp.tx, wp.ty, dir);
      return;
    }
  }
  G.save.x = ptx; G.save.y = pty; G.save.dir = dir;
  persistSoon();
  // encounter check: once per tile STEPPED ONTO, chance-based
  if (def.encounter && map.encounters && Math.random() < map.encounters.rate) {
    const wild = pickEncounter();
    if (wild) { G.onEncounter(wild.speciesId, wild.level); return; }
  }
}

export function update(dt) {
  if (!map) return;
  if (moving) {
    mT += (dt * 1000) / MOVE_MS;
    if (mT >= 1) { mT = 1; }
    const e = mT; // linear is fine at 170ms/tile
    fx = (mFromX + (ptx - mFromX) * e) * TILE;
    fy = (mFromY + (pty - mFromY) * e) * TILE;
    if (mT >= 1) arrive();
    return;
  }
  // buffered: held direction keeps walking
  let nx = 0, ny = 0;
  if (G.input.held('up')) { ny = -1; dir = 'up'; }
  else if (G.input.held('down')) { ny = 1; dir = 'down'; }
  else if (G.input.held('left')) { nx = -1; dir = 'left'; }
  else if (G.input.held('right')) { nx = 1; dir = 'right'; }
  if (nx === 0 && ny === 0) return;
  const tx = ptx + nx, ty = pty + ny;
  const warp = map.warps.find(w => w.x === tx && w.y === ty);
  const blocked = (x, y) => {
    if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
    if (npcTiles && npcTiles.has(x + ',' + y)) return true; // NPCs are solid
    return !!grid[y][x].solid;
  };
  if (!blocked(tx, ty) || warp) {
    mFromX = ptx; mFromY = pty;
    ptx = tx; pty = ty;
    moving = true; mT = 0;
  }
}

function playerSprite() {
  if (dir === 'up') return SPRITES.playerUp;
  if (dir === 'left' || dir === 'right') return SPRITES.playerSide;
  return SPRITES.playerDown;
}

export function draw(ctx) {
  if (!map || !staticCv) return;
  let cx = Math.floor(fx) - (VIEW_W / 2 - TILE / 2);
  let cy = Math.floor(fy) - (VIEW_H / 2 - TILE / 2);
  cx = Math.max(0, Math.min(map.w * TILE - VIEW_W, cx));
  cy = Math.max(0, Math.min(map.h * TILE - VIEW_H, cy));
  ctx.drawImage(staticCv, -cx, -cy);
  // player: 1px walk bob, flipped for left
  const bob = moving ? (mT < 0.5 ? -1 : 0) : 0;
  const sx = Math.floor(fx) - cx, sy = Math.floor(fy) - cy - 2 + bob;
  if (dir === 'left') {
    ctx.save();
    ctx.translate(sx + 16, sy);
    ctx.scale(-1, 1);
    drawSprite(ctx, playerSprite(), PAL, 0, 0, 1);
    ctx.restore();
  } else {
    drawSprite(ctx, playerSprite(), PAL, sx, sy, 1);
  }
}

/** What the player is facing (NPC or sign), or null. Only meaningful when
 *  the player is standing still — the dialogue layer in core.js asks for it. */
function findAhead() {
  const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const x = ptx + dx, y = pty + dy;
  for (const n of (map.npcs || [])) {
    if (n.x === x && n.y === y) return { kind: 'npc', name: n.name, lines: n.lines };
  }
  for (const s of (map.signs || [])) {
    if (s.x === x && s.y === y) return { kind: 'sign', name: 'SIGN', lines: s.lines };
  }
  return null;
}
export function facingTarget() {
  if (!map || moving) return null;
  return findAhead();
}

export function info() {
  return { map: map ? map.id : '?', x: ptx, y: pty, dir };
}
