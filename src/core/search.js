/*
 * search.js — Ricerca testuale su oggetti e incantesimi.
 */
(function (root, factory) {
  'use strict';
  var mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; Object.assign(root.DND, mod); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  // Recupera util sia dal namespace globale (browser) sia via require (Node).
  var util = (root && root.DND && root.DND.matchesText)
    ? root.DND
    : (typeof require !== 'undefined' ? require('./util.js') : null);
  var matchesText = util.matchesText;

  // Tutto il testo "cercabile" di un oggetto, in un'unica stringa.
  // Includiamo anche `id` (slug inglese) così la ricerca funziona sia col nome
  // italiano sia col nome inglese canonico (es. "fireball", "bag of holding").
  function itemHaystack(item) {
    var parts = [item.name, item.id, item.descrizione, item.type];
    if (item.tags) { parts = parts.concat(item.tags); }
    if (item.bonus && item.bonus.extra) { parts.push(item.bonus.extra); }
    if (item.attunementNote) { parts.push(item.attunementNote); }
    return parts.join(' ');
  }

  function spellHaystack(spell) {
    var parts = [spell.name, spell.id, spell.descrizione, spell.school];
    if (spell.classes) { parts = parts.concat(spell.classes); }
    if (spell.higherLevels) { parts.push(spell.higherLevels); }
    return parts.join(' ');
  }

  // Query vuota -> tutti gli elementi (copia). Altrimenti filtra per sottostringa.
  function searchItems(items, query) {
    if (!Array.isArray(items)) { return []; }
    return items.filter(function (item) {
      return matchesText(itemHaystack(item), query);
    });
  }

  function searchSpells(spells, query) {
    if (!Array.isArray(spells)) { return []; }
    return spells.filter(function (spell) {
      return matchesText(spellHaystack(spell), query);
    });
  }

  return {
    searchItems: searchItems,
    searchSpells: searchSpells
  };
});
