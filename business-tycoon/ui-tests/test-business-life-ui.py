import subprocess,time,urllib.request,json,websocket,os,base64,threading,http.server,functools
root=os.environ.get('BUSINESS_GAME_ROOT','/tmp/business-game');out=os.environ.get('BUSINESS_GAME_OUTPUT','/tmp/business-ui');os.makedirs(out,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8799),functools.partial(Handler,directory=root));threading.Thread(target=server.serve_forever,daemon=True).start()
p=subprocess.Popen(['google-chrome-stable','--headless=new','--no-sandbox','--disable-gpu','--remote-allow-origins=*','--remote-debugging-port=9338','--user-data-dir=/tmp/business-chrome','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 tabs=[]
 for _ in range(200):
  try: tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9338/json'));break
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
 def shot(name):
  js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  data=cmd('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data'];open(out+'/'+name+'.png','wb').write(base64.b64decode(data))
 cmd('Page.enable');cmd('Runtime.enable');cmd('Network.enable');cmd('Network.setCacheDisabled',{'cacheDisabled':True});cmd('Storage.clearDataForOrigin',{'origin':'http://127.0.0.1:8799','storageTypes':'all'});cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});cmd('Page.navigate',{'url':'http://127.0.0.1:8799/'});
 for _ in range(60):
  if js('!!document.querySelector(".life-room")'):break
  time.sleep(.1)
 def state():return js('JSON.parse(localStorage.getItem("business-sim-v1"))')
 def click(action,args=None):
  code='Array.from(document.querySelectorAll("[data-action=\\"'+action+'\\"]"))'
  if args:code+='.find(x=>'+ '&&'.join('JSON.parse(x.dataset.args).'+k+'==='+json.dumps(v) for k,v in args.items())+')'
  else:code+='.at(0)'
  # Colons in data-action values require the quoted selector above.
  if not js('!!'+code):raise Exception('missing '+action+' '+str(args)+' '+str(state()['life'])+' '+js('document.querySelector("#modal").innerText'))
  js(code+'.click()')
 def sheet(name):js('document.querySelector("[data-life-sheet='+name+']").click()')
 def close():js('document.querySelector("#modal").close()')
 assert state()['cash']==12.5 and state()['life']['employment']=='unemployed'
 shot('clicker-fresh-390')
 assert not js('document.documentElement.scrollWidth>innerWidth')
 # Earned-only opening: taps, sell, upgrade, learn, recover, casual shifts.
 cmd('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
 r=js('(()=>{let r=document.querySelector(".tap-earn").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
 cmd('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x'],'y':r['y'],'radiusX':2,'radiusY':2,'force':1,'id':1}]});cmd('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});time.sleep(.15);assert state()['cash']==13
 sheet('sell');click('life:sell',{'id':'headphones'});assert state()['cash']==31;close()
 sheet('upgrade');click('life:upgrade');assert state()['life']['upgrade']==1;close()
 cmd('Emulation.setFocusEmulationEnabled',{'enabled':True});js('document.querySelector(".tap-earn").focus()');cmd('Input.dispatchKeyEvent',{'type':'keyDown','text':'\r','key':'Enter','code':'Enter','windowsVirtualKeyCode':13});cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':'Enter','code':'Enter','windowsVirtualKeyCode':13});assert state()['cash']==16.75;assert js('document.activeElement.dataset.action')=='life:tap'
 sheet('learn');click('life:activity',{'id':'book'});shot('clicker-learning-390');close()
 sheet('jobs');click('life:job',{'id':'retail'});click('life:casualShift');assert state()['life']['phase']=='clicker';close();assert state()['life']['focused']>4;time.sleep(3.6);shot('clicker-overwork-390');sheet('social');click('life:activity',{'id':'walk'});assert state()['life']['focused']==0;shot('clicker-break-390');close()
 sheet('rest');shot('clicker-rest-options-390');click('life:sleep');close()
 sheet('jobs');click('life:casualShift');close()
 sheet('learn');click('life:activity',{'id':'book'});close()
 sheet('rest');click('life:sleep');close()
 sheet('learn');click('life:activity',{'id':'book'});close()
 sheet('jobs');click('life:job',{'id':'office'});assert state()['life']['phase']=='career';shot('clicker-first-fulltime-390');close()
 old=state()['cash'];click('life:tap');assert state()['cash']>old
 # Reload, save menu, phone widths, zero console-derived fixtures.
 before=state();cmd('Page.reload');time.sleep(.5);assert state()==before
 for w in [320,390,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':True});time.sleep(.1)
  assert not js('document.documentElement.scrollWidth>innerWidth'),w
  shot('clicker-fulltime-'+str(w))
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 # Continue entirely through the UI into the first owned company and crew.
 sheet('food');click('life:pantry');close()
 h=state()['hoursUsed'];daily=state()['life']['hours'];click('shift')
 assert state()['hoursUsed']==h+8 and state()['life']['hours']==round(daily-8,2)
 sheet('rest');click('life:sleep');close();click('shift')
 click('week');assert state()['week']==2 and state()['life']['day']==8
 js('document.querySelector("[data-nav=city]").click()')
 click('shift');sheet('rest');click('life:sleep');close();click('shift')
 assert state()['cash']>=630
 js('document.querySelector("[data-nav=business]").click()')
 click('reviewOpen');shot('clicker-first-company-review-390');js('document.querySelector("#confirm button").click()')
 assert state()['life']['phase']=='owner' and len(state()['businesses'])==1
 click('hire');assert state()['businesses'][0]['staff']==1 and state()['cash']>=0
 js('document.querySelector("[data-nav=city]").click()');shot('clicker-earned-owner-390')
 assert not js('!!document.querySelector("[data-action=\\"life:tap\\"]")')
 # Persisted life history survives the genre change and a real exported file restore.
 os.makedirs(out+'/life-exports',exist_ok=True)
 if os.path.exists(out+'/life-exports/business-tycoon-save.json'):os.remove(out+'/life-exports/business-tycoon-save.json')
 cmd('Browser.setDownloadBehavior',{'behavior':'allow','downloadPath':out+'/life-exports'})
 js('document.querySelector("#savebtn").click()');js('Array.from(document.querySelectorAll(".cs-b")).find(x=>x.textContent==="Export save file").click()')
 for _ in range(30):
  if os.path.exists(out+'/life-exports/business-tycoon-save.json'):break
  time.sleep(.1)
 exported=json.load(open(out+'/life-exports/business-tycoon-save.json'));saved=json.loads(exported['data']['business-sim-v1']);assert saved['life']['sold']==['headphones']
 click('week');assert state()['week']==saved['week']+1
 js('(()=>{let old=HTMLInputElement.prototype.click;HTMLInputElement.prototype.click=function(){if(this.type==="file"){this.id="test-import-input";document.body.append(this);}else old.call(this);};})()')
 js('document.querySelector("#savebtn").click()');js('Array.from(document.querySelectorAll(".cs-b")).find(x=>x.textContent==="Import save file").click()')
 rootnode=cmd('DOM.getDocument')['root']['nodeId'];node=cmd('DOM.querySelector',{'nodeId':rootnode,'selector':'#test-import-input'})['nodeId'];cmd('DOM.setFileInputFiles',{'nodeId':node,'files':[out+'/life-exports/business-tycoon-save.json']})
 for _ in range(30):
  if js('!!Array.from(document.querySelectorAll(".cs-b")).find(x=>x.textContent==="Import to this device")'):break
  time.sleep(.1)
 shot('clicker-owner-import-review-390');js('Array.from(document.querySelectorAll(".cs-b")).find(x=>x.textContent==="Import to this device").click()');time.sleep(.7)
 assert state()==saved
 # A separate empty localhost origin proves a bad first week is recoverable, with no injected balance.
 cmd('Storage.clearDataForOrigin',{'origin':'http://localhost:8799','storageTypes':'all'});cmd('Page.navigate',{'url':'http://localhost:8799/'})
 for _ in range(60):
  if js('!!document.querySelector(".life-room")'):break
  time.sleep(.1)
 assert state()['cash']==12.5
 sheet('rest');click('week');assert state()['cash']==-62.5 and state()['life']['day']==8;close()
 old=state()['cash'];click('life:tap');assert state()['cash']>old
 sheet('food');click('life:pantry');close()
 sheet('learn');click('life:activity',{'id':'book'});close()
 sheet('jobs');click('life:job',{'id':'retail'});click('life:casualShift');close()
 sheet('rest');click('life:sleep');close()
 sheet('jobs');click('life:casualShift');close()
 assert state()['cash']>0;shot('clicker-earned-negative-recovery-390')
 sheet('sell');shot('clicker-search-before-390');click('life:search',{'id':'cupboard'});shot('clicker-search-found-390');click('life:sell',{'id':'lamp'});click('life:search',{'id':'closet'});click('life:sell',{'id':'console'});assert state()['life']['sold']==['lamp','console'];shot('clicker-discovery-390');close()
 sheet('food');click('life:pantry');close()
 sheet('learn');old=state()['cash'];click('life:offer',{'id':'popup'});assert state()['cash']==old+14;assert state()['life']['offerDay']==state()['life']['day'];shot('clicker-odd-job-complete-390');close()
 print('PASS earned fresh clicker -> casual shifts -> full-time -> company -> crew; daily/weekly hours, tap retirement, actual exported-file restore, real touch/keyboard activation, overwork/breaks, room discovery/sales/daily odd job, skipped-week negative-cash recovery and 320/390/1280 layouts')
finally:
 try:ws.close()
 except:pass
 p.terminate();p.wait(timeout=10);server.shutdown();server.server_close()
