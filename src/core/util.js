/*
 * util.js — Funzioni di utilita condivise (normalizzazione testo, escape HTML).
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; Object.assign(root.DND, mod); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Range dei segni diacritici combinanti (U+0300..U+036F), costruito da stringa ASCII.
  var COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

  // Minuscolo + rimozione accenti: "Pozione" trova "pozione", "elfico" trova la voce accentata.
  function normalize(text) {
    if (text === null || text === undefined) { return ''; }
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .trim();
  }

  // Escape per inserire testo dei dati nell'HTML senza rischi di injection.
  function escapeHtml(text) {
    if (text === null || text === undefined) { return ''; }
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // true se `query` e contenuta in `haystack` (entrambe normalizzate).
  function matchesText(haystack, query) {
    var q = normalize(query);
    if (q === '') { return true; }
    return normalize(haystack).indexOf(q) !== -1;
  }

  return {
    normalize: normalize,
    escapeHtml: escapeHtml,
    matchesText: matchesText
  };
});
