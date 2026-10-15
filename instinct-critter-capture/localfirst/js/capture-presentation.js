/* capture-presentation.js - Throw / containment / three wobbles / escape / caught.
 *
 * Presentation module only. It never touches RNG, catch odds, UID/lineage,
 * inventory, XP, or save state; game.js keeps owning all of those and calls
 * this module for the visuals and opt-in capture sounds.
 *
 * The timeline matches the waits already in throwBall: 650ms throw,
 * then three 450ms wobbles (resolve at 2000ms), so game logic timing,
 * log lines and save timing are unchanged.
 *
 * Opt-in sound: every cue is gated on the `sound` flag handed in by the
 * caller (state.sound in game.js, itself opt-in and default off). The
 * AudioContext is created lazily on the first cue that is allowed to play.
 *
 * Reduced motion: when the caller passes reducedMotion (game.js reads
 * prefers-reduced-motion), travel arcs, spins, flashes and particles are
 * replaced with crossfades and gentle opacity pulses. Total timing is
 * identical so battle flow and log cadence do not change.
 *
 * No network calls: the two optional sprite assets load from the same
 * static origin as the rest of the art, with a procedural fallback when
 * they are not there.
 */
'use strict';
(()=>{
const THROW_MS=650,WOBBLE_MS=450,WOBBLES=3;
const RESOLVE_MS=THROW_MS+WOBBLE_MS*WOBBLES; // 2000 - matches throwBall's waits
const CAUGHT_MS=1400,ESCAPE_MS=600; // match the post-resolution waits in throwBall
const FROM={x:65,y:170},LAND={x:235,y:118}; // same anchors as the original inline anim
const REST_DROP=12; // resting wilds sit lower on the platform; land the ball a touch lower
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let seq=null,audio=null;
const images={};
function loadAssets(){
 if(typeof Image==='undefined')return;
 for(const name of['sparkle','poof']){
  try{const img=new Image();img.onload=()=>{images[name]=img};img.src='./assets/capture/'+name+'.png'}catch(e){/* asset optional */}
 }
}
loadAssets();
function phaseOf(dt,success){
 if(dt<0)return null;
 if(dt<THROW_MS)return'throw';
 if(dt<RESOLVE_MS)return'wobble';
 if(dt<(success?RESOLVE_MS+CAUGHT_MS:RESOLVE_MS+ESCAPE_MS))return success?'caught':'escape';
 return null;
}
function now(){return typeof performance!=='undefined'&&performance.now?performance.now():Date.now()}
function tone(on,freq,dur,type,vol,sweepTo){
 if(!on)return;
 try{
  const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
  if(!AC)return;
  audio??=new AC();
  if(audio.resume)audio.resume();
  const osc=audio.createOscillator(),gain=audio.createGain();
  osc.type=type||'triangle';
  osc.frequency.setValueAtTime(freq,audio.currentTime);
  if(sweepTo)osc.frequency.exponentialRampToValueAtTime(sweepTo,audio.currentTime+dur);
  gain.gain.setValueAtTime(vol||.035,audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);
  osc.connect(gain);gain.connect(audio.destination);
  osc.start();osc.stop(audio.currentTime+dur);
 }catch(e){/* sound must never break a capture */}
}
function cue(name,on,step){
 switch(name){
  case'throw':tone(on,320,.18,'sine',.03,180);break;
  case'contain':tone(on,880,.06,'square',.025);tone(on,1320,.05,'triangle',.02);break;
  case'wobble':tone(on,(520+40*(step||0)),.07,'triangle',.028);break;
  case'escape':tone(on,200,.22,'sawtooth',.03,90);tone(on,140,.18,'square',.018,70);break;
  case'catch':[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(on,f,.18,'triangle',.035),i*160));break;
 }
}
function start(opts){
 seq={
  t0:opts&&opts.now!=null?opts.now:now(),
  color:(opts&&opts.color)||'#dc9b5a',
  success:!!(opts&&opts.success),
  sound:!!(opts&&opts.sound),
  resting:!!(opts&&opts.resting),
  reduced:!!(opts&&opts.reducedMotion),
  phase:'throw',wobble:-1,fanfare:false,
  land:{x:LAND.x,y:LAND.y+(opts&&opts.resting?REST_DROP:0)}
 };
 cue('throw',seq.sound);
}
function clear(){seq=null}
function active(){
 if(!seq)return false;
 if(!phaseOf(now()-seq.t0,seq.success)){seq=null;return false}
 return true;
}
function wildVisible(){
 if(!seq)return true;
 return seq.phase==='throw'||seq.phase==='escape';
}
/* Lantern ball, ported from game.js drawBall so the module is self-contained.
   The ball's gem facets and glow take the thrown ball's colour. */
function paintBall(g,x,y,angle,opts){
 opts=opts||{};
 const open=opts.open||0,tint=opts.color||'#dc9b5a',active=!!opts.active||open>0;
 g.save();g.translate(x,y);if(angle)g.rotate(angle);g.scale(.65,.65);
 const glow=g.createRadialGradient(0,0,2,0,0,42);
 glow.addColorStop(0,active?'#78f0e8aa':'#ebbf6b44');glow.addColorStop(1,'transparent');
 g.fillStyle=glow;g.fillRect(-44,-44,88,88);
 g.lineWidth=1.8;
 const shape=(points,fill,stroke)=>{g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=stroke||'#604f31';g.stroke()};
 shape([[0,-28],[17,-11],[12,20],[0,29],[-12,20],[-17,-11]],'#2b776f');
 shape([[0,-28],[0,29],[-12,20],[-17,-11]],'#73c9b8');
 shape([[0,-28],[17,-11],[0,-6]],'#b8eddb');
 shape([[0,-6],[17,-11],[12,20],[0,29]],active?tint:'#479d90');
 g.strokeStyle='#d7f4dd';g.lineWidth=.8;
 g.beginPath();g.moveTo(-15,-10);g.lineTo(0,-6);g.lineTo(13,18);g.moveTo(0,-26);g.lineTo(0,28);g.stroke();
 for(const side of[-1,1]){
  const spread=active?9+open*10:open*10;
  const brass=g.createLinearGradient(-24,0,24,0);
  brass.addColorStop(0,'#786139');brass.addColorStop(.45,'#e5c38a');brass.addColorStop(1,'#a17943');
  shape([[side*5,27],[side*(21+spread),10],[side*(23+spread),-12],[side*(13+spread),-25],[side*16,-6],[side*12,18]],brass);
  g.strokeStyle='#f8d99b';g.beginPath();g.moveTo(side*7,22);g.quadraticCurveTo(side*(21+spread),3,side*(18+spread),-15);g.stroke();
 }
 shape([[-7,28],[0,34],[7,28],[0,23]],'#bb9459');
 g.save();g.rotate(opts.still?0:(active?.7+open*.9:0));
 shape([[-16,-3],[-6,-10],[7,-5],[15,1],[4,8],[-8,5]],'#c5a063');
 g.strokeStyle='#ead599';g.beginPath();g.moveTo(-10,0);g.lineTo(10,0);g.stroke();g.restore();
 const warm=g.createRadialGradient(0,9,1,0,9,14);
 warm.addColorStop(0,active?'#fff4b6ee':'#f4bd6388');warm.addColorStop(1,'transparent');
 g.fillStyle=warm;g.fillRect(-14,-5,28,28);
 g.restore();
}
function shadow(g,x,y,k){
 g.save();g.globalAlpha=.28*k;g.fillStyle='#1d3a35';
 g.beginPath();g.ellipse(x,y+30,16+4*k,4.5,0,0,Math.PI*2);g.fill();g.restore();
}
function sparkle(g,x,y,r,alpha){
 g.save();g.globalAlpha=alpha;
 if(images.sparkle){g.drawImage(images.sparkle,x-r,y-r,r*2,r*2)}
 else{g.fillStyle='#f5e3a5';g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.28,y-r*.28);g.lineTo(x+r,y);g.lineTo(x+r*.28,y+r*.28);g.lineTo(x,y+r);g.lineTo(x-r*.28,y+r*.28);g.lineTo(x-r,y);g.lineTo(x-r*.28,y-r*.28);g.closePath();g.fill()}
 g.restore();
}
function puff(g,x,y,r,alpha){
 g.save();g.globalAlpha=alpha;
 if(images.poof){g.drawImage(images.poof,x-r,y-r,r*2,r*2)}
 else{g.fillStyle='#e8e2d2';for(let i=0;i<3;i++){g.beginPath();g.ellipse(x+(i-1)*r*.55,y+(i%2?-r*.18:r*.14),r*.62,r*.5,0,0,Math.PI*2);g.fill()}}
 g.restore();
}
function fireCues(phase,dt,prev){
 if(phase==='wobble'){
  if(seq.wobble===-1){seq.wobble=0;cue('contain',seq.sound)}
  const idx=Math.min(WOBBLES-1,Math.floor((dt-THROW_MS)/WOBBLE_MS));
  if(idx>seq.wobble){seq.wobble=idx;cue('wobble',seq.sound,idx)}
 }else if(phase==='caught'){
  if(!seq.fanfare){seq.fanfare=true;cue('catch',seq.sound)}
 }else if(phase==='escape'&&prev!=='escape'){
  cue('escape',seq.sound);
 }
}
function drawThrow(g,dt){
 const k=clamp(dt/THROW_MS,0,1);
 if(seq.reduced){
  g.save();g.globalAlpha=.25+.75*k;paintBall(g,seq.land.x,seq.land.y,0,{color:seq.color});g.restore();
  return;
 }
 const px=k=>FROM.x+k*(seq.land.x-FROM.x),py=k=>FROM.y-k*(FROM.y-seq.land.y)-Math.sin(k*Math.PI)*95;
 for(let i=3;i>=1;i--){const kk=k-i*.06;if(kk<=0)continue;g.save();g.globalAlpha=.07*i;paintBall(g,px(kk),py(kk),kk*6,{color:seq.color});g.restore()}
 paintBall(g,px(k),py(k),k*6,{color:seq.color});
}
function drawWobble(g,dt){
 const local=dt-THROW_MS,idx=Math.min(WOBBLES-1,Math.floor(local/WOBBLE_MS)),wl=local-idx*WOBBLE_MS;
 const contain=clamp(local/140,0,1); // impact flash during the first 140ms of containment
 shadow(g,seq.land.x,seq.land.y,1);
 if(seq.reduced){
  g.save();g.globalAlpha=.62+.38*Math.abs(Math.sin(local/140));
  paintBall(g,seq.land.x,seq.land.y,0,{color:seq.color,active:true,still:true});g.restore();
 }else{
  if(contain<1){ // soft landing flash
   g.save();g.globalAlpha=(1-contain)*.55;g.strokeStyle='#fff4cf';g.lineWidth=2;
   g.beginPath();g.ellipse(seq.land.x,seq.land.y,10+contain*30,(10+contain*30)*.62,0,0,Math.PI*2);g.stroke();g.restore();
   puff(g,seq.land.x-14,seq.land.y+16,7+contain*6,(1-contain)*.5);
   puff(g,seq.land.x+13,seq.land.y+14,6+contain*5,(1-contain)*.4);
  }
  const amp=[.18,.26,.34][idx],settle=1-clamp(wl/WOBBLE_MS,0,1)*.35;
  paintBall(g,seq.land.x,seq.land.y,Math.sin(local/95)*amp*settle,{color:seq.color,active:true});
 }
}
function drawCaught(g,dt){
 const local=dt-RESOLVE_MS,k=clamp(local/CAUGHT_MS,0,1);
 shadow(g,seq.land.x,seq.land.y,1-.3*k);
 paintBall(g,seq.land.x,seq.land.y,0,{color:seq.color,active:true});
 if(seq.reduced){ // static glints, no burst
  g.save();g.globalAlpha=.8;g.fillStyle='#f5e3a5';
  for(let i=0;i<4;i++)g.fillRect(seq.land.x-15+i*10,seq.land.y-19+(i%2)*5,3,3);
  g.restore();return;
 }
 for(let i=0;i<8;i++){
  const a=i*Math.PI*2/8+.4,r=8+Math.sin(clamp(k*1.6,0,1)*Math.PI)*(20+(i%3)*7);
  const fade=k<.7?1:1-(k-.7)/.3;
  sparkle(g,seq.land.x+Math.cos(a)*r,seq.land.y-6+Math.sin(a)*r*.72,3.2-(i%2),Math.max(0,fade)*.95);
 }
 if(k<.35){g.save();g.globalAlpha=(.35-k)*.9;g.fillStyle='#fff4cf';g.beginPath();g.ellipse(seq.land.x,seq.land.y,26+k*60,(26+k*60)*.6,0,0,Math.PI*2);g.fill();g.restore()}
}
function drawEscape(g,dt){
 const local=dt-RESOLVE_MS,k=clamp(local/ESCAPE_MS,0,1);
 shadow(g,seq.land.x,seq.land.y,1-k);
 if(seq.reduced){
  g.save();g.globalAlpha=1-k;paintBall(g,seq.land.x,seq.land.y,0,{color:seq.color,active:true});g.restore();
  return;
 }
 if(k<.3){g.save();g.globalAlpha=(.3-k)/.3*.7;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.ellipse(seq.land.x,seq.land.y,12+k*70,(12+k*70)*.6,0,0,Math.PI*2);g.stroke();g.restore()}
 paintBall(g,seq.land.x,seq.land.y-k*4,Math.sin(local/70)*.1*(1-k),{color:seq.color,active:true,open:clamp(k*2.2,0,1)});
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3+.7,d=k*(10+(i%3)*8);
  puff(g,seq.land.x+Math.cos(a)*d,seq.land.y-2+Math.sin(a)*d*.6-k*8,4+(i%3),Math.max(0,1-k*1.15)*.55);
 }
}
function render(g,t){
 if(!seq)return;
 const dt=t-seq.t0,phase=phaseOf(dt,seq.success);
 if(!phase){seq=null;return}
 const prev=seq.phase;seq.phase=phase;
 fireCues(phase,dt,prev);
 if(phase==='throw')drawThrow(g,dt);
 else if(phase==='wobble')drawWobble(g,dt);
 else if(phase==='caught')drawCaught(g,dt);
 else{void prev;drawEscape(g,dt)}
}
function playCue(kind,on){
 if(kind!=='catch')return false; // rest/hatch/badge stay with game.js
 if(seq){if(!seq.fanfare){seq.fanfare=true;cue('catch',on!==false)}}else cue('catch',on!==false);
 return true;
}
const api={start,render,clear,active,wildVisible,playCue,
 THROW_MS,WOBBLE_MS,WOBBLES,RESOLVE_MS,CAUGHT_MS,ESCAPE_MS};
if(typeof window!=='undefined')window.CapturePresentation=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
