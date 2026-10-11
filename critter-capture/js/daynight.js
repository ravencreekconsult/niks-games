/* Critter Capture — day/night helpers: pure functions, no imports, no DOM.
   Time is minutes since midnight (0..1439) living in the save as `time`.
   Two real seconds = one in-game minute, so a full day is 12 real minutes. */

export const MINUTES_PER_SECOND = 2;
export const DAY_START = 480; // 08:00
export const PHASES = ['dawn', 'day', 'dusk', 'night'];

/* Time-of-day phase. Minutes are normalised first so negative or >1440
   values wrap cleanly into the 0..1439 day. */
export function phaseOf(minutes) {
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  if (m >= 300 && m <= 419) return 'dawn';     // 05:00-06:59
  if (m >= 420 && m <= 1079) return 'day';     // 07:00-17:59
  if (m >= 1080 && m <= 1199) return 'dusk';   // 18:00-19:59
  return 'night';                              // 20:00-04:59
}

/* Zero-padded clock string, e.g. formatClock(480) === '08:00'. */
export function formatClock(minutes) {
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), min = m % 60;
  return (h < 10 ? '0' : '') + h + ':' + (min < 10 ? '0' : '') + min;
}

/* Tint for the current phase: { color, alpha } with color === null for day.
   Colour is an 'rgb(r,g,b)' string, alpha a plain number so callers can
   scale it (battle draws at half strength so text stays readable). */
export function tintFor(minutes) {
  const phase = phaseOf(minutes);
  if (phase === 'dawn') return { color: 'rgb(255,170,120)', alpha: 0.18 };
  if (phase === 'dusk') return { color: 'rgb(255,138,60)', alpha: 0.20 };
  if (phase === 'night') return { color: 'rgb(20,24,64)', alpha: 0.42 };
  return { color: null, alpha: 0 };
}

/* The encounter set that applies right now: the map's night table takes over
   at night when it has one. Never mutates the data; null in, null out. */
export function tableFor(encounters, minutes) {
  if (!encounters) return null;
  if (phaseOf(minutes) === 'night' && encounters.night) return encounters.night;
  return encounters;
}
