import { createRoomLink, parseRoomLink, isRoomCode, roomLinkMessage } from './invite-link.mjs';

const STYLE_ID = 'havenmoor-invite-link-styles';
const STYLE = `
.havenmoor-invite { box-sizing:border-box; width:100%; max-width:42rem; margin:0 auto; padding:12px; border:1px solid #465564; border-radius:12px; color:inherit; }
.havenmoor-invite *, .havenmoor-invite *::before, .havenmoor-invite *::after { box-sizing:border-box; }
.havenmoor-invite__row { display:flex; flex-wrap:wrap; align-items:stretch; gap:8px; width:100%; }
.havenmoor-invite__code, .havenmoor-invite__copy { min-height:44px; font:inherit; border-radius:8px; }
.havenmoor-invite__code { flex:1 1 9rem; min-width:0; width:100%; padding:10px 12px; }
.havenmoor-invite__copy { flex:0 1 auto; max-width:100%; padding:10px 14px; white-space:normal; overflow-wrap:anywhere; }
.havenmoor-invite__fallback { display:block; width:100%; min-width:0; margin-top:8px; padding:10px; font:inherit; }
.havenmoor-invite__status { min-height:1.4em; margin:8px 0 0; overflow-wrap:anywhere; }
@media (max-width: 359px) { .havenmoor-invite__row { flex-direction:column; } .havenmoor-invite__copy { width:100%; } }
`;

function addStyle(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLE;
  documentRef.head.append(style);
}

/**
 * Mount a deliberately limited invite-link panel after the regular signed-in
 * bootstrap UI is rendered. `codeInput` must be the existing room-code input;
 * the module never creates a join button or invokes the join operation.
 *
 * Returns { status, showJoinResult, destroy }. Call showJoinResult only with
 * the outcome from the existing authenticated join flow.
 */
export function mountInviteLinkUI({ root, codeInput, windowRef = globalThis.window, documentRef = globalThis.document }) {
  if (!root || !codeInput || !windowRef || !documentRef) throw new TypeError('root, codeInput, windowRef, and documentRef are required');
  addStyle(documentRef);

  const panel = documentRef.createElement('section');
  panel.className = 'havenmoor-invite';
  panel.setAttribute('aria-label', 'Private room link');
  const row = documentRef.createElement('div');
  row.className = 'havenmoor-invite__row';
  const copyButton = documentRef.createElement('button');
  copyButton.className = 'havenmoor-invite__copy';
  copyButton.type = 'button';
  copyButton.textContent = 'Copy room link';
  const fallback = documentRef.createElement('input');
  fallback.className = 'havenmoor-invite__fallback';
  fallback.type = 'text';
  fallback.readOnly = true;
  fallback.hidden = true;
  fallback.setAttribute('aria-label', 'Room link for manual copying');
  const status = documentRef.createElement('p');
  status.className = 'havenmoor-invite__status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  row.append(copyButton);
  panel.append(row, fallback, status);
  root.append(panel);

  const parsed = parseRoomLink(windowRef.location.href, windowRef.location.origin);
  if (parsed.ok) {
    // Prefill only; never invoke the existing join action.
    codeInput.value = parsed.code;
    status.textContent = 'Room code filled in. Review it, then use the usual Join button.';
  } else if (new URL(windowRef.location.href).searchParams.has('room')) {
    status.textContent = roomLinkMessage(parsed.reason);
  }

  async function copyRoomLink() {
    const code = String(codeInput.value || '').trim();
    if (!isRoomCode(code)) {
      status.textContent = 'Enter the eight-character room code before copying its link.';
      return;
    }
    let link;
    try {
      link = createRoomLink(windowRef.location.origin, code);
    } catch {
      status.textContent = roomLinkMessage('origin-unavailable');
      return;
    }
    try {
      if (!windowRef.navigator?.clipboard?.writeText) throw new Error('clipboard unavailable');
      await windowRef.navigator.clipboard.writeText(link);
      fallback.hidden = true;
      fallback.value = '';
      status.textContent = 'Room link copied. Share it only with the person you want to invite.';
    } catch {
      fallback.value = link;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = 'Could not copy automatically. The room link is selected below; copy it manually.';
    }
  }

  copyButton.addEventListener('click', copyRoomLink);
  return {
    status,
    showJoinResult(result) {
      const reason = typeof result === 'string' ? result : result?.reason;
      if (reason && ['stale', 'expired', 'full', 'unauthenticated'].includes(reason)) {
        status.textContent = roomLinkMessage(reason);
      } else if (result?.ok === true) {
        status.textContent = 'Joined the room.';
      } else if (result) {
        status.textContent = roomLinkMessage('join-failed');
      }
    },
    destroy() {
      copyButton.removeEventListener('click', copyRoomLink);
      panel.remove();
    }
  };
}
