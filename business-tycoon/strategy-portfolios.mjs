import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,worth,ECONOMICS,cashPlan} from './engine.mjs';
let rows=[];
for(let types of [['service','shop','manufacturing','logistics'],['service','mechanic','cafe','transport']])for(let seed of [17,531,98431,24316,90210]){
 let s=freshInitial();s.rng=seed;let minimum=s.cash,orders=0,collections=0,expansions=[];
 const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s));assert.ok(s.cash>=0,'negative cash '+t+' week '+s.week);minimum=Math.min(minimum,s.cash);};
 for(let n=0;n<3;n++)move('life:activity',{id:'book'});
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 while(s.cash<3000){if(s.shifts>=4||s.hoursUsed+8>40)move('week');if(s.life.hours<8||s.life.energy<28)move('life:sleep');move('shift');}
 function open(type){move('open',{industry:type});let id=s.businesses.at(-1).id;move('hire',{id});move('hire',{id});move('manager',{id});if(ECONOMICS[type].stock){move('autoRestock',{id});move('restockBudget',{id,level:3000});}if(type==='manufacturing')move('autoProduction',{id});if(type==='cafe')move('cafeStyle',{id,style:'table'});expansions.push({type,week:s.week});}
 open('service');let salaryStops=s.week;
 // Expansion deliberately waits for reserve, entirely funded by company cash after first ownership.
 for(let n=0;n<120;n++){
  if(s.businesses.length<4&&s.cash>20000)open(types.find(type=>!s.businesses.some(b=>b.type===type)));
  for(let b of s.businesses)if(b.condition<65)move('maintenance',{id:b.id});
  if(n%13===0&&s.businesses.length>1)move('settlementOrder',{id:s.businesses.at(-1).id,direction:-1});
  let q=cashPlan(s);orders+=q.restock;move('week');collections+=s.businesses.reduce((n,b)=>n+b.last.collected,0);
  assert.ok(Math.abs(s.report.net-q.net)<.02,'mixed cash plan vs report week '+s.week);
  assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
 }
 assert.equal(s.businesses.length,4,'expansion not earned');
 rows.push({route:types.join('+'),seed,salaryStops,expansions:expansions.map(x=>x.type+'@'+x.week).join(', '),minimum:Math.round(minimum),cash:Math.round(s.cash),worth:Math.round(worth(s)),orders:Math.round(orders),collections:Math.round(collections)});
}
console.table(rows);console.log('PASS 10 earned fresh-to-four-firm 120-week portfolios, two industry mixes/five seeds; no injected cash/manual jobs/outside salary after first ownership, per-action solvency, shared-budget cash-plan reconciliation and exact restore');
