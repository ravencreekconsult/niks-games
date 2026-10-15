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
  js(code+'.click()')
 def sheet(name):js('document.querySelector("[data-life-sheet='+name+']").click()')
 def close():js('document.querySelector("#modal").close()')
 assert state()['cash']==12.5 and state()['life']['employment']=='unemployed'
 shot('clicker-fresh-390')
 assert not js('document.documentElement.scrollWidth>innerWidth')
 # Earned-only opening: taps, sell, upgrade, learn, recover, casual shifts.
 click('life:tap');assert state()['cash']==13
 sheet('sell');click('life:sell',{'id':'headphones'});assert state()['cash']==31;close()
 sheet('upgrade');click('life:upgrade');assert state()['life']['upgrade']==1;close()
 click('life:tap');assert state()['cash']==16.75
 sheet('learn');click('life:activity',{'id':'book'});shot('clicker-learning-390');close()
 sheet('jobs');click('life:job',{'id':'retail'});click('life:casualShift');assert state()['life']['phase']=='clicker';close()
 sheet('rest');click('life:sleep');close()
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
 print('PASS earned fresh clicker opening, sale, upgrade, learning, casual shifts, full-time gate, persistence and 320/390/1280 layouts')
finally:
 try:ws.close()
 except:pass
 p.terminate();p.wait(timeout=10);server.shutdown();server.server_close()
