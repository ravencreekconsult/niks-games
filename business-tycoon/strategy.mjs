import assert from 'node:assert/strict';
import {initial,action,validSave,worth,forecast,INDUSTRIES,cashPlan} from './engine.mjs';
let results=[];
for(let strategy of ['employee','side-hustles','first-company'])for(let seed of [17,531,98431,24316,90210]){
 let s={...initial(),rng:seed},minimum=s.cash,failures=0;
 function move(type,args){try{s=action(s,type,args);return true}catch{failures++;return false}}
 for(let week=0;week<32;week++){
  for(let n=0;n<3;n++)move('shift');
  if(s.skill<2&&s.cash>250)move('class');
  if(strategy==='side-hustles'){
   for(let id of ['websites','resale','tutoring'])if(!s.hustles.some(h=>h.type===id)&&s.cash>400)move('startHustle',{id});
   for(let h of s.hustles)if(h.level<2&&s.cash>1200)move('upgradeHustle',{id:h.type});
  }
  if(strategy==='first-company'){
   if(!s.businesses.length&&s.cash>=900)move('open',{industry:'service'});
   for(let b of s.businesses){if(b.staff<2&&s.cash>850)move('hire',{id:b.id});if(b.staff>=2&&!b.manager&&s.cash>1800)move('manager',{id:b.id});if(b.tools<1&&s.cash>2200)move('tool',{id:b.id});if(b.condition<65&&s.cash>600)move('maintenance',{id:b.id});}
  }
  move('week');minimum=Math.min(minimum,s.cash);assert.ok(validSave(s));assert.ok(s.cash>=0,'conservative path insolvent');
 }
 results.push({strategy,seed,cash:Math.round(s.cash),worth:Math.round(worth(s)),minimum:Math.round(minimum),companies:s.businesses.length,missedActions:failures});
}
console.table(results);
console.log('PASS 15 seeded conservative 32-week strategy paths (no manual job farming or injected capital)');
for(let industry of Object.keys(INDUSTRIES)){
 let s=action({...initial(),cash:10000,skill:2},'open',{industry});s=action(s,'hire',{id:1});s=action(s,'hire',{id:1});let f=forecast(s,s.businesses[0]),plan=cashPlan(s);console.log('opening scenario',industry,{cash:Math.round(s.cash),salesWithoutStock:f.units,bills:Math.round(plan.outflow),firstWeekCash:Math.round(plan.net),lag:f.lag});
}
