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
  return r.get('result',{}).get('value')
 def shot(name):
  js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  data=cmd('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data'];open(out+'/'+name+'.png','wb').write(base64.b64decode(data))
 cmd('Page.enable');cmd('Runtime.enable');cmd('Network.enable');cmd('Network.setCacheDisabled',{'cacheDisabled':True});cmd('Storage.clearDataForOrigin',{'origin':'http://127.0.0.1:8799','storageTypes':'all'});cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});cmd('Page.navigate',{'url':'http://127.0.0.1:8799/'});
 for _ in range(60):
  if js('!!document.querySelector(".workbtn")'):break
  time.sleep(.1)
 print('loaded',js('document.body.innerText.slice(0,400)'));shot('apartment-390')
 print('initial overflow',js('document.documentElement.scrollWidth>innerWidth'))
 js('document.querySelector("[data-action=shift]").click()');js('document.querySelector("[data-action=class]").click()');
 for i in range(28):js('document.querySelector("[data-action=work]").click()')
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewOpen]").click()');print('modal',js('document.querySelector("dialog").innerText'));js('document.querySelector("#confirm button").click()');js('document.querySelector("[data-action=hire]").click()');shot('business-390')
 # Add a test-only evolved save via the same engine, on isolated local origin, not a real user account.
 js('(async()=>{window.fixture=await import("./engine.mjs");window.t=JSON.parse(localStorage.getItem("business-sim-v1"));t.cash=60000;t=fixture.action(t,"open",{industry:"cafe"});t=fixture.action(t,"property");localStorage.setItem("business-sim-v1",JSON.stringify(t));location.reload()})()')
 for _ in range(50):
  if js('!!document.querySelector(".scene.city")'):break
  time.sleep(.1)
 js('document.querySelector("[data-nav=city]").click()');shot('city-390')
 js('document.querySelector("[data-nav=deals]").click()');js('document.querySelector("[data-dealtab=founders]").click()');js('document.querySelector("[data-founder=crate]").click()');js('document.querySelector("[data-action=question]").click()');shot('founder-390');js('window.scrollTo(0,700)');shot('founder-question-390');js('window.scrollTo(0,0)')
 js('document.querySelector("[data-action=diligence]").click()');js('Array.from(document.querySelectorAll("h3")).find(x=>x.textContent.startsWith("Books review:")).scrollIntoView({block:"center"})');shot('diligence-findings-390');js('document.querySelector("[data-action=reviewStartup]").click()');print('founder review',js('document.querySelector("dialog").innerText'));js('document.querySelector("#confirm button").click()');print('funded scenario',js('JSON.parse(localStorage.getItem("business-sim-v1")).startups.map(x=>x.founder)'))
 js('document.querySelector("[data-nav=property]").click()');js('document.querySelector("[data-action=reviewProperty]").click()');print('property review',js('document.querySelector("dialog").innerText'));js('document.querySelector("#confirm button").click()');shot('property-purchase-390');print('owned properties',js('JSON.parse(localStorage.getItem("business-sim-v1")).properties.map(x=>x.kind)'))
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-setting=price]").value=document.querySelector("[data-setting=price]").options[2].value;document.querySelector("[data-setting=price]").dispatchEvent(new Event("change",{bubbles:true}))');print('price setting',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].price'))
 js('document.querySelector("[data-action=week]").click()');js('document.querySelector("[data-nav=report]").click()');shot('settlement-390');print('settlement',js('JSON.parse(localStorage.getItem("business-sim-v1")).report.items.map(x=>x.name)'))
 for tab in ['business','property','deals','report']:
  js(f'document.querySelector("[data-nav={tab}]").click()');shot(tab+'-390');js('window.scrollTo(0,document.body.scrollHeight-innerHeight)');shot(tab+'-bottom-390');js('window.scrollTo(0,0)');print(tab,'overflow',js('document.documentElement.scrollWidth>innerWidth'))
 for width in [320,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':width,'height':844,'deviceScaleFactor':1,'mobile':width<800})
  js('document.querySelector("[data-nav=city]").click()');shot('city-'+str(width))
  for tab in ['business','property','deals','report']:
   js(f'document.querySelector("[data-nav={tab}]").click()');shot(tab+'-'+str(width));print(width,tab,'overflow',js('document.documentElement.scrollWidth>innerWidth'))
 # Multiple hustles and specialization controls on an earned company save.
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('document.querySelector("[data-nav=city]").click()');js('document.querySelector("#home-controls details.panel:not(.journey)").open=true');js('Array.from(document.querySelectorAll("summary")).find(x=>x.innerText.includes("Side hustles")).parentElement.open=true');js('Array.from(document.querySelectorAll("[data-action=startHustle]")).find(x=>JSON.parse(x.dataset.args).id==="resale").click()');js('document.querySelector("#home-controls details.panel:not(.journey)").open=true');js('Array.from(document.querySelectorAll("summary")).find(x=>x.innerText.includes("Side hustles")).parentElement.open=true');js('Array.from(document.querySelectorAll("[data-action=startHustle]")).find(x=>JSON.parse(x.dataset.args).id==="websites").click()');print('UI hustles',js('JSON.parse(localStorage.getItem("business-sim-v1")).hustles.map(x=>x.type)'))
 js('document.querySelector("#home-controls details.panel:not(.journey)").open=true');js('Array.from(document.querySelectorAll("summary")).find(x=>x.innerText.includes("specialization")).parentElement.open=true');js('document.querySelector("[data-action=course]").click()');print('UI course',js('JSON.parse(localStorage.getItem("business-sim-v1")).education'))
 js('document.querySelector("#home-controls details.panel:not(.journey)").open=true');js('Array.from(document.querySelectorAll("summary")).find(x=>x.innerText.includes("Side hustles")).parentElement.open=true');js('document.querySelector("[data-action=pauseHustle]").scrollIntoView({block:"center"})');shot('hustles-390')
 # Exercise a factory through the actual UI on the isolated test origin.
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('(async()=>{window.factoryEngine=await import("./engine.mjs");window.ft={...factoryEngine.initial(),cash:40000,skill:2,education:{trades:0,production:1,operations:0,sales:0}};ft=factoryEngine.action(ft,"open",{industry:"manufacturing"});ft=factoryEngine.action(ft,"hire",{id:1});ft=factoryEngine.action(ft,"hire",{id:1});ft=factoryEngine.action(ft,"manager",{id:1});localStorage.setItem("business-sim-v1",JSON.stringify(ft));location.reload()})()')
 for _ in range(50):
  if js('!!document.querySelector("[data-nav=business]")'):break
  time.sleep(.1)
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=buyStock]").click()');js('document.querySelector("[data-action=produce]").click()');js('document.querySelector("[data-action=autoProduction]").click()');print('factory actions',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0]'))
 js('document.querySelector("[data-action=week]").click()');print('factory invoice',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].receivables'));js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=produce]").scrollIntoView({block:"center"})');shot('factory-production-390')
 js('document.querySelector("[data-nav=city]").click()');js('document.querySelector("[data-focus-controls]").click()');time.sleep(.5);print('scene action scroll',js('scrollY'));shot('scene-action-controls-390')
 # Fresh factory line switches into a slower, higher-input recipe through UI.
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=tool]").click()');js('Array.from(document.querySelectorAll("[data-action=product]")).find(x=>JSON.parse(x.dataset.args).product==="fixtures").click()');js('Array.from(document.querySelectorAll("[data-action=buyStock]")).at(-1).click()');js('document.querySelector("[data-action=produce]").click()');print('recipe queued',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].productionQueue'));js('document.querySelector("[data-action=produce]").scrollIntoView({block:"center"})');shot('recipe-390')
 js('document.querySelector("[data-nav=city]").click()');js('document.querySelector("#home-controls details.panel:not(.journey)").open=true');js('Array.from(document.querySelectorAll("summary")).find(x=>x.innerText.includes("job path")).parentElement.open=true');js('Array.from(document.querySelectorAll("[data-action=career]")).find(x=>JSON.parse(x.dataset.args).id==="machinist").click()');print('career selected',js('JSON.parse(localStorage.getItem("business-sim-v1")).career'))
 # A local operating-history fixture tests loan terms and accounting, not earned eligibility.
 js('(async()=>{let e=await import("./engine.mjs");let t=JSON.parse(localStorage.getItem("business-sim-v1"));t.businesses[0].weeks=10;t.businesses[0].totalProfit=6000;localStorage.setItem("business-sim-v1",JSON.stringify(t));location.reload()})()');time.sleep(.2);js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewLoan]").click()');print('loan review',js('document.querySelector("dialog").innerText'));shot('loan-review-390');js('document.querySelector("#confirm button").click()');print('loan debt',js('JSON.parse(localStorage.getItem("business-sim-v1")).loans'))
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewRestock]").click()');print('restock review',js('document.querySelector("dialog").innerText'));shot('restock-review-390');js('document.querySelector("#confirm button").click()');js('document.querySelector("[data-setting=restockBudget]").value="3000";document.querySelector("[data-setting=restockBudget]").dispatchEvent(new Event("change",{bubbles:true}))');js('document.querySelector("[data-action=reviewRestock]").scrollIntoView({block:"center"})');shot('restock-control-390');js('document.querySelector("[data-action=week]").click()');assert js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].autoRestock');print('PASS manager restock UI enabled and survived settlement')
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector(".upgrade-options").open=true;document.querySelector(".upgrade-options").scrollIntoView({block:"start"})');shot('upgrade-options-390');
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewSale]").click()');shot('sale-liabilities-390');js('document.querySelector("#cancel").click()')
 js('document.querySelector("#savebtn").click()');shot('save-menu-390');print('save controls',js('document.body.innerText.slice(-1300)'))
 print('saved local bytes',js('localStorage.getItem("business-sim-v1").length'))
finally:p.terminate();server.shutdown()
