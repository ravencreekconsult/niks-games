/* Original slice data. The overview specifies names/systems, not balance values. */
'use strict';
const TYPES=['Ember','Tide','Verdant','Stone','Gale','Spark','Frost','Shade','Radiance','Iron','Wild','Mind'];
// Attacking type -> overrides. Every unspecified matchup is neutral (1).
const TYPE_CHART={
 Ember:{Verdant:2,Frost:2,Iron:2,Tide:.5,Stone:.5,Ember:.5},
 Tide:{Ember:2,Stone:2,Tide:.5,Verdant:.5,Frost:.5},
 Verdant:{Tide:2,Stone:2,Ember:.5,Verdant:.5,Gale:.5,Iron:.5},
 Stone:{Gale:2,Spark:2,Ember:2,Verdant:.5,Iron:.5},
 Gale:{Verdant:2,Wild:2,Stone:.5,Spark:.5,Iron:.5},
 Spark:{Tide:2,Gale:2,Stone:0,Spark:.5,Verdant:.5},
 Frost:{Verdant:2,Gale:2,Ember:.5,Tide:.5,Iron:.5,Frost:.5},
 Shade:{Mind:2,Radiance:2,Shade:.5,Wild:.5},
 Radiance:{Shade:2,Wild:2,Iron:.5,Radiance:.5},
 Iron:{Stone:2,Frost:2,Radiance:2,Ember:.5,Spark:.5,Iron:.5},
 Wild:{Mind:2,Radiance:.5,Iron:.5,Stone:.5,Shade:0},
 Mind:{Wild:2,Stone:2,Mind:.5,Shade:0,Iron:.5}
};
const typeMultiplier=(type,defTypes)=>defTypes.reduce((n,t)=>n*(TYPE_CHART[type]?.[t]??1),1);
const MOVES={
 tackle:{name:'Tackle',type:'Wild',category:'physical',power:40,accuracy:100,pp:35},
 quick:{name:'Quick dart',type:'Wild',category:'physical',power:35,accuracy:100,pp:25,priority:1},
 ember:{name:'Cinder spit',type:'Ember',category:'special',power:45,accuracy:95,pp:25,status:'Scorch',chance:.15},
 flare:{name:'Flare pounce',type:'Ember',category:'physical',power:65,accuracy:90,pp:15},
 splash:{name:'Jet stream',type:'Tide',category:'special',power:45,accuracy:100,pp:25},
 torrent:{name:'Breaker',type:'Tide',category:'special',power:70,accuracy:90,pp:15},
 leaf:{name:'Thorn flick',type:'Verdant',category:'physical',power:45,accuracy:100,pp:25},
 bloom:{name:'Bramble burst',type:'Verdant',category:'special',power:70,accuracy:90,pp:15},
 pebble:{name:'Pebble shot',type:'Stone',category:'physical',power:50,accuracy:90,pp:20},
 gust:{name:'Gust',type:'Gale',category:'special',power:40,accuracy:100,pp:30},
 spark:{name:'Spark snap',type:'Spark',category:'special',power:45,accuracy:95,pp:25,status:'Static',chance:.2},
 frost:{name:'Frost bite',type:'Frost',category:'special',power:50,accuracy:95,pp:20,status:'Chill',chance:.2},
 shade:{name:'Night pulse',type:'Shade',category:'special',power:50,accuracy:100,pp:20},
 shine:{name:'Glimmer',type:'Radiance',category:'special',power:50,accuracy:100,pp:20},
 iron:{name:'Iron claw',type:'Iron',category:'physical',power:50,accuracy:95,pp:20},
 mind:{name:'Mind ripple',type:'Mind',category:'special',power:50,accuracy:100,pp:20},
 sleep:{name:'Drowse dust',type:'Mind',category:'status',power:0,accuracy:80,pp:15,status:'Slumber',chance:1},
 blight:{name:'Spore cloud',type:'Verdant',category:'status',power:0,accuracy:90,pp:15,status:'Blight',chance:1},
 growl:{name:'Rattle',type:'Wild',category:'status',power:0,accuracy:100,pp:25,stage:'atk',delta:-1,target:'foe'},
 guard:{name:'Brace',type:'Iron',category:'status',power:0,accuracy:100,pp:20,stage:'def',delta:1,target:'self'},
 struggle:{name:'Struggle',type:'Wild',category:'physical',power:45,accuracy:100,pp:999,recoil:true}
};
const SPECIES={
 cindlet:{name:'Cindlet',types:['Ember'],base:[44,52,38,55,40,60],art:'fox',colors:['#c86646','#efba70','#733a38'],catchRate:.52,ability:'Kindle',moves:[[1,'tackle'],[1,'ember'],[5,'quick'],[7,'growl'],[10,'flare']],evolve:{level:10,to:'pyrolynx'},bio:'A warm-eared coast fox. Its tail glows when it is excited.'},
 pyrolynx:{name:'Pyrolynx',types:['Ember','Gale'],base:[64,75,55,77,60,85],art:'fox',adult:true,colors:['#bf4d3e','#f5ce83','#763541'],catchRate:.3,ability:'Kindle',moves:[[1,'tackle'],[1,'ember'],[1,'gust'],[5,'quick'],[10,'flare']],bio:'It rides warm sea winds with a flame-tipped mane.'},
 puddlep:{name:'Puddlep',types:['Tide'],base:[50,42,58,52,55,34],art:'turtle',colors:['#609aa2','#b1dfce','#365b76'],catchRate:.52,ability:'Shellguard',moves:[[1,'tackle'],[1,'splash'],[5,'guard'],[8,'frost'],[10,'torrent']],evolve:{level:10,to:'reefback'},bio:'A tide-pool turtle with a tiny island on its back.'},
 reefback:{name:'Reefback',types:['Tide','Stone'],base:[76,58,88,70,79,40],art:'turtle',adult:true,colors:['#43818c','#c7dab0','#3d5b72'],catchRate:.3,ability:'Shellguard',moves:[[1,'tackle'],[1,'splash'],[1,'pebble'],[5,'guard'],[8,'frost'],[10,'torrent']],bio:'A walking reef. Shore birds mistake it for a safe landing.'},
 spriggit:{name:'Spriggit',types:['Verdant'],base:[46,55,45,45,50,49],art:'plant',colors:['#6b9f54','#c5d986','#3b6450'],catchRate:.52,ability:'Rooted',moves:[[1,'tackle'],[1,'leaf'],[5,'blight'],[8,'guard'],[10,'bloom']],evolve:{level:10,to:'briarook'},bio:'A shy forest hare wearing leaves twice its size.'},
 briarook:{name:'Briarook',types:['Verdant','Iron'],base:[70,82,73,62,72,61],art:'plant',adult:true,colors:['#51825a','#d5d89a','#354b55'],catchRate:.3,ability:'Rooted',moves:[[1,'tackle'],[1,'leaf'],[1,'iron'],[5,'blight'],[10,'bloom']],bio:'Its bramble antlers turn iron-hard after the first frost.'},
 flitter:{name:'Flitter',types:['Gale','Wild'],base:[35,43,30,42,35,65],art:'bird',colors:['#be9257','#eee0a1','#624f50'],catchRate:.65,ability:'Tailwind',moves:[[1,'tackle'],[1,'gust'],[4,'quick'],[7,'growl']],evolve:{level:9,to:'stormcrest'},bio:'An impatient shore bird that always flies into the wind.'},
 stormcrest:{name:'Stormcrest',types:['Gale','Spark'],base:[58,66,48,70,56,90],art:'bird',adult:true,colors:['#527c8f','#edd07a','#354a65'],catchRate:.38,ability:'Tailwind',moves:[[1,'tackle'],[1,'gust'],[1,'spark'],[4,'quick']],bio:'Its copper crest crackles before a storm arrives.'},
 glimoth:{name:'Glimoth',types:['Radiance','Mind'],base:[38,30,33,60,58,47],art:'moth',colors:['#caa877','#f5e3ae','#756181'],catchRate:.58,ability:'Clear mind',moves:[[1,'tackle'],[1,'shine'],[3,'sleep'],[6,'mind']],evolve:{level:9,to:'lumenwing'},bio:'Its wings hold little maps of the constellations.'},
 lumenwing:{name:'Lumenwing',types:['Radiance','Mind'],base:[61,42,53,88,85,65],art:'moth',adult:true,colors:['#b08aa0','#f5dbb1','#584e7a'],catchRate:.32,ability:'Clear mind',moves:[[1,'tackle'],[1,'shine'],[1,'mind'],[3,'sleep']],bio:'A drifting lantern that can follow a thought through fog.'},
 shiveroot:{name:'Shiveroot',types:['Frost','Shade'],base:[43,45,48,53,55,35],art:'ghost',colors:['#8ba3b6','#d1dfd6','#596281'],catchRate:.5,ability:'Cold skin',moves:[[1,'tackle'],[1,'frost'],[3,'shade'],[6,'growl']],evolve:{level:9,to:'hollowpine'},bio:'A small spirit found in the hollow of a frozen stump.'},
 hollowpine:{name:'Hollowpine',types:['Frost','Shade'],base:[68,63,71,81,80,49],art:'ghost',adult:true,colors:['#657f99','#c4dccb','#414b70'],catchRate:.3,ability:'Cold skin',moves:[[1,'tackle'],[1,'frost'],[1,'shade'],[6,'growl']],bio:'A quiet guardian of the oldest trees in Rivenmoor.'}
};
const BALLS={basic:{name:'Field ball',bonus:.55,color:'#b4c0a6'},trail:{name:'Trail ball',bonus:1,color:'#dc9b5a'},great:{name:'Reef ball',bonus:1.5,color:'#68adc2'},ultra:{name:'Aurora ball',bonus:2,color:'#bea6d6'}};
const STATUS_INFO={Scorch:'Loses HP each turn; physical attack is halved.',Blight:'Loses more HP each turn.',Static:'Speed is halved; 1 in 4 turns may be lost.',Slumber:'Cannot move for 1-3 turns.',Chill:'Speed is halved; 1 in 5 turns may be lost.'};
const ABILITIES={Kindle:'Ember moves deal 15% more damage.',Shellguard:'Physical damage taken is reduced by 15%.',Rooted:'Restores a little HP after every turn.',Tailwind:'Speed is boosted by 15%.','Clear mind':'Cannot be put into Slumber.','Cold skin':'Cannot be Chilled.'};
const ENCOUNTERS=[['flitter',30],['glimoth',25],['shiveroot',20],['spriggit',10],['puddlep',8],['cindlet',7]];
