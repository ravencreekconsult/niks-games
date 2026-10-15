import subprocess,time,urllib.request,json,websocket,os,base64,threading,http.server,functools
root=os.environ.get('BUSINESS_GAME_ROOT','/tmp/business-game');out=os.environ.get('BUSINESS_GAME_OUTPUT','/tmp/business-ui');os.makedirs(out,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8799),functools.partial(Handler,directory=root));threading.Thread(target=server.serve_forever,daemon=True).start()
p=subprocess.Popen(['google-chrome-stable','--headless=new','--no-sandbox','--disable-gpu','--remote-allow-origins=*','--remote-debugging-port=9337','--user-data-dir=/tmp/business-chrome-interactions','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 tabs=[]
 for _ in range(200):
  try: tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9337/json'));break
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
  return r.get('result',{}).get('value')
 def shot(name):
  js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  data=cmd('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data'];open(out+'/'+name+'.png','wb').write(base64.b64decode(data))
 cmd('Page.enable');cmd('Runtime.enable');cmd('Network.enable');cmd('Network.setCacheDisabled',{'cacheDisabled':True});cmd('Storage.clearDataForOrigin',{'origin':'http://127.0.0.1:8799','storageTypes':'all'});cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});cmd('Page.navigate',{'url':'http://127.0.0.1:8799/'});
 for _ in range(60):
  if js('!!document.querySelector(".workbtn")'):break
  time.sleep(.1)
 # This run never adds cash or alters game state: every mutation goes through the UI.
 def state():return js('JSON.parse(localStorage.getItem("business-sim-v1"))')
 def nav(name):js(f'document.querySelector("[data-nav={name}]").click()')
 def click(action,args=None):
  code='Array.from(document.querySelectorAll("[data-action='+action+']"))'
  if args:code+='.find(x=>'+ '&&'.join('JSON.parse(x.dataset.args).'+k+'==='+json.dumps(v) for k,v in args.items())+')'
  else:code+='.at(0)'
  if not js('!!'+code):raise Exception('missing UI action '+action+' '+str(args))
  js(code+'.click()')
 def review(action,args=None):click(action,args);js('document.querySelector("#confirm button").click()')
 def life():
  nav('city');js('document.querySelector("#home-controls details.panel:not(.journey)")&&(document.querySelector("#home-controls details.panel:not(.journey)").open=true)')

 # Hold real pointer: short tap remains one action; release of a long hold adds no extra click.
 life();js('document.querySelector(".workbtn").scrollIntoView({block:"center"})')
 def pointer(kind):
  r=js('(()=>{let r=document.querySelector(".workbtn").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
  cmd('Input.dispatchMouseEvent',{'type':kind,'x':r['x'],'y':r['y'],'button':'left','clickCount':1})
 pointer('mousePressed');time.sleep(.12);pointer('mouseReleased');assert state()['jobProgress']==1
 pointer('mousePressed');time.sleep(.65);before=state()['jobProgress'];pointer('mouseReleased');time.sleep(.15);assert state()['jobProgress']==before,'hold release produced an extra click'
 pointer('mousePressed');time.sleep(.5);js('window.dispatchEvent(new Event("blur"))');before=state()['jobProgress'];time.sleep(.6);assert state()['jobProgress']==before,'hold continued after window blur';pointer('mouseReleased')
 print('PASS real pointer tap/hold/release/blur')
 # Keyboard focus remains after action and details remain open during render.
 js('document.querySelector("details summary").click()');js('document.querySelector("[data-action=shift]").focus()')
 cmd('Input.dispatchKeyEvent',{'type':'keyDown','key':'Enter','code':'Enter','windowsVirtualKeyCode':13});cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':'Enter','code':'Enter','windowsVirtualKeyCode':13})
 assert js('document.activeElement.dataset.action')=='shift','keyboard focus lost'
 assert js('document.querySelector("details").open'),'details collapsed on action'
 print('PASS keyboard action retains focus and expanded section')
 js('document.querySelector("#savebtn").focus();document.querySelector("#savebtn").click()');assert js('document.activeElement.classList.contains("cs-b")');assert js('document.querySelector(".cs-panel").getAttribute("aria-modal")')=='true'
 cmd('Input.dispatchKeyEvent',{'type':'keyDown','key':'Tab','code':'Tab','modifiers':8,'windowsVirtualKeyCode':9});cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':'Tab','code':'Tab','modifiers':8,'windowsVirtualKeyCode':9});assert js('document.activeElement.textContent')=='Close'
 cmd('Input.dispatchKeyEvent',{'type':'keyDown','key':'Escape','code':'Escape','windowsVirtualKeyCode':27});cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':'Escape','code':'Escape','windowsVirtualKeyCode':27});assert js('!document.querySelector(".cs-ov")');assert js('document.activeElement.id')=='savebtn';print('PASS Save dialog keyboard trap/Escape/restored focus')
 # A local imported-text fixture must stay text, including sale review titles.
 js('(async()=>{let e=await import("./engine.mjs");let t=e.action({...e.initial(),cash:5000,skill:2},"open",{industry:"service",name:"<img src=x onerror=window.unsafeImport=1>"});t.events=[{week:1,title:"<img src=x onerror=window.unsafeImport=1>",body:"<script>window.unsafeImport=1</script>"}];t.report={week:1,net:0,revenue:0,items:[{name:"<img src=x onerror=window.unsafeImport=1>",why:"<b>plain text</b>",amount:0}]};localStorage.setItem("business-sim-v1",JSON.stringify(t));location.reload()})()');time.sleep(.5)
 js('document.querySelector("[data-nav=business]").click()');assert js('!window.unsafeImport');js('document.querySelector("[data-action=reviewSale]").click()');assert js('!document.querySelector("dialog img")');js('document.querySelector("#cancel").click()');js('document.querySelector("[data-nav=report]").click()');time.sleep(.1);assert js('!window.unsafeImport');assert js('!document.querySelector("main img")');print('PASS imported HTML-like labels/reports remain text')
 # Corruption checks are isolated from earned-path run. Keep the exact invalid bytes for recovery.
 raw='{"version":1,"cash":999,"week":1,"report":{}}'
 js('localStorage.setItem("business-sim-v1",'+json.dumps(raw)+')');cmd('Page.reload');time.sleep(.4)
 assert state()['cash']==110;assert js('localStorage.getItem("business-sim-v1-recovery")')==raw
 assert js('!!document.querySelector("#recover-save")');js('document.querySelector("#recover-save").scrollIntoView({block:"center"})');shot('recovery-390')
 print('PASS corrupt local save preserved without game crash')
finally:p.terminate();server.shutdown()
