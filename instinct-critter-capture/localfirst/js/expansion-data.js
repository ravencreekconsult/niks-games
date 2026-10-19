'use strict';
// Prototype chapter expansion. These names/balance values are original.
const MORE_LINES=[
 ['pebblit','cragodon','Pebblit','Cragodon',['Stone'],['Stone','Iron'],'turtle',['#a59a83','#d8d2b2','#5c665f'],'pebble','iron','Shellguard'],
 ['voltkit','thunderpaw','Voltkit','Thunderpaw',['Spark'],['Spark','Wild'],'fox',['#caac53','#ede49a','#6b5a4a'],'spark','quick','Tailwind'],
 ['snowbun','frosthorn','Snowbun','Frosthorn',['Frost'],['Frost','Verdant'],'plant',['#92b8b2','#edf0ce','#59747d'],'frost','leaf','Cold skin'],
 ['duskit','umbrafox','Duskit','Umbrafox',['Shade'],['Shade','Mind'],'fox',['#897995','#c3aac8','#434457'],'shade','mind','Clear mind'],
 ['tinling','forgeback','Tinling','Forgeback',['Iron'],['Iron','Ember'],'turtle',['#929eaa','#d4dbca','#4a5c6c'],'iron','ember','Shellguard'],
 ['mossling','eldermoss','Mossling','Eldermoss',['Verdant','Stone'],['Verdant','Stone'],'ghost',['#7b9c68','#d4d8a2','#465e48'],'leaf','pebble','Rooted'],
 ['brookfin','rivermaw','Brookfin','Rivermaw',['Tide'],['Tide','Mind'],'turtle',['#6babb2','#cae3c2','#46687e'],'splash','mind','Clear mind'],
 ['sunpip','dawncrest','Sunpip','Dawncrest',['Radiance'],['Radiance','Gale'],'bird',['#d5a071','#f6df9e','#85604f'],'shine','gust','Tailwind'],
 ['wispup','veilfang','Wispup','Veilfang',['Shade','Wild'],['Shade','Wild'],'fox',['#8d9390','#d7d3ba','#505967'],'shade','quick','Clear mind'],
 ['thoughtlet','oracloom','Thoughtlet','Oracloom',['Mind'],['Mind','Verdant'],'moth',['#c594ae','#e4d4b2','#736181'],'mind','bloom','Clear mind'],
 ['coalimp','magmoss','Coalimp','Magmoss',['Ember','Stone'],['Ember','Stone'],'ghost',['#bf7959','#f0c38a','#725b58'],'ember','pebble','Kindle'],
 ['breezeling','skyribbon','Breezeling','Skyribbon',['Gale'],['Gale','Frost'],'moth',['#83a6b1','#d8e6be','#557383'],'gust','frost','Tailwind']
];
MORE_LINES.forEach(([a,b,an,bn,at,bt,art,colors,move,extra,ability],index)=>{
 const base=[40+index%4*3,40+index%3*5,42+index%5*3,45+index%3*5,42+index%4*4,38+index%5*5];
 SPECIES[a]={name:an,types:at,base,art,colors,catchRate:.58,ability,moves:[[1,'tackle'],[1,move],[5,'guard'],[8,extra]],evolve:{level:12,to:b},bio:'A small '+at[0].toLowerCase()+' critter native to the wooded valley.'};
 SPECIES[b]={name:bn,types:bt,base:base.map(v=>v+25),art,adult:true,colors:colors.map((c,i)=>i===0?c:colors[i]),catchRate:.3,ability,moves:[[1,'tackle'],[1,move],[1,extra],[5,'guard']],bio:'The grown form of '+an+', adapted to life beyond the coast.'};
});
const HERITAGE={Sturdy:{key:'def',bonus:1.08,description:'+8% defence'},Fleet:{key:'spe',bonus:1.08,description:'+8% speed'},Keen:{key:'spa',bonus:1.08,description:'+8% special attack'},Brave:{key:'atk',bonus:1.08,description:'+8% attack'},Gentle:{key:'spd',bonus:1.08,description:'+8% special defence'}};
const MARKS={Plain:{name:'Plain',color:'#cbd7b1'},Freckled:{name:'Freckled',color:'#f1d397'},Moonband:{name:'Moonband',color:'#b9cde2'},Rosetipped:{name:'Rose-tipped',color:'#dcb0c4'}};
const REGION={village:{name:'Bramblebay village',tag:'HOME'},route:{name:'Reedway route',tag:'ROUTE 01'},forest:{name:'Lanternwood forest',tag:'WOODLAND'},town:{name:'Alderhaven town',tag:'TOWN 02'},cave:{name:'Echoquarry cave',tag:'CAVE 01'}};
const AREA_ENCOUNTERS={route:ENCOUNTERS,forest:[['mossling',20],['thoughtlet',15],['duskit',15],['breezeling',15],['spriggit',15],['snowbun',10],['sunpip',10]],cave:[['pebblit',25],['tinling',20],['coalimp',15],['voltkit',15],['wispup',15],['brookfin',10]]};
const TRAINERS={wren:{name:'Scout Wren',team:[['flitter',5],['glimoth',6]],prize:120},fern:{name:'Keeper Fern',team:[['mossling',7],['thoughtlet',8]],prize:160},rowan:{name:'Rival Rowan',team:[['voltkit',9],['puddlep',10]],prize:220},flint:{name:'Miner Flint',team:[['pebblit',10],['tinling',11],['coalimp',11]],prize:280}};
// 25 prototype nature entries: five neutral, twenty +/-10% pairs.
const NATURES={Hardy:{},Docile:{},Serious:{},Bashful:{},Quirky:{},Lonely:{up:'atk',down:'def'},Brave:{up:'atk',down:'spe'},Adamant:{up:'atk',down:'spa'},Naughty:{up:'atk',down:'spd'},Bold:{up:'def',down:'atk'},Relaxed:{up:'def',down:'spe'},Impish:{up:'def',down:'spa'},Lax:{up:'def',down:'spd'},Timid:{up:'spe',down:'atk'},Swift:{up:'spe',down:'def'},Jolly:{up:'spe',down:'spa'},Naive:{up:'spe',down:'spd'},Modest:{up:'spa',down:'atk'},Mild:{up:'spa',down:'def'},Quiet:{up:'spa',down:'spe'},Rash:{up:'spa',down:'spd'},Calm:{up:'spd',down:'atk'},Gentle:{up:'spd',down:'def'},Sassy:{up:'spd',down:'spe'},Careful:{up:'spd',down:'spa'}};
const HELD_ITEMS={salve:{name:'Cleanse salve',price:25,consumable:true,description:'Single use. In battle, removes one status condition from the active companion.'},mosscharm:{name:'Moss charm',price:80,description:'Recover 1/16 maximum HP each turn.'},shellplate:{name:'Shell plate',price:100,description:'Take 10% less physical damage.'},emberstone:{name:'Ember stone',price:100,description:'Ember moves deal 10% more damage.'},swiftfeather:{name:'Swift feather',price:100,description:'Gain 10% speed.'}};
const SHOP={trail:{name:'Trail ball',price:10,kind:'ball'},great:{name:'Reef ball',price:25,kind:'ball'},ultra:{name:'Aurora ball',price:45,kind:'ball'},potion:{name:'Field potion',price:15,kind:'potion'},...Object.fromEntries(Object.entries(HELD_ITEMS).map(([k,v])=>[k,{...v,kind:'held'}]))};
const CHALLENGES={brook:{name:'Warden Brook',badge:'Current badge',power:'Swim',team:[['puddlep',7],['brookfin',8]],prize:180},granite:{name:'Warden Granite',badge:'Quarry badge',power:'Shove',team:[['pebblit',10],['tinling',10]],prize:200},aurora:{name:'Warden Aurora',badge:'Lantern badge',team:[['glimoth',12],['sunpip',12]],prize:240},thorn:{name:'Warden Thorn',badge:'Bramble badge',team:[['briarook',14],['mossling',14],['thoughtlet',14]],prize:300}};
Object.assign(TRAINERS,CHALLENGES);
Object.assign(REGION,{hall:{name:'Alderhaven challenge hall',tag:'CHALLENGES'},lake:{name:'Mirrorlake crossing',tag:'FIELD · SWIM'},mine:{name:'Deep Echoquarry',tag:'FIELD · SHOVE'}});
AREA_ENCOUNTERS.lake=[['brookfin',40],['puddlep',25],['sunpip',20],['breezeling',15]];
AREA_ENCOUNTERS.mine=[['coalimp',30],['tinling',30],['pebblit',25],['wispup',15]];
// Each attacking type has >=2 strengths and each defending type >=2 weaknesses.
TYPE_CHART.Wild.Spark=2;TYPE_CHART.Mind.Iron=2;TYPE_CHART.Radiance.Mind=2;
Object.entries(SPECIES).forEach(([id,s])=>{s.growthCurve='cubic';s.rarity=s.adult?'evolved':'common';s.habitat=Object.entries(AREA_ENCOUNTERS).filter(([,table])=>table.some(([k])=>k===id)).map(([area])=>REGION[area].name);s.trainingYield={key:KEY_FROM_TYPE(s.types[0]),amount:2}});
function KEY_FROM_TYPE(t){return({Ember:'spa',Tide:'hp',Verdant:'def',Stone:'def',Gale:'spe',Spark:'spe',Frost:'spd',Shade:'spa',Radiance:'spd',Iron:'atk',Wild:'atk',Mind:'spa'})[t]}
TYPE_CHART.Frost.Shade=2;

