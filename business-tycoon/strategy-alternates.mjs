import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,forecast,worth,INDUSTRIES,ECONOMICS,startupCost,cashPlan,cashExposure,inventoryQuote} from './engine.mjs';
let rows=[];
for(let strategy of ['lean','budget250','budget1000','express-bridge'])for(let reserve of [250,1000,2500])for(let route of ['shop','cafe-table','manufacturing','logistics','logistics-express'])for(let seed of [17,531,98431,24316,90210]){
 let type=route.startsWith('cafe-')?'cafe':route==='logistics-express'?'logistics':route,style=route.startsWith('cafe-')?route.slice(5):'standard';
 let s=freshInitial();s.rng=seed;let minimum=s.cash,orders=0,collections=0,salary=0;
 const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s),type+' invalid '+t);minimum=Math.min(minimum,s.cash);};
 for(let n=0;n<3;n++)move('life:activity',{id:'book'});
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 // Earn capital through actual salary actions and personal days. No cash injection.
 let target=INDUSTRIES[type].cost+180+220+600+reserve;
 while(s.cash<target){if(s.shifts>=4||s.hoursUsed+8>40)move('week');if(s.life.hours<8||s.life.energy<28)move('life:sleep');move('shift');assert.ok(s.week<60,'salary runway stalled');}
 move('open',{industry:type});move('hire',{id:1});if(strategy!=='lean'){move('hire',{id:1});move('manager',{id:1});}
 if(ECONOMICS[type].stock&&strategy!=='lean'){move('autoRestock',{id:1});move('restockBudget',{id:1,level:strategy==='budget250'?250:strategy==='budget1000'?1000:3000});}
 if(type==='manufacturing'&&strategy!=='lean')move('autoProduction',{id:1});
 if(type==='cafe'&&style!=='standard')move('cafeStyle',{id:1,style});
 if(route==='logistics-express')move('route',{id:1,route:'express'});
 let opened=s.week,start=s.cash;
 // Owner deliberately stops outside salary here. The firm must fund its own bills and personal costs.
 let failed=false,low=s.cash,repairs=0;for(let week=0;week<48;week++){
  let b=s.businesses[0];if(b.condition<65&&s.cash>INDUSTRIES[type].tool*.18){move('maintenance',{id:1});repairs++;}
  if(strategy==='express-bridge'&&type==='logistics')move('route',{id:1,route:week<2?'express':route==='logistics-express'?'express':'accounts'});
  if(strategy==='lean'&&ECONOMICS[type].stock){let f=forecast(s,b),held=type==='manufacturing'?(b.rawStock||0):(b.inventory||0),count=Math.min(Math.max(0,f.potential-held),Math.floor(Math.max(0,s.cash-500)/inventoryQuote(s,b,1)));if(count)move('buyStock',{id:1,count});if(type==='manufacturing'){for(let n=0;n<10;n++){let z=s.businesses[0];if(!z.rawStock||(z.producedThisWeek||0)>=forecast(s,z).capacity)break;move('produce',{id:1});}}}
  let before=s.cash,q=cashPlan(s),risk=cashExposure(s,q);orders+=q.restock;move('week');collections+=s.businesses[0].last.collected;assert.ok(Math.abs(s.cash-before-q.net)<.02);assert.equal(risk.balance,s.cash);assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
  low=Math.min(low,s.cash);if(s.cash<0){failed=true;break;}
  let roundtrip=restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(roundtrip,s);
 }
 let expectedFailure=strategy==='lean'? (reserve<2500&&['manufacturing','logistics'].includes(route)) :strategy==='budget250'?route!=='logistics-express':reserve===250?route!=='logistics-express':reserve===1000?['shop','manufacturing','logistics'].includes(route):['manufacturing','logistics'].includes(route);
 assert.equal(failed,expectedFailure,JSON.stringify({strategy,reserve,route,seed}));
 rows.push({strategy,reserve,failed,repairs,low:Math.round(low),route,seed,opened,minimum:Math.round(minimum),start:Math.round(start),end:Math.round(s.cash),change:Math.round(s.cash-start),orders:Math.round(orders),collections:Math.round(collections),worth:Math.round(worth(s))});
}
assert.equal(rows.length,300);assert.equal(rows.filter(r=>r.failed).length,170);
console.table(rows);console.log('PASS 300 alternate earned 48-week strategy comparisons: lean owner-operated, manager budgets250/1000 and two-week express bridge; 130 survive,170 expected first-negative stops; salary-earned capital, exact cash/restore, no injected funds or outside salary after opening');
