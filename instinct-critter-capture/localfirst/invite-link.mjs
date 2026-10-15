/**
 * Private room-link helpers. The only permitted URL payload is one eight-character
 * room code in the `room` query parameter. These helpers do not create, join,
 * authenticate, or transmit anything.
 */

const ROOM_CODE = /^[A-Z0-9]{8}$/;

function validOrigin(value) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      parsed.origin === value.replace(/\/$/, '') &&
      !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

/** Validate format only; no lookup, freshness, membership, or room-state checks. */
export function isRoomCode(value) {
  return typeof value === 'string' && ROOM_CODE.test(value);
}

/**
 * Make a same-origin private room route. `origin` must be an origin, not a page
 * URL. The code alphabet is constrained, but URLSearchParams is still used for
 * correct query serialization.
 */
export function createRoomLink(origin, code) {
  if (!validOrigin(origin)) throw new TypeError('origin must be an http(s) origin');
  if (!isRoomCode(code)) throw new TypeError('room code must be exactly eight uppercase alphanumeric characters');
  const link = new URL('/local-first/', origin);
  link.searchParams.set('room', code);
  return link.href;
}

/**
 * Parse an invite link against the current app origin. In a browser the origin
 * defaults to location.origin; tests and non-browser callers may pass it as the
 * second argument. Invalid links return a harmless reason instead of throwing.
 */
export function parseRoomLink(value, currentOrigin = globalThis.location?.origin) {
  if (!currentOrigin || !validOrigin(currentOrigin)) {
    return { ok: false, reason: 'origin-unavailable' };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (parsed.origin !== currentOrigin) return { ok: false, reason: 'foreign-origin' };
  if (!['/local-first/','/localfirst/'].includes(parsed.pathname) || parsed.username || parsed.password || parsed.hash) return { ok: false, reason: 'malformed' };
  const entries = [...parsed.searchParams.entries()];
  if (entries.length !== 1 || entries[0][0] !== 'room') {
    return { ok: false, reason: entries.some(([key]) => key === 'room') ? 'duplicate-or-extra-parameters' : 'missing-room-code' };
  }
  const code = entries[0][1];
  if (!isRoomCode(code)) return { ok: false, reason: 'malformed-room-code' };
  return { ok: true, code };
}

/** Safe, non-sensitive user-facing messages for link and existing join results. */
export function roomLinkMessage(reason) {
  const messages = {
    'origin-unavailable': 'Room links are unavailable here. Open the game from its usual address.',
    'foreign-origin': 'This room link is for a different game address. Open the link from the game site you use.',
    malformed: 'This room link is not valid. Ask the room host for a fresh link.',
    'duplicate-or-extra-parameters': 'This room link is not valid. Ask the room host for a fresh link.',
    'missing-room-code': 'This link does not include a room code. Ask the room host for the room link.',
    'malformed-room-code': 'This room link does not contain a valid room code. Ask the room host for a fresh link.',
    stale: 'That room has expired. Ask the host to open a new room and share its link.',
    expired: 'That room has expired. Ask the host to open a new room and share its link.',
    full: 'That room is full. Ask the host whether another room is available.',
    unauthenticated: 'Sign in before joining a room.',
    'join-failed': 'Could not join that room. Check the code and try again.'
  };
  return messages[reason] || messages['join-failed'];
}
