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

  // Normalizza una chiave-condizione (stringa ripulita).
  function normKey(key) {
    return (key === undefined || key === null ? '' : String(key)).trim();
  }
  // Normalizza una lista di condizioni: stringhe non vuote, senza duplicati.
  function normConditions(arr) {
    if (!Array.isArray(arr)) { return []; }
    var out = [], seen = {};
    for (var i = 0; i < arr.length; i++) {
      var s = normKey(arr[i]);
      if (s && !seen[s]) { seen[s] = true; out.push(s); }
    }
    return out;
  }

  // Generatore di id univoci (monotòno anche con creazioni nello stesso ms).
  var counter = 0;
  function uid() {
    counter += 1;
    return 'm' + Date.now().toString(36) + '-' + counter;
  }

  // Crea un combattente normalizzato. `name` e `hp` obbligatori; `opts` facoltativo
  // (id, currentHp, note, initiative, isPC, conditions) — usato anche al ripristino
  // da localStorage. Per un PG (isPC) senza PF indicati, maxHp = 0 (PF non tracciati).
  function makeMonster(name, hp, opts) {
    opts = opts || {};
    var pc = !!opts.isPC;
    var rawHp = toInt(hp, pc ? 0 : 1);
    var maxHp = (pc && rawHp <= 0) ? 0 : Math.max(1, rawHp);
    var nm = (name === undefined || name === null ? '' : String(name)).trim() || (pc ? 'Personaggio' : 'Mostro');
    var cur;
    if (maxHp === 0) {
      cur = 0;
    } else if (opts.currentHp === undefined || opts.currentHp === null) {
      cur = maxHp;
    } else {
      cur = clampHp(toInt(opts.currentHp, maxHp), maxHp);
    }
    return {
      id: opts.id || uid(),
      name: nm,
      maxHp: maxHp,
      currentHp: cur,
      note: opts.note ? String(opts.note) : '',
      initiative: opts.initiative === undefined || opts.initiative === null ? null : toInt(opts.initiative, 0),
      isPC: pc,
      conditions: normConditions(opts.conditions)
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
  //   pc (PG senza PF) · dead (0) · healthy (100%) · wounded (>50%) · bloodied (>25%) · critical (resto)
  function status(monster) {
    if (!monster.maxHp) { return 'pc'; }        // PG senza PF tracciati
    if (monster.currentHp <= 0) { return 'dead'; }
    var pct = monster.currentHp / monster.maxHp;
    if (pct >= 1) { return 'healthy'; }
    if (pct > 0.5) { return 'wounded'; }
    if (pct > 0.25) { return 'bloodied'; }
    return 'critical';
  }

  // ---- Condizioni di stato (immutabili: restituiscono un NUOVO combattente) --
  function hasCondition(monster, key) {
    return normConditions(monster.conditions).indexOf(normKey(key)) !== -1;
  }
  function addCondition(monster, key) {
    var k = normKey(key);
    var list = normConditions(monster.conditions);
    if (k && list.indexOf(k) === -1) { list.push(k); }
    return assign({}, monster, { conditions: list });
  }
  function removeCondition(monster, key) {
    var k = normKey(key);
    var list = normConditions(monster.conditions).filter(function (c) { return c !== k; });
    return assign({}, monster, { conditions: list });
  }
  function toggleCondition(monster, key) {
    return hasCondition(monster, key) ? removeCondition(monster, key) : addCondition(monster, key);
  }

  // Ordina i combattenti per iniziativa decrescente (chi non ce l'ha va in fondo);
  // a parità, ordine alfabetico. Restituisce un NUOVO array (non muta l'input).
  function sortByInitiative(list) {
    function val(m) { return (m && m.initiative !== undefined && m.initiative !== null) ? toInt(m.initiative, 0) : -Infinity; }
    return (list || []).slice().sort(function (a, b) {
      var av = val(a), bv = val(b);
      if (av !== bv) { return bv - av; }
      var an = (a.name || '').toLowerCase(), bn = (b.name || '').toLowerCase();
      return an < bn ? -1 : (an > bn ? 1 : 0);
    });
  }

  return {
    toInt: toInt,
    clampHp: clampHp,
    makeMonster: makeMonster,
    applyDamage: applyDamage,
    applyHeal: applyHeal,
    hpPercent: hpPercent,
    status: status,
    hasCondition: hasCondition,
    addCondition: addCondition,
    removeCondition: removeCondition,
    toggleCondition: toggleCondition,
    sortByInitiative: sortByInitiative
  };
});
