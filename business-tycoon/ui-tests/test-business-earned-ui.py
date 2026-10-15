import subprocess,time,urllib.request,json,websocket,os,base64,threading,http.server,functools
root='/tmp/business-game';out='/tmp/business-ui';os.makedirs(out,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8799),functools.partial(Handler,directory=root));threading.Thread(target=server.serve_forever,daemon=True).start()
p=subprocess.Popen(['google-chrome-stable','--headless=new','--no-sandbox','--disable-gpu','--remote-allow-origins=*','--remote-debugging-port=9338','--user-data-dir=/tmp/business-chrome','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for _ in range(50):
  try: tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9338/json'));break
  except:time.sleep(.1)
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
 for week in range(20):
  life()
  if state()['skill']<1:click('shift');click('class')
  st=state()
  for i in range(3-st['shifts']):click('shift')
  for i in range(48):click('work')
  st=state()
  if not st['businesses'] and st['cash']>800:nav('business');review('reviewOpen');click('hire')
  st=state()
  if st['businesses']:
   nav('business')
   if st['businesses'][0]['staff']<2 and st['cash']>1000:click('hire')
   st=state()
   if st['businesses'][0]['staff']>=2 and not st['businesses'][0]['manager'] and st['cash']>1500:click('manager')
   st=state()
   if st['businesses'][0]['tools']<1 and st['cash']>2000:click('tool')
   if (st['businesses'][0].get('condition',100))<65 and st['cash']>2000:click('maintenance')
  st=state()
  if week==7:
   nav('deals');review('reviewOpen',{'industry':'logistics'});print('second business post-open',state()['businesses'],js('document.body.innerText.slice(-500)'));nav('business');click('hire');shot('earned-second-business-390')
  if week==10:
   nav('property');review('reviewProperty',{'kind':'apartments'});shot('earned-property-390')
  if week==12:
   nav('deals');js('document.querySelector("[data-dealtab=founders]").click()');click('diligence',{'founder':'loop'});review('reviewStartup',{'founder':'loop','offer':'negotiate'});shot('earned-founder-390')
  click('week');st=state();print('earned week',st['week'],'cash',st['cash'],'companies',len(st['businesses']),'properties',len(st['properties']),'funded',len(st['startups']))
  assert st['cash']>=0,'earned path ran out of cash'
 st=state();assert len(st['businesses'])==2;assert len(st['properties'])==1;assert st['startups'][0]['funded'];assert st['businesses'][0]['manager']
 before=st;cmd('Page.reload');time.sleep(.3);after=state();assert all(after[k]==before[k] for k in ['week','cash','properties','startups','market','ledger','stocks']),'reload changed progress';assert all(after['businesses'][i].get(k)==v for i,b in enumerate(before['businesses']) for k,v in b.items()),'reload changed company progress'
 nav('city');shot('earned-city-390');js('document.querySelector(".journey").open=true');js('document.querySelector(".journey").scrollIntoView({block:"start"})');shot('earned-journey-390');js('Array.from(document.querySelectorAll("h3")).find(x=>x.innerText==="Before the next week").scrollIntoView({block:"center"})');shot('earned-cash-plan-390');print('PASS earned UI journey: $110, shifts/classes/jobs, managed company, logistics, property, founder, 20 weeks, exact save refresh')
finally:p.terminate();server.shutdown()
