/*
 * filter.js — Filtri combinabili (AND) per oggetti e incantesimi.
 *
 * Convenzione: ogni criterio assente o vuoto NON filtra. Gli array (rarities,
 * types, levels, schools, classes, castingTimes) usano semantica OR al loro
 * interno ma vengono combinati in AND tra criteri diversi.
 */
(function (root, factory) {
  'use strict';
  var mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; Object.assign(root.DND, mod); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var util = (root && root.DND && root.DND.matchesText)
    ? root.DND
    : (typeof require !== 'undefined' ? require('./util.js') : null);
  var matchesText = util.matchesText;

  function asArray(v) { return Array.isArray(v) ? v : []; }
  function nonEmpty(arr) { return arr.length > 0; }

  // Includiamo anche `id` (slug inglese) così i filtri testuali trovano gli
  // elementi sia col nome italiano sia col nome inglese canonico.
  function itemHaystack(item) {
    var parts = [item.name, item.id, item.descrizione, item.type];
    if (item.tags) { parts = parts.concat(item.tags); }
    if (item.bonus && item.bonus.extra) { parts.push(item.bonus.extra); }
    return parts.join(' ');
  }

  function spellHaystack(spell) {
    var parts = [spell.name, spell.id, spell.descrizione, spell.school];
    if (spell.classes) { parts = parts.concat(spell.classes); }
    return parts.join(' ');
  }

  // opts: { text, rarities:[], types:[], attunement:'any'|'yes'|'no' }
  function filterItems(items, opts) {
    if (!Array.isArray(items)) { return []; }
    opts = opts || {};
    var rarities = asArray(opts.rarities);
    var types = asArray(opts.types);
    var att = opts.attunement || 'any';
    return items.filter(function (item) {
      if (!matchesText(itemHaystack(item), opts.text)) { return false; }
      if (nonEmpty(rarities) && rarities.indexOf(item.rarity) === -1) { return false; }
      if (nonEmpty(types) && types.indexOf(item.type) === -1) { return false; }
      if (att === 'yes' && item.attunement !== true) { return false; }
      if (att === 'no' && item.attunement !== false) { return false; }
      return true;
    });
  }

  // opts: { text, classes:[], levels:[], schools:[], castingTimes:[],
  //         components:{v,s,m} (true => richiede presente),
  //         concentration:bool, ritual:bool }
  function filterSpells(spells, opts) {
    if (!Array.isArray(spells)) { return []; }
    opts = opts || {};
    var classes = asArray(opts.classes);
    var levels = asArray(opts.levels);
    var schools = asArray(opts.schools);
    var castingTimes = asArray(opts.castingTimes);
    var comp = opts.components || {};
    return spells.filter(function (spell) {
      if (!matchesText(spellHaystack(spell), opts.text)) { return false; }
      if (nonEmpty(classes)) {
        var canCast = classes.some(function (c) { return (spell.classes || []).indexOf(c) !== -1; });
        if (!canCast) { return false; }
      }
      if (nonEmpty(levels) && levels.indexOf(spell.level) === -1) { return false; }
      if (nonEmpty(schools) && schools.indexOf(spell.school) === -1) { return false; }
      if (nonEmpty(castingTimes) && castingTimes.indexOf(spell.castingTime) === -1) { return false; }
      var sc = spell.components || {};
      if (comp.v === true && sc.v !== true) { return false; }
      if (comp.s === true && sc.s !== true) { return false; }
      if (comp.m === true && sc.m !== true) { return false; }
      if (opts.concentration === true && spell.concentration !== true) { return false; }
      if (opts.ritual === true && spell.ritual !== true) { return false; }
      return true;
    });
  }

  return {
    filterItems: filterItems,
    filterSpells: filterSpells
  };
});
