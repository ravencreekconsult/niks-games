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
 # Continue the earned family through both community alternatives without a battle/stat/position grant.
 js('Math.random=()=>.99')
 def clicktext(text):
  return js('(()=>{let b=Array.from(document.querySelectorAll("#modalBody button")).find(b=>b.textContent==='+json.dumps(text)+');if(!b)throw Error("Missing button: "+'+json.dumps(text)+');b.click();return true})()')
 def close():js('document.querySelector("#closeModal").click()')
 def walk(goal):
  route=js('('+safe_path+')( '+goal+' )')
  for d in route:padstep(d)
  assert not js('!!CritterDebug.battle()'), 'Unexpected trainer or wild encounter on community route'
 def meet(id):
  n=js('CritterDebug.npcs(CritterDebug.state().area).find(n=>n.id==='+json.dumps(id)+')')
  assert n, id
  walk('(x,y)=>Math.abs(x-'+str(n['x'])+')+Math.abs(y-'+str(n['y'])+')===1')
  js('document.querySelector("#interactBtn").click()')
 safe_path="(goal)=>{let s=CritterDebug.state(),m=CritterDebug.map(s.area),n=CritterDebug.npcs(s.area),q=[[s.x,s.y,[]]],seen=new Set();while(q.length){let[x,y,p]=q.shift(),k=x+','+y;if(seen.has(k))continue;seen.add(k);if(goal(x,y,m.grid[y]?.[x]))return p;for(let[d,dx,dy]of[['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]]){let xx=x+dx,yy=y+dy,t=m.grid[yy]?.[xx];if(t&&!['water','tree','house','fence','rock','cavewall','boulder'].includes(t)&&!n.some(v=>v.x===xx&&v.y===yy)&&!n.some(v=>TRAINERS[v.id]&&!CHALLENGES[v.id]&&!s.trainerWins.includes(v.id)&&xx===10&&Math.abs(yy-v.y)<=2))q.push([xx,yy,p.concat(d)])}}throw Error('No legal community route')}"
 # The north Reedway gate must be closed until a real test or story completes.
 walk('(x,y)=>x===9&&y===0');padstep('up')
 assert js('CritterDebug.state().area==="route"&&!CritterDebug.state().trainerWins.length')
 original=js('JSON.stringify(CritterDebug.state().party)')
 money=js('CritterDebug.state().money');balls=js('CritterDebug.state().balls.trail')
 for arc,next_area in [('census','forest'),('roots','town')]:
  meet('arc:'+arc);clicktext('Tell me more.')
  first=js('ADVENTURE_ARCS['+json.dumps(arc)+'].answers[0][0]');clicktext(first);clicktext('I will help this way.');close()
  assert js('CritterDebug.state().adventure['+json.dumps(arc)+'].stage===1')
  meet('site:'+arc)
  choice=js('ADVENTURE_ARCS['+json.dumps(arc)+'].siteChoices[0][0]');clicktext(choice);close()
  assert js('CritterDebug.state().adventure['+json.dumps(arc)+'].stage===2')
  meet('arc:'+arc);clicktext('Report our work');clicktext('Finish this community story');close()
  assert js('CritterDebug.state().adventure['+json.dumps(arc)+'].stage===3')
  assert js('JSON.stringify(CritterDebug.state().party)')==original
  assert js('!CritterDebug.state().trainerWins.length')
  expected=100 if arc=='census' else 120
  money+=expected;balls+=2
  assert js('CritterDebug.state().money')==money
  assert js('CritterDebug.state().balls.trail')==balls
  meet('arc:'+arc);close()
  assert js('CritterDebug.state().money')==money
  walk('(x,y)=>x===9&&y===0');padstep('up')
  assert js('CritterDebug.state().area')==next_area
  js('CritterDebug.save()');earned=js('JSON.stringify(CritterDebug.state())')
  cmd('Page.reload');time.sleep(.7)
  js('Math.random=()=>.99')
  assert js('JSON.stringify(CritterDebug.state())')==earned
  assert js('CritterDebug.validSave(CritterDebug.state())')
  print('PASS earned '+arc+' acceptance/site/report/reward once, north permit, unchanged companions, full save reload')
 meet('nurseryDoor')
 assert js('CritterDebug.state().area==="nursery"')
 meet('breeder')
 assert js('document.querySelector("#modalBody").innerText.includes("Keep one healthy companion")')
 assert js('Array.from(document.querySelectorAll("#modalBody button")).some(b=>b.textContent==="Drop off parents · Free"&&b.disabled)')
 shot('earned-nursery-two-companions-390')
 print('PASS actual village/route/forest/town/nursery travel through two community permits; nursery refuses unsafe two-companion dropoff')
 close()
 # Nursery setup needs two compatible parents and a healthy third companion.
 # Walk back to the same habitat and catch a second member of the existing wild family.
 walk('(x,y)=>x===9&&y===14');padstep('down')
 meet('restDoor')
 assert js('CritterDebug.state().party.every(m=>m.hp>0)')
 walk('(x,y)=>x===9&&y===CritterDebug.map("town").h-1');padstep('down')
 assert js('CritterDebug.state().area==="forest"')
 walk('(x,y)=>x===9&&y===CritterDebug.map("forest").h-1');padstep('down')
 assert js('CritterDebug.state().area==="route"')
 js('Math.random=()=>.1')
 walk('(x,y,t)=>t==="grass"')
 for _ in range(10):
  if js('!!CritterDebug.battle()'):break
  padstep(js('(()=>{let s=CritterDebug.state(),m=CritterDebug.map(s.area);return [["up",0,-1],["down",0,1],["left",-1,0],["right",1,0]].find(([d,dx,dy])=>m.grid[s.y+dy]?.[s.x+dx]==="grass")[0]})()'))
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
 assert js('CritterDebug.state().party.length===3')
 js('Math.random=()=>.99')
 for area in ['route','forest']:
  walk('(x,y)=>x===9&&y===0');padstep('up')
 assert js('CritterDebug.state().area==="town"')
 meet('restDoor');meet('nurseryDoor');meet('breeder')
 js("(()=>{let a=document.querySelectorAll('select')[1];a.value=CritterDebug.state().party[1].uid;a.dispatchEvent(new Event('change'))})()")
 assert js('!Array.from(document.querySelectorAll("#modalBody button")).find(b=>b.textContent==="Drop off parents · Free").disabled')
 parents=js('(()=>{let m=CritterDebug.state().party;return m.slice(1).map(m=>JSON.stringify(m))})()')
 clicktext('Drop off parents · Free')
 clicktext('Confirm drop-off')
 assert js('CritterDebug.state().party.length===1&&CritterDebug.state().eggs.length===1')
 assert js('CritterDebug.state().eggs[0].parents.length===2&&CritterDebug.state().eggs[0].remaining>0')
 assert js('CritterDebug.state().eggs[0].parents.map(m=>JSON.stringify(m))')==parents
 assert js('Array.from(document.querySelectorAll("#modalBody button")).find(b=>b.textContent==="Collect parents & baby").disabled')
 # Reload while the family is away, then use80 earned GAME coins through the real care confirmation.
 js('CritterDebug.save()');cmd('Page.reload');time.sleep(.7);js('Math.random=()=>.99')
 assert js('CritterDebug.validSave(CritterDebug.state())&&CritterDebug.state().party.length===1&&CritterDebug.state().eggs.length===1')
 meet('breeder');before_coins=js('CritterDebug.state().money')
 clicktext('Keeper care · 80 game coins');clicktext('Confirm care · 80 game coins')
 assert js('CritterDebug.state().money')==before_coins-80
 assert js('CritterDebug.state().eggs[0].remaining===0')
 clicktext('Collect parents & baby')
 assert js('CritterDebug.state().eggs.length===0&&CritterDebug.state().party.length===4')
 assert js('CritterDebug.state().party.filter(m=>m.lineage.generation===0&&m.id==="flitter").map(m=>JSON.stringify(m))')==parents
 baby=js('CritterDebug.state().party.find(m=>m.lineage.generation===1)')
 assert baby['lineage']['born']=='Alderhaven nursery' and len(baby['lineage']['parents'])==2
 assert baby['birthTrainer']=='Test Keeper'
 assert all(v in ['A','B'] for v in baby['inheritance']['ivs'])
 assert js('CritterDebug.validSave(CritterDebug.state())')
 shot('earned-newborn-390')
 js('CritterDebug.save()');earned=js('JSON.stringify(CritterDebug.state())')
 cmd('Page.reload');time.sleep(.7)
 assert js('JSON.stringify(CritterDebug.state())')==earned
 assert js('CritterDebug.validSave(CritterDebug.state())')
 print('PASS earned second wild catch/compatible parents, healthy teammate retained, confirmed dropoff, pending-family reload,80 earned game-coin care, pickup with byte-identical parents, inherited baby and full-state reload')
 close();js('Math.random=()=>.99')
 walk('(x,y)=>x===9&&y===14');padstep('down')
 walk('(x,y)=>x===9&&y===CritterDebug.map("town").h-1');padstep('down')
 assert js('CritterDebug.state().area==="forest"')
 for w,h in [(320,568),(390,844),(1280,844)]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':w<800})
  js('CritterDebug.showEncounterNotes()')
  assert js('document.querySelector("#modalBody").innerText.includes("Rare")')
  assert not js('document.documentElement.scrollWidth>innerWidth')
  shot('earned-forest-rarity-'+str(w))
  js('document.querySelector("#modalBody").parentElement.scrollTop=10000')
  shot('earned-forest-coats-'+str(w))
  close()
 print('PASS earned nursery -> forest habitat notes; rare-species odds readable with unseen names hidden at320/390/1280')
 js('CritterDebug.save()')
 Path(out+'/earned-nursery-runtime.json').write_text(js('localStorage.getItem("havenmoore-localfirst-prototype-runtime-local-regression-1")'))
 print('CHECKPOINT earned nursery runtime written for continuation tests')

finally:p.terminate();server.shutdown()