TRAINERS.duotutors={name:'Field tutors',team:[['flitter',5],['puddlep',5],['spriggit',6]],prize:0,double:true};TRAINERS.thorn.double=true;

Object.values(SPECIES).forEach(s=>{s.eggMoves=({fox:['quick','guard','ember'],turtle:['guard','splash','iron'],plant:['guard','leaf','bloom'],bird:['quick','gust','shine'],moth:['mind','shade','gust'],ghost:['shade','mind','pebble']})[s.art].filter(id=>MOVES[id]);});

Object.assign(REGION,{harbor:{name:'Willowharbor village',tag:'LAKESIDE'},orchard:{name:'Amber orchard',tag:'ROUTE 03'},marsh:{name:'Reedglass marsh',tag:'WETLAND'},ruins:{name:'Old lantern ruins',tag:'HERITAGE'},ridge:{name:'Quarry overlook',tag:'VALLEY FINALE'}});
Object.assign(AREA_ENCOUNTERS,{orchard:[['sunpip',25],['voltkit',20],['spriggit',20],['thoughtlet',20],['duskit',15]],marsh:[['puddlep',25],['brookfin',25],['glimoth',20],['wispup',15],['mossling',15]],ruins:[['coalimp',20],['thoughtlet',20],['wispup',20],['pebblit',20],['tinling',20]],ridge:[['breezeling',25],['snowbun',20],['sunpip',20],['voltkit',20],['duskit',15]]});
Object.assign(TRAINERS,{amber:{name:'Orchard keeper Amber',team:[['spriggit',12],['voltkit',13]],prize:240},reed:{name:'Marsh guide Reed',team:[['brookfin',13],['glimoth',14]],prize:260},ivy:{name:'Archivist Ivy',team:[['thoughtlet',14],['coalimp',14],['wispup',15]],prize:300,double:true},rowanFinal:{name:'Rowan at the overlook',team:[['thunderpaw',17],['rivermaw',17],['eldermoss',18]],prize:420,double:true}});
Object.entries(SPECIES).forEach(([id,s])=>{s.habitat=Object.entries(AREA_ENCOUNTERS).filter(([,table])=>table.some(([k])=>k===id)).map(([area])=>REGION[area].name)});

