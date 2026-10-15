import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,forecast,worth,INDUSTRIES,ECONOMICS,startupCost,cashPlan,cashExposure} from './engine.mjs';
let rows=[];
for(let reserve of [250,1000,2500,6000])for(let route of ['shop','cafe-table','manufacturing','logistics','logistics-express'])for(let seed of [17,531,98431,24316,90210]){
 let type=route.startsWith('cafe-')?'cafe':route==='logistics-express'?'logistics':route,style=route.startsWith('cafe-')?route.slice(5):'standard';
 let s=freshInitial();s.rng=seed;let minimum=s.cash,orders=0,collections=0,salary=0;
 const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s),type+' invalid '+t);minimum=Math.min(minimum,s.cash);};
 for(let n=0;n<3;n++)move('life:activity',{id:'book'});
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 // Earn capital through actual salary actions and personal days. No cash injection.
 let target=INDUSTRIES[type].cost+180+220+600+reserve;
 while(s.cash<target){if(s.shifts>=4||s.hoursUsed+8>40)move('week');if(s.life.hours<8||s.life.energy<28)move('life:sleep');move('shift');assert.ok(s.week<60,'salary runway stalled');}
 move('open',{industry:type});move('hire',{id:1});move('hire',{id:1});move('manager',{id:1});
 if(ECONOMICS[type].stock){move('autoRestock',{id:1});move('restockBudget',{id:1,level:3000});}
 if(type==='manufacturing')move('autoProduction',{id:1});
 if(type==='cafe'&&style!=='standard')move('cafeStyle',{id:1,style});
 if(route==='logistics-express')move('route',{id:1,route:'express'});
 let opened=s.week,start=s.cash;
 // Owner deliberately stops outside salary here. The firm must fund its own bills and personal costs.
 let failed=false,low=s.cash,repairs=0;for(let week=0;week<48;week++){
  let b=s.businesses[0];if(b.condition<65&&s.cash>INDUSTRIES[type].tool*.18){move('maintenance',{id:1});repairs++;}
  let before=s.cash,q=cashPlan(s),risk=cashExposure(s,q);orders+=q.restock;move('week');collections+=s.businesses[0].last.collected;assert.ok(Math.abs(s.cash-before-q.net)<.02);assert.equal(risk.balance,s.cash);assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
  low=Math.min(low,s.cash);if(s.cash<0){failed=true;break;}
  let roundtrip=restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(roundtrip,s);
 }
 let expectFailure=reserve===250&&route!=='logistics-express'||reserve===1000&&['shop','manufacturing','logistics'].includes(route)||reserve===2500&&['manufacturing','logistics'].includes(route);assert.equal(failed,expectFailure,JSON.stringify({reserve,route,seed}));
 rows.push({reserve,failed,repairs,low:Math.round(low),route,seed,opened,minimum:Math.round(minimum),start:Math.round(start),end:Math.round(s.cash),change:Math.round(s.cash-start),orders:Math.round(orders),collections:Math.round(collections),worth:Math.round(worth(s))});
}
assert.equal(rows.filter(r=>r.failed).length,45);assert.ok(rows.some(r=>r.repairs));console.table(rows);console.log('PASS 100 earned 48-week low-reserve stock/invoice/maintenance stress scenarios; 55 survive and 45 stop at first negative cash as expected; exact cash forecast, importable failure states, no outside salary after ownership or injected cash');
