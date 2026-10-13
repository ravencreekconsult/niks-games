/* PULL A SWORD — data.js
   Pure data, no DOM, no side effects. Sets window.PAS_Data. */
(function () {
  'use strict';

  /* 1. RARITY — ordered tiers, pull weights sum to exactly 100 */
  var RARITY = [
    { k: 'Common',    c: '#9da7b3', w: 60 },
    { k: 'Uncommon',  c: '#3fb950', w: 25 },
    { k: 'Rare',      c: '#58a6ff', w: 10 },
    { k: 'Epic',      c: '#bc8cff', w: 4 },
    { k: 'Legendary', c: '#ffa657', w: 0.9 },
    { k: 'Mythic',    c: '#ff4d4d', w: 0.1 }
  ];

  /* 2. WORLDS — same five worlds, same order, same swords as the original game */
  var WORLDS = [
    {
      name: 'Whisperwood', boss: 'Briar Golem',
      egg: { name: 'Whisper Egg', cost: 60 },
      swords: [
        { n: 'Dawn Sword',         req: 50,        m: 2,        r: 'Common' },
        { n: 'Heartsbane Sword',   req: 700,       m: 4,        r: 'Uncommon' },
        { n: 'Sword of Essence',   req: 5000,      m: 8,        r: 'Rare' },
        { n: 'Kotetsu Blade',      req: 41500,     m: 16,       r: 'Epic' },
        { n: 'Excalibur',          req: 460000,    m: 32,       r: 'Legendary' },
        { n: 'The King',           req: 850000,    m: 64,       r: 'Mythic' }
      ]
    },
    {
      name: 'Emberfall', boss: 'Magma Dragon',
      egg: { name: 'Ember Egg', cost: 500 },
      swords: [
        { n: 'Dark Sword',     req: 6e6,      m: 100,    r: 'Common' },
        { n: 'Void Ripper',    req: 44.3e6,   m: 180,    r: 'Uncommon' },
        { n: 'Veilpiercer',    req: 406.6e6,  m: 320,    r: 'Rare' },
        { n: 'Bleakharvest',   req: 3.2e9,    m: 600,    r: 'Epic' },
        { n: 'Pyroslash',      req: 44e9,     m: 1100,   r: 'Legendary' },
        { n: 'Dravenar',       req: 100e9,    m: 2000,   r: 'Mythic' }
      ]
    },
    {
      name: 'Cloudspire', boss: 'Storm Roc',
      egg: { name: 'Cloud Egg', cost: 3000 },
      swords: [
        { n: 'Cloud Reaver',       req: 280e9,   m: 3500,    r: 'Common' },
        { n: 'Skyfall Edge',     req: 1.8e12,  m: 6000,    r: 'Uncommon' },
        { n: 'Tempest Fury',        req: 7e12,    m: 10000,   r: 'Rare' },
        { n: "Thunder's Bane",    req: 200e12,  m: 18000,   r: 'Epic' },
        { n: 'Aquila',             req: 1.7e15,  m: 32000,   r: 'Legendary' },
        { n: 'Zephyrus',            req: 2.3e15,  m: 56000,   r: 'Mythic' }
      ]
    },
    {
      name: 'Sunscar Desert', boss: 'Anubis Colossus',
      egg: { name: 'Desert Egg', cost: 20000 },
      swords: [
        { n: 'Carrotbane',         req: 7.5e15,  m: 100000,   r: 'Common' },
        { n: "Nile's Fury",        req: 65e15,   m: 180000,   r: 'Uncommon' },
        { n: "Amun's Might",       req: 550e15,  m: 320000,   r: 'Rare' },
        { n: 'Bastet Staff',       req: 3.5e18,  m: 560000,   r: 'Epic' },
        { n: "Ra's Judgement",     req: 25e18,   m: 1000000,  r: 'Legendary' },
        { n: 'Anubis Blade',       req: 150e18,  m: 1800000,  r: 'Mythic' }
      ]
    },
    {
      name: 'Elderwood', boss: 'Forest Guardian',
      egg: { name: 'Forest Egg', cost: 120000 },
      swords: [
        { n: 'Rootbound Edge',     req: 900e18,  m: 3000000,   r: 'Common' },
        { n: 'Thornbranch Blade',  req: 6e21,    m: 5000000,   r: 'Uncommon' },
        { n: 'Verdant Staff',      req: 40e21,   m: 8000000,   r: 'Rare' },
        { n: 'Verdant Cleaver',    req: 250e21,  m: 13000000,  r: 'Epic' },
        { n: 'Elderwood Ravager',  req: 1.5e24,  m: 21000000,  r: 'Legendary' },
        { n: 'Forest Guardian',    req: 9e24,    m: 34000000,  r: 'Mythic' }
      ]
    }
  ];

  /* 3. PETS — 28 pets (27 hatchable/special + Founder's Blade code pet) */
  var PETS = [
    /* World 0 — Whisper Egg */
    { n: 'Moss Cat',     r: 'Common',    m: 1.5,       luck: 0,    world: 0, shape: 'cat',   col: '#c9a227' },
    { n: 'Fern Pup',    r: 'Uncommon',  m: 2.5,       luck: 0,    world: 0, shape: 'pup',   col: '#8d99ae' },
    { n: 'Hollow Owl',     r: 'Rare',      m: 5,         luck: 0,    world: 0, shape: 'bird',  col: '#b08968' },
    { n: 'Glade Griffin',  r: 'Epic',      m: 14,        luck: 0,    world: 0, shape: 'bird',  col: '#d4af37' },
    { n: 'Glade Lion',     r: 'Legendary', m: 40,        luck: 0.05, world: 0, shape: 'cat',   col: '#e0a020' },
    /* World 1 — Magma Egg */
    { n: 'Magma Pup',      r: 'Common',    m: 4,         luck: 0,    world: 1, shape: 'pup',   col: '#d9481f' },
    { n: 'Ember Bat',      r: 'Uncommon',  m: 9,         luck: 0,    world: 1, shape: 'bird',  col: '#ff7b3d' },
    { n: 'Ash Hound',      r: 'Rare',      m: 22,        luck: 0,    world: 1, shape: 'fox',   col: '#6b6b6b' },
    { n: 'Lava Drake',     r: 'Epic',      m: 60,        luck: 0,    world: 1, shape: 'dragon', col: '#ff5a1f' },
    { n: 'Phoenix Chick',  r: 'Legendary', m: 180,       luck: 0.05, world: 1, shape: 'bird',  col: '#ff9f1c' },
    /* World 2 — Cloud Egg */
    { n: 'Cloud Fox',      r: 'Common',    m: 25,        luck: 0,    world: 2, shape: 'fox',   col: '#9ad4f0' },
    { n: 'Mist Hare',      r: 'Uncommon',  m: 55,        luck: 0,    world: 2, shape: 'fox',   col: '#e8f4ff' },
    { n: 'Storm Golem',      r: 'Rare',      m: 140,       luck: 0,    world: 2, shape: 'golem', col: '#6fb7d9' },
    { n: 'Sky Wyrm',   r: 'Epic',      m: 380,       luck: 0,    world: 2, shape: 'dragon', col: '#8fe3ff' },
    { n: 'Aurora Spirit',  r: 'Legendary', m: 1100,      luck: 0.05, world: 2, shape: 'blob',  col: '#7ef0d0' },
    /* World 3 — Desert Egg */
    { n: 'Sand Scarab',    r: 'Common',    m: 900,       luck: 0,    world: 3, shape: 'bug',   col: '#c9a227' },
    { n: 'Dust Jackal',    r: 'Uncommon',  m: 2200,      luck: 0,    world: 3, shape: 'fox',   col: '#b08d57' },
    { n: 'Anubis Cub',     r: 'Rare',      m: 5500,      luck: 0,    world: 3, shape: 'cat',   col: '#2f2f38' },
    { n: 'Sun Phoenix',    r: 'Epic',      m: 14000,     luck: 0,    world: 3, shape: 'bird',  col: '#ff8c1a' },
    { n: 'Sphinx Cat',     r: 'Legendary', m: 42000,     luck: 0.05, world: 3, shape: 'cat',   col: '#f2c14e' },
    /* World 4 — Forest Egg */
    { n: 'Verdant Sprite', r: 'Common',    m: 40000,     luck: 0,    world: 4, shape: 'blob',  col: '#7bd88f' },
    { n: 'Moss Turtle',    r: 'Uncommon',  m: 100000,    luck: 0,    world: 4, shape: 'golem', col: '#4f8a5b' },
    { n: 'Thorn Wolf',     r: 'Rare',      m: 250000,    luck: 0,    world: 4, shape: 'fox',   col: '#3f6b45' },
    { n: 'Elder Treant',   r: 'Epic',      m: 600000,    luck: 0,    world: 4, shape: 'golem', col: '#2f5d3a' },
    { n: 'World Serpent',  r: 'Legendary', m: 1800000,   luck: 0.05, world: 4, shape: 'dragon', col: '#1f8a4c' },
    /* Specials (world -1) */
    { n: 'Golden Bunny',   r: 'Mythic',    m: 5000000,   luck: 0.10, world: -1, shape: 'blob', col: '#ffd700' },
    { n: 'Void Kitten',    r: 'Mythic',    m: 12000000,  luck: 0.10, world: -1, shape: 'cat',  col: '#7a5cff' },
    /* Code pet (world -1) */
    { n: "Founder's Blade", r: 'Mythic',   m: 8000000,   luck: 0.10, world: -1, shape: 'blob', col: '#00e5ff' }
  ];

  /* 4. EGG_WEIGHTS — hatch rarity weights, Common..Legendary (no Mythic from eggs) */
  var EGG_WEIGHTS = [65, 25, 8, 1.8, 0.2];

  /* 5. CODES — same codes as before, pet now reads "Founder's Blade" */
  var CODES = {
    'PULL2026':   { t: 'strength', v: 5000 },
    'SWORDLUCK':  { t: 'luck', v: 0.25 },
    'NIK':        { t: 'pet', v: "Founder's Blade" }
  };

  /* 6. INDEX_SLOTS — unique pets indexed -> equip slots */
  var INDEX_SLOTS = [
    { at: 0,  slots: 3 },
    { at: 5,  slots: 4 },
    { at: 10, slots: 5 },
    { at: 16, slots: 6 }
  ];

  window.PAS_Data = {
    RARITY: RARITY,
    WORLDS: WORLDS,
    PETS: PETS,
    EGG_WEIGHTS: EGG_WEIGHTS,
    CODES: CODES,
    INDEX_SLOTS: INDEX_SLOTS,
    SLOT_MILESTONES: INDEX_SLOTS
  };
})();
