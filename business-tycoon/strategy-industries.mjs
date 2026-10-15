import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,forecast,worth,INDUSTRIES,ECONOMICS,startupCost,cashPlan} from './engine.mjs';
let rows=[];
for(let route of [...Object.keys(INDUSTRIES),'cafe-counter','cafe-table','logistics-express'])for(let seed of [17,531,98431,24316,90210]){
 let type=route.startsWith('cafe-')?'cafe':route==='logistics-express'?'logistics':route,style=route.startsWith('cafe-')?route.slice(5):'standard';
 let s=freshInitial();s.rng=seed;let minimum=s.cash,orders=0,collections=0,salary=0;
 const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s),type+' invalid '+t);assert.ok(s.cash>=0,type+' negative after '+t+' week '+s.week);minimum=Math.min(minimum,s.cash);};
 for(let n=0;n<3;n++)move('life:activity',{id:'book'});
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 // Earn capital through actual salary actions and personal days. No cash injection.
 let target=INDUSTRIES[type].cost+180+220+600+INDUSTRIES[type].input*100+5000;
 while(s.cash<target){if(s.shifts>=4||s.hoursUsed+8>40)move('week');if(s.life.hours<8||s.life.energy<28)move('life:sleep');move('shift');assert.ok(s.week<60,'salary runway stalled');}
 move('open',{industry:type});move('hire',{id:1});move('hire',{id:1});move('manager',{id:1});
 if(ECONOMICS[type].stock){move('autoRestock',{id:1});move('restockBudget',{id:1,level:3000});}
 if(type==='manufacturing')move('autoProduction',{id:1});
 if(type==='cafe'&&style!=='standard')move('cafeStyle',{id:1,style});
 if(route==='logistics-express')move('route',{id:1,route:'express'});
 let opened=s.week,start=s.cash;
 // Owner deliberately stops outside salary here. The firm must fund its own bills and personal costs.
 for(let week=0;week<32;week++){
  let b=s.businesses[0];if(b.condition<65)move('maintenance',{id:1});
  let q=cashPlan(s);orders+=q.restock;move('week');collections+=s.businesses[0].last.collected;
  let roundtrip=restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(roundtrip,s);
 }
 rows.push({route,seed,opened,minimum:Math.round(minimum),start:Math.round(start),end:Math.round(s.cash),change:Math.round(s.cash-start),orders:Math.round(orders),collections:Math.round(collections),worth:Math.round(worth(s))});
}
console.table(rows);console.log('PASS 50 earned fresh-to-industry 32-week strategies across seven industries plus cafe styles and express logistics/five seeds; salary-earned startup, no cash injection/manual jobs, no outside salary after opening; per-action solvency and exact restore');
