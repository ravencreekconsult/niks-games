/* Rivenmoore cartoon pack. Painted world assets, cast characters, atmosphere.
 * Loads after environment-art.js, before game.js. Read-only over game state:
 * wraps Art.tile/Art.house/Art.person/Art.npc and adds a post-frame warp.
 * Falls back to the original painters until every sprite has loaded.
 */
(function(root){
 'use strict';
 const A='./assets/painted/';
 const HOUSE_SCALE=.66; // A/B pending: Matthew picks cottage scale; dock follows
 const imgs={};
 const load=(id,src)=>{const im=new Image();im.onload=()=>{imgs[id]=im};im.src=src};
 for(const id of ['tuft','cottage','cottage-b','cottage-c','cottage-a2','cottage-a3','cartoon-fir','oak','oakb'])load(id,A+id+'.png');
 for(const id of ['tamsin','jun','iona','maren','player-m','player-f','wren','lark','keeper','breeder','villager','kid'])load('cast-'+id,A+'cast/'+id+'.png');
 const indoor=new Set(['lab','nursery','depot','hall','thornhall','granitehall','tidehall','cave','mine']);
 const MH={village:36,town:36,harbor:36,route:64,forest:64,cave:64,mine:64,lake:64,orchard:64,marsh:64,ruins:64,ridge:64,farm:48,highwater:40,windscar:40,bellmouth:40,cairnwick:40,switchyard:48,lampworks:20};
 let frame=null,installed=false,playerVariant='m';
 const pathTrees=new Set(),pathTreesDone=new Set();
 const H=(x,y,s)=>((Math.imul(x,73856093)^Math.imul(y,19349663)^Math.imul(s,2654435761))>>>0);
 const vhash=(cx,cy)=>(H(cx,cy,77)%1000)/1000;
 function vn(wx,wy,cs){const gx=wx/cs,gy=wy/cs;const x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=vhash(x0,y0),b=vhash(x0+1,y0),c=vhash(x0,y0+1),d=vhash(x0+1,y0+1);
  return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
 const mottle=(wx,wy)=>.62*vn(wx,wy,72)+.38*vn(wx,wy,29);
 function depthShade(x,y,area){
  const mh=MH[area]||48,tt=Math.max(0,Math.min(1,(y/16)/mh)),m=mottle(x+8,y+8);
  const raw=(.10+(-.30-.10)*tt)+(m-.5)*.18;
  const band=Math.round(raw*4)/4;
  return Math.max(-.11,Math.min(.09,band*.5))}
 // NPC id -> cast sprite. Engine ids arrive via Art.npc's last argument.
 const CAST={tamsin:'tamsin',jun:'jun',iona:'iona',maren:'maren',wren:'wren',scout:'wren',fern:'wren',thorn:'wren',
  ranger:'lark',rowan:'lark',rowanFinal:'lark',aurora:'lark',brook:'lark',
  breeder:'breeder',ivy:'breeder',restorer:'breeder',
  shopkeeper:'keeper',lakekeeper:'keeper',hallkeeper:'keeper',labGuide:'keeper',researcher:'keeper',granite:'keeper',
  villager:'villager',harborElder:'villager',fisher:'villager',flint:'villager',amber:'villager',
  kid:'kid','orchard-worker':'villager','nursery-keeper':'breeder','ranger-blue':'wren'};
 function castFor(id){
  if(!id)return 'villager';
  const base=String(id).split(':')[0];
  if(base==='breeder')return 'breeder';
  return CAST[id]||CAST[base]||'villager'}
 function drawCast(ctx,id,x,y,step){
  const im=imgs['cast-'+id];if(!im)return false;
  const h=id==='kid'?17:(id==='player-m'||id==='player-f')?21:26,w=h*(im.naturalWidth/im.naturalHeight);
  const bob=step?((step%2)?-.6:0):0;
  ctx.fillStyle='rgba(20,32,22,.24)';ctx.beginPath();ctx.ellipse(x+8,y+14,6.5,2.2,-.15,0,7);ctx.fill();
  ctx.drawImage(im,x+8-w/2,y+16-h+bob,w,h);
  return true}
 function convertPathTrees(){
  if(!frame||!frame.grid||pathTreesDone.has(frame.area))return;
  pathTreesDone.add(frame.area);
  const g=frame.grid;
  for(let yy=1;yy<g.length-1;yy++)for(let xx=1;xx<g[yy].length-1;xx++){
   if(g[yy][xx]!=='tree')continue;
   const L=g[yy][xx-1],R=g[yy][xx+1],U=g[yy-1][xx],D=g[yy+1][xx];
   if((L==='path'&&R==='path')||(U==='path'&&D==='path')){pathTrees.add(frame.area+':'+xx+','+yy);g[yy][xx]='path'}}}
 function install(){
  if(installed||typeof Art==='undefined')return;
  installed=true;
  const ot=Art.tile;
  Art.tile=function(ctx,t,x,y,seed){
   const area=frame?frame.area:'village';
   const out=!indoor.has(area)&&area!=='farm';
   const tx=Math.round(x/16),ty=Math.round(y/16);
   if(t==='tree'&&out){
    if(pathTrees.has(area+':'+tx+','+ty))ot(ctx,'path',x,y,seed);
    const kind=seed%3,im=[imgs['cartoon-fir'],imgs.oak,imgs.oakb][kind];
    ctx.fillStyle='rgba(28,46,26,.3)';ctx.beginPath();ctx.ellipse(x+8,y+13.5,8.5,3,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(18,30,18,.26)';ctx.beginPath();ctx.ellipse(x+11.5,y+14.5,9.5,2.6,0,0,7);ctx.fill();
    if(im){const wh=kind===0?[16,30]:[23,31];
     ctx.drawImage(im,x+8-wh[0]/2,y+16-wh[1],wh[0],wh[1]);
     if(kind!==0){ctx.strokeStyle='rgba(255,238,180,.4)';ctx.lineWidth=.9;
      ctx.beginPath();ctx.arc(x+8,y+3,8.4,Math.PI*.95,Math.PI*1.5);ctx.stroke()}
    }else ot(ctx,t,x,y,seed);
    ctx.strokeStyle='rgba(40,64,34,.7)';ctx.lineWidth=.8;
    for(let k=0;k<2;k++){const bx=x+4+((seed*7+k*9)%9);ctx.beginPath();ctx.moveTo(bx,y+15);ctx.lineTo(bx+1,y+12.5);ctx.stroke()}
    return}
   ot(ctx,t,x,y,seed);
   if(!out)return;
   if(t==='grass'&&imgs.tuft){const r=(x*7+y*13)%5;
    ctx.drawImage(imgs.tuft,x+.5+(r%3),y+16-6.5-(r*.25),15,6.5)}
   if(['plain','grass','flower','path','water'].includes(t)){
    const v=depthShade(x,y,area);
    if(v>0.005){ctx.fillStyle='rgba(255,245,210,'+v+')';ctx.fillRect(x,y,16.1,16.1)}
    else if(v<-0.005){ctx.fillStyle='rgba(10,25,15,'+(-v)+')';ctx.fillRect(x,y,16.1,16.1)}}
  };
  const oh=Art.house;
  Art.house=function(ctx,x,y,w,label,lab){
   const cots=[imgs.cottage,imgs['cottage-a2'],imgs['cottage-c'],imgs['cottage-b'],imgs['cottage-a3']];
   let v=lab?2:((Math.round(x)*31+Math.round(y)*17+((label||'x').length*7))%cots.length);
   let im=cots[v];
   if(!im)im=imgs.cottage;
   if(im){
    const cw=(lab?Math.min(w,80):Math.min(w,64))*HOUSE_SCALE,ch=cw*(im.naturalHeight/im.naturalWidth);
    ctx.fillStyle='rgba(20,32,22,.22)';ctx.beginPath();ctx.ellipse(x+w/2+4,y+72,cw*.5,3.4,0,0,7);ctx.fill();
    ctx.drawImage(im,x+(w-cw)/2,y+74-ch,cw,ch);
    if(label){ctx.font='5px sans-serif';ctx.fillStyle='#3a3430';ctx.textAlign='center';ctx.fillText(label,x+w/2,y+71)}
    return}
   return oh(ctx,x,y,w,label,lab)};
  const op=Art.person,on=Art.npc;
  Art.person=function(ctx,x,y,trainer,face,step){
   if(drawCast(ctx,'player-'+playerVariant,x,y,step))return;
   return op(ctx,x,y,trainer,face,step)};
  Art.npc=function(ctx,x,y,role,variant,id){
   if(drawCast(ctx,castFor(id),x,y,0))return;
   return on?on(ctx,x,y,role,variant,id):undefined};
 }
 // Atmosphere: heat-warp (locked warp22 geometry) + drifting pollen.
 const WARP=22;let buf=null,lut=null;
 function postFX(ctx){
  const area=frame?frame.area:'';
  if(indoor.has(area)||!ctx||!ctx.canvas)return;
  const cv=ctx.canvas,W=cv.width,Hh=cv.height;
  if(!buf){buf=document.createElement('canvas');buf.width=W;buf.height=Hh}
  if(buf.width!==W||buf.height!==Hh){buf.width=W;buf.height=Hh;lut=null}
  const b=buf.getContext('2d');b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,W,Hh);b.drawImage(cv,0,0);
  // pollen: slow deterministic drift, warm motes + a few leaf flecks
  const t=performance.now()/1000;
  for(let i=0;i<32;i++){const px=(H(i,3,11)%1000)/1000*W+Math.sin(t*.13+i)*9*3;
   const py=((H(i,7,13)%1000)/1000*Hh+t*(2+(i%5))*3)%Hh;
   const br=(0.5+((H(i,5,17)%1000)/1000)*1)*3;
   b.fillStyle='rgba(255,234,178,'+(0.2+((H(i,9,19)%1000)/1000)*.3)+')';
   b.beginPath();b.arc(px,py,br,0,7);b.fill()}
  for(let i=0;i<7;i++){const px=(H(i,21,23)%1000)/1000*W,py=Hh*.35+((H(i,27,29)%1000)/1000)*Hh*.6;
   b.fillStyle='rgba(122,142,62,'+(0.3+((H(i,31,37)%1000)/1000)*.25)+')';
   b.beginPath();b.ellipse(px,py,1.6*3,.8*3,i,0,7);b.fill()}
  if(!lut){lut=[];const rows=280;
   for(let y=0;y<=rows;y++){let lo=0,hi=rows;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(m-WARP*Math.sin(Math.PI*m/rows)>y)hi=m;else lo=m}lut.push((lo+hi)/2)}}
  const sy=Hh/280,sx=W/320;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.clearRect(0,0,W,Hh);
  for(let y=0;y<280;y++){const w0=lut[y]*sy,w1=lut[y+1]*sy;if(w1-w0<=.01)continue;
   ctx.drawImage(buf,0,w0,W,w1-w0,0,y*sy,W,Math.ceil(sy))}
  ctx.restore()}
 root.CartoonPack={
  beginFrame(f){frame=f;convertPathTrees();install()},
  setPlayer(v){if(v==='m'||v==='f')playerVariant=v},
  postFX,
  stats(){return{installed,area:frame&&frame.area,sprites:Object.keys(imgs).length,pathTrees:pathTrees.size,player:playerVariant}},
  version:'1.0.0'};
})(window);
