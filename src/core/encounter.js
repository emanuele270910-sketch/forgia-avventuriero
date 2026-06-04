/*
 * encounter.js — Logica pura del tracker dei mostri (niente DOM).
 * Funzioni testabili: creazione mostro, danni, cure, stato e percentuale PF.
 * Pattern UMD-lite: nel browser espone DND.encounter, in Node module.exports.
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; root.DND.encounter = mod; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Object.assign con fallback per ambienti datati.
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) { continue; }
      for (var k in src) {
        if (Object.prototype.hasOwnProperty.call(src, k)) { target[k] = src[k]; }
      }
    }
    return target;
  }

  // Converte in intero; se non valido restituisce `fallback` (default 0).
  function toInt(value, fallback) {
    var n = parseInt(value, 10);
    return isNaN(n) ? (fallback === undefined ? 0 : fallback) : n;
  }

  // Vincola i PF nell'intervallo [0, maxHp].
  function clampHp(hp, maxHp) {
    if (hp < 0) { return 0; }
    if (hp > maxHp) { return maxHp; }
    return hp;
  }

  // Generatore di id univoci (monotòno anche con creazioni nello stesso ms).
  var counter = 0;
  function uid() {
    counter += 1;
    return 'm' + Date.now().toString(36) + '-' + counter;
  }

  // Crea un mostro normalizzato. `name` e `hp` obbligatori; `opts` facoltativo
  // (id, currentHp, note, initiative) — usato al ripristino da localStorage.
  function makeMonster(name, hp, opts) {
    opts = opts || {};
    var maxHp = Math.max(1, toInt(hp, 1));
    var nm = (name === undefined || name === null ? '' : String(name)).trim() || 'Mostro';
    var cur = opts.currentHp === undefined || opts.currentHp === null
      ? maxHp
      : clampHp(toInt(opts.currentHp, maxHp), maxHp);
    return {
      id: opts.id || uid(),
      name: nm,
      maxHp: maxHp,
      currentHp: cur,
      note: opts.note ? String(opts.note) : '',
      initiative: opts.initiative === undefined || opts.initiative === null ? null : toInt(opts.initiative, 0)
    };
  }

  // Applica danni: restituisce un NUOVO mostro con i PF ridotti (mai sotto 0).
  function applyDamage(monster, amount) {
    var amt = Math.max(0, toInt(amount, 0));
    return assign({}, monster, { currentHp: clampHp(monster.currentHp - amt, monster.maxHp) });
  }

  // Applica cure: restituisce un NUOVO mostro con i PF aumentati (mai sopra max).
  function applyHeal(monster, amount) {
    var amt = Math.max(0, toInt(amount, 0));
    return assign({}, monster, { currentHp: clampHp(monster.currentHp + amt, monster.maxHp) });
  }

  // Percentuale di PF residui (0–100, arrotondata).
  function hpPercent(monster) {
    if (!monster.maxHp) { return 0; }
    return Math.round((monster.currentHp / monster.maxHp) * 100);
  }

  // Stato sintetico in base ai PF residui.
  //   dead (0) · healthy (100%) · wounded (>50%) · bloodied (>25%) · critical (resto)
  function status(monster) {
    if (monster.currentHp <= 0) { return 'dead'; }
    var pct = monster.currentHp / monster.maxHp;
    if (pct >= 1) { return 'healthy'; }
    if (pct > 0.5) { return 'wounded'; }
    if (pct > 0.25) { return 'bloodied'; }
    return 'critical';
  }

  return {
    toInt: toInt,
    clampHp: clampHp,
    makeMonster: makeMonster,
    applyDamage: applyDamage,
    applyHeal: applyHeal,
    hpPercent: hpPercent,
    status: status
  };
});
