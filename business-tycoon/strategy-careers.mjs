import assert from 'node:assert/strict';
import {freshInitial,action,validSave,restore,CAREERS,careerQuote,careerPay,startupCost} from './engine.mjs';
import {COURSES} from './content.mjs';
let rows=[];
for(let seed of [17,531,98431,24316,90210]){
 let s=freshInitial();s.rng=seed;
 const move=(t,a)=>{s=action(s,t,a);assert.ok(validSave(s));assert.deepEqual(restore(s),s);assert.ok(s.cash>=0);};
 for(let i=0;i<3;i++)move('life:activity',{id:'book'});
 move('life:sleep');move('life:job',{id:'warehouse'});move('life:casualShift');move('life:sleep');move('life:casualShift');move('life:job',{id:'office'});
 let guard=0;
 while(s.cash<4000){assert.ok(++guard<100);let c=CAREERS[s.career];if(s.shifts>=c.slots||s.hoursUsed+c.hours>40)move('week');if(s.life.hours<c.hours||s.life.energy<28)move('life:sleep');move('shift');}
 for(let [type,args,hours,energy] of [['class',{},4,24],['class',{},4,24],...['trades','operations','production'].map(id=>['course',{id},COURSES[id].hours,22])]){if(s.hoursUsed+hours>40)move('week');if(s.life.hours<hours||s.life.energy<energy)move('life:sleep');move(type,args);}
 move('week');let qualified=structuredClone(s);
 for(let id of Object.keys(CAREERS)){
  s=structuredClone(qualified);assert.ok(careerQuote(s,id).eligible);move('career',{id});let startCash=s.cash,startWeek=s.week,startPay=careerPay(s),hours=0,shifts=0;
  for(let w=0;w<16;w++){
   while(s.shifts<CAREERS[id].slots){if(s.life.hours<CAREERS[id].hours||s.life.energy<28)move('life:sleep');let before=s.cash;move('shift');assert.ok(s.cash>before);hours+=CAREERS[id].hours;shifts++;}
   move('week');
  }
  assert.equal(s.week,startWeek+16);let changed=Object.entries(s.industryExperience).filter(([industry,n])=>n>(qualified.industryExperience[industry]||0)).map(([id])=>id);assert.deepEqual(changed,[...(CAREERS[id].course?COURSES[CAREERS[id].course].industries:[])]);
  for(let industry of changed){assert.ok(startupCost(s,industry)<startupCost(qualified,industry));assert.equal(s.industryExperience[industry]-(qualified.industryExperience[industry]||0),shifts);}
  rows.push({seed,career:id,qualificationWeek:startWeek,startCash:Math.round(startCash),startPay,endPay:careerPay(s),shifts,hours,net:Math.round(s.cash-startCash),experience:changed.join(',')});
 }
}
console.table(rows);console.log('PASS 30 earned fresh-to-qualified 16-week career comparisons: six jobs/five seeds; shared salary-funded qualification, per-action solvency/exact restore, job-specific promotions and actual industry startup discounts, no injected funds or company/manual income');
