/** Small, dependency-free phone-first renderer. It never polls; caller renders only on state changes. */
export function renderCoopQuest(root, state, { onReady, onCheckpoint, onCancel } = {}) {
  if (!root) throw new TypeError('root is required');
  const partner = state.partner || {}, self = state.self || {};
  const status = state.status === 'complete' ? (state.story?(state.story.stage==='delivered'?'Shared record delivered':state.story.stage==='cancelled'?'Side story cancelled':state.story.stage==='expired'?'Side story expired':'Survey complete - agree on a plan'):'Practice complete') : state.status === 'active' ? 'Both ready' : state.status === 'cancelled' ? 'Practice cancelled' : state.status === 'expired' ? 'Practice expired' : 'Waiting for your partner';
  const button = (label, action, disabled = false) => `<button type="button" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
  const beaconList = (state.beacons || []).map(b => {
    const marked = (self.checkpoints || []).includes(b.id) ? 'Acknowledged' : (partner.checkpoints || []).includes(b.id) ? 'Partner acknowledged' : 'Not checked in';
    return `<li><span>${escapeHtml(b.label)}</span><small>${marked}</small></li>`;
  }).join('');
  root.innerHTML = `<section class="cq-card" aria-labelledby="cq-title">
    <header><p class="cq-kicker">${state.story?'CO-OP SIDE STORY':'CO-OP PRACTICE'}</p><h2 id="cq-title">${escapeHtml(state.label || 'Bramblebay field survey')}</h2>
    <p class="cq-practice">${state.story?'Optional side story · no items, coins or solo-story changes':'Practice only · no rewards or progression'}</p></header>
    <p class="cq-status" role="status">${status}</p>
    <p class="cq-partner">You: ${self.ready ? 'Ready' : 'Not ready'} · Partner: ${partner.ready ? 'Ready' : 'Waiting'}</p>
    ${state.story&&state.status==='complete'?'<details><summary>Survey checkpoints</summary><ol>'+beaconList+'</ol></details>':'<ol>'+beaconList+'</ol>'}
    <div class="cq-actions">${button(self.ready ? 'Ready' : "I'm ready", 'ready', self.ready || ['complete','cancelled','expired'].includes(state.status))}${button('Acknowledge nearby marker', 'checkpoint', state.status !== 'active')}${button(state.story?'Leave side story':'Leave practice', 'cancel', state.status === 'complete' && (!state.story||['delivered','cancelled','expired'].includes(state.story.stage)) || state.status === 'cancelled' || state.status === 'expired')}</div>
    <p class="cq-note">Solo play stays available. Check-ins use an acknowledged device position for ${state.story?'this side story':'this practice'} only; they do not prove movement.</p>
  </section>`;
  if(state.story&&state.status==='complete'){root.querySelector('[data-action="ready"]')?.remove();root.querySelector('[data-action="checkpoint"]')?.remove();if(['delivered','cancelled','expired'].includes(state.story.stage))root.querySelector('.cq-actions')?.remove()}
  root.querySelector('[data-action="ready"]')?.addEventListener('click', () => onReady?.());
  root.querySelector('[data-action="checkpoint"]')?.addEventListener('click', () => onCheckpoint?.());
  root.querySelector('[data-action="cancel"]')?.addEventListener('click', () => onCancel?.());
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
