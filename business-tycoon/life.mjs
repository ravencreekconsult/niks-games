// Apartment opening. Optional on saves so existing portfolios never reset.
export const LIFE_ACTIVITIES={
 book:{name:'Read a book',cost:0,hours:2,energy:-12,mood:-3,food:-4,knowledge:2},
 course:{name:'Take a course',cost:30,hours:3,energy:-22,mood:-5,food:-6,knowledge:5},
 seminar:{name:'Go to a seminar',cost:65,hours:4,energy:-28,mood:4,food:-9,knowledge:8},
 snack:{name:'Eat a snack',cost:2,hours:.25,energy:3,mood:1,food:18},
 fastfood:{name:'Fast food',cost:6,hours:.5,energy:6,mood:3,food:40},
 meal:{name:'Full meal',cost:11,hours:1,energy:12,mood:6,food:75},
 powernap:{name:'Power nap',cost:0,hours:.5,energy:15,mood:2,food:-2},
 nap:{name:'Full nap',cost:0,hours:2,energy:40,mood:6,food:-5},
 walk:{name:'Take a walk',cost:0,hours:1,energy:-4,mood:18,food:-3},
 friend:{name:'Hang out with a friend',cost:0,hours:2,energy:-6,mood:35,food:-5}
};
export const HOUSEHOLD={headphones:{name:'Spare headphones',cash:18},lamp:{name:'Old desk lamp',cash:12},console:{name:'Unused console',cash:45}};
export const LIFE_UPGRADES=[{name:'Organize your listings',cost:15,value:.75},{name:'Better work setup',cost:45,value:1},{name:'Local referrals',cost:95,value:1.25}];
export function newLife(){return {day:1,hours:14,energy:100,mood:75,food:65,knowledge:0,taps:0,upgrade:0,sold:[],pantryDay:0,employment:'unemployed',shifts:0,phase:'clicker',focused:0,last:'Start small. Tap to earn, learn the basics and look after yourself.'};}
export function focusPenalty(l,hours){let before=l.focused||0;return Math.round((Math.max(0,before+hours-4)-Math.max(0,before-4))*200)/100;}
export function applyFocus(l,hours){let penalty=focusPenalty(l,hours);l.focused=Math.round(((l.focused||0)+hours)*100)/100;l.mood=Math.max(0,l.mood-penalty);return penalty;}
export function validLife(l){return (l?.focused===undefined||Number.isFinite(l.focused)&&l.focused>=0&&l.focused<=40)&&!!l&&typeof l==='object'&&!Array.isArray(l)&&['day','taps','upgrade','pantryDay','shifts'].every(k=>Number.isSafeInteger(l[k])&&l[k]>=0)&&l.day>=1&&l.day<=700000&&l.upgrade<=3&&l.pantryDay<=l.day&&['energy','mood','food'].every(k=>Number.isFinite(l[k])&&l[k]>=0&&l[k]<=100)&&Number.isFinite(l.hours)&&l.hours>=0&&l.hours<=14&&Number.isFinite(l.knowledge)&&l.knowledge>=0&&l.knowledge<=100&&Array.isArray(l.sold)&&l.sold.length<=3&&new Set(l.sold).size===l.sold.length&&l.sold.every(k=>Object.hasOwn(HOUSEHOLD,k))&&['unemployed','retail','warehouse','office'].includes(l.employment)&&['clicker','career','owner'].includes(l.phase)&&typeof l.last==='string'&&l.last.length<=500;}
export const tapValue=l=>(l.upgrade?LIFE_UPGRADES[l.upgrade-1].value:.5)*(l.food<15||l.mood<15?.5:1);
const clamp=n=>Math.max(0,Math.min(100,n));
export function lifeAction(state,type,args,{clone,cash,settle}){
 let s=clone(state),l=s.life;if(!validLife(l))throw Error('This save has no apartment opening. Existing progress is unchanged.');
 const spend=(amount,hours,energy=0,productive=false)=>{if(amount>0&&s.cash<amount)throw Error('You need $'+(amount-s.cash).toFixed(2)+' more.');if(l.hours+.00001<hours)throw Error('Not enough time today. Sleep to begin a new day.');if(l.energy<energy)throw Error('Low energy. Take a nap or sleep.');if(productive&&(s.hoursUsed||0)+hours>40.00001)throw Error('Your 40 active hours are used for this week. Sleep through to the next week to reset them.');if(productive){s.hoursUsed=Math.round(((s.hoursUsed||0)+hours)*100)/100;applyFocus(l,hours);}l.hours=Math.max(0,Math.round((l.hours-hours)*100)/100);if(amount)cash(s,-amount,'Personal: '+type);};
 if(l.phase==='owner')throw Error('Your company is the main earning loop now.');
 switch(type){
 case 'tap':{spend(0,.1,.5,true);let value=tapValue(l);cash(s,value,'Small freelance task');l.energy=clamp(l.energy-.5);l.mood=clamp(l.mood-.08);l.food=clamp(l.food-.12);l.taps++;l.last='Earned $'+value.toFixed(2)+'. '+(l.food<15||l.mood<15?'Low nourishment or mood halves tap earnings.':'Small work adds up.');break;}
 case 'activity':{let a=Object.hasOwn(LIFE_ACTIVITIES,args.id)&&LIFE_ACTIVITIES[args.id];if(!a)throw Error('Choose an available activity.');spend(a.cost,a.hours,Math.max(0,-a.energy),!!a.knowledge);l.energy=clamp(l.energy+a.energy);l.mood=clamp(l.mood+a.mood);l.food=clamp(l.food+a.food);if(['walk','friend','nap'].includes(args.id))l.focused=0;else if(['powernap','meal'].includes(args.id))l.focused=Math.max(0,(l.focused||0)-2);else if(args.id==='fastfood')l.focused=Math.max(0,(l.focused||0)-1);l.knowledge=Math.min(100,l.knowledge+(a.knowledge||0));s.skill=Math.max(s.skill,Math.min(3,Math.floor(l.knowledge/6)));l.last=a.name+' complete.'+(a.knowledge?' Knowledge +'+a.knowledge+'.':'');break;}
 case 'sell':{let item=Object.hasOwn(HOUSEHOLD,args.id)&&HOUSEHOLD[args.id];if(!item)throw Error('Choose an item from your room.');if(l.sold.includes(args.id))throw Error('You already sold that item.');spend(0,.5,4,true);l.energy-=4;l.sold.push(args.id);cash(s,item.cash,'Facebook sale: '+item.name);l.last=item.name+' sold for $'+item.cash+'. One-off, not recurring income.';break;}
 case 'upgrade':{let u=LIFE_UPGRADES[l.upgrade];if(!u)throw Error('All opening upgrades are complete.');spend(u.cost,1,5,true);l.energy-=5;l.upgrade++;l.last=u.name+' ready. Base tap earnings are $'+u.value.toFixed(2)+'.';break;}
 case 'pantry':{if(l.pantryDay===l.day)throw Error('Your free pantry portion is used for today.');spend(0,.25);l.food=clamp(l.food+20);l.pantryDay=l.day;l.last='Pantry meal: +20 nourishment. One free portion per day.';break;}
 case 'sleep':{if(l.day%7===0){s=settle(s);s.life.last='A new day. Energy refilled; weekly living costs settled once.';return s;}else l.day++;l.hours=14;l.energy=100;l.focused=0;l.mood=clamp(l.mood+12);l.food=clamp(l.food-15);l.last='A new day. Energy refilled; weekly living costs settle every seventh night.';break;}
 case 'job':{if(!['retail','warehouse','office'].includes(args.id))throw Error('Choose an available job.');if(args.id==='office'){if(l.knowledge<6||l.shifts<2)throw Error('Full-time role needs 6 knowledge and 2 completed casual shifts.');l.phase='career';s.career='office';s.jobLevel=Math.max(1,s.jobLevel);s.xp=Math.max(40,s.xp);l.last='First full-time job landed. Your weekly career and company options are open. Tapping stays until your first business.';}else{if(l.phase!=='clicker')throw Error('Your full-time role is already secured.');l.last='Casual work secured. You remain in the clicker phase until your first full-time role.';}l.employment=args.id;break;}
 case 'casualShift':{if(!['retail','warehouse'].includes(l.employment)||l.phase!=='clicker')throw Error('Choose a casual job first.');if(s.shifts>=3)throw Error('Three casual shifts filled this week. Next week brings more.');spend(0,6,28,true);l.energy-=28;l.mood=clamp(l.mood-9);l.food=clamp(l.food-14);cash(s,l.employment==='warehouse'?65:55,'Casual '+l.employment+' shift');s.shifts++;l.shifts++;l.last='Casual shift completed. '+l.shifts+' shifts toward your first full-time job.';break;}
 default:throw Error('Unknown apartment activity.');
 }
 return s;
}
