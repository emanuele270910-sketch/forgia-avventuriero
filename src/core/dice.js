/*
 * dice.js — Logica pura del lancio dei dadi di D&D (testabile, RNG iniettabile).
 * Nessuna dipendenza dal DOM: l'animazione e l'interfaccia vivono in app.js.
 * Esposto come DND.dice nel browser e come module.exports in Node.
 *
 * API:
 *   DICE            -> elenco dei dadi classici [{ sides, label }]
 *   MAX_COUNT       -> numero massimo di dadi per tiro
 *   rollDie(sides, rng?)        -> intero 1..sides
 *   roll(spec, rng?)            -> { count, sides, modifier, rolls[], sum, total }
 *   notation(spec)              -> stringa "NdS+M" (es. "2d6+3")
 *   parse(str)                  -> spec { count, sides, modifier } oppure null
 *   clampInt(n, min, max, def)  -> intero entro i limiti
 *
 * `rng` è una funzione che restituisce un float in [0,1) (default Math.random):
 * iniettandola, i test diventano deterministici.
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; root.DND.dice = mod; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // I dadi classici di Dungeons & Dragons.
  var DICE = [
    { sides: 4, label: 'd4' },
    { sides: 6, label: 'd6' },
    { sides: 8, label: 'd8' },
    { sides: 10, label: 'd10' },
    { sides: 12, label: 'd12' },
    { sides: 20, label: 'd20' },
    { sides: 100, label: 'd100' }
  ];

  var MAX_COUNT = 20; // dadi massimi per singolo tiro

  // Forza un valore a intero entro [min, max]; se non è un numero usa `fallback`.
  function clampInt(n, min, max, fallback) {
    n = Math.floor(Number(n));
    if (isNaN(n)) { return fallback; }
    if (n < min) { return min; }
    if (n > max) { return max; }
    return n;
  }

  // Tira un singolo dado a `sides` facce. rng() deve restituire un float in [0,1).
  function rollDie(sides, rng) {
    var r = (typeof rng === 'function') ? rng : Math.random;
    var s = clampInt(sides, 2, 1000, 20);
    return Math.floor(r() * s) + 1;
  }

  // Esegue un tiro completo a partire da uno spec { count, sides, modifier }.
  function roll(spec, rng) {
    spec = spec || {};
    var sides = clampInt(spec.sides, 2, 1000, 20);
    var count = clampInt(spec.count, 1, MAX_COUNT, 1);
    var modifier = clampInt(spec.modifier, -1000, 1000, 0);
    var rolls = [];
    var sum = 0;
    for (var i = 0; i < count; i++) {
      var v = rollDie(sides, rng);
      rolls.push(v);
      sum += v;
    }
    return { count: count, sides: sides, modifier: modifier, rolls: rolls, sum: sum, total: sum + modifier };
  }

  // Converte uno spec nella notazione testuale, es. "2d6+3", "1d20-1", "3d8".
  function notation(spec) {
    spec = spec || {};
    var count = clampInt(spec.count, 1, MAX_COUNT, 1);
    var sides = clampInt(spec.sides, 2, 1000, 20);
    var modifier = clampInt(spec.modifier, -1000, 1000, 0);
    var s = count + 'd' + sides;
    if (modifier > 0) { s += '+' + modifier; }
    else if (modifier < 0) { s += String(modifier); } // il segno '-' è già incluso
    return s;
  }

  // Analizza una notazione "NdS+M" (spazi opzionali). Ritorna lo spec o null.
  function parse(str) {
    if (typeof str !== 'string') { return null; }
    var m = str.replace(/\s+/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!m) { return null; }
    return {
      count: m[1] ? parseInt(m[1], 10) : 1,
      sides: parseInt(m[2], 10),
      modifier: m[3] ? parseInt(m[3], 10) : 0
    };
  }

  return {
    DICE: DICE,
    MAX_COUNT: MAX_COUNT,
    clampInt: clampInt,
    rollDie: rollDie,
    roll: roll,
    notation: notation,
    parse: parse
  };
});
