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
 cmd('Page.enable');cmd('Runtime.enable');cmd('Network.enable');cmd('Network.setCacheDisabled',{'cacheDisabled':True});cmd('Storage.clearDataForOrigin',{'origin':'http://127.0.0.1:8799','storageTypes':'all'});cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});
 # Compatibility coverage starts from an existing v19 apartment save, not the new opening.
 cmd('Page.addScriptToEvaluateOnNewDocument',{'source':'if(!localStorage.getItem("business-sim-v1"))localStorage.setItem("business-sim-v1","{\\"version\\":1,\\"week\\":1,\\"cash\\":110,\\"hoursUsed\\":0,\\"careerXP\\":{},\\"industryExperience\\":{},\\"loans\\":[],\\"education\\":{\\"trades\\":0,\\"production\\":0,\\"operations\\":0,\\"sales\\":0},\\"hustles\\":[],\\"economy\\":{\\"id\\":\\"steady\\",\\"until\\":4},\\"competitors\\":{\\"mechanic\\":{\\"name\\":\\"Hearth & Co.\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"},\\"manufacturing\\":{\\"name\\":\\"Foundry Lane\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"},\\"logistics\\":{\\"name\\":\\"Parcel Partners\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"},\\"transport\\":{\\"name\\":\\"Metro Shuttle\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"},\\"service\\":{\\"name\\":\\"Harbor Crew\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"},\\"cafe\\":{\\"name\\":\\"Daily Cup\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"},\\"shop\\":{\\"name\\":\\"Second Story\\",\\"price\\":1,\\"quality\\":1,\\"move\\":\\"Holding prices\\"}},\\"career\\":\\"retail\\",\\"jobLevel\\":0,\\"shifts\\":0,\\"classProgress\\":0,\\"hustle\\":false,\\"hustleLevel\\":0,\\"outsideRaised\\":false,\\"xp\\":0,\\"skill\\":0,\\"jobProgress\\":0,\\"jobsDone\\":0,\\"workThisWeek\\":0,\\"businesses\\":[],\\"nextId\\":1,\\"stocks\\":{},\\"market\\":[{\\"id\\":\\"north\\",\\"price\\":40,\\"history\\":[40]},{\\"id\\":\\"vale\\",\\"price\\":25,\\"history\\":[25]},{\\"id\\":\\"orbit\\",\\"price\\":70,\\"history\\":[70]}],\\"properties\\":[],\\"startups\\":[],\\"collectibles\\":[],\\"reputation\\":45,\\"report\\":null,\\"events\\":[],\\"ledger\\":[],\\"phaseSeen\\":0,\\"tutorial\\":0,\\"settings\\":{\\"sound\\":true},\\"weeklyHistory\\":[],\\"founderQuestions\\":{},\\"closedInvestments\\":[],\\"achievements\\":{},\\"rng\\":24316}");'});cmd('Page.navigate',{'url':'http://127.0.0.1:8799/'});
 for _ in range(60):
  if js('!!document.querySelector(".workbtn")'):break
  time.sleep(.1)
 print('loaded',js('document.body.innerText.slice(0,400)'));shot('apartment-390')
 print('initial overflow',js('document.documentElement.scrollWidth>innerWidth'))
 js('document.querySelector("[data-action=shift]").click()');js('document.querySelector("[data-action=class]").click()');
 for i in range(28):js('document.querySelector("[data-action=work]").click()')
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewOpen]").click()');print('modal',js('document.querySelector("dialog").innerText'));js('document.querySelector("#confirm button").click()');js('document.querySelector("[data-action=hire]").click()');shot('business-390')
 # Add a test-only evolved save via the same engine, on isolated local origin, not a real user account.
 js('(async()=>{window.fixture=await import("./engine.mjs");window.t=JSON.parse(localStorage.getItem("business-sim-v1"));t.cash=60000;t=fixture.action(t,"open",{industry:"cafe"});t=fixture.action(t,"property");localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()')
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
 js('(async()=>{window.factoryEngine=await import("./engine.mjs");window.ft={...factoryEngine.initial(),cash:40000,skill:2,education:{trades:0,production:1,operations:0,sales:0}};ft=factoryEngine.action(ft,"open",{industry:"manufacturing"});ft=factoryEngine.action(ft,"hire",{id:1});ft=factoryEngine.action(ft,"hire",{id:1});ft=factoryEngine.action(ft,"manager",{id:1});localStorage.setItem("business-sim-v1",JSON.stringify(ft));setTimeout(()=>location.reload(),0)})()')
 for _ in range(50):
  if js('!!document.querySelector("[data-nav=business]")'):break
  time.sleep(.1)
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=buyStock]").click()');js('document.querySelector("[data-action=produce]").click()');js('document.querySelector("[data-action=autoProduction]").click()');print('factory actions',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0]'))
 js('document.querySelector("[data-action=week]").click()');print('factory invoice',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].receivables'));js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=produce]").scrollIntoView({block:"center"})');shot('factory-production-390')
 js('document.querySelector(".company-cash-timing").scrollIntoView({block:"start"})');assert js('document.querySelector(".company-cash-timing").innerText.includes("Customer cash collected")');shot('company-cash-timing-390');js('document.querySelector(".company-cash-timing details").open=true;document.querySelector(".company-cash-timing details").scrollIntoView({block:"center"})');shot('company-invoice-schedule-390')
 for w in [320,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".company-cash-timing").scrollIntoView({block:"start"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('company-cash-timing-'+str(w))
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('document.querySelector("[data-nav=city]").click()');js('document.querySelector("[data-focus-controls]").click()');time.sleep(.5);print('scene action scroll',js('scrollY'));shot('scene-action-controls-390')
 # Fresh factory line switches into a slower, higher-input recipe through UI.
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=tool]").click()');js('Array.from(document.querySelectorAll("[data-action=product]")).find(x=>JSON.parse(x.dataset.args).product==="fixtures").click()');js('Array.from(document.querySelectorAll("[data-action=buyStock]")).at(-1).click()');js('document.querySelector("[data-action=produce]").click()');print('recipe queued',js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].productionQueue'));js('document.querySelector("[data-action=produce]").scrollIntoView({block:"center"})');shot('recipe-390')
 js('document.querySelector("[data-nav=city]").click()');js('document.querySelector("#home-controls details.panel:not(.journey)").open=true');js('Array.from(document.querySelectorAll("summary")).find(x=>x.innerText.includes("job path")).parentElement.open=true');js('Array.from(document.querySelectorAll("[data-action=career]")).find(x=>JSON.parse(x.dataset.args).id==="machinist").click()');print('career selected',js('JSON.parse(localStorage.getItem("business-sim-v1")).career'))
 # A local operating-history fixture tests loan terms and accounting, not earned eligibility.
 js('(async()=>{let e=await import("./engine.mjs");let t=JSON.parse(localStorage.getItem("business-sim-v1"));t.businesses[0].weeks=10;t.businesses[0].totalProfit=6000;localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()');time.sleep(.2);js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewLoan]").click()');print('loan review',js('document.querySelector("dialog").innerText'));shot('loan-review-390');js('document.querySelector("#confirm button").click()');print('loan debt',js('JSON.parse(localStorage.getItem("business-sim-v1")).loans'))
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewRestock]").click()');print('restock review',js('document.querySelector("dialog").innerText'));shot('restock-review-390');js('document.querySelector("#confirm button").click()');js('document.querySelector("[data-setting=restockBudget]").value="3000";document.querySelector("[data-setting=restockBudget]").dispatchEvent(new Event("change",{bubbles:true}))');js('document.querySelector("[data-action=reviewRestock]").scrollIntoView({block:"center"})');shot('restock-control-390');js('document.querySelector("[data-action=week]").click()');assert js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].autoRestock');print('PASS manager restock UI enabled and survived settlement')
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector(".upgrade-options").open=true;document.querySelector(".upgrade-options").scrollIntoView({block:"start"})');shot('upgrade-options-390');
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=reviewSale]").click()');shot('sale-liabilities-390');js('document.querySelector("#cancel").click()')
 js('document.querySelector("[data-nav=deals]").click()');js('document.querySelector("[data-action=reviewAcquire]").click()');shot('acquisition-current-390');js('document.querySelector("#cancel").click()')
 # Tight-cash shared-order fixture, not an earned portfolio path.
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:20000,skill:3};for(let type of ["shop","mechanic"]){t=e.action(t,"open",{industry:type});let id=t.businesses.at(-1).id;for(let n=0;n<2;n++)t=e.action(t,"hire",{id});t=e.action(t,"manager",{id});t=e.action(t,"autoRestock",{id});t=e.action(t,"restockBudget",{id,level:3000});}t.cash=1000;localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()')
 js('document.querySelector("[data-nav=report]").click()');js('document.querySelector(".portfolio-cash-order").scrollIntoView({block:"start"})');shot('portfolio-order-before-390')
 js('Array.from(document.querySelectorAll("[data-action=settlementOrder]")).find(x=>JSON.parse(x.dataset.args).id===2).click()')
 assert js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].id===2');assert js('document.querySelector("[data-cash-order]").dataset.cashOrder==="2"')
 for w in [320,390,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".portfolio-cash-order").scrollIntoView({block:"start"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('portfolio-order-after-'+str(w))
 js('(async()=>{let e=await import("./engine.mjs");window.orderQuote=e.cashPlan(JSON.parse(localStorage.getItem("business-sim-v1"))).net})()')
 js('document.querySelector(".portfolio-cash-order [data-action=week]").click()');assert abs(js('JSON.parse(localStorage.getItem("business-sim-v1")).cash-1000-window.orderQuote'))<.01
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 # Isolated funded UI fixture: service-style choice/preview, not earned startup evidence.
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:40000,skill:2};t=e.action(t,"open",{industry:"cafe"});t=e.action(t,"hire",{id:1});t=e.action(t,"hire",{id:1});t=e.action(t,"buyStock",{id:1,count:200});localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()')
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector(".cafe-style-options").scrollIntoView({block:"start"})');shot('cafe-styles-before-390')
 before=js('JSON.parse(localStorage.getItem("business-sim-v1"))')
 js('Array.from(document.querySelectorAll("[data-action=cafeStyle]")).find(x=>JSON.parse(x.dataset.args).style==="table").click()')
 after=js('JSON.parse(localStorage.getItem("business-sim-v1"))');assert after['businesses'][0]['cafeStyle']=='table' and before['cash']==after['cash'] and before['businesses'][0]['inventory']==after['businesses'][0]['inventory']
 assert js('document.querySelector(".cafe-style-options").innerText.includes("Table service · active")');assert js('document.querySelector("[data-setting=price]").selectedOptions[0].textContent.includes("$20")')
 for w in [320,390,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".cafe-style-options").scrollIntoView({block:"start"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('cafe-styles-after-'+str(w))
 js('window.cashQuote=window.factoryEngine.cashPlan(JSON.parse(localStorage.getItem("business-sim-v1"))).companies[0]') if js('!!window.factoryEngine') else js('(async()=>{let e=await import("./engine.mjs");window.cashQuote=e.cashPlan(JSON.parse(localStorage.getItem("business-sim-v1"))).companies[0]})()')
 js('document.querySelector("[data-action=week]").click()');assert abs(js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].last.net-window.cashQuote.net'))<.01
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('document.querySelector("#savebtn").click()');shot('save-menu-390');print('save controls',js('document.body.innerText.slice(-1300)'))
 print('saved local bytes',js('localStorage.getItem("business-sim-v1").length'))
 # Funded local logistics fixture: UI behavior, not earned progression evidence.
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:20000,skill:2};t=e.action(t,"open",{industry:"logistics"});t=e.action(t,"hire",{id:1});t=e.action(t,"week");localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()');time.sleep(.3)
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector(".route-options").scrollIntoView({block:"start"})');shot('logistics-accounts-390')
 js('window.routeBefore=JSON.parse(localStorage.getItem("business-sim-v1"));document.querySelector("[data-action=route]").click()')
 assert js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].route==="express"')
 assert js('JSON.stringify(JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].receivables)===JSON.stringify(routeBefore.businesses[0].receivables)')
 assert js('JSON.parse(localStorage.getItem("business-sim-v1")).cash===routeBefore.cash')
 assert js('document.querySelector("[data-setting=price]").selectedOptions[0].textContent.includes("$68.75")')
 for w in [390,320,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".route-options").scrollIntoView({block:"start"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('logistics-express-'+str(w))
  assert js('Array.from(document.querySelectorAll(".route-card button")).every(b=>b.getBoundingClientRect().height>=44)')
 js('document.querySelector(".route-terms").open=true');shot('logistics-terms-1280');js('document.querySelector(".route-terms").open=false')
 cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 js('document.querySelector(".route-card button").focus()');assert js('document.activeElement.matches(".route-card button")');shot('logistics-keyboard-1280')
 js('document.querySelector("[data-action=week]").click()');assert js('JSON.parse(localStorage.getItem("business-sim-v1")).businesses[0].last.collected>0')
 print('PASS logistics route UI, unchanged old invoice dates, no setup charge, price label, touch targets, widths and keyboard/reduced-motion emulation')
 # Local low-cash fixture exercises the forecast warning, not earned progression.
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:5000,skill:2};t=e.action(t,"open",{industry:"logistics"});t=e.action(t,"hire",{id:1});t=e.action(t,"hire",{id:1});localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()');time.sleep(.3)
 js('document.querySelector("[data-nav=report]").click()')
 assert js('document.querySelector(".cash-exposure").innerText.includes("Cash falls below zero")')
 for w in [320,390,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".cash-exposure").scrollIntoView({block:"start"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('cash-exposure-shortfall-'+str(w))
 js('document.querySelector("[data-focus-cash]").click()');time.sleep(.2);assert js('document.querySelector(".portfolio-cash-order").getBoundingClientRect().top<200')
 js('(async()=>{let e=await import("./engine.mjs");window.exposureQuote=e.cashExposure(JSON.parse(localStorage.getItem("business-sim-v1")))})()')
 before_guard=js('localStorage.getItem("business-sim-v1")')
 js('document.querySelector(".portfolio-cash-order [data-action=week]").click()');assert js('document.querySelector("#modal").open');assert js('document.activeElement.id==="cancel"');assert js('localStorage.getItem("business-sim-v1")')==before_guard
 for w,h in [(320,568),(390,844),(1280,844)]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':w<800});shot('cash-review-'+str(w));assert js('document.querySelector("#cancel").getBoundingClientRect().bottom<=document.querySelector("#modal").getBoundingClientRect().bottom');assert js('document.querySelector("#modal").getBoundingClientRect().height<=innerHeight');assert not js('document.documentElement.scrollWidth>innerWidth')
 js('document.querySelector("#cancel").click()');assert js('localStorage.getItem("business-sim-v1")')==before_guard
 js('document.querySelector(".portfolio-cash-order [data-action=week]").click()');js('document.querySelector("#modal [data-nav=report]").click()');assert not js('document.querySelector("#modal").open');assert js('localStorage.getItem("business-sim-v1")')==before_guard
 js('document.querySelector(".portfolio-cash-order [data-action=week]").click()');js('document.querySelector("#confirm button").click()');assert abs(js('JSON.parse(localStorage.getItem("business-sim-v1")).cash-window.exposureQuote.balance'))<.01
 js('document.querySelector("[data-action=week]").click()');assert js('document.querySelector("#modal").open');js('document.querySelector("#modal").close()')
 print('PASS cash warning blocks fast settlement pending explicit choice, cancellation/inspection preserve bytes and confirmation settles exactly once')
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:20000,skill:2};t=e.action(t,"open",{industry:"manufacturing"});t=e.action(t,"hire",{id:1});t=e.action(t,"size",{id:1});t.businesses[0].condition=50;t.cash=500;localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()');time.sleep(.3)
 js('document.querySelector("[data-nav=report]").click()');js('document.querySelector(".cash-exposure").scrollIntoView({block:"start"})');assert js('document.querySelector(".cash-exposure").innerText.includes("Some cash is already spoken for")');js('document.querySelector(".cash-exposure details").open=true');shot('cash-exposure-held-390')
 print('PASS cash exposure UI negative balance, held commitments, separate equipment cost, jump control and actual settlement reconciliation')
 # Funded shop fixture verifies the budget tradeoff and truthful order preview.
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:10000,skill:2};t=e.action(t,"open",{industry:"shop"});for(let n=0;n<2;n++)t=e.action(t,"hire",{id:1});t=e.action(t,"manager",{id:1});t=e.action(t,"autoRestock",{id:1});t=e.action(t,"restockBudget",{id:1,level:250});localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()');time.sleep(.3)
 js('document.querySelector("[data-nav=business]").click()');assert js('!!document.querySelector(".restock-budget-preview .cash-warning")')
 for w in [320,390,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".restock-budget-preview").scrollIntoView({block:"center"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('restock-budget-shortfall-'+str(w))
 js('window.budgetCash=JSON.parse(localStorage.getItem("business-sim-v1")).cash;document.querySelector("[data-setting=restockBudget]").value="1000";document.querySelector("[data-setting=restockBudget]").dispatchEvent(new Event("change",{bubbles:true}))')
 assert js('!document.querySelector(".restock-budget-preview .cash-warning")');assert js('JSON.parse(localStorage.getItem("business-sim-v1")).cash===window.budgetCash')
 cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});js('document.querySelector(".restock-budget-preview").scrollIntoView({block:"center"})');shot('restock-budget-covered-390')
 print('PASS manager budget shortfall preview, higher budget removes limitation without spending now, widths320/390/1280')
 # Operating feedback is session-only and separate from action/economy state.
 js('(async()=>{let e=await import("./engine.mjs");let t={...e.initial(),cash:8000,skill:2};t=e.action(t,"open",{industry:"service"});t=e.action(t,"hire",{id:1});localStorage.setItem("business-sim-v1",JSON.stringify(t));setTimeout(()=>location.reload(),0)})()');time.sleep(.3)
 js('document.querySelector("[data-nav=business]").click()');js('document.querySelector("[data-action=hire]").click()');assert js('document.querySelector(".operation-receipt").innerText.includes("Employee hired")')
 js('document.querySelector("[data-action=manager]").click()');assert js('document.querySelector(".operation-receipt").innerText.includes("Manager hired")');assert js('document.querySelector(".operation-receipt").innerText.includes("wages still apply")');time.sleep(3.6)
 for w in [320,390,1280]:
  cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':844,'deviceScaleFactor':1,'mobile':w<800});js('document.querySelector(".operation-receipt").scrollIntoView({block:"start"})');assert not js('document.documentElement.scrollWidth>innerWidth');shot('manager-receipt-'+str(w))
 before_dismiss=js('localStorage.getItem("business-sim-v1")');js('document.querySelector("[data-dismiss-operation]").click()');assert js('!document.querySelector(".operation-receipt")');assert js('localStorage.getItem("business-sim-v1")')==before_dismiss
 print('PASS hire/manager change receipt, honest delegation scope, widths320/390/1280 and state-free dismissal')
finally:p.terminate();server.shutdown()
