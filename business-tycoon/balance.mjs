import {initial,action,forecast,worth,INDUSTRIES} from './engine.mjs';
let s=initial();let safe=(type,a)=>{try{s=action(s,type,a);return true}catch{return false}};
for(let w=0;w<32;w++){
 for(let i=0;i<3;i++)safe('shift');if(!s.skill)safe('class');for(let j=0;j<48;j++)safe('work');
 if(!s.hustle)safe('hustle');if(s.hustleLevel<3&&s.cash>600)safe('hustleUpgrade');
 if(!s.businesses.length&&s.cash>=700)safe('open',{industry:'service'});
 for(let b of s.businesses){if(b.staff<2&&s.cash>700)safe('hire',{id:b.id});if(!b.manager&&b.staff>=2&&s.cash>1500)safe('manager',{id:b.id});if(b.tools<1&&s.cash>1800)safe('tool',{id:b.id});}
 safe('week');if([0,3,7,15,31].includes(w))console.log('earned',s.week,Math.round(s.cash),Math.round(worth(s)),s.businesses.map(b=>({staff:b.staff,profit:b.last?.profit,manager:b.manager})))
}
console.log('individual industries at base demand, two staff, stocked, no paid marketing');
for(let industry of Object.keys(INDUSTRIES)){
 let x=action({...initial(),cash:100000,skill:2},'open',{industry});x=action(x,'hire',{id:1});x=action(x,'hire',{id:1});x.businesses[0].inventory=1000;let f=forecast(x,x.businesses[0]);console.log(industry,{demand:f.demand,cap:f.capacity,profit:f.profit,costs:f.costs,lag:f.lag});
}
