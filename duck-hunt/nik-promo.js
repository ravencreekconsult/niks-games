/* Nik's secret codes. Codes are never stored here, only salted SHA-256 hashes. */
(function(){
  function sha256(str){
    var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var b=[],i,j; for(i=0;i<str.length;i++){ var c=str.charCodeAt(i); if(c<128) b.push(c); else if(c<2048) b.push(192|c>>6,128|c&63); else b.push(224|c>>12,128|(c>>6)&63,128|c&63); }
    var l=b.length*8; b.push(0x80); while(b.length%64!==56) b.push(0);
    for(i=7;i>=0;i--) b.push(i>3?0:(l>>>(i*8))&255);
    var w=new Array(64);
    for(var o=0;o<b.length;o+=64){
      for(i=0;i<16;i++) w[i]=(b[o+i*4]<<24)|(b[o+i*4+1]<<16)|(b[o+i*4+2]<<8)|b[o+i*4+3];
      for(i=16;i<64;i++){ var s0=((w[i-15]>>>7)|(w[i-15]<<25))^((w[i-15]>>>18)|(w[i-15]<<14))^(w[i-15]>>>3), s1=((w[i-2]>>>17)|(w[i-2]<<15))^((w[i-2]>>>19)|(w[i-2]<<13))^(w[i-2]>>>10); w[i]=(w[i-16]+s0+w[i-7]+s1)|0; }
      var a=H[0],bb=H[1],cc=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for(i=0;i<64;i++){ var S1=((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7)), ch=(e&f)^(~e&g), t1=(h+S1+ch+K[i]+w[i])|0, S0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10)), mj=(a&bb)^(a&cc)^(bb&cc), t2=(S0+mj)|0;
        h=g;g=f;f=e;e=(d+t1)|0;d=cc;cc=bb;bb=a;a=(t1+t2)|0; }
      H[0]=(H[0]+a)|0;H[1]=(H[1]+bb)|0;H[2]=(H[2]+cc)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0; }
    var hex=''; for(j=0;j<8;j++) hex+=('00000000'+(H[j]>>>0).toString(16)).slice(-8); return hex; }
  var NP={sha256:sha256}, cfg=null;
  function norm(t){ return String(t||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }
  function key(){ return 'nikpromo_'+cfg.game; }
  function done(){ try{ return JSON.parse(localStorage.getItem(key())||'[]'); }catch(e){ return []; } }
  NP.has=function(id){ return done().indexOf(id)>=0; };
  function mark(id){ var d=done(); if(d.indexOf(id)<0){ d.push(id); try{ localStorage.setItem(key(),JSON.stringify(d)); }catch(e){} } }
  function css(){ if(document.getElementById('npCss')) return; var s=document.createElement('style'); s.id='npCss';
    s.textContent='.np-ov{position:fixed;inset:0;z-index:100001;background:rgba(5,6,14,.82);display:flex;align-items:center;justify-content:center;padding:14px;font:600 14px/1.45 system-ui,sans-serif;color:#fff}.np-card{background:linear-gradient(180deg,#232a52,#12162e);border:2px solid #ffd34d;border-radius:16px;padding:18px;max-width:340px;width:100%;text-align:center;box-shadow:0 0 40px rgba(255,211,77,.35)}.np-card h2{margin:0 0 6px;font-size:20px;color:#ffd34d;letter-spacing:.04em}.np-card input{width:100%;box-sizing:border-box;margin:10px 0;padding:12px;border-radius:10px;border:2px solid #4a5590;background:#0b0e20;color:#fff;font:700 16px ui-monospace,monospace;text-transform:uppercase;text-align:center}.np-card button{display:block;width:100%;min-height:44px;margin-top:8px;border-radius:10px;border:0;background:#ffd34d;color:#201600;font:800 14px system-ui}.np-card button.sec{background:#2a3150;color:#fff}.np-msg{min-height:18px;color:#ff9a9a;font-size:13px}.np-burst{position:absolute;inset:0;pointer-events:none;overflow:hidden}.np-burst i{position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:2px;opacity:0;animation:npb 1.4s ease-out forwards}@keyframes npb{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(540deg)}}.np-pop{animation:npp .5s cubic-bezier(.2,1.6,.4,1)}@keyframes npp{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}';
    document.head.appendChild(s); }
  function burst(host){ var b=document.createElement('div'); b.className='np-burst'; var cols=['#ffd34d','#ff7ab6','#7ef2ff','#9bff8a','#ffffff'];
    for(var i=0;i<46;i++){ var p=document.createElement('i'),a=Math.random()*6.283,r=120+Math.random()*220; p.style.setProperty('--x',Math.cos(a)*r+'px'); p.style.setProperty('--y',Math.sin(a)*r+'px'); p.style.background=cols[i%cols.length]; p.style.animationDelay=(Math.random()*0.25)+'s'; b.appendChild(p); }
    host.appendChild(b); }
  function unlockMoment(def){ css(); var o=document.createElement('div'); o.className='np-ov'; var c=document.createElement('div'); c.className='np-card np-pop';
    c.innerHTML='<div style="font-size:12px;letter-spacing:.2em;color:#9fb0ff">NIK\'S SECRET UNLOCKED</div><h2></h2><div class="np-d"></div>'; c.querySelector('h2').textContent=def.title; c.querySelector('.np-d').textContent=def.desc;
    var b=document.createElement('button'); b.textContent='Awesome!'; b.onclick=function(){ o.remove(); if(def.after) def.after(); }; c.appendChild(b); o.appendChild(c); burst(o); document.body.appendChild(o);
    try{ var A=window.AudioContext||window.webkitAudioContext; if(A){ var x=new A(),t=x.currentTime; [523,659,784,1046,1318].forEach(function(f,i){ var os=x.createOscillator(),g=x.createGain(); os.type='triangle'; os.frequency.value=f; g.gain.setValueAtTime(0.0001,t+i*0.11); g.gain.exponentialRampToValueAtTime(0.12,t+i*0.11+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.11+0.4); os.connect(g); g.connect(x.destination); os.start(t+i*0.11); os.stop(t+i*0.11+0.45); }); } }catch(e){}
    try{ if(navigator.vibrate) navigator.vibrate([40,30,80]); }catch(e){} }
  NP.open=function(){ css(); var o=document.createElement('div'); o.className='np-ov'; var c=document.createElement('div'); c.className='np-card';
    c.innerHTML='<h2>Secret code</h2><div style="opacity:.8;font-size:13px">Got a code from the Ranger HQ? Type it in.</div><input id="npIn" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="NIK-..."><div class="np-msg" id="npMsg"></div>';
    var go=document.createElement('button'); go.textContent='Redeem'; var cl=document.createElement('button'); cl.className='sec'; cl.textContent='Close';
    function submit(){ var n=norm(c.querySelector('#npIn').value); if(!n) return; var h=sha256(cfg.salt+cfg.game+n), def=null;
      for(var i=0;i<cfg.codes.length;i++) if(cfg.codes[i].hash===h) def=cfg.codes[i];
      if(!def){ c.querySelector('#npMsg').textContent='Hmm, that code does not unlock anything.'; try{ if(navigator.vibrate) navigator.vibrate(60); }catch(e){} return; }
      o.remove(); var again=NP.has(def.id); mark(def.id); def.apply(again); unlockMoment({title:again?def.title+' (already yours)':def.title,desc:def.desc,after:def.after}); }
    go.onclick=submit; cl.onclick=function(){ o.remove(); }; c.querySelector('#npIn').onkeydown=function(e){ if(e.key==='Enter') submit(); };
    c.appendChild(go); c.appendChild(cl); o.appendChild(c); document.body.appendChild(o); setTimeout(function(){ try{ c.querySelector('#npIn').focus(); }catch(e){} },50); };
  NP.init=function(c){ cfg=c; try{ var d=done(); for(var i=0;i<cfg.codes.length;i++) if(d.indexOf(cfg.codes[i].id)>=0&&cfg.codes[i].restore) cfg.codes[i].restore(); }catch(e){} };
  NP.hotspot=function(el,taps){ taps=taps||7; var n=0,t=0; if(!el) return; el.addEventListener('click',function(){ var now=Date.now(); if(now-t>1800) n=0; t=now; n++; if(n>=taps){ n=0; NP.open(); } }); };
  window.NikPromo=NP;
})();
