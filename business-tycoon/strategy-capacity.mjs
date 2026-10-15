import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,forecast,INDUSTRIES,ECONOMICS,cashPlan} from './engine.mjs';
let rows=[];
for(let type of ['mechanic','transport'])for(let plan of ['maintain','neglect','extra-employee','extra-equipment'])for(let seed of [17,531,98431,24316,90210]){
 let s=freshInitial();s.rng=seed;let repairs=0,repairCash=0,limited=0,missed=0;
 const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s),type+' invalid '+t);};
 for(let n=0;n<3;n++)move('life:activity',{id:'book'});
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 // Identical salary-earned capital target across the four whole operating plans.
 let target=INDUSTRIES[type].cost+10000;
 while(s.cash<target){if(s.shifts>=4||s.hoursUsed+8>40)move('week');if(s.life.hours<8||s.life.energy<28)move('life:sleep');move('shift');assert.ok(s.week<60);}
 move('open',{industry:type});move('hire',{id:1});move('hire',{id:1});move('manager',{id:1});
 if(ECONOMICS[type].stock){move('autoRestock',{id:1});move('restockBudget',{id:1,level:3000});}
 if(plan==='extra-employee')move('hire',{id:1});if(plan==='extra-equipment')move('tool',{id:1});
 let start=s.cash,opened=s.week,failed=false,low=s.cash;
 for(let week=0;week<80;week++){
  let b=s.businesses[0];if(plan!=='neglect'&&b.condition<65){let cost=Math.round(INDUSTRIES[type].tool*.18*(1+b.tools*.4));if(s.cash>=cost){move('maintenance',{id:1});repairs++;repairCash+=cost;}}
  let f=forecast(s,s.businesses[0]);if(f.bottleneck==='Equipment condition')limited++;missed+=f.missed;
  let before=s.cash,q=cashPlan(s);move('week');assert.ok(Math.abs(s.cash-before-q.net)<.02);assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);low=Math.min(low,s.cash);if(s.cash<0){failed=true;break;}
 }
 rows.push({type,plan,seed,opened,start:Math.round(start),end:Math.round(s.cash),low:Math.round(low),failed,repairs,repairCash,limited,missed});
}
console.table(rows);
for(let type of ['mechanic','transport'])for(let seed of [17,531,98431,24316,90210]){
 let group=rows.filter(r=>r.type===type&&r.seed===seed),base=group.find(r=>r.plan==='maintain'),neglect=group.find(r=>r.plan==='neglect');
 assert.ok(group.every(r=>!r.failed));assert.ok(base.end>neglect.end);assert.ok(base.end>group.find(r=>r.plan==='extra-employee').end);assert.ok(base.end<group.find(r=>r.plan==='extra-equipment').end);assert.ok(base.repairs>0);assert.equal(base.limited,0);assert.equal(neglect.repairs,0);assert.ok(neglect.limited>0);
}
console.log('PASS 40 earned mechanic/transport 80-week whole-plan comparisons: maintenance/neglect/extra employee/extra equipment across five seeds; salary-earned capital, exact cash/restore, no outside salary after opening or injected funds; failures stop at first negative balance');
