import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../localfirst/',import.meta.url),source=fs.readFileSync(new URL('js/game.js',root),'utf8'),old=fs.readFileSync(new URL('baseline-game-v20.js',import.meta.url),'utf8');
function take(s,n){const a=s.search(new RegExp('(?:async )?function '+n+'\\('));assert.ok(a>=0,n);let rest=s.slice(a),b=rest.search(/\n (?:async )?function /);return b<0?rest:rest.slice(0,b)}
const c=vm.createContext({console});for(const f of ['data','expansion-data'])vm.runInContext(fs.readFileSync(new URL('js/'+f+'.js',root),'utf8'),c);
vm.runInContext(`let state={area:'route'},weather='Clear',time='Day';const currentWeather=()=>weather,currentTime=()=>time,rand=n=>Math.floor(Math.random()*n);`,c);
for(const n of ['encounterTable','pickEncounter','assignWildGenes'])vm.runInContext(take(source,n),c);
for(const n of ['assignWildGenes','stats','odds','showBreeding','validFamily','validSave','load','save','migrate'])assert.equal(take(source,n),take(old,n),n+' outside scope');
let conditions=0,samples=0;
for(const area of vm.runInContext('Object.keys(AREA_ENCOUNTERS)',c))for(const time of ['Day','Night'])for(const weather of ['Clear','Rain','Sun']){
 c.input={area,time,weather};const table=vm.runInContext('state.area=input.area;time=input.time;weather=input.weather;encounterTable()',c);
 assert.ok(Math.abs(table.reduce((n,[,p])=>n+p,0)-100)<1e-8);
 let common=0,previous=0;for(const[id,rate]of table){
  c.id=id;assert.ok(vm.runInContext('!!SPECIES[id]&&!!FIELD_RARITY[SPECIES[id].fieldRarity]',c));
  if(vm.runInContext('SPECIES[id].fieldRarity',c)==='Common')common+=rate;
  if(id==='sunpip')assert.notEqual(time,'Night');if(['duskit','wispup'].includes(id))assert.equal(time,'Night');if(id==='brookfin')assert.equal(weather,'Rain');
  for(const roll of [previous+1e-9,previous+rate/2,previous+rate-1e-9]){c.table=table;c.roll=roll;assert.equal(vm.runInContext('pickEncounter(table,roll)',c),id);samples++}previous+=rate;
 }
 assert.ok(common>=60,area+' '+time+' '+weather+' not mostly common: '+common);
 c.table=table;assert.equal(vm.runInContext('pickEncounter(table,99.999999999)',c),table.at(-1)[0]);conditions++;
}
// Sweep every coat threshold midpoint; native hidden carriers stay ordinary-looking, ultra never wild.
let coats={};for(let i=0;i<10000;i++){c.roll=(i+.5)/100;const m=vm.runInContext('assignWildGenes({id:"flitter"},roll)',c);const g=m.coat[0]==='Native'?'Native':m.coat[0];coats[g]=(coats[g]||0)+1;assert.ok(!Object.values(m.subgenes).some(p=>p[0]&&p[1]));}
assert.deepEqual(coats,{Native:9600,Copper:200,Silver:100,Moss:50,Piebald:25,Streaked:20,Platinum:5});
const expansion=fs.readFileSync(new URL('js/expansion-data.js',root),'utf8'),before=fs.readFileSync(new URL('baseline-expansion-v20.js',import.meta.url),'utf8');assert.ok(expansion.startsWith(before),'existing species/learnsets/area tables changed');
console.log('PASS '+conditions+' habitat/time/weather tables: normalized,>=60% commons, restrictions; '+samples+' continuous-roll boundaries;10000 coat bins retain exact previous rates; inheritance/catch/stats/save code unchanged');
