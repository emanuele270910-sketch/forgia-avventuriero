/*
 * builds.js — Logica pura per le build personalizzate dell'utente (niente DOM).
 * Crea/modifica build (nome, classe, oggetti, incantesimi) in modo immutabile e
 * le valuta con un assistente a regole. Nessuna dipendenza esterna: i dati
 * (oggetti, incantesimi, classi) arrivano via `ctx`, così la logica è testabile.
 * Pattern UMD-lite: nel browser espone DND.builds, in Node module.exports.
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; root.DND.builds = mod; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var MAX_ATTUNEMENT = 3;
  // Slot che di norma si equipaggiano in un solo esemplare: i doppioni sono ridondanti.
  var UNIQUE_SLOTS = { armor: 1, shield: 1 };

  function str(v) { return (v === undefined || v === null) ? '' : String(v); }
  function trim(v) { return str(v).trim(); }

  // Lista di stringhe ripulite, senza vuoti né duplicati (mantiene l'ordine).
  function uniqueStrings(arr) {
    if (!Array.isArray(arr)) { return []; }
    var out = [], seen = {};
    for (var i = 0; i < arr.length; i++) {
      var s = trim(arr[i]);
      if (s && !seen[s]) { seen[s] = true; out.push(s); }
    }
    return out;
  }

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) { continue; }
      for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) { target[k] = src[k]; } }
    }
    return target;
  }

  var counter = 0;
  function uid() { counter += 1; return 'b' + Date.now().toString(36) + '-' + counter; }

  // Crea una build normalizzata. `opts`: id, itemIds, spellIds (usati anche al
  // ripristino da localStorage).
  function makeBuild(name, clazz, opts) {
    opts = opts || {};
    return {
      id: opts.id || uid(),
      name: trim(name) || 'Nuova build',
      clazz: trim(clazz),
      itemIds: uniqueStrings(opts.itemIds),
      spellIds: uniqueStrings(opts.spellIds)
    };
  }

  // Restituisce una NUOVA build con la lista `key` rimpiazzata (deduplicata).
  function withList(build, key, list) {
    var patch = {}; patch[key] = uniqueStrings(list);
    return assign({}, build, patch);
  }

  function addItem(build, id) {
    id = trim(id);
    if (!id) { return build; }
    return withList(build, 'itemIds', (build.itemIds || []).concat([id]));
  }
  function removeItem(build, id) {
    id = trim(id);
    return withList(build, 'itemIds', (build.itemIds || []).filter(function (x) { return x !== id; }));
  }
  function addSpell(build, id) {
    id = trim(id);
    if (!id) { return build; }
    return withList(build, 'spellIds', (build.spellIds || []).concat([id]));
  }
  function removeSpell(build, id) {
    id = trim(id);
    return withList(build, 'spellIds', (build.spellIds || []).filter(function (x) { return x !== id; }));
  }
  function rename(build, name) {
    return assign({}, build, { name: trim(name) || build.name });
  }
  function setClass(build, clazz) {
    return assign({}, build, { clazz: trim(clazz) });
  }
  function hasItem(build, id) { return (build.itemIds || []).indexOf(trim(id)) !== -1; }
  function hasSpell(build, id) { return (build.spellIds || []).indexOf(trim(id)) !== -1; }

  // ---- Assistente: valutazione a regole -------------------------------------
  // ctx: { itemById, spellById, classById }. Restituisce un report con
  // punteggio 0-100, verdetto e liste di codici (warnings/suggestions/positives)
  // che la UI traduce in messaggi localizzati.
  function evaluateBuild(build, ctx) {
    ctx = ctx || {};
    build = build || {};
    var itemById = ctx.itemById || {};
    var spellById = ctx.spellById || {};
    var classById = ctx.classById || {};

    var items = (build.itemIds || []).map(function (id) { return itemById[id]; }).filter(Boolean);
    var spells = (build.spellIds || []).map(function (id) { return spellById[id]; }).filter(Boolean);
    var info = classById[build.clazz] || null;
    var isCaster = !!(info && info.caster);

    var warnings = [], suggestions = [], positives = [];

    // Build vuota: niente da valutare.
    if (items.length === 0 && spells.length === 0) {
      return {
        score: 0, verdict: 'empty', isCaster: isCaster,
        itemCount: 0, spellCount: 0, attunementUsed: 0, attunementMax: MAX_ATTUNEMENT,
        warnings: [], suggestions: [{ code: 'empty' }], positives: []
      };
    }

    var score = 100;

    // Budget di sintonia (max 3).
    var attuneUsed = 0;
    items.forEach(function (it) { if (it.attunement) { attuneUsed++; } });
    if (attuneUsed > MAX_ATTUNEMENT) {
      warnings.push({ code: 'attune-over', used: attuneUsed, max: MAX_ATTUNEMENT });
      score -= 12 * (attuneUsed - MAX_ATTUNEMENT);
    } else if (attuneUsed > 0) {
      positives.push({ code: 'attune-ok', used: attuneUsed, max: MAX_ATTUNEMENT });
    }

    // Doppioni di slot tipicamente unici (armatura, scudo).
    var typeCount = {};
    items.forEach(function (it) { typeCount[it.type] = (typeCount[it.type] || 0) + 1; });
    Object.keys(UNIQUE_SLOTS).forEach(function (type) {
      if ((typeCount[type] || 0) > 1) {
        warnings.push({ code: 'dup-slot', type: type, count: typeCount[type] });
        score -= 10;
      }
    });

    // Coerenza classe / incantesimi.
    if (info && !isCaster && spells.length > 0) {
      warnings.push({ code: 'noncaster-spells', clazz: build.clazz });
      score -= 12;
    }
    if (isCaster && spells.length === 0) {
      suggestions.push({ code: 'caster-no-spells', clazz: build.clazz });
      score -= 8;
    }
    if (isCaster && spells.length > 0) {
      var offClass = spells.filter(function (sp) { return (sp.classes || []).indexOf(build.clazz) === -1; });
      if (offClass.length > 0) {
        warnings.push({ code: 'spells-offclass', count: offClass.length });
        score -= 4 * offClass.length;
      } else {
        positives.push({ code: 'spells-onclass', count: spells.length });
      }
    }

    // Classe non scelta.
    if (!info) {
      suggestions.push({ code: 'no-class' });
      score -= 6;
    }

    // Nessun modo di attaccare: né arma né incantesimi.
    var hasWeapon = (typeCount['weapon'] || 0) > 0;
    if (!hasWeapon && spells.length === 0) {
      suggestions.push({ code: 'no-offense' });
      score -= 8;
    } else if (hasWeapon) {
      positives.push({ code: 'has-weapon' });
    }

    // Troppi oggetti di altissima potenza.
    var legendary = items.filter(function (it) { return it.rarity === 'legendary' || it.rarity === 'artifact'; }).length;
    if (legendary > 2) {
      warnings.push({ code: 'too-legendary', count: legendary });
      score -= 6;
    }

    if (score < 0) { score = 0; }
    if (score > 100) { score = 100; }
    var verdict = score >= 80 ? 'great' : (score >= 55 ? 'good' : 'review');

    return {
      score: score, verdict: verdict, isCaster: isCaster,
      itemCount: items.length, spellCount: spells.length,
      attunementUsed: attuneUsed, attunementMax: MAX_ATTUNEMENT,
      warnings: warnings, suggestions: suggestions, positives: positives
    };
  }

  return {
    MAX_ATTUNEMENT: MAX_ATTUNEMENT,
    makeBuild: makeBuild,
    addItem: addItem, removeItem: removeItem,
    addSpell: addSpell, removeSpell: removeSpell,
    rename: rename, setClass: setClass,
    hasItem: hasItem, hasSpell: hasSpell,
    evaluateBuild: evaluateBuild
  };
});
