import subprocess,time,urllib.request,json,websocket,os,base64,threading,http.server,functools,re
from pathlib import Path
root=str(Path(__file__).resolve().parent.parent/'localfirst');out=os.environ.get('RIVENMOORE_OUTPUT','/tmp/rivenmoore-proof');os.makedirs(out,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):
  if self.path.split('?')[0]=='/':
   text=Path(root+'/index.html').read_text()
   text=re.sub(r'<script.*?</script>','',text)
   files=['data','expansion-data','adventure-data','investigation-data','art','environment-art','cartoon-pack','capture-presentation','game']
   scripts='<script>window.LocalFirstContext={account: "local-regression"};</script>'+''.join('<script src="/js/'+f+'.js"></script>' for f in files)
   raw=text.replace('</body>',scripts+'</body>').encode();self.send_response(200);self.send_header('Content-Type','text/html');self.end_headers();self.wfile.write(raw)
  else:super().do_GET()
server=http.server.ThreadingHTTPServer(('127.0.0.1',8801),functools.partial(Handler,directory=root));threading.Thread(target=server.serve_forever,daemon=True).start()
p=subprocess.Popen(['google-chrome-stable','--headless=new','--no-sandbox','--disable-gpu','--remote-allow-origins=*','--remote-debugging-port=9341','--user-data-dir=/tmp/rivenmoore-chrome-test','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 tabs=[]
 for _ in range(200):
  try: tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9341/json'));break
  except:time.sleep(.1)
 if not tabs:raise RuntimeError('Chrome debugging endpoint did not start within 20 seconds')
 ws=websocket.create_connection(next(t for t in tabs if t["type"]=="page")['webSocketDebuggerUrl']);seq=0;ws.settimeout(8)
 def cmd(method,params={}):
  global seq
  seq+=1;ws.send(json.dumps({'id':seq,'method':method,'params':params}))
  while True:
   r=json.loads(ws.recv())
   if r.get('id')==seq:
    if 'error'in r:raise Exception(r['error'])
    return r.get('result',{})
 def js(x):
  r=cmd('Runtime.evaluate',{'expression':x,'awaitPromise':True,'returnByValue':True})
  if 'exceptionDetails' in r:raise Exception(r['exceptionDetails'])
  if 'setTimeout(()=>location.reload(),0)' in x:time.sleep(.6)
  return r.get('result',{}).get('value')
 def padstep(d):
  r=js('(()=>{let b=document.querySelector("[data-dir='+d+']");b.scrollIntoView({block:"center"});let r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
  cmd('Input.dispatchMouseEvent',{'type':'mousePressed','x':r['x'],'y':r['y'],'button':'left','clickCount':1})
  cmd('Input.dispatchMouseEvent',{'type':'mouseReleased','x':r['x'],'y':r['y'],'button':'left','clickCount':1})
 def shot(name):
  js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  data=cmd('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data'];open(out+'/'+name+'.png','wb').write(base64.b64decode(data))
 cmd('Page.enable');cmd('Runtime.enable');cmd('Network.enable');cmd('Network.setCacheDisabled',{'cacheDisabled':True});cmd('Storage.clearDataForOrigin',{'origin':'http://127.0.0.1:8801','storageTypes':'all'})
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 cmd('Page.navigate',{'url':'http://127.0.0.1:8801/?debug=1'})
 for _ in range(100):
  if js('!!window.CritterDebug'):break
  time.sleep(.1)
 assert js('!!window.CritterDebug')
 js('document.querySelector(".nursery-variants div").click();document.querySelector("input").value="Test Keeper";Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Begin the journey").click();document.querySelector("button.starter").click()')
 assert js('CritterDebug.validSave(CritterDebug.state())')
 js('CritterDebug.save()')
 saved=js('localStorage.getItem("havenmoore-localfirst-prototype-runtime-local-regression-1")')
 cmd('Page.reload')
 time.sleep(1)
 assert js('CritterDebug.validSave(CritterDebug.state())')
 assert js('CritterDebug.state().farm.trainer==="Test Keeper"')
 print('PASS real fresh name/hero/starter UI and reload retain valid family/save')
 # Earned seeded opening: actual movement buttons, battle moves and ball, no stat/cash/position grant.
 js('Math.random=()=>.1')
 pathfn="(goal)=>{let s=CritterDebug.state(),m=CritterDebug.map(s.area),n=CritterDebug.npcs(s.area),q=[[s.x,s.y,[]]],seen=new Set();while(q.length){let[x,y,p]=q.shift(),k=x+','+y;if(seen.has(k))continue;seen.add(k);if(goal(x,y,m.grid[y]?.[x]))return p;for(let[d,dx,dy]of[['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]]){let xx=x+dx,yy=y+dy,t=m.grid[yy]?.[xx];if(t&&!['water','tree','house','fence','rock','cavewall','boulder'].includes(t)&&!n.some(v=>v.x===xx&&v.y===yy))q.push([xx,yy,p.concat(d)])}}throw Error('No test route')}"
 path=js('('+pathfn+')( (x,y)=>x===10&&y===0 )')
 for d in path+['up']:padstep(d)
 assert js('CritterDebug.state().area==="route"')
 path=js('('+pathfn+')( (x,y,t)=>t==="grass" )')
 for d in path:
  if js('!!CritterDebug.battle()'):break
  padstep(d)
 # If the first grass visit did not yet reach the step counter, alternate a legal neighbour.
 for _ in range(10):
  if js('!!CritterDebug.battle()'):break
  padstep(js('(()=>{let s=CritterDebug.state(),m=CritterDebug.map(s.area);let d=[["up",0,-1],["down",0,1],["left",-1,0],["right",1,0]].find(([d,dx,dy])=>m.grid[s.y+dy]?.[s.x+dx]==="grass");if(!d)throw Error("No grass neighbour");return d[0]})()'))
 assert js('!!CritterDebug.battle()&&!CritterDebug.battle().trainer')
 for _ in range(15):
  if js('CritterDebug.battle().wildFainted'):break
  js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Fight")).click()')
  js('(()=>{let m=CritterDebug.state().party[CritterDebug.battle().active],t=CritterDebug.battle().foes[0],v=m.moves.filter(v=>v.pp>0&&MOVES[v.id].power).sort((u,v)=>CritterDebug.damageFor(m,t,v.id,true,1)-CritterDebug.damageFor(m,t,u.id,true,1))[0];Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith(MOVES[v.id].name)).click()})()')
  for _ in range(100):
   time.sleep(.1)
   if js('!!CritterDebug.battle()?.wildFainted||Array.from(document.querySelectorAll("#battleActions button")).some(b=>b.textContent.startsWith("Fight"))'):break
 assert js('CritterDebug.battle().wildFainted')
 js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Catch")).click();Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Reef ball")).click()')
 for _ in range(120):
  if js('!CritterDebug.battle()'):break
  time.sleep(.1)
 assert js('CritterDebug.state().party.length===2&&CritterDebug.validSave(CritterDebug.state())')
 assert js('CritterDebug.state().money===100&&CritterDebug.state().balls.great===4')
 print('PASS seeded fresh starter to on-foot wild battle and caught second companion using actual movement/move/ball buttons, no stat/cash/position grants')
 js('CritterDebug.save()')
 earned=js('JSON.stringify(CritterDebug.state())')
 cmd('Page.reload');time.sleep(.7)
 assert js('JSON.stringify(CritterDebug.state())')==earned
 assert js('CritterDebug.validSave(CritterDebug.state())')
 print('PASS captured family save reload preserves full state bytes including HP/XP/identity/lineage/supplies')
 # Explicit isolated tactical fixture, not an earned battle or capture.
 js('window.a=CritterDebug.createMon("cindlet",18);window.a.ivs=[31,31,31,31,31,31];a.evs=[0,120,0,120,0,0];CritterDebug.setParty([a]);CritterDebug.startBattle("wren")')
 time.sleep(.2)
 assert js('!!CritterDebug.battle()')
 for w,h in [(320,568),(390,844),(1280,844)]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':w<800})
  js('CritterDebug.fightActions()')
  assert js('document.querySelector("#battleActions").innerText.includes("On hit:")')
  assert not js('document.documentElement.scrollWidth>innerWidth')
  js('document.querySelector("#battleActions").scrollIntoView({block:"center"})')
  shot('tactical-moves-'+str(w))
  before=js('JSON.stringify(CritterDebug.state())')
  js('CritterDebug.showBattleReadout()')
  assert js('document.querySelector("#modalBody").innerText.includes("Ranges exclude critical hits")')
  assert js('JSON.stringify(CritterDebug.state())')==before
  assert not js('document.documentElement.scrollWidth>innerWidth')
  shot('tactical-notes-'+str(w))
  js('document.querySelector("#closeModal").click()')
 # Actual resolver consumes rolls in its old order; compare displayed bounds to observed HP loss.
 result=js('(async()=>{let foe=CritterDebug.battle().foes[0];a.status=null;foe.status=null;a.hp=CritterDebug.stats(a).hp;foe.hp=1000;a.stages={atk:0,def:0,spa:0,spd:0,spe:0};foe.stages={...a.stages};let id=a.moves.find(v=>v.id!=="guard").id;let lo=CritterDebug.damageFor(a,foe,id,true,.85),hi=CritterDebug.damageFor(a,foe,id,true,1),old=Math.random;Math.random=()=>.5;try{await CritterDebug.performMove(a,foe,id,true)}finally{Math.random=old}return {lo,hi,hit:1000-foe.hp}})()')
 assert result['lo']<=result['hit']<=result['hi']
 print('PASS actual on-hit resolver damage inside forecast:',result)
 js('CritterDebug.finishBattle("Fixture complete")')
 # Double target preview must use each chosen foe, not only the first opponent.
 js('CritterDebug.setParty([CritterDebug.createMon("cindlet",18),CritterDebug.createMon("puddlep",18)]);CritterDebug.startDoubles("wren")')
 time.sleep(.2)
 assert js('CritterDebug.battle().double')
 js('CritterDebug.doubleTargets(0,CritterDebug.state().party[0].moves[0].id)')
 assert js('Array.from(document.querySelectorAll("#battleActions button")).filter(b=>b.innerText.startsWith("Target ")).every(b=>b.innerText.includes("On hit:"))')
 shot('tactical-double-targets-1280')
 print('PASS tactical fixtures320/390/1280 move and double-target previews, read-only notes and actual damage; not signed-in multiplayer testing')
finally:p.terminate();server.shutdown()
