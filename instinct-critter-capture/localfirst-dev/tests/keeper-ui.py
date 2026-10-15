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
 # Continuation uses a previously earned checkpoint, never a synthetic party.
 checkpoint=os.environ.get('RIVENMOORE_CHECKPOINT',out+'/earned-nursery-runtime.json')
 raw=Path(checkpoint).read_text();js('localStorage.setItem("havenmoore-localfirst-prototype-runtime-local-regression-1",'+json.dumps(raw)+');location.reload()');time.sleep(.7)
 assert js('CritterDebug.validSave(CritterDebug.state())&&CritterDebug.state().party.length===4')
 js('Math.random=()=>.99;window._timer=setTimeout;window.setTimeout=(f,n,...a)=>_timer(f,Math.min(n,10),...a)')
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

 def settle():
  for _ in range(400):
   if js('!CritterDebug.battle()||Array.from(document.querySelectorAll("#battleActions button")).some(b=>!b.disabled&&b.getClientRects().length)'):time.sleep(.03);return
   time.sleep(.02)
  raise RuntimeError('Battle did not settle')
 def fight():
  js('Math.random=()=>.5')
  for turn in range(100):
   if not js('!!CritterDebug.battle()'):break
   if js('!document.querySelector("#modal").hidden&&Array.from(document.querySelectorAll("#modalBody button")).some(b=>b.textContent.startsWith("Replace "))'):
    js('(()=>{let b=Array.from(document.querySelectorAll("#modalBody button")).find(b=>b.textContent.startsWith("Replace Tackle"))||Array.from(document.querySelectorAll("#modalBody button")).find(b=>b.textContent.startsWith("Replace Guard"))||document.querySelector("#modalBody button");b.click()})()');time.sleep(.25);continue
   actions=js('Array.from(document.querySelectorAll("#battleActions button")).filter(b=>!b.disabled).map(b=>b.textContent)')
   if js('CritterDebug.battle().double'):
    choice=js('(()=>{let b=CritterDebug.battle(),m=CritterDebug.state().party[b.active],best=null;for(let v of m.moves.filter(v=>v.pp>0&&MOVES[v.id].power))for(let i of b.foeSlots){let n=CritterDebug.damageFor(m,b.foes[i],v.id,true,1);if(!best||n>best.n)best={id:v.id,target:i,n}}return best})()')
    if not choice:raise RuntimeError('Double companion lacks powered moves')
    js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith(MOVES['+json.dumps(choice['id'])+'].name)).click()')
    js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Target "+SPECIES[CritterDebug.battle().foes['+str(choice['target'])+'].id].name)).click()')
    time.sleep(.4);continue
   if any(t.startswith('Fight') for t in actions):
    choice=js('(()=>{let b=CritterDebug.battle(),s=CritterDebug.state(),t=b.foes[b.foeIndex],score=m=>Math.max(0,...m.moves.filter(v=>v.pp>0&&MOVES[v.id].power).map(v=>CritterDebug.damageFor(m,t,v.id,true,1))),m=s.party[b.active],best=s.party.map((m,i)=>({m,i,n:m.hp>0?score(m):0})).sort((a,b)=>b.n-a.n)[0];if(m.hp<CritterDebug.stats(m).hp*.45&&s.potions)return {potion:true};if(best.i!==b.active&&best.n>score(m)*1.5)return {switch:best.i};return {}})()')
    if choice.get('potion'):
     js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Field potion")).click()');time.sleep(.35);continue
    if 'switch' in choice:
     js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Switch")).click()')
     js('document.querySelectorAll("#battleActions button")['+str(choice['switch'])+'].click()');time.sleep(.35);continue
    js('Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Fight")).click()')
    js('(()=>{let m=CritterDebug.state().party[CritterDebug.battle().active],t=CritterDebug.battle().foes[CritterDebug.battle().foeIndex],v=m.moves.filter(v=>v.pp>0&&MOVES[v.id].power).sort((u,v)=>CritterDebug.damageFor(m,t,v.id,true,1)-CritterDebug.damageFor(m,t,u.id,true,1))[0];let b=Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith(v?MOVES[v.id].name:"Struggle"));if(!b)throw Error("No move");b.click()})()')
   elif js('CritterDebug.state().party[CritterDebug.battle().active].hp<=0'):
    js('(()=>{let b=CritterDebug.battle(),s=CritterDebug.state(),t=b.foes[b.foeIndex],best=s.party.map((m,i)=>({m,i,n:m.hp>0?Math.max(0,...m.moves.filter(v=>v.pp>0&&MOVES[v.id].power).map(v=>CritterDebug.damageFor(m,t,v.id,true,1))):0})).sort((a,b)=>b.n-a.n)[0];document.querySelectorAll("#battleActions button")[best.i].click()})()')
   else:
    raise RuntimeError('Unknown battle actions '+str(actions))
   time.sleep(.35)
  assert not js('!!CritterDebug.battle()'), 'Turn cap'
  js('Math.random=()=>.99')
 def enter(areaid):
  meet(areaid)
 def reloadcheck():
  js('CritterDebug.save()');before=js('JSON.stringify(CritterDebug.state())')
  cmd('Page.reload');time.sleep(.6)
  assert js('JSON.stringify(CritterDebug.state())')==before
  js('Math.random=()=>.99;window._timer=setTimeout;window.setTimeout=(f,n,...a)=>_timer(f,Math.min(n,10),...a)')
 # Catch two habitat companions through movement and ball controls. RNG controls luck, not stats.
 walk('(x,y,t)=>t==="grass"')
 for species in ['spriggit','mossling']:
  for _ in range(12):
   if js('!!CritterDebug.battle()'):break
   js('window._q=[.1,(()=>{let n=0;for(let[id,w]of CritterDebug.encounterTable()){if(id==='+json.dumps(species)+')return (n+w/2)/100;n+=w}throw Error("Missing desired habitat")} )()];Math.random=()=>_q.length?_q.shift():.5')
   padstep(js('(()=>{let s=CritterDebug.state(),m=CritterDebug.map(s.area);return [["up",0,-1],["down",0,1],["left",-1,0],["right",1,0]].find(([d,dx,dy])=>m.grid[s.y+dy]?.[s.x+dx]==="grass")[0]})()'))
  assert js('CritterDebug.battle().foes[0].id')==species
  js('Math.random=()=>.01;Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Catch")).click();Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Reef ball")).click()')
  time.sleep(.4)
  assert not js('!!CritterDebug.battle()')
  js('Math.random=()=>.99')
 assert js('CritterDebug.state().party.length===6')
 def lead(species):
  js('document.querySelector("#partyBtn").click()')
  js('Array.from(document.querySelectorAll("#modalBody .roster")).find(c=>c.querySelector("b").textContent.startsWith(SPECIES['+json.dumps(species)+'].name+" ·")).querySelectorAll("button").forEach(b=>{if(b.textContent==="Make lead"&&!b.disabled)b.click()})')
  close()
 lead('spriggit')
 # Collect a legal field training site before approaching a keeper, then heal in town.
 meet('fieldTraining');clicktext('Collect training · Free');time.sleep(.2);close()
 walk('(x,y)=>x===9&&y===0');padstep('up');assert js('CritterDebug.state().area==="town"')
 meet('restDoor');meet('hallkeeper')
 assert js('CritterDebug.state().area==="hall"')
 for keeper in ['brook','granite','aurora']:
  if keeper!='brook':
   walk('(x,y)=>x===9&&y===14');padstep('down')
   assert js('CritterDebug.state().area==="hall"')
   walk('(x,y)=>x===9&&y===14');padstep('down')
   meet('restDoor')
   if keeper=='aurora':
    # Earn the workshop permit and recruit quarry residents instead of grinding the first route.
    meet('arc:signal');clicktext('Tell me more.');clicktext('Learn from the keepers first.');clicktext('I will help this way.');close()
    meet('site:signal');clicktext('Make a steady welcome signal');close()
    meet('arc:signal');clicktext('Report our work');clicktext('Finish this community story');close()
    assert js('CritterDebug.state().adventure.signal.stage===3')
    js('document.querySelector("#partyBtn").click()')
    for _ in range(2):
     js('(()=>{let cards=Array.from(document.querySelectorAll("#modalBody .roster")),c=cards.find(c=>c.querySelector("b").textContent.startsWith("Flitter · L3"));Array.from(c.querySelectorAll("button")).find(b=>b.textContent==="Store").click()})()')
    close()
    walk('(x,y)=>x===9&&y===0');padstep('up');assert js('CritterDebug.state().area==="cave"')
    walk('(x,y,t)=>t==="cavegrass"')
    for species in ['pebblit','coalimp']:
     for _ in range(12):
      if js('!!CritterDebug.battle()'):break
      js('window._q=[.1,(()=>{let n=0;for(let[id,w]of CritterDebug.encounterTable()){if(id==='+json.dumps(species)+')return (n+w/2)/100;n+=w}throw Error("Missing quarry resident")} )()];Math.random=()=>_q.length?_q.shift():.5')
      padstep(js('(()=>{let s=CritterDebug.state(),m=CritterDebug.map(s.area);return [["up",0,-1],["down",0,1],["left",-1,0],["right",1,0]].find(([d,dx,dy])=>m.grid[s.y+dy]?.[s.x+dx]==="cavegrass")[0]})()'))
     assert js('CritterDebug.battle().foes[0].id')==species
     js('Math.random=()=>.01;Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Catch")).click();Array.from(document.querySelectorAll("#battleActions button")).find(b=>b.textContent.startsWith("Reef ball")).click()')
     time.sleep(.4);assert not js('!!CritterDebug.battle()');js('Math.random=()=>.99')
    walk('(x,y)=>x===9&&y===CritterDebug.map("cave").h-1');padstep('down')
    meet('restDoor')
   lead({'granite':'spriggit','aurora':'spriggit','thorn':'coalimp'}[keeper])
   if keeper=='thorn':lead('flitter');lead('cindlet')
   meet('hallkeeper')
  meet(keeper);assert js('CritterDebug.state().area')==keeper+'hall'
  meet('chamberDevice')
  choices={'brook':['Open the upstream intake','Send it through the village pipe'],'granite':['Fit the brace under the support','Place the counterweight on the west tray'],'aurora':['Turn the mirror toward the north crystal','Brush the lens gently'],'thorn':['Water the dry roots','Move it into the planted bed']}
  for label in choices[keeper]:clicktext(label)
  assert js('CritterDebug.state().chamberDevices.includes('+json.dumps(keeper+'hall')+')')
  close();reloadcheck();meet(keeper);clicktext('Begin the battle')
  if keeper=='aurora':Path(out+'/earned-before-aurora-runtime.json').write_text(js('localStorage.getItem("havenmoore-localfirst-prototype-runtime-local-regression-1")'))
  fight()
  print('KEEPER RESULT',keeper,js('({area:CritterDebug.state().area,badges:CritterDebug.state().badges,team:CritterDebug.state().party.map(m=>[m.id,m.level,m.hp])})'),flush=True)
  assert js('CritterDebug.state().badges.includes('+json.dumps(keeper)+')'), keeper+' not won'
  shot('earned-'+keeper+'-recognition-390');close();reloadcheck()
  Path(out+'/earned-'+keeper+'-runtime.json').write_text(js('localStorage.getItem("havenmoore-localfirst-prototype-runtime-local-regression-1")'))
 print('PASS earned Brook/Granite/Aurora mechanisms, battles, badges, Swim/Shove and full checkpoint reloads')
finally:p.terminate();server.shutdown()