const CHAMBERS={brookhall:{name:'Current waterworks',warden:'brook',tile:'water',color:'#649fac',story:'Brook keeps clean water flowing through the valley. Follow the dry walkway and open the intake valve before your test.'},granitehall:{name:'Quarry works',warden:'granite',tile:'rock',color:'#99907c',story:'Granite trains companions that keep the mine safe. Reach the support winch before your test.'},aurorahall:{name:'Lantern observatory',warden:'aurora',tile:'flower',color:'#c8ad7d',story:'Aurora studies the old lantern signals. Align the reflector before your test.'},thornhall:{name:'Bramble conservatory',warden:'thorn',tile:'tree',color:'#708d63',story:'Thorn raises pairs that protect the valley together. Open the seed gate, then bring two healthy companions for the team test.'}};
Object.assign(REGION,Object.fromEntries(Object.entries(CHAMBERS).map(([id,c])=>[id,{name:c.name,tag:'WARDEN CHALLENGE'}])),{lab:{name:'Bramblebay field lab',tag:'INTERIOR'},nursery:{name:'Alderhaven nursery interior',tag:'INTERIOR'},depot:{name:'Willowharbor supply depot',tag:'INTERIOR'}});

TRAINERS.trailCircuit={name:'Valley trail practice',team:[['flitter',6],['puddlep',6]],prize:70};
const EXPEDITIONS=[{id:'trail',title:'A record for the keepers',speaker:'Ranger Moss',story:'"The old beacon has stopped answering. Before we send anyone beyond the village, show us the creatures that still call this valley home. Wren will test whether you can travel safely."',goal:'Defeat Scout Wren and record at least three species as caught.',reward:90},{id:'family',title:'The nursery promise',speaker:'Keeper Fern',story:'"The valley cannot live on borrowed strength. Take two companions to Alderhaven, hatch their first child, and show that you can raise a family as well as win a fight."',goal:'Reach Alderhaven, defeat Fern and hatch a generation-1-or-later companion.',reward:150},{id:'lantern',title:'A light beneath the stone',speaker:'Miner Flint',story:'"The mine lantern used to answer the coast beacon. Now its lens is dim. Earn the keepers\' four badges, move the fallen stone and bring that light back."',goal:'Earn four badges and restore the quarry lantern.',reward:220},{id:'beacon',title:'What the valley remembers',speaker:'Willowharbor elder',story:'"The archive holds the first families\' record. Rowan wants to know what kind of keeper you have become. Carry both their trust and that record to the overlook."',goal:'Read the archive, defeat final Rowan and restore the overlook beacon.',reward:320}];
// Visual identity is independent of nursery body-family compatibility.
Object.assign(SPECIES.pebblit,{spriteKey:'rockling',bio:'A young quarry keeper that stacks loose stones on its shell. Miners follow its tapping when a tunnel wall is unsafe.'});Object.assign(SPECIES.cragodon,{spriteKey:'rockling',bio:'Its stepped stone shell shelters smaller companions from falling gravel. It only pushes a rock after checking what lies beyond.'});
for(const id of ['brookfin','rivermaw'])SPECIES[id].spriteKey='riverfin';
for(const id of ['breezeling','skyribbon'])SPECIES[id].spriteKey='ribbon';
for(const id of ['snowbun','frosthorn'])SPECIES[id].spriteKey='snowhare';
for(const id of ['coalimp','magmoss'])SPECIES[id].spriteKey='coalspirit';
Object.assign(SPECIES.brookfin,{bio:'A whiskered river companion that finds clean currents beneath the rain. Its fins sound like tiny bells against smooth stones.'});Object.assign(SPECIES.rivermaw,{bio:'It carries young river companions through floodwater. The old keepers watched its route before building the waterworks.'});
Object.assign(SPECIES.breezeling,{bio:'A little wind ribbon that hides in the high leaves. It curls around a warm lantern when the forest grows cold.'});Object.assign(SPECIES.skyribbon,{bio:'Its long sail catches cold mountain winds. When two meet, their ribbons draw loops above the valley.'});
Object.assign(SPECIES.snowbun,{bio:'It leaves six-pointed prints where frost settles on the woodland path. Its ears shelter the first winter shoots.'});Object.assign(SPECIES.frosthorn,{bio:'New leaves grow beneath its icy antlers. It walks slowly so the woodland seedlings are never crushed.'});
Object.assign(SPECIES.coalimp,{bio:'A pocket-sized hearth spirit that warms empty mine camps. Its little coal crown glows brighter when someone tells a story.'});Object.assign(SPECIES.magmoss,{bio:'Warm moss grows around its ember heart. Forgotten miners once used that glow to find the path home.'});
Object.values(SPECIES).forEach(s=>{s.habitat=Object.entries(AREA_ENCOUNTERS).filter(([,table])=>table.some(([k])=>SPECIES[k]===s)).map(([area])=>REGION[area].name)});

