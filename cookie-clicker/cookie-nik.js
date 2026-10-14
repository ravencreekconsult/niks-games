/* Nik's secret: Sprinkles the Chip Hamster + Golden Biscuit perks. State lives in NK.state.nik (inside the save blob). */
(function(){
  if(!window.NK||!window.NikPromo) return;
  var oldX=NK.extraMult, oldC=NK.cpc, pet=null, timer=0;
  NK.extraMult=function(){ var m=oldX?oldX():1; return NK.state&&NK.state.nik?m*1.25:m; };
  NK.cpc=function(){ var v=oldC(); return NK.state&&NK.state.nik?v*2:v; };
  function mkPet(){
    if(pet||!NK.state||!NK.state.nik) return;
    pet=document.createElement('div'); pet.id='nikPet'; pet.setAttribute('aria-hidden','true');
    pet.style.cssText='position:fixed;width:64px;height:64px;z-index:5;pointer-events:none;animation:nkpet 1.6s ease-in-out infinite';
    pet.innerHTML='<svg viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(0,0,0,.25)"/><ellipse cx="32" cy="38" rx="20" ry="18" fill="#e9b36a" stroke="#4a2c12" stroke-width="3"/><ellipse cx="32" cy="44" rx="12" ry="10" fill="#fbe3b8"/><circle cx="16" cy="22" r="7" fill="#e9b36a" stroke="#4a2c12" stroke-width="3"/><circle cx="48" cy="22" r="7" fill="#e9b36a" stroke="#4a2c12" stroke-width="3"/><circle cx="16" cy="22" r="3" fill="#f2a0a0"/><circle cx="48" cy="22" r="3" fill="#f2a0a0"/><circle cx="25" cy="34" r="3.2" fill="#1b1209"/><circle cx="39" cy="34" r="3.2" fill="#1b1209"/><circle cx="26" cy="33" r="1" fill="#fff"/><circle cx="40" cy="33" r="1" fill="#fff"/><ellipse cx="32" cy="40" rx="3" ry="2" fill="#c0604a"/><circle cx="21" cy="42" r="4" fill="#f6a8a0" opacity=".7"/><circle cx="43" cy="42" r="4" fill="#f6a8a0" opacity=".7"/><circle cx="32" cy="50" r="5" fill="#8a5a2b" stroke="#4a2c12" stroke-width="1.5"/><circle cx="30" cy="49" r="1" fill="#4a2c12"/><circle cx="34" cy="51" r="1" fill="#4a2c12"/></svg>';
    var st=document.createElement('style'); st.textContent='@keyframes nkpet{0%,100%{margin-top:0}50%{margin-top:-6px}}'; document.head.appendChild(st);
    document.body.appendChild(pet); place();
    timer=setInterval(function(){ place(); try{ var b=document.getElementById('bigcookie'); if(!b||b.offsetParent===null||document.hidden) return; var r=b.getBoundingClientRect(); NK.click(r.left+r.width*0.75,r.top+r.height*0.7); }catch(e){} },2000);
  }
  function place(){ var b=document.getElementById('bigcookie'); if(!pet||!b) return; var r=b.getBoundingClientRect(); var vis=b.offsetParent!==null&&r.width>0; pet.style.display=vis?'block':'none'; if(!vis) return;
    pet.style.left=Math.max(4,Math.min(innerWidth-68,r.right-56))+'px'; pet.style.top=Math.max(4,r.bottom-48)+'px'; }
  addEventListener('resize',place); addEventListener('scroll',place,true);
  window.__nikCC=function(again){ NK.state.nik=1; if(!again){ NK.state.cookies+=Math.max(5e6,NK.cps()*900); } try{ NK.save(); }catch(e){} mkPet(); };
  NikPromo.init({game:"cookie-clicker",salt:"nk-23dd69da4a2c",codes:[{id:"cc-sprinkles",hash:"e4edbe80a2e9c0991e431d3ddc81acfbc5c5bfb3b660d9453440f416bbff46d0",title:"Sprinkles the Chip Hamster",desc:"A secret pet for Nik: Sprinkles bakes for you with a tap every 2 seconds. Plus the Golden Biscuit perks: x2 tap power, +25% cookies per second, and a starter stash of cookies.",apply:function(again){ __nikCC(again); }}]});
  NikPromo.hotspot(document.getElementById("count"),7);
  if(NK.state&&NK.state.nik) mkPet();
  setInterval(function(){ if(NK.state&&NK.state.nik&&!pet) mkPet(); },3000);
})();
