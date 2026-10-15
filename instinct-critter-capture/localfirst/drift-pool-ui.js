// Drift pool UI · private family-and-friends pools with reviewed transfers.
// Server text (pool names, member names, birth farm/trainer) renders with
// textContent only. Solo play and the local Drift stay byte-identical.
'use strict';
const driftSyncKey=()=> 'havenmoore-localfirst-sync-v1:'+window.LocalFirstContext.account;
const driftRuntimeKey=()=> 'havenmoore-localfirst-prototype-runtime-'+window.LocalFirstContext.account+'-1';
const driftMeta=()=>JSON.parse(localStorage.getItem(driftSyncKey())||'null');
async function driftPost(path,body={}){const r=await fetch('/private-room/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let out={};try{out=await r.json()}catch{}if(!r.ok)throw Error(out.error||'Drift pool unavailable');return out}
function dBtn(text,fn,cls=''){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;return b}
function dPara(text,cls=''){const p=document.createElement('p');if(cls)p.className=cls;p.textContent=text;return p}
function dInput(ph,max){const label=document.createElement('label');const el=document.createElement('input');el.maxLength=max;el.placeholder=ph;el.setAttribute('aria-label',ph);label.append(el);return{label,el}}
const dSpecies=id=>(typeof SPECIES!=='undefined'&&SPECIES[id]?.name)||id;
const dToast=t=>{try{document.querySelector('#toast').textContent=t}catch{}};
const dDate=t=>new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'});

let driftArmed=null; // {kind:'release'|'claim'|'collect', pool?} while a review holds the sync pause
function driftPause(v){window.LocalFirstSync?.pauseTrade(v);if(v&&document.querySelector('#modal')?.hidden)document.querySelector('#app').inert=true;if(!v)document.querySelector('#app').inert=false}
function driftDisarm(){driftArmed=null;driftPause(false)}
async function driftReady(){await window.LocalFirstSync.flush();const m=driftMeta();if(!m||m.pending||window.LocalFirstSync.paused)throw Error('Back up your journey first, then try again');return m.revision}
function driftApply(res){localStorage.setItem(driftRuntimeKey(),JSON.stringify(res.state));window.LocalFirstSync.adopt(res.revision);window.PrivateRuntime.apply()}
async function driftAck(kind,id,revision){try{await driftPost(kind+'/ack',{id,revision})}catch{}}

function driftCard(p){const card=document.createElement('div');card.className='roster';const top=document.createElement('div');top.className='roster-top';if(typeof Art!=='undefined'&&p.mark!=null&&Array.isArray(p.heritage))try{top.append(Art.preview(p.id,p.mark,p.heritage,typeof appearanceCoat!=='undefined'?appearanceCoat({coat:p.coat||['Native','Native'],subgenes:p.subgenes||{}}):p.coat||undefined))}catch{}const name=document.createElement('b');name.style.color='#33503a';name.textContent=dSpecies(p.id)+' · L'+(p.level??'?');top.append(name);card.append(top);if(p.birthFarm||p.birthTrainer)card.append(dPara('Born at '+(p.birthFarm||'an unrecorded farm')+' · '+(p.birthTrainer||'unnamed trainer'),'note'));const id=dPara('Companion ID: '+p.uid,'note');id.style.overflowWrap='anywhere';card.append(id);return card}

const driftDetails=document.createElement('details');driftDetails.id='driftPool';driftDetails.style='padding:12px 16px;color:#f1e6c6';
const driftSummary=document.createElement('summary');driftSummary.textContent='Drift pool · family & friends';driftDetails.append(driftSummary);
driftDetails.append(dPara('A private pool for people you invite. Release a companion to travel the pool: a family member can claim it with their own review, and if nobody claims it within 7 days it comes home to your storage. Identity, genes and family always stay intact, and nothing is ever copied. Your solo journey and local Drift are unchanged.'));
const driftStatus=dPara('','note');driftStatus.id='driftStatus';driftStatus.setAttribute('role','status');
const driftBody=document.createElement('div');driftDetails.append(driftStatus,driftBody);
(document.querySelector('#privateRoom')||document.querySelector('#app')).after(driftDetails);
const driftNote=t=>{driftStatus.textContent=t};
driftDetails.addEventListener('toggle',()=>{if(driftDetails.open)driftRefresh();else if(driftArmed?.kind==='claim')driftCancelClaim(true)});

async function driftRefresh(){driftBody.replaceChildren();
 if(!window.LocalFirstContext?.account){driftBody.append(dPara('Sign in from your dashboard first, then open the Drift pool.'));return}
 if(window.LocalFirstContext.offline){driftBody.append(dPara('Reconnect to use the Drift pool. Your local journey is safe.'));return}
 try{const[{pools},pend]=await Promise.all([driftPost('drift/list'),driftPost('recovery/pending')]);
  if(pend.driftNotices?.length){const box=document.createElement('div');for(const n of pend.driftNotices)for(const s of n.stripped||[])box.append(dPara('Cloud journey updated: '+dSpecies(s.id)+' now travels elsewhere.','note'));box.append(dBtn('Got it',async()=>{await driftPost('drift/notices/clear').catch(()=>{});driftRefresh()}));driftBody.append(box)}
  if(!pools.length)driftBody.append(dPara('No pools yet. Create one for your family, or join with an invite code.'));
  for(const p of pools)driftBody.append(dBtn(p.name+' · '+p.members+' members · '+p.entries+' travellers',()=>driftViewPool(p.id)));
  const mk=document.createElement('details'),ms=document.createElement('summary');ms.textContent='Create a family pool';mk.append(ms);
  const pn=dInput('Pool name',40),dn=dInput('Your display name',40);
  mk.append(pn.label,dn.label,dBtn('Create pool',async()=>{try{await driftPost('drift/create',{pool:pn.el.value,name:dn.el.value});driftNote('Pool created');driftRefresh()}catch(e){driftNote(e.message)}}));
  const jn=document.createElement('details'),js=document.createElement('summary');js.textContent='Join with an invite code';jn.append(js);
  const cd=dInput('8-character invite code',8),dn2=dInput('Your display name',40);
  jn.append(cd.label,dn2.label,dBtn('Join pool',async()=>{try{await driftPost('drift/join',{code:cd.el.value.trim().toUpperCase(),name:dn2.el.value});driftNote('Joined the pool');driftRefresh()}catch(e){driftNote(e.message)}}));
  driftBody.append(mk,jn);
 }catch(e){driftBody.append(dPara(e.message))}
}

async function driftViewPool(id){driftBody.replaceChildren();
 try{const v=await driftPost('drift/view',{pool:id});
  driftBody.append(dBtn('← All pools',driftRefresh));
  const h=document.createElement('h3');h.textContent=v.name;driftBody.append(h);
  driftBody.append(dPara('Members: '+v.members.map(m=>m.name+(m.role==='owner'?' (owner)':'')+(m.me?' (you)':'')).join(', ')));
  if(v.invites.length)driftBody.append(dPara('Active invite codes, share with family: '+v.invites.map(i=>i.code).join(' · '),'note'));
  driftBody.append(dBtn('New invite code',async()=>{try{const r=await driftPost('drift/invite',{pool:id});driftNote('Invite code '+r.code+' · valid 7 days');driftViewPool(id)}catch(e){driftNote(e.message)}}));
  if(!v.entries.length)driftBody.append(dPara('No companions travelling yet. Release one from its creature card: choose Release, then Release to '+v.name+'.','note'));
  const myName=v.members.find(m=>m.me)?.name;
  for(const e of v.entries)driftBody.append(driftEntryCard(v,e,myName));
  driftBody.append(dBtn('Leave this pool',async()=>{if(!confirm('Leave '+v.name+'?'))return;try{await driftPost('drift/leave',{pool:id});driftNote('Left the pool');driftRefresh()}catch(e2){driftNote(e2.message)}}));
 }catch(e){driftBody.append(dPara(e.message),dBtn('← All pools',driftRefresh))}
}

function driftEntryCard(v,e,myName){const card=driftCard(e.preview);
 const st={pooled:'Travelling · comes home '+dDate(e.expiresAt),'pending-claim':'A claim is being reviewed',claimed:'Now travelling with '+(e.claimedBy||'a pool member'),returned:'Came home · waiting to be collected',collected:'Back home with '+(e.owner||'its owner')}[e.state]||e.state;
 card.append(dPara('Released by '+(e.owner||'a pool member')+' · '+st,'note'));
 if(e.state==='pooled')card.append(dBtn(e.owner===myName?'Bring home early':'Claim this companion',()=>driftClaimReview(v,e,false),'primary'));
 if((v.myCollectable||[]).includes(e.entryId))card.append(dBtn('Welcome home to storage',()=>driftCollect(v.id,e.entryId),'primary'));
 if(v.myPendingClaim?.entryId===e.entryId)card.append(dBtn('Finish the claim',()=>driftClaimReview(v,e,true),'primary'));
 return card}

async function driftClaimReview(v,e,resume){if(driftArmed)return;
 if(!document.querySelector('#modal').hidden){driftNote('Close the open window first');return}
 let prep;
 try{const rev=await driftReady();driftPause(true);driftArmed={kind:'claim',pool:v.id};
  prep=resume?await driftPost('drift/claim/resume',{pool:v.id}):await driftPost('drift/claim/prepare',{pool:v.id,entryId:e.entryId});
  if(prep.revision!==rev)throw Error('Acknowledge your current journey, then try again');
 }catch(err){driftDisarm();driftNote(err.message);driftViewPool(v.id);return}
 driftBody.replaceChildren();
 const h=document.createElement('h3');h.textContent='Claim '+dSpecies(prep.preview.mon.id)+'?';driftBody.append(h);
 driftBody.append(driftCard(prep.preview.mon));
 driftBody.append(dPara('It joins your storage with its identity, genes and family. '+(prep.preview.owner?prep.preview.owner+' released it to travel. ':'')+'Nothing is copied: it leaves the pool for good.'));
 driftBody.append(dBtn('Claim and bring it home',async()=>{try{const conf=await driftPost('drift/claim/confirm',{review:prep.review,revision:prep.revision});driftApply(conf);await driftAck('drift-claim',conf.entryId,conf.revision);driftDisarm();driftNote('Claimed. It rests in your storage.');driftViewPool(v.id)}catch(err2){driftDisarm();driftNote(err2.message);driftViewPool(v.id)}},'primary'));
 driftBody.append(dBtn('Let it keep travelling',()=>driftCancelClaim(false)));
}

async function driftCancelClaim(silent){const pool=driftArmed?.pool;try{if(driftArmed?.kind==='claim'&&pool)await driftPost('drift/claim/cancel',{pool})}catch{}driftDisarm();if(!silent)driftNote('Claim cancelled. It keeps travelling.');if(!silent&&pool)driftViewPool(pool)}

async function driftCollect(poolId,entryId){if(driftArmed)return;
 try{await driftReady();driftPause(true);driftArmed={kind:'collect'};
  const res=await driftPost('drift/collect',{pool:poolId,entryId});
  driftApply(res);await driftAck('drift-return',res.entryId,res.revision);
  driftDisarm();driftNote('Welcome home. It rests in your storage.');driftViewPool(poolId)}
 catch(e){driftDisarm();driftNote(e.message);driftViewPool(poolId)}}

// Release entry point, called from the creature release dialog in game.js.
window.DriftPoolRelease=async(mon,modalBody)=>{
 try{if(!window.LocalFirstContext?.account||window.LocalFirstContext.offline||driftArmed)return;
 const pools=(await driftPost('drift/list')).pools;if(!pools?.length)return;
 const wrap=document.createElement('div');
 wrap.append(dPara('Or release it to a family pool: someone you invited can claim it with their own review. Unclaimed travellers come home after 7 days.','note'));
 for(const p of pools)wrap.append(dBtn('Release to '+p.name,()=>driftReleaseReview(mon,p,modalBody)));
 modalBody.append(wrap)}catch{}};

async function driftReleaseReview(mon,pool,modalBody){if(driftArmed)return;
 let prep;
 try{const rev=await driftReady();driftPause(true);driftArmed={kind:'release'};
  prep=await driftPost('drift/release/prepare',{pool:pool.id,uid:mon.uid});
  if(prep.revision!==rev)throw Error('Acknowledge your current journey, then try again');
 }catch(e){driftDisarm();dToast(e.message);return}
 const closeX=document.querySelector('#closeModal');
 const guard=()=>{driftDisarm();closeX?.removeEventListener('click',guard)};
 closeX?.addEventListener('click',guard);
 document.querySelector('#modalKicker').textContent='DRIFT POOL';
 modalBody.replaceChildren();
 modalBody.append(driftCard(prep.preview.mon));
 modalBody.append(dPara('Release to '+pool.name+'. It travels for up to 7 days. Anyone in the pool can claim it with their own review; if nobody does, it comes home to your storage. Its identity, genes and family stay intact. Nothing is copied.'));
 const keep=dBtn('Keep companion',()=>{guard();closeX.click()});
 const go=dBtn('Release to '+pool.name,async()=>{keep.disabled=go.disabled=true;
  try{const conf=await driftPost('drift/release/confirm',{review:prep.review,revision:prep.revision});
   driftApply(conf);await driftAck('drift-release',conf.entryId,conf.revision);
   closeX?.removeEventListener('click',guard);driftDisarm();
   dToast('Released to '+pool.name+'. Its lineage stays intact.')}
  catch(e){closeX?.removeEventListener('click',guard);driftDisarm();closeX.click();dToast(e.message)}},'primary');
 modalBody.append(keep,go)}