for(const [ids,key]of [[['voltkit','thunderpaw'],'lightningcat'],[['duskit','umbrafox'],'nightfox'],[['tinling','forgeback'],'armadillo'],[['mossling','eldermoss'],'mossstump'],[['sunpip','dawncrest'],'crestbird'],[['wispup','veilfang'],'veildog'],[['thoughtlet','oracloom'],'orchidmind']])for(const id of ids)SPECIES[id].spriteKey=key;
Object.assign(SPECIES.voltkit,{bio:'Its forked tail stores static from dry grass. Small sparks give away its hiding place before its paws do.'});Object.assign(SPECIES.thunderpaw,{bio:'A fast trail runner whose mane crackles before a storm. It guides lost teams away from exposed ridges.'});
Object.assign(SPECIES.duskit,{bio:'A wide-eared fox that listens where lantern light cannot reach. It leaves tiny crescent tracks after dusk.'});Object.assign(SPECIES.umbrafox,{bio:'Its long shadow keeps pace even under broken moonlight. Patient keepers learn to read its quiet tail signals.'});
Object.assign(SPECIES.tinling,{bio:'Overlapping metal plates fold around this shy quarry forager. It polishes them against warm stones.'});Object.assign(SPECIES.forgeback,{bio:'Heat glows beneath its layered armor. Quarry workers rest tools on its shell only after asking permission.'});
Object.assign(SPECIES.mossling,{bio:'A walking stump with fresh moss growing around old roots. It remembers which banks need new seedlings.'});Object.assign(SPECIES.eldermoss,{bio:'Its branching roots hold soil through the valley rains. Small families nest safely beneath its moss.'});
Object.assign(SPECIES.sunpip,{bio:'A crested bird that catches the first light in its feathers. Its morning calls once guided the lantern keepers.'});Object.assign(SPECIES.dawncrest,{bio:'The crest opens like a fan at sunrise. A flock can carry a gleam from one hill to the next.'});
Object.assign(SPECIES.wispup,{bio:'A small hound with a pale veil around its shoulders. It follows familiar footsteps without making a sound.'});Object.assign(SPECIES.veilfang,{bio:'A quiet guardian whose misty collar thickens near danger. It waits at the edge of camp until every companion returns.'});
Object.assign(SPECIES.thoughtlet,{bio:'An orchid-shaped companion whose petals twitch with nearby thoughts. Calm voices help it settle.'});Object.assign(SPECIES.oracloom,{bio:'Its layered petals open when a family is at ease. The archive keepers once read stories in their changing patterns.'});

