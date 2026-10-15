/* Painted environment pass. No map, actor, camera or progression writes.
 * Load after art.js, before game.js. The single beginFrame hook installs only
 * after the baseline painted images have loaded. disable() restores Art.tile.
 */
(function(root){
 'use strict';
 const block=new Set(['tree','rock','boulder','cavewall']);
 const indoor=new Set(['lab','nursery','depot','hall','thornhall','granitehall','tidehall','cave','mine']);
 const textures={},accents={},cache=new Map();let original=null,wrapper=null,frame=null,enabled=true;
 const maxCache=384;
 const load=(store,id,src)=>{const im=new Image();im.onload=()=>{store[id]=im;cache.clear()};im.src=src};
 for(const id of ['grass','path','water','oak','fir','boulder','caverock','wall'])load(textures,id,'./assets/painted/'+id+'.png');
 for(const id of ['trail-flowers','bank-fern','moss-stone','shore-wash'])load(accents,id,'./assets/environment/'+id+'.png');
 const isPath=t=>['path','house','fence'].includes(t);
 const hash=(x,y)=>((Math.imul(x,73856093)^Math.imul(y,19349663))>>>0);
 function terrainTile(kind,x,y){
  const gx=Math.round(x/16),gy=Math.round(y/16),tile=frame.tileAt;
  const same=(dx,dy)=>{if(kind==='path'&&['village','town','harbor'].includes(frame.area)&&[4,15].includes(gx+dx)&&gy+dy>=6&&gy+dy<=9)return true;return kind==='water'?tile(gx+dx,gy+dy)==='water':isPath(tile(gx+dx,gy+dy))};
  const e=[same(-1,0),same(1,0),same(0,-1),same(0,1)],diag=[same(-1,-1),same(1,-1),same(-1,1),same(1,1)];
  const key=[kind,x%128,y%128,...e,...diag].join(':');if(cache.has(key))return cache.get(key);
  const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d');
  const sx=((x%128)+128)%128*4,sy=((y%128)+128)%128*4;
  q.drawImage(textures.grass,sx,sy,64,64,0,0,64,64);
  const top=document.createElement('canvas');top.width=top.height=64;const tq=top.getContext('2d');tq.drawImage(textures[kind],sx,sy,64,64,0,0,64,64);
  const pixels=tq.getImageData(0,0,64,64),p=pixels.data;
  for(let yy=0;yy<64;yy++)for(let xx=0;xx<64;xx++){
   const wx=x*4+xx,wy=y*4+yy;
   const noise=kind==='water'?Math.sin(wy*.15)*1.1+Math.sin(wx*.16)*1.1:Math.sin(wy*.31)*.7+Math.sin(wx*.27)*.7;
   let d=64;const ds=[xx,63-xx,yy,63-yy];for(let i=0;i<4;i++)if(!e[i])d=Math.min(d,ds[i]);
   for(const[cx,cy,a,b,i]of [[0,0,0,2,0],[63,0,1,2,1],[0,63,0,3,2],[63,63,1,3,3]]){
    const dx=Math.abs(xx-cx),dy=Math.abs(yy-cy),r=kind==='water'?22:16;
    if(!e[a]&&!e[b]&&dx<r&&dy<r)d=Math.min(d,r-Math.hypot(r-dx,r-dy));
    // Small concave corner fills remove square bites without joining diagonals.
    if(e[a]&&e[b]&&!diag[i]&&dx<7&&dy<7)d=Math.min(d,Math.hypot(dx,dy)-2);
   }
   const a=Math.max(0,Math.min(1,(d-(kind==='water'?4:2.5)+noise)/(kind==='water'?7:5)));
   p[(yy*64+xx)*4+3]=Math.round(a*255);
   if(kind==='water'&&d>3&&d<8){const j=(yy*64+xx)*4;p[j]=Math.min(255,p[j]+18);p[j+1]=Math.min(255,p[j+1]+13);p[j+2]=Math.min(255,p[j+2]+4)}
  }
  tq.putImageData(pixels,0,0);
  // Ground-only bank wash. No raised props are ever drawn in this pass.
  if(kind==='water'&&accents['shore-wash']){q.save();for(let i=0;i<4;i++){if(e[i])continue;q.save();if(i===0){q.translate(0,64);q.rotate(-Math.PI/2)}if(i===1){q.translate(64,0);q.rotate(Math.PI/2)}if(i===3){q.translate(64,64);q.rotate(Math.PI)}q.drawImage(accents['shore-wash'],0,0,256,64,0,-1,64,16);q.restore()}q.restore()}
  q.drawImage(top,0,0);if(cache.size>=maxCache)cache.delete(cache.keys().next().value);cache.set(key,c);return c;
 }
 function tile(ctx,t,x,y,seed){
  if(!frame||!enabled||frame.area==='farm')return original(ctx,t,x,y,seed);
  const outdoor=!indoor.has(frame.area)&&!frame.area.endsWith('hall');
  if(outdoor&&['path','water'].includes(t)&&textures.grass&&textures[t]){ctx.drawImage(terrainTile(t,x,y),x,y,16.05,16.05);return}
  if(outdoor&&block.has(t)&&frame.area!=='farm'){
   const gx=Math.round(x/16),gy=Math.round(y/16),h=hash(gx,gy),id=t==='tree'?(seed%3?'oak':'fir'):t==='cavewall'?'wall':'boulder',im=textures[id];
   if(im){const w=t==='tree'?22.5+(h%5)*.45:t==='cavewall'?21:18.5+(h%3)*.5,hgt=t==='tree'?30+(h%4)*.6:t==='cavewall'?17:22+(h%3)*.5;
    ctx.save();ctx.fillStyle='#274c3525';ctx.beginPath();ctx.ellipse(x+8,y+14,w*.39,2.5,0,0,Math.PI*2);ctx.fill();ctx.drawImage(im,x+8-w/2,y+16-hgt,w,hgt);ctx.restore();return}
  }
  original(ctx,t,x,y,seed);
  // Keep farm, NPC areas and doorway approaches completely untouched.
  if(!outdoor||frame.area==='farm'||!['plain','grass'].includes(t))return;
  const gx=Math.round(x/16),gy=Math.round(y/16),h=hash(gx,gy);if(frame.npcs.some(n=>Math.abs(n.x-gx)+Math.abs(n.y-gy)<3))return;
  const nearWater=[[-1,0],[1,0],[0,-1],[0,1]].some(([a,b])=>frame.tileAt(gx+a,gy+b)==='water');
  const nearRock=[[-1,0],[1,0],[0,-1],[0,1]].some(([a,b])=>['rock','boulder'].includes(frame.tileAt(gx+a,gy+b)));
  // Small painted moss flecks only, contained in one tile and below all actors.
  const nearPath=[[-1,0],[1,0],[0,-1],[0,1]].some(([a,b])=>frame.tileAt(gx+a,gy+b)==='path');
  if(nearPath&&h%11===0&&accents['trail-flowers'])ctx.drawImage(accents['trail-flowers'],x+5,y+9,6,4);
  if(nearRock&&h%5===0&&accents['moss-stone'])ctx.drawImage(accents['moss-stone'],x+4,y+9,5,4);
  if(nearWater&&h%5===0&&accents['bank-fern'])ctx.drawImage(accents['bank-fern'],x+3,y+8,7,6);
 }
 root.EnvironmentArt={beginFrame(f){frame=f;if(!enabled||!f.ready)return;if(!wrapper){original=Art.tile;wrapper=tile;Art.tile=wrapper}},disable(){enabled=false;if(wrapper&&Art.tile===wrapper)Art.tile=original;wrapper=null},enable(){enabled=true},stats(){return{installed:!!wrapper,cache:cache.size,maxCache,assets:Object.keys(accents).length}},version:'1.0.0'};
})(window);
