const CADENCE_MS = 1500;

/** Mount an opt-in, read-only spectator view. Calling mount starts refreshes; close() stops them. */
export function mountSpectator(root, { service, viewer, sessionId, onClose = () => {} }) {
  if (!root || !service || !viewer || !sessionId) throw new TypeError('root, service, viewer, and sessionId are required');
  let closed = false, busy = false, timer = null;
  root.replaceChildren();
  const shell = document.createElement('section');
  shell.className = 'spectator'; shell.setAttribute('aria-label', 'Battle spectator view');
  shell.innerHTML = `<header class="spectator__header"><div><p class="spectator__eyebrow">LIVE VIEW · READ ONLY</p><h1>Battle watch</h1></div><button class="spectator__close" type="button" aria-label="Close spectator view">Close</button></header><main><p class="spectator__state" role="status" aria-live="polite">Connecting…</p><div class="spectator__battle" hidden><div class="spectator__summary"><span class="spectator__turn"></span><span class="spectator__status"></span></div><section><h2>On the field</h2><div class="spectator__active"></div></section><section><h2>Waiting</h2><div class="spectator__reserve"></div></section><section><h2>Move log</h2><ol class="spectator__log"></ol></section></div></main><footer>This view cannot make moves or change your game.</footer>`;
  root.append(shell);
  const $ = s => shell.querySelector(s);
  const closeButton = $('.spectator__close');
  function close() { if (closed) return; closed = true; if (timer) clearInterval(timer); closeButton.removeEventListener('click', close); root.replaceChildren(); onClose(); }
  closeButton.addEventListener('click', close);
  function renderFoes(container, foes) {
    container.replaceChildren();
    if (!foes.length) { const p=document.createElement('p'); p.className='spectator__empty'; p.textContent='No creatures here'; container.append(p); return; }
    for (const f of foes) {
      const card=document.createElement('article'); card.className='spectator__foe';
      const name=document.createElement('strong'); name.textContent=f.name || 'Creature';
      const state=document.createElement('span'); state.className='spectator__foe-status'; state.textContent=f.status || 'Ready';
      const hp=document.createElement('span'); hp.className='spectator__hp'; hp.textContent=`${f.hp} / ${f.maxHp} HP`;
      const bar=document.createElement('div'); bar.className='spectator__bar'; bar.setAttribute('role','meter'); bar.setAttribute('aria-label',`${f.name || 'Creature'} health`); bar.setAttribute('aria-valuemin','0'); bar.setAttribute('aria-valuemax',String(f.maxHp)); bar.setAttribute('aria-valuenow',String(Math.min(f.hp,f.maxHp)));
      const fill=document.createElement('i'); fill.style.width=`${f.maxHp ? Math.max(0,Math.min(100,100*f.hp/f.maxHp)) : 0}%`; bar.append(fill);
      card.append(name,state,hp,bar); container.append(card);
    }
  }
  function paint(data) {
    $('.spectator__state').textContent='Watching live'; $('.spectator__battle').hidden=false;
    $('.spectator__turn').textContent=`Turn ${data.turn}`; $('.spectator__status').textContent=data.status;
    renderFoes($('.spectator__active'),data.activeFoes); renderFoes($('.spectator__reserve'),data.reserveFoes);
    const log=$('.spectator__log'); log.replaceChildren();
    if (!data.moveLog.length) { const li=document.createElement('li'); li.className='spectator__empty'; li.textContent='No moves yet'; log.append(li); }
    for (const event of data.moveLog) { const li=document.createElement('li'); li.textContent=`T${event.turn} · ${event.text}`; log.append(li); }
  }
  async function refresh() {
    if (closed || busy) return; busy=true;
    try { paint(await service.view(viewer,sessionId)); }
    catch (error) { if (!closed) { $('.spectator__state').textContent=error?.code === 'STALE_SESSION' || error?.code === 'EXPIRED' || error?.code === 'SESSION_ENDED' ? 'This viewing session has ended.' : 'Unable to load this battle.'; $('.spectator__battle').hidden=true; if (timer) clearInterval(timer); timer=null; } }
    finally { busy=false; }
  }
  void refresh(); timer=setInterval(() => void refresh(), CADENCE_MS);
  return Object.freeze({ close, refresh, cadenceMs:CADENCE_MS });
}