const REMATCH_IDS=['brook','granite','aurora','thorn','rowanFinal'];for(const id of REMATCH_IDS)TRAINERS['rematch_'+id]={...TRAINERS[id],name:TRAINERS[id].name+' · Rematch',team:TRAINERS[id].team.map(v=>[...v]),prize:100};

const COATS={Native:{color:'#d8c8a2',name:'Native'},Copper:{color:'#da8a5b',name:'Copper'},Silver:{color:'#a3bfd6',name:'Silver'},Moss:{color:'#8eb98a',name:'Moss'},Platinum:{color:'#dfedf4',name:'Platinum',recessive:true},Piebald:{color:'#f4ecd9',name:'Piebald',recessive:true},Streaked:{color:'#dae1e6',name:'Streaked',recessive:true}};const coatExpressed=genes=>genes.filter(g=>!COATS[g].recessive||genes.every(x=>x===g));const coatName=genes=>{const shown=coatExpressed(genes);return !shown.length?'Native coat':shown.length===1?shown[0]+' coat':shown[0]===shown[1]?shown[0]+' coat':shown.slice().sort().join(' / ')+' blend'};

// Third starter forms: habitat-grown, not automatic level upgrades.
const THIRD_FORMS=[['pyrolynx','sunmane','Sunmane',['Ember','Gale'],['forest','orchard','ridge'],'A mature flame-mantled guardian whose warmth steadies the high trails.'],['reefback','atollward','Atollward',['Tide','Stone'],['lake','marsh','harbor'],'A living reef island. Clear water runs down its coral terraces.'],['briarook','canopyrook','Canopyrook',['Verdant','Iron'],['forest','orchard','ruins'],'A canopy guardian whose antlers shelter blossoms, seeds and nesting birds.']];
for(const [from,id,name,types,habitats,bio]of THIRD_FORMS){const parent=SPECIES[from];parent.evolve={to:id,resonanceOnly:true,habitats};SPECIES[id]={...parent,name,types,base:parent.base.map((v,i)=>v+(i===0?15:12)),catchRate:.15,evolve:null,bio,habitat:['Raised through Resonance evolution'],moves:parent.moves.map(v=>[...v])}}

