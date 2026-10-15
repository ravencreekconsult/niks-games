# Tactical readout - October15,2026

Current non-critical on-hit damage ranges on single move and double-target choices. Shared damage calculation preserves existing resolution and random-call order. Existing readout explains current-state assumptions, criticals, recoil/end-turn exclusions and sleep/Static/Chill skipping an action. No economy, family, progression, save, auth or trade change. Service-worker cache cartoon-v19 -> cartoon-v20.

## Species rarity / field hunting (cache v21)
- Common, Uncommon and Rare species weights within existing habitats. Thoughtlet, Brookfin and Wispup are Rare; Duskit, Sunpip, Snowbun and Voltkit are Uncommon. All other current wild residents are Common. Common weight1, Uncommon0.2, Rare0.05 multiply the existing habitat weights before day/night/rain filtering and normalization. This is a deliberate change to future wild encounter frequencies, not combat stats, capture or inheritance rules.
- Continuous species roll replaces the old integer-percent roll so small probabilities match the actual normalized tables rather than rounding to a whole-percent bucket.
- Field kit and scanner open read-only habitat notes with current rounded encounter percentages, hidden unseen names, species/coat distinction, existing coat odds and breeding-only ultra rules. Wild battles announce uncommon/rare species separately from rare-coat challenge logs.
- Earned browser coverage now includes two community permits, compatible wild catches, safe nursery dropoff, pending-family reload, care paid with earned game coins, exact preserved parents and inherited baby pickup. No trainer win/stat/cash/position grants in this path. Separate rare-species combat fixture is labelled as such.
- Runtime changes from tactical-v20:js/game.js,js/expansion-data.js,sw.js. The other62runtime files remain byte-identical. No new runtime assets or save fields. Backend/auth/sync/ownership untouched.
