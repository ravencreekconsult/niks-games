import assert from 'node:assert/strict';
import {freshInitial,action,validSave,worth,cashPlan} from './engine.mjs';
let rows=[];
for(let path of ['books','paid-course','odd-jobs'])for(let seed of [17,531,98431,24316,90210]){
 let s=freshInitial();s.rng=seed;let move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s));};
 if(path==='paid-course'){move('life:sell',{id:'headphones'});move('life:activity',{id:'course'});move('life:activity',{id:'book'});}
 if(path==='books'){for(let i=0;i<3;i++)move('life:activity',{id:'book'});}
 if(path==='odd-jobs'){move('life:activity',{id:'book'});move('life:offer',{id:'photos'});move('life:activity',{id:'book'});move('life:sleep');move('life:pantry');move('life:offer',{id:'printer'});}
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 let fulltimeDay=s.life.day,minimum=s.cash;
 while(s.cash<985){
  for(let i=0;i<7;i++){
   if(s.shifts<4&&s.hoursUsed+8<=40){if(s.life.hours<8||s.life.energy<28)move('life:sleep');if(s.week>20)throw Error('path stalled');move('shift');}
   else break;
  }
  minimum=Math.min(minimum,s.cash);if(s.cash<985)move('week');
 }
 move('open',{industry:'service'});move('hire',{id:1});let ownerWeek=s.week;
 for(let i=0;i<24;i++){
  for(let j=s.shifts;j<3;j++)move('shift');
  if(s.businesses[0].staff<2&&s.cash>1100)move('hire',{id:1});
  if(s.businesses[0].staff>=2&&!s.businesses[0].manager&&s.cash>2000)move('manager',{id:1});
  if(s.businesses[0].condition<65&&s.cash>800)move('maintenance',{id:1});
  move('week');minimum=Math.min(minimum,s.cash);assert.ok(s.cash>=0,path+' became insolvent');
 }
 rows.push({path,seed,fulltimeDay,ownerWeek,minimum:Math.round(minimum),cash:Math.round(s.cash),worth:Math.round(worth(s)),managed:s.businesses[0].manager});
}
console.table(rows);console.log('PASS 15 fresh-life earned 24-week owner strategies: books, paid course and condition-gated odd jobs across five seeds; no injected capital or manual-job farming');