const SUBGENES=['PigmentLoss','PaleLink','DarkPigment','DeepTone'];
const neutralSubgenes=()=>Object.fromEntries(SUBGENES.map(k=>[k,[0,0]]));
function ultraPhenotype(m){const g=m.subgenes||neutralSubgenes(),on=k=>g[k]?.every(v=>v===1);return on('PigmentLoss')&&on('PaleLink')?'Albino':on('DarkPigment')&&on('DeepTone')?'Melanistic':null}
function appearanceCoat(m){const ultra=ultraPhenotype(m);return ultra?[ultra,ultra]:m.coat}
function ultraChance(a,b,keys){return keys.reduce((n,k)=>n*((a.subgenes?.[k]||[0,0]).reduce((x,y)=>x+y,0)/2)*((b.subgenes?.[k]||[0,0]).reduce((x,y)=>x+y,0)/2),1)*100}
COATS.Albino={name:'Albino',color:'#fff0d4',recessive:true};COATS.Melanistic={name:'Melanistic',color:'#171b24',recessive:true};

REGION.farm={name:'Your home farm',tag:'HOME FARM'};

const TRAINING_SCHOOLS={
 grove:{name:'Lanternwood Grove School',area:'forest',types:['Verdant','Wild','Mind','Gale'],stat:'spd',species:['mossling','thoughtlet','flitter'],trophy:'Living Roots Cup',color:'#668b51'},
 tide:{name:'Willowharbor Tide School',area:'harbor',types:['Tide','Frost','Radiance','Shade'],stat:'spa',species:['puddlep','snowbun','sunpip'],trophy:'Mirrorlake Cup',color:'#659eac'},
 forge:{name:'Echoquarry Forge School',area:'cave',types:['Ember','Stone','Spark','Iron'],stat:'atk',species:['coalimp','pebblit','tinling'],trophy:'Quarry Lantern Cup',color:'#b47b50'}
};
for(const[id,g]of Object.entries(TRAINING_SCHOOLS))for(let rank=1;rank<=3;rank++)TRAINERS['school_'+id+'_'+rank]={name:g.name+' · '+['','Apprentice','Adept','Cup final'][rank],team:g.species.slice(0,rank).map(s=>[s,5+rank*5]),prize:rank*60,school:id,rank};
const FIELD_TRAINING={
 village:{name:'Sunleaf patch',kind:'Plant',stat:'hp',x:23,y:16},route:{name:'Windreed cluster',kind:'Plant',stat:'spe',x:24,y:28},forest:{name:'Rootglow fern',kind:'Plant',stat:'spd',x:23,y:33},orchard:{name:'Amberberry bush',kind:'Plant',stat:'def',x:23,y:38},marsh:{name:'Moonwater reed',kind:'Plant',stat:'spa',x:23,y:34},cave:{name:'Old forge tablet',kind:'Artifact',stat:'atk',x:23,y:30},ruins:{name:'Family-training mosaic',kind:'Artifact',stat:'spd',x:24,y:30},ridge:{name:'Beacon tuning stone',kind:'Artifact',stat:'spa',x:24,y:30}
};

const SCHOOL_BRACKETS={
 grove:['Mira','Ash','Nell','Sage','Wren','Fern','Rowan'],
 tide:['Tavi','Mae','Oren','Brook','Lark','Vale','Sable'],
 forge:['Ellis','Flint','Granite','Pip','Ember','Copper','Quill']
};
for(const[id,g]of Object.entries(TRAINING_SCHOOLS))for(let round=0;round<3;round++)TRAINERS['tournament_'+id+'_'+round]={name:SCHOOL_BRACKETS[id][round*2],team:g.species.slice(0,round+1).map(s=>[s,18+round*4]),prize:90+round*30,tournament:id,round};

// Extra passives extend, never replace existing species abilities.
Object.assign(ABILITIES,{'Rain caller':'Summons rain on battle entry until another weather caller enters.','Sun caller':'Summons sun on battle entry until another weather caller enters.','Iron resolve':'After surviving physical damage, Defence rises one stage, up to +6.'});
for(const id of ['brookfin','rivermaw'])SPECIES[id].extraAbility='Rain caller';
for(const id of ['sunpip','dawncrest'])SPECIES[id].extraAbility='Sun caller';
for(const id of ['tinling','forgeback'])SPECIES[id].extraAbility='Iron resolve';

// Species rarity is independent of inherited coat rarity. Native residents stay common;
// a few specialist lines are occasional finds within their existing habitats.
const FIELD_RARITY={Common:{weight:1},Uncommon:{weight:.2},Rare:{weight:.05}};
for(const [id,s] of Object.entries(SPECIES))s.fieldRarity=['thoughtlet','brookfin','wispup'].includes(id)?'Rare':['duskit','sunpip','snowbun','voltkit'].includes(id)?'Uncommon':'Common';
