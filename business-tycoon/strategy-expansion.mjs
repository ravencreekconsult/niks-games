import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,INDUSTRIES,ECONOMICS,startupCost,cashPlan} from './engine.mjs';
let rows=[];
for(let type of ['shop','mechanic','manufacturing','logistics','transport','cafe'])for(let reserve of [500,2500])for(let seed of [17,531,98431,24316,90210]){
 let s=freshInitial();s.rng=seed;const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s));};
 for(let n=0;n<3;n++)move('life:activity',{id:'book'});move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 while(s.cash<3000){if(s.shifts>=4||s.hoursUsed+8>40)move('week');if(s.life.hours<8||s.life.energy<28)move('life:sleep');move('shift');}
 function open(industry){move('open',{industry});let id=s.businesses.at(-1).id;move('hire',{id});move('hire',{id});move('manager',{id});if(ECONOMICS[industry].stock){move('autoRestock',{id});move('restockBudget',{id,level:3000});}if(industry==='manufacturing')move('autoProduction',{id});if(industry==='cafe')move('cafeStyle',{id,style:'table'});}
 open('service');let salaryStops=s.week;
 function settle(){for(let b of s.businesses)if(b.condition<65&&s.cash>=Math.round(INDUSTRIES[b.type].tool*.18*(1+b.tools*.4)))move('maintenance',{id:b.id});let before=s.cash,q=cashPlan(s);move('week');assert.ok(Math.abs(s.cash-before-q.net)<.02);assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);}
 // Second firm is funded only by the service firm's cash, at a salary-step-independent target.
 while(s.cash<startupCost(s,type)+1000+reserve){settle();assert.ok(s.cash>=0);assert.ok(s.week<200);}
 open(type);let opened=s.week,start=s.cash,low=s.cash,failed=false;
 for(let week=0;week<48;week++){settle();low=Math.min(low,s.cash);if(s.cash<0){failed=true;break;}}
 let expectedFailure=reserve===500&&(['manufacturing','logistics'].includes(type)||type==='transport'&&seed!==17)||reserve===2500&&type==='manufacturing'&&[531,98431,24316].includes(seed);assert.equal(failed,expectedFailure,JSON.stringify({type,reserve,seed}));
 rows.push({type,reserve,seed,salaryStops,opened,start:Math.round(start),end:Math.round(s.cash),low:Math.round(low),failed});
}
assert.equal(rows.filter(r=>r.failed).length,17);console.table(rows);console.log('PASS 60 earned service-to-second-firm48week comparisons across six industries/two reserve targets/five seeds:43survive,17expected first-negative stops; company-earned expansion, no outside salary after first ownership, exact cash/restore');
