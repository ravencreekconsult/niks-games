/* Cloud save client v1 (candidate, private). Inert off the game-accounts origin except Export/Import.
   CloudSave.initLS({game, keys:[localStorage keys], summarize(data), mount:{el|selector|pos}}) */
(function(){
  var API='/api/games/';
  var HOSTS=['game-accounts.ravencreek.workers.dev','instinct-critter-staging.ravencreek.workers.dev'];
  var CS={enabled:(/^\/games\/(cookie-clicker|duck-hunt|pull-a-sword|tower-defense)\/?/.test(location.pathname)&&HOSTS.indexOf(location.hostname)>=0),state:'off',revision:0,account:null,reloading:false};
  var cfg=null,timer=null,queue=Promise.resolve(),statusEl=null,busy=false;
  function rid(){var a='abcdefghijklmnopqrstuvwxyz0123456789',s='w';for(var i=0;i<24;i++)s+=a[Math.floor(Math.random()*a.length)];return s;}
  function raw(url,body){return fetch(url,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body||{})}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok){var e=new Error(j.error||j.code||('HTTP'+r.status));e.status=r.status;e.body=j;throw e;}return j;});});}
  function post(p,b){return raw(API+cfg.game+p,b);}
  function mk(){return 'cloudsave_meta:'+(CS.account||'anon')+':'+cfg.game;}
  function meta(){try{return JSON.parse(localStorage.getItem(mk())||'{}')}catch(e){return{}}}
  function setMeta(m){try{localStorage.setItem(mk(),JSON.stringify(m))}catch(e){}}
  function ok_(){return CS.enabled&&CS.account;}
  function ownerKey(){return 'cloudsave_owner:'+cfg.game;}
  function pkey(){return 'cloudsave_paused:'+(CS.account||'anon')+':'+cfg.game;}
  function isPaused(){try{return localStorage.getItem(pkey())==='1'}catch(e){return false}}
  function setPaused(v){try{if(v)localStorage.setItem(pkey(),'1');else localStorage.removeItem(pkey());}catch(e){}}
  function owner(){try{return localStorage.getItem(ownerKey())}catch(e){return null}}
  function setOwner(a){try{localStorage.setItem(ownerKey(),a)}catch(e){}}
  function acct(j){return (typeof j.account==='string'?j.account:(j.account&&(j.account.id||j.account.email)))||null;}
  /* re-check the session account before every cloud mutation; pause on mismatch */
  function guard(skipOwner){return raw('/api/games/session',{}).then(function(j){var a=acct(j);if(!j.authenticated||!a){say('Sign in to sync','paused');return false;}
      if(a!==CS.account){say('Account changed - reload this page','paused');choose('Account changed',['You signed in as a different account in another tab. Cloud sync is paused so your save is not written to the wrong account.','Reload this page to continue.'],['Reload','Close']).then(function(i){if(i===0)location.reload();});return false;}
      var o=owner();if(!skipOwner&&o&&o!==CS.account){say('Review local save first','paused');return false;}
      return true;}).catch(function(e){if(e&&e.status===401)say('Sign in to sync','paused');else say('Cloud error','error');return false;});}
  function envelope(){return {game:cfg.game,schemaVersion:1,savedAt:Date.now(),data:cfg.get()};}
  function dig(o){try{return JSON.stringify(o)}catch(e){return''}}
  function say(t,c){CS.state=c||t;if(statusEl)statusEl.textContent=t;}
  function summary(env){if(!env)return 'empty';return (cfg.summarize?cfg.summarize(env.data||{}):'saved data')+' ('+new Date(env.savedAt||0).toLocaleString()+')';}
  function download(name,obj){var b=new Blob([JSON.stringify(obj,null,1)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500);}
  function backupLocal(){download('backup-'+cfg.game+'-'+Date.now()+'.json',envelope());}
  /* styled panel: choose(title, lines[], buttons[]) -> Promise<index> */
  function choose(title,lines,btns){return new Promise(function(res){
    var o=document.createElement('div');o.className='cs-ov';var p=document.createElement('div');p.className='cs-panel';
    var h=document.createElement('div');h.className='cs-h';h.textContent=title;p.appendChild(h);
    lines.forEach(function(l){var d=document.createElement('div');d.className='cs-l';d.textContent=l;p.appendChild(d);});
    btns.forEach(function(t,i){var b=document.createElement('button');b.textContent=t;b.className=i===0?'cs-b cs-pri':'cs-b';b.onclick=function(){o.remove();res(i);};p.appendChild(b);});
    o.appendChild(p);document.body.appendChild(o);});}
  CS.choose=choose;
  function err(e){
    if(e.status===401){say('Sign in to sync','paused');return Promise.resolve();}
    if(e.status===409&&/ACCOUNT_CHANGED/.test(e.message)){say('Account changed - reload this page','paused');return choose('Account changed',['Your sign-in changed in another tab. Cloud sync is paused and nothing was saved.'],['Reload','Close']).then(function(i){if(i===0)location.reload();});}
    if(e.status===409&&/CONFLICT/.test(e.message)){say('Conflict - choose a save','conflict');return conflict();}
    if(e.status===429){say('Cloud busy - try again shortly','paused');return Promise.resolve();}
    say('Cloud error','error');return Promise.resolve();}
  function adopt(rec){setOwner(CS.account);cfg.set(rec.envelope.data);setMeta({rev:rec.revision,digest:'adopted'});CS.revision=rec.revision;say('Loaded cloud save','ok');}
  function load(){say('Checking cloud...','busy');
    return post('/read',{}).then(function(rec){return guard(true).then(function(g){if(!g)return;return loadWith(rec);});}).catch(err);}
  function loadWith(rec){return Promise.resolve(rec).then(function(rec){CS.revision=rec.revision||0;
      if(isPaused()){say('Cloud sync paused (device save kept). Use Sync now to resume.','paused');return;}
      var le=envelope(),m=meta(),dl=dig(le.data),empty=!Object.keys(le.data||{}).length,ow=owner();
      if(ow&&ow!==CS.account&&!empty){return choose('This browser has another account\'s save',['The saved game on this device was last used with a different account.','A copy is downloaded and kept first. Nothing is uploaded unless you choose.'],[rec.envelope?'Load this account\'s cloud save':'Start fresh for this account','Use this device save for this account','Not now (sync paused)']).then(function(i){
        backupLocal();try{localStorage.setItem('cloudsave_preserved:'+cfg.game+':'+ow,dig(le))}catch(e){}
        if(i===0){setOwner(CS.account);if(rec.envelope){adopt(rec);}else{cfg.set({});say('Fresh start','idle');}}
        else if(i===1){setOwner(CS.account);return write();}else say('Review needed - sync paused','paused');});}
      if(ow&&ow!==CS.account&&empty)setOwner(CS.account);
      if(!rec.envelope){if(empty){say('Cloud empty','idle');setOwner(CS.account);return;}
        return choose('Cloud save is empty',['Upload this device\'s save to your account?','This device: '+summary(le)],['Upload to cloud','Not now']).then(function(i){if(i===0)return write();say('Cloud sync paused (not uploaded)','paused');});}
      if(dig(rec.envelope.data)===dl){setMeta({rev:rec.revision,digest:dl});say('Cloud synced','ok');return;}
      if(empty){adopt(rec);return;}
      if(m.rev===rec.revision){say('Cloud synced','ok');schedule();return;}
      return choose('Two different saves',['CLOUD: '+summary(rec.envelope),'THIS DEVICE: '+summary(le),'Nothing is overwritten until you choose. A backup of this device downloads first if you pick the cloud save.'],['Use cloud save','Keep this device (do not sync yet)']).then(function(i){
        if(i===0){backupLocal();adopt(rec);}else say('Cloud differs - not syncing','paused');});
    });}
  function conflict(){return post('/read',{}).then(function(rec){return guard(false).then(function(g){if(!g)return;return conflictWith(rec);});}).catch(function(){say('Cloud error','error')});}
  function conflictWith(rec){return Promise.resolve(rec).then(function(rec){var le=envelope();CS.revision=rec.revision;
    return choose('Cloud changed elsewhere',['CLOUD: '+summary(rec.envelope),'THIS DEVICE: '+summary(le)],['Use cloud save (backup this device)','Overwrite cloud with this device','Decide later']).then(function(i){
      if(i===0){backupLocal();adopt(rec);}else if(i===1)return write();else say('Not syncing','paused');});});}
  function write(){var env=envelope(),id=rid();
    if(!Object.keys(env.data||{}).length){say('Nothing to save yet','idle');return Promise.resolve();}
    if(cfg.validate&&!cfg.validate(env.data)){say('Local save looks invalid - not uploaded','error');return Promise.resolve();}
    var p=queue.then(function(){return guard().then(function(g){if(!g)return {skip:1};
      return post('/write',{baseRevision:CS.revision,envelope:env,requestId:id,expectedAccount:CS.account}).then(function(rec){CS.revision=rec.revision;setOwner(CS.account);setMeta({rev:rec.revision,digest:dig(env.data)});say('Saved to cloud','ok');return {};},function(e){return {err:e};});});});
    queue=p.then(function(){},function(){});
    return p.then(function(r){if(r&&r.err)return err(r.err);});}
  function schedule(){if(CS.state!=='ok')return;clearTimeout(timer);timer=setTimeout(write,30000);}
  CS.exportJson=function(){download(cfg.game+'-save.json',envelope());};
  CS.importJson=function(){var inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';
    inp.onchange=function(){var f=inp.files[0];if(!f)return;
      f.text().then(function(t){var env=JSON.parse(t);if(env.game!==cfg.game||!env.data||(cfg.validate&&!cfg.validate(env.data)))throw new Error('bad');return env;})
      .then(function(env){
        return choose('Import this save file?',['FILE: '+summary(env),'THIS DEVICE: '+summary(envelope()),'A backup of this device downloads first.'],['Import to this device','Cancel']).then(function(i){
          if(i!==0)return;backupLocal();
          var inCloud=CS.enabled&&CS.account&&CS.state!=='off'&&CS.state!=='paused';
          if(!inCloud){if(CS.enabled&&CS.account){setPaused(true);}cfg.set(env.data);return;}
          return guard().then(function(g){if(!g){setPaused(true);cfg.set(env.data);return;}return post('/import-preview',{baseRevision:CS.revision,envelope:env,expectedAccount:CS.account}).then(function(p){
            return choose('Replace your cloud save too?',['CLOUD NOW: '+summary(p.current&&(p.current.envelope||p.current)),'IMPORT: '+summary(env),'Cloud keeps its last 3 older saves, so you can restore.'],['Replace cloud with import','Only this device']).then(function(j){
              if(j===0)return post('/import-confirm',{reviewId:p.reviewId,choice:'use-import',requestId:rid(),expectedAccount:CS.account}).then(function(rec){CS.revision=rec.revision;setMeta({rev:rec.revision,digest:'adopted'});cfg.set(env.data);say('Imported to cloud','ok');});
              setPaused(true);say('Cloud sync paused (device import)','paused');cfg.set(env.data);});});});
        });
      },function(){return choose('Could not import',['That file is not a valid save for this game.'],['OK']);})
      .catch(err);};
    inp.click();};
  CS.history=function(){return post('/history',{}).then(function(h){var bs=h.backups||[];if(!bs.length)return choose('Cloud history',['No older saves yet.'],['OK']);
    function pick(k){if(k>=bs.length)return;return choose('Restore an older cloud save?',['Backup '+(k+1)+' of '+bs.length+', saved '+new Date(bs[k].updatedAt).toLocaleString()],['Restore this one','Next older','Close']).then(function(i){
      if(i===1)return pick(k+1);if(i!==0)return;
      return guard().then(function(g){if(!g)return;return post('/restore',{baseRevision:CS.revision,backupRevision:bs[k].revision,requestId:rid(),expectedAccount:CS.account}).then(function(rec){backupLocal();adopt(rec);});});});}
    return pick(0);}).catch(err);};
  CS.syncNow=function(){if(isPaused()){return choose('Replace cloud with this device?',['This device\'s save was imported from a file and cloud sync was paused.','THIS DEVICE: '+summary(envelope()),'Cloud keeps its last 3 older saves.'],['Sync this device to cloud','Cancel']).then(function(i){if(i!==0)return;setPaused(false);return write();});}return write();};
  CS.init=function(c){cfg=c;if(!CS.enabled)return;
    raw('/api/games/session',{}).then(function(j){CS.account=acct(j)||'acct';return load();}).catch(function(){say('Sign in to sync','paused');});
    if(c.onChange)c.onChange(schedule);
    addEventListener('pagehide',function(){if(!CS.reloading&&CS.state==='ok'&&meta().digest!==dig(cfg.get()))write();});};
  CS.mountUI=function(m){m=m||{};
    var st=document.createElement('style');st.textContent='.cs-ov{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100000;display:flex;align-items:center;justify-content:center;padding:12px}.cs-panel{background:#1b2036;color:#fff;border:2px solid rgba(255,255,255,.45);border-radius:14px;padding:14px;max-width:340px;width:100%;max-height:92vh;overflow:auto;font:600 13px/1.4 system-ui,sans-serif}.cs-h{font-size:16px;font-weight:800;margin-bottom:8px}.cs-l{margin:4px 0;opacity:.92}.cs-b{display:block;width:100%;min-height:44px;margin-top:8px;border-radius:10px;border:2px solid rgba(255,255,255,.3);background:#2a3150;color:#fff;font:700 13px system-ui}.cs-pri{background:#3b82f6;border-color:#3b82f6}.cs-open{min-height:40px;padding:0 14px;border-radius:12px;border:2px solid rgba(255,255,255,.45);background:rgba(20,24,40,.9);color:#fff;font:700 13px system-ui,sans-serif}.cs-float{position:fixed;z-index:9990}';
    document.head.appendChild(st);
    var b=document.createElement('button');b.className=(m.className||'cs-open')+(m.pos?' cs-float':'');b.textContent=m.label||'Save / Cloud';b.id='csBtn';
    if(m.pos)for(var k in m.pos)b.style[k]=m.pos[k];
    function openMenu(){
      var lines=[CS.enabled?'Cloud: '+(statusEl?statusEl.textContent:''):'Browser save only (cloud sync works on the account site).'];
      var btns=['Export save file','Import save file'];if(CS.enabled){btns.push('Sync now');btns.push('Cloud history');}btns.push('Close');
      choose('Save',lines,btns).then(function(i){var n=btns[i];if(n==='Export save file')CS.exportJson();else if(n==='Import save file')CS.importJson();else if(n==='Sync now')CS.syncNow();else if(n==='Cloud history')CS.history();});}
    CS.openMenu=openMenu;b.onclick=openMenu;
    var t=document.createElement('span');t.style.display='none';statusEl=t;document.body.appendChild(t);
    if(m.none)return;
    var host=m.el||(m.selector&&document.querySelector(m.selector))||document.body;if(m.cls){var r=document.querySelector(m.cls);if(r)b.className=r.className;}host.appendChild(b);};
  CS.initLS=function(o){var keys=o.keys;
    function get(){var d={};keys.forEach(function(k){var v=null;try{v=localStorage.getItem(k)}catch(e){}if(v!==null)d[k]=v;});return d;}
    function set(d){keys.forEach(function(k){try{if(d[k]==null)localStorage.removeItem(k);else localStorage.setItem(k,d[k]);}catch(e){}});CS.reloading=true;setTimeout(function(){location.reload()},250);}
    var last=dig(get()),cb=null;setInterval(function(){var n=dig(get());if(n!==last){last=n;if(cb)cb();}},5000);
    CS.init({game:o.game,get:get,set:set,summarize:o.summarize,validate:o.validate,onChange:function(f){cb=f;}});
    function mount(){CS.mountUI(o.mount);}if(document.body)mount();else addEventListener('DOMContentLoaded',mount);};
  window.CloudSave=CS;
})();
