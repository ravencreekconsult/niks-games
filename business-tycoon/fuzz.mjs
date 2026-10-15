import {initial,action,validSave,restore,forecast,worth,INDUSTRIES} from './engine.mjs';
let seed=5731;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
for(let run=0;run<20;run++){
 let s={...initial(),cash:50000,skill:3};let history=[];
 for(let i=0;i<500;i++){
  let b=s.businesses[Math.floor(rnd()*s.businesses.length)],moves=[['shift'],['work'],['week'],['hustle'],['hustleUpgrade'],['train'],['career',{id:['retail','warehouse','office','specialist','dispatcher','machinist'][Math.floor(rnd()*6)]}],['course',{id:['trades','sales','production','operations'][Math.floor(rnd()*4)]}],['startHustle',{id:['websites','resale','tutoring','repair'][Math.floor(rnd()*4)]}],['property',{kind:['apartments','retail','warehouse'][Math.floor(rnd()*3)]}],['open',{industry:Object.keys(INDUSTRIES)[Math.floor(rnd()*7)]}]];
  if(b)for(let type of ['hire','fire','tool','staffTrain','marketing','price','manager','branch','outside','size','outreach','knocker','maintenance','produce','autoProduction','autoRestock','restockBudget','sellBusiness','buyStock','loan'])moves.push([type,{id:b.id,count:50,level:type==='price'?1.2:type==='restockBudget'?1000:2}]);
  if(b?.type==='cafe')moves.push(['cafeStyle',{id:b.id,style:['standard','counter','table'][Math.floor(rnd()*3)]}]);
  if(b?.type==='manufacturing')moves.push(['product',{id:b.id,product:['components','fixtures','precision'][Math.floor(rnd()*3)]}]);if(s.loans?.length)moves.push(['repayLoan',{id:s.loans[0].id}]);
  let [type,a]=moves[Math.floor(rnd()*moves.length)];try{s=action(s,type,a);history.push(type)}catch{}
  if(!validSave(s))throw Error('legitimate save rejected '+JSON.stringify({run,i,type,history:history.slice(-20),s}));
  if(!Number.isFinite(worth(s))||s.businesses.some(b=>!Number.isFinite(forecast(s,b).profit)))throw Error('nonfinite economics');
  let restored=restore(s);if(restored.week!==s.week||restored.cash!==s.cash)throw Error('lost save');
 }
}
console.log('PASS 10,000 randomized action/save/forecast transitions across 20 seeded runs');
