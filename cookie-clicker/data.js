/* =========================================================================
   NKData — pure data for the Cookie Clicker engine (no DOM, no side effects
   beyond setting window.NKData). Loaded BEFORE engine.js.
   ========================================================================= */
window.NKData = {

  /* ---------------- buildings ----------------
     The first 8 are the legacy buildings: ids, base costs and cps MUST NOT
     change — existing v1 saves depend on them. */
  BUILDINGS: [
    { id: "cursor",      name: "Cursor",         ico: "👆", base: 15,      cps: 0.1,    blurb: "A finger that clicks on its own" },
    { id: "grandma",     name: "Grandma",        ico: "👵", base: 100,     cps: 1,      blurb: "Bakes cookies by hand" },
    { id: "farm",        name: "Cookie Farm",    ico: "🌾", base: 1100,    cps: 8,      blurb: "Grows cookies from the ground" },
    { id: "mine",        name: "Cookie Mine",    ico: "⛏️", base: 12000,   cps: 47,     blurb: "Digs up cookie ore" },
    { id: "factory",     name: "Factory",        ico: "🏭", base: 130000,  cps: 260,    blurb: "Makes them on a conveyor belt" },
    { id: "bank",        name: "Cookie Bank",    ico: "🏦", base: 1400000, cps: 1400,   blurb: "Your cookies earn interest" },
    { id: "temple",      name: "Temple",         ico: "🛕", base: 2e7,     cps: 7800,   blurb: "Ancient cookie worshippers" },
    { id: "portal",      name: "Portal",         ico: "🌀", base: 3.3e8,   cps: 44000,  blurb: "Cookies from another dimension" },
    { id: "timewarp",    name: "Time Warp",      ico: "🕰️", base: 4e9,     cps: 330000, blurb: "Reaches back for yesterday's cookies" },
    { id: "antimatter",  name: "Antimatter Oven",ico: "⚛️", base: 5e10,    cps: 2.6e6,  blurb: "Bakes cookies out of pure nothing" },
    { id: "prism",       name: "Cookie Prism",   ico: "🔺", base: 6e11,    cps: 2.1e7,  blurb: "Splits one cookie into a million" },
    { id: "chancemaker", name: "Chancemaker",    ico: "🎲", base: 7.2e12,  cps: 1.7e8,  blurb: "Bakes cookies that were never going to exist" }
  ],

  /* ---------------- upgrades (30) ----------------
     effect.kind: tapAdd | tapMult | buildingMult | globalMult | offlineRate |
                  offlineCap | goldenFreq | goldenDur | critChance | crumbGain
     req.kind:    always | total | cps | clicks | buildings | building |
                  golden | ascensions                                     */
  UPGRADES: [
    { id: "tap2",   name: "Stronger Tap",    ico: "💪", cost: 100,     desc: "+1 cookie per tap",
      effect: { kind: "tapAdd", v: 1 },    req: { kind: "clicks", v: 10 } },
    { id: "cur2",   name: "Reinforced Cursors", ico: "🖱️", cost: 500,  desc: "Cursors are twice as good",
      effect: { kind: "buildingMult", id: "cursor", v: 2 }, req: { kind: "building", id: "cursor", v: 10 } },
    { id: "gran2",  name: "Grandma's Recipe", ico: "🧁", cost: 1000,   desc: "Grandmas bake twice as fast",
      effect: { kind: "buildingMult", id: "grandma", v: 2 }, req: { kind: "building", id: "grandma", v: 5 } },
    { id: "tap3",   name: "Mighty Tap",      ico: "💥", cost: 1100,    desc: "+4 cookies per tap",
      effect: { kind: "tapAdd", v: 4 },    req: { kind: "clicks", v: 100 } },
    { id: "farm2",  name: "Fertile Soil",    ico: "🌱", cost: 10000,   desc: "Farms grow twice the cookies",
      effect: { kind: "buildingMult", id: "farm", v: 2 }, req: { kind: "building", id: "farm", v: 10 } },
    { id: "tapx2",  name: "Double-Tap",      ico: "✌️", cost: 5000,    desc: "Taps are twice as strong",
      effect: { kind: "tapMult", v: 2 },   req: { kind: "clicks", v: 500 } },
    { id: "cur3",   name: "Cursor Army",     ico: "🪖", cost: 50000,   desc: "Cursors are twice as good again",
      effect: { kind: "buildingMult", id: "cursor", v: 2 }, req: { kind: "building", id: "cursor", v: 25 } },
    { id: "glob5",  name: "Bakery Boost",    ico: "📈", cost: 10000,   desc: "+5% to everything you bake",
      effect: { kind: "globalMult", v: 1.05 }, req: { kind: "total", v: 50000 } },
    { id: "gran3",  name: "Kneady Grandmas", ico: "🥖", cost: 100000,  desc: "Grandmas bake twice as fast again",
      effect: { kind: "buildingMult", id: "grandma", v: 2 }, req: { kind: "building", id: "grandma", v: 25 } },
    { id: "mine2",  name: "Deeper Dig",      ico: "🕳️", cost: 100000,  desc: "Mines dig up twice the ore",
      effect: { kind: "buildingMult", id: "mine", v: 2 }, req: { kind: "building", id: "mine", v: 10 } },
    { id: "crit1",  name: "Lucky Finger",    ico: "☝️", cost: 50000,   desc: "5% chance a tap is a x10 crit",
      effect: { kind: "critChance", v: 0.05 }, req: { kind: "clicks", v: 2000 } },
    { id: "tapx3",  name: "Turbo Taps",      ico: "🌀", cost: 250000,  desc: "Taps are twice as strong again",
      effect: { kind: "tapMult", v: 2 },   req: { kind: "clicks", v: 5000 } },
    { id: "glob10", name: "Sugar Rush",      ico: "🍬", cost: 500000,  desc: "+10% to everything you bake",
      effect: { kind: "globalMult", v: 1.10 }, req: { kind: "total", v: 500000 } },
    { id: "fact2",  name: "Overtime",        ico: "🏭", cost: 1e6,     desc: "Factories work twice as hard",
      effect: { kind: "buildingMult", id: "factory", v: 2 }, req: { kind: "building", id: "factory", v: 10 } },
    { id: "off1",   name: "Dream Baker",     ico: "😴", cost: 1e6,     desc: "Offline baking pays out 60%",
      effect: { kind: "offlineRate", v: 0.6 }, req: { kind: "total", v: 1e6 } },
    { id: "gf1",    name: "Golden Lure",     ico: "✨", cost: 1e6,     desc: "Golden cookies show up 20% more often",
      effect: { kind: "goldenFreq", v: 0.8 }, req: { kind: "golden", v: 1 } },
    { id: "bank2",  name: "Compound Interest", ico: "💹", cost: 1e7,   desc: "Banks earn twice the interest",
      effect: { kind: "buildingMult", id: "bank", v: 2 }, req: { kind: "building", id: "bank", v: 10 } },
    { id: "cap1",   name: "Deep Freeze",     ico: "🧊", cost: 5e7,     desc: "Offline baking lasts up to 8 hours",
      effect: { kind: "offlineCap", v: 28800 }, req: { kind: "total", v: 5e7 } },
    { id: "gd1",    name: "Golden Polish",   ico: "🪞", cost: 1e7,     desc: "Golden cookies last 50% longer",
      effect: { kind: "goldenDur", v: 1.5 }, req: { kind: "golden", v: 10 } },
    { id: "temp2",  name: "Ancient Chant",   ico: "📜", cost: 1e8,     desc: "Temples produce twice as much",
      effect: { kind: "buildingMult", id: "temple", v: 2 }, req: { kind: "building", id: "temple", v: 10 } },
    { id: "crit2",  name: "Thunder Thumb",   ico: "⚡", cost: 5e7,     desc: "Another 5% chance of a x10 crit",
      effect: { kind: "critChance", v: 0.05 }, req: { kind: "clicks", v: 10000 } },
    { id: "glob25", name: "Brand Loyalty",   ico: "❤️", cost: 5e7,     desc: "+25% to everything you bake",
      effect: { kind: "globalMult", v: 1.25 }, req: { kind: "cps", v: 50000 } },
    { id: "off2",   name: "Night Shift",     ico: "🌙", cost: 1e8,     desc: "Offline baking pays out 75%",
      effect: { kind: "offlineRate", v: 0.75 }, req: { kind: "total", v: 1e8 } },
    { id: "port2",  name: "Warp Cookies",    ico: "🌠", cost: 1e9,     desc: "Portals pull twice the cookies",
      effect: { kind: "buildingMult", id: "portal", v: 2 }, req: { kind: "building", id: "portal", v: 10 } },
    { id: "gf2",    name: "Golden Magnet",   ico: "🧲", cost: 1e9,     desc: "Golden cookies show up 40% more often",
      effect: { kind: "goldenFreq", v: 0.6 }, req: { kind: "golden", v: 25 } },
    { id: "cap2",   name: "Cryo Vault",      ico: "❄️", cost: 5e9,     desc: "Offline baking lasts up to 16 hours",
      effect: { kind: "offlineCap", v: 57600 }, req: { kind: "total", v: 5e9 } },
    { id: "glob50", name: "Cosmic Kitchen",  ico: "🪐", cost: 5e9,     desc: "+50% to everything you bake",
      effect: { kind: "globalMult", v: 1.5 }, req: { kind: "cps", v: 1e6 } },
    { id: "tw2",    name: "Chrono Flour",    ico: "⏳", cost: 5e10,    desc: "Time Warps bake twice as much",
      effect: { kind: "buildingMult", id: "timewarp", v: 2 }, req: { kind: "building", id: "timewarp", v: 10 } },
    { id: "glob100", name: "Cookie Singularity", ico: "🕳️", cost: 5e11, desc: "Double everything you bake",
      effect: { kind: "globalMult", v: 2 }, req: { kind: "cps", v: 1e8 } },
    { id: "crumb1", name: "Crumb Harvester", ico: "🥮", cost: 5e13,    desc: "+25% crumbs from every ascension",
      effect: { kind: "crumbGain", v: 1.25 }, req: { kind: "ascensions", v: 1 } }
  ],

  /* ---------------- achievements (40) ----------------
     check.kind: same as upgrade reqs plus 'playtime' (v = seconds). */
  ACHIEVEMENTS: [
    { id: "tap1",    name: "First Crumb",              ico: "👆", desc: "Your very first tap. It all starts here.", check: { kind: "clicks", v: 1 } },
    { id: "tap100",  name: "Warm Fingers",             ico: "✌️", desc: "Tap 100 times.", check: { kind: "clicks", v: 100 } },
    { id: "tap1k",   name: "Tap Machine",              ico: "🖲️", desc: "Tap 1,000 times.", check: { kind: "clicks", v: 1000 } },
    { id: "tap10k",  name: "Finger of Legend",         ico: "🦾", desc: "Tap 10,000 times.", check: { kind: "clicks", v: 10000 } },
    { id: "tap100k", name: "Retire That Finger",       ico: "🏅", desc: "Tap 100,000 times. Seriously.", check: { kind: "clicks", v: 100000 } },
    { id: "bake1k",  name: "Fledgling Bakery",         ico: "🍪", desc: "Bake 1,000 cookies all-time.", check: { kind: "total", v: 1e3 } },
    { id: "bake1m",  name: "So Baked Right Now",       ico: "😵", desc: "Bake 1 million cookies all-time.", check: { kind: "total", v: 1e6 } },
    { id: "bake1b",  name: "Billion Cookie Club",      ico: "💰", desc: "Bake 1 billion cookies all-time.", check: { kind: "total", v: 1e9 } },
    { id: "bake1t",  name: "Trillion Tycoon",          ico: "🚀", desc: "Bake 1 trillion cookies all-time.", check: { kind: "total", v: 1e12 } },
    { id: "bake1qa", name: "You Can Stop Now",         ico: "🛑", desc: "Bake 1 quadrillion cookies. You can stop.", check: { kind: "total", v: 1e15 } },
    { id: "bake1qi", name: "Okay, You Didn't Stop",    ico: "🌌", desc: "Bake 1 quintillion cookies all-time.", check: { kind: "total", v: 1e18 } },
    { id: "own1c",   name: "One Tiny Helper",          ico: "👆", desc: "Own your first Cursor.", check: { kind: "building", id: "cursor", v: 1 } },
    { id: "own10g",  name: "Grandma Squad",            ico: "👵", desc: "Own 10 Grandmas.", check: { kind: "building", id: "grandma", v: 10 } },
    { id: "own25f",  name: "Agri-Cookie Empire",       ico: "🌾", desc: "Own 25 Cookie Farms.", check: { kind: "building", id: "farm", v: 25 } },
    { id: "own50m",  name: "Deep Down",                ico: "⛏️", desc: "Own 50 Cookie Mines.", check: { kind: "building", id: "mine", v: 50 } },
    { id: "own100f", name: "Belt Line",                ico: "🏭", desc: "Own 100 Factories.", check: { kind: "building", id: "factory", v: 100 } },
    { id: "own25p",  name: "Portal Network",           ico: "🌀", desc: "Own 25 Portals.", check: { kind: "building", id: "portal", v: 25 } },
    { id: "own50b",  name: "Vault Full",               ico: "🏦", desc: "Own 50 Cookie Banks.", check: { kind: "building", id: "bank", v: 50 } },
    { id: "tot10",   name: "Little Shop",              ico: "🏪", desc: "Own 10 buildings in total.", check: { kind: "buildings", v: 10 } },
    { id: "tot50",   name: "Busy Bakery",              ico: "🍰", desc: "Own 50 buildings in total.", check: { kind: "buildings", v: 50 } },
    { id: "tot100",  name: "Cookie Campus",            ico: "🏫", desc: "Own 100 buildings in total.", check: { kind: "buildings", v: 100 } },
    { id: "tot200",  name: "City of Cookies",          ico: "🏙️", desc: "Own 200 buildings in total.", check: { kind: "buildings", v: 200 } },
    { id: "tot300",  name: "Whole Cookie Nation",      ico: "🗺️", desc: "Own 300 buildings in total.", check: { kind: "buildings", v: 300 } },
    { id: "up5",     name: "Upgrade Rookie",           ico: "🧰", desc: "Buy 5 upgrades.", check: { kind: "upgrades", v: 5 } },
    { id: "up10",    name: "Improver",                 ico: "🛠️", desc: "Buy 10 upgrades.", check: { kind: "upgrades", v: 10 } },
    { id: "up20",    name: "Optimiser Supreme",        ico: "⚙️", desc: "Buy 20 upgrades.", check: { kind: "upgrades", v: 20 } },
    { id: "up30",    name: "Fully Decked",             ico: "🧙", desc: "Buy all 30 upgrades.", check: { kind: "upgrades", v: 30 } },
    { id: "g1",      name: "Shiny!",                   ico: "✨", desc: "Click your first golden cookie.", check: { kind: "golden", v: 1 } },
    { id: "g10",     name: "Gold Rush",                ico: "🥇", desc: "Click 10 golden cookies.", check: { kind: "golden", v: 10 } },
    { id: "g250",    name: "Golden Age",              ico: "🌟", desc: "Click 250 golden cookies.", check: { kind: "golden", v: 250 } },
    { id: "tap250k", name: "Carpal Tunnel Hero",      ico: "🏅", desc: "Tap 250,000 times.", check: { kind: "clicks", v: 250000 } },
    { id: "bake1sx", name: "Sextillion Scoop",        ico: "🌌", desc: "Bake 1 sextillion cookies all-time.", check: { kind: "total", v: 1e21 } },
    { id: "bake1sp", name: "Septillion Sweetie",      ico: "🌌", desc: "Bake 1 septillion cookies all-time.", check: { kind: "total", v: 1e24 } },
    { id: "own100c", name: "Cursor Swarm",            ico: "👆", desc: "Own 100 Cursors.", check: { kind: "building", id: "cursor", v: 100 } },
    { id: "own75g",  name: "Grandma Parliament",      ico: "👵", desc: "Own 75 Grandmas.", check: { kind: "building", id: "grandma", v: 75 } },
    { id: "own50t",  name: "Temple Town",             ico: "🛕", desc: "Own 50 Temples.", check: { kind: "building", id: "temple", v: 50 } },
    { id: "tot400",  name: "Cookie Metropolis",       ico: "🏙️", desc: "Own 400 buildings in total.", check: { kind: "buildings", v: 400 } },
    { id: "tot500",  name: "Cookie Planet",           ico: "🗺️", desc: "Own 500 buildings in total.", check: { kind: "buildings", v: 500 } },
    { id: "g50",     name: "Golden Touch",             ico: "🌟", desc: "Click 50 golden cookies.", check: { kind: "golden", v: 50 } },
    { id: "g100",    name: "Golden Everything",        ico: "💫", desc: "Click 100 golden cookies.", check: { kind: "golden", v: 100 } },
    { id: "cps1",    name: "Something's Baking",       ico: "🍞", desc: "Reach 1 cookie per second.", check: { kind: "cps", v: 1 } },
    { id: "cps1k",   name: "Hum of the Ovens",         ico: "🔊", desc: "Reach 1,000 cookies per second.", check: { kind: "cps", v: 1e3 } },
    { id: "cps1m",   name: "Roar of Production",       ico: "🌪️", desc: "Reach 1 million cookies per second.", check: { kind: "cps", v: 1e6 } },
    { id: "cps1b",   name: "The Ovens Sing",           ico: "🎶", desc: "Reach 1 billion cookies per second.", check: { kind: "cps", v: 1e9 } },
    { id: "cps1t",   name: "Oven Overdrive",           ico: "🔥", desc: "Reach 1 trillion cookies per second.", check: { kind: "cps", v: 1e12 } },
    { id: "asc1",    name: "Reborn Baker",             ico: "🐣", desc: "Ascend for the first time.", check: { kind: "ascensions", v: 1 } },
    { id: "asc5",    name: "Circle of Crumbs",         ico: "♻️", desc: "Ascend 5 times.", check: { kind: "ascensions", v: 5 } },
    { id: "pt1",     name: "Just Five More Minutes",   ico: "⏰", desc: "Play for 1 minute.", check: { kind: "playtime", v: 60 } },
    { id: "pt60",    name: "Marathon Baker",           ico: "🏃", desc: "Play for a whole hour.", check: { kind: "playtime", v: 3600 } }
  ],

  /* ---------------- golden cookie effects ----------------
     w = pick weight (bigger = picked more often). kind:
       lucky       -> instant lump: max(cps*90, cookies*0.15) * mult, capped
       frenzy      -> production buff for secs
       clickFrenzy -> tap-power buff for secs
       clot        -> production PENALTY buff for secs (rare)             */
  GOLDEN_EFFECTS: [
    { id: "lucky",   name: "Lucky!",        ico: "🍀", kind: "lucky",       mult: 1,   secs: 0,  w: 10 },
    { id: "frenzy",  name: "Frenzy",        ico: "🔥", kind: "frenzy",      mult: 7,   secs: 30, w: 30 },
    { id: "clickfz", name: "Click Frenzy",  ico: "🖱️", kind: "clickFrenzy", mult: 777, secs: 12, w: 8 },
    { id: "dragon",  name: "Mega Frenzy",   ico: "🐉", kind: "frenzy",      mult: 15,  secs: 15, w: 8 },
    { id: "storm",   name: "Cookie Storm",  ico: "🌧️", kind: "lucky",       mult: 2,   secs: 0,  w: 3 },
    { id: "sugarrush", name: "Sugar Rush",  ico: "🍬", kind: "frenzy",      mult: 3,   secs: 60, w: 16 },
    { id: "jackpot", name: "Jackpot!",      ico: "💰", kind: "lucky",       mult: 4,   secs: 0,  w: 2 },
    { id: "clot",    name: "Clot",          ico: "🩹", kind: "clot",        mult: 0.5, secs: 12, w: 5 }
  ],

  /* ---------------- news ticker ---------------- */
  NEWS: [
    "Local bakery reportedly 'on a roll', says flour-dusted reporter.",
    "Grandmas union demands warmer ovens, more nap time.",
    "Cursor spotted clicking itself; experts baffled.",
    "Cookie mine collapses; worker fine, cookies everywhere.",
    "Scientists confirm cookies are, in fact, delicious.",
    "Portal opens in bakery; cookies flow out, nobody complains.",
    "Cookie farm reports record harvest of literally just cookies.",
    "Time Warp sends yesterday's cookies to tomorrow; tomorrow thrilled.",
    "Antimatter Oven passes safety inspection 'by a crumb'.",
    "Prism splits one cookie into a million; crumbs file complaint.",
    "Chancemaker bakes cookie that never existed; it's still tasty.",
    "Golden cookie sighted; nation briefly very excited.",
    "Bank now accepts deposits of cookies; interest paid in crumbs.",
    "Temple monks vow silence, except to say 'more cookies'.",
    "Factory adds second conveyor belt; cookies now travel in style.",
    "Weather forecast: light flurry of powdered sugar.",
    "Area kid bakes more cookies than some small countries.",
    "Oven temperature described as 'just right' by visiting chef.",
    "Cookie shortage cancelled, everyone breathed a sugary sigh.",
    "Historians agree: this is a lot of cookies.",
    "Milk sales soar alongside mysterious cookie boom.",
    "Local crumbs declare independence, are promptly swept up.",
    "Bakery cat named official quality inspector; naps on the job.",
    "Grandma wins regional bake-off using only her hands and love.",
    "Time traveller reports cookies are even better in the future.",
    "Cookie prism described as 'the shiniest thing ever built'.",
    "Economists puzzled as cookie becomes strongest currency.",
    "Astronauts request cookies be sent to space station, please.",
    "Mayor declares today Cookie Day; tomorrow also Cookie Day.",
    "Cookie scented candle discontinued: 'redundant', says baker.",
    "Breaking: cookies still warm, situation delicious.",
    "Rumour of secret recipe denied by everyone covered in flour.",
    "Cookie-based rocket enters testing; smells amazing."
  ],

  /* ---------------- baker ranks ---------------- */
  RANKS: [
    { name: "Dough Beginner",     at: 0 },
    { name: "Junior Baker",       at: 1e3 },
    { name: "Cookie Chef",        at: 1e6 },
    { name: "Bakery Boss",        at: 1e9 },
    { name: "Dough Magnate",      at: 1e12 },
    { name: "Cookie Baron",       at: 1e15 },
    { name: "Crumb Overlord",     at: 1e18 },
    { name: "Oven Emperor",       at: 1e21 },
    { name: "Galactic Baker",     at: 1e24 },
    { name: "Universal Baker",    at: 1e27 },
    { name: "Multiverse Baker",   at: 1e30 },
    { name: "The Cosmic Bakery",  at: 1e33 }
  ],

  /* ---------------- heavenly upgrades (permanent, cost crumbs) ----------------
     Same effect kinds as normal upgrades, plus two heavenly-only kinds:
       startBuilding { id, v } -> begin each new run with v free of that building
       costMult      { v }     -> building prices multiplied by v (cheaper)   */
  HEAVENLY: [
    { id: "hstart",  name: "Head Start",      ico: "👆", cost: 5,  desc: "Begin every run with 10 free Cursors",
      effect: { kind: "startBuilding", id: "cursor", v: 10 } },
    { id: "hgluck",  name: "Starry Luck",     ico: "⭐", cost: 10, desc: "Golden cookies show up 25% more often, forever",
      effect: { kind: "goldenFreq", v: 0.75 } },
    { id: "hdur",    name: "Longer Shine",    ico: "🌟", cost: 15, desc: "Golden cookies and buffs last 50% longer, forever",
      effect: { kind: "goldenDur", v: 1.5 } },
    { id: "hoff",    name: "Dreamless Sleep", ico: "😴", cost: 20, desc: "Offline baking pays out 75%, forever",
      effect: { kind: "offlineRate", v: 0.75 } },
    { id: "hcost",   name: "Bulk Discount",   ico: "🏷️", cost: 30, desc: "Buildings cost 10% less, forever",
      effect: { kind: "costMult", v: 0.9 } },
    { id: "hcrumb",  name: "Crumb Doubler",   ico: "🥮", cost: 50, desc: "Double the crumbs from every ascension",
      effect: { kind: "crumbGain", v: 2 } }
  ]
};
