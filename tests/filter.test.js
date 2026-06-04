/*
 * filter.test.js — Filtri combinabili (AND tra criteri, OR dentro un criterio).
 * Verifica oggetti (rarità, tipo, sintonia) e incantesimi (classe, livello,
 * scuola, componenti, concentrazione, rituale) e le combinazioni.
 */
(function () {
  'use strict';

  var items = T.items;
  var spells = T.spells;
  var filterItems = T.filterItems;
  var filterSpells = T.filterSpells;

  function every(list, pred) {
    for (var i = 0; i < list.length; i++) { if (!pred(list[i])) { return false; } }
    return true;
  }

  describe('Filtri oggetti', function () {
    it('nessun criterio => tutti gli oggetti', function () {
      expect(filterItems(items, {}).length).toBe(items.length);
    });

    it('filtra per rarità (uncommon)', function () {
      var r = filterItems(items, { rarities: ['uncommon'] });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (i) { return i.rarity === 'uncommon'; })).toBe(true);
    });

    it('filtra per tipo (weapon)', function () {
      var r = filterItems(items, { types: ['weapon'] });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (i) { return i.type === 'weapon'; })).toBe(true);
    });

    it('filtra per sintonia richiesta (yes)', function () {
      var r = filterItems(items, { attunement: 'yes' });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (i) { return i.attunement === true; })).toBe(true);
    });

    it('filtra per sintonia non richiesta (no)', function () {
      var r = filterItems(items, { attunement: 'no' });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (i) { return i.attunement === false; })).toBe(true);
    });

    it('combina rarità AND tipo', function () {
      var r = filterItems(items, { rarities: ['rare'], types: ['weapon'] });
      expect(every(r, function (i) { return i.rarity === 'rare' && i.type === 'weapon'; })).toBe(true);
    });

    it('la combinazione rarità+tipo è un sottoinsieme del solo filtro rarità', function () {
      var byRarity = filterItems(items, { rarities: ['rare'] }).length;
      var byBoth = filterItems(items, { rarities: ['rare'], types: ['weapon'] }).length;
      expect(byBoth).toBeLessThanOrEqual(byRarity);
    });
  });

  describe('Filtri incantesimi', function () {
    it('nessun criterio => tutti gli incantesimi', function () {
      expect(filterSpells(spells, {}).length).toBe(spells.length);
    });

    it('filtra per classe (wizard)', function () {
      var r = filterSpells(spells, { classes: ['wizard'] });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (s) { return s.classes.indexOf('wizard') !== -1; })).toBe(true);
    });

    it('filtra per livello (0 = trucchetti)', function () {
      var r = filterSpells(spells, { levels: [0] });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (s) { return s.level === 0; })).toBe(true);
    });

    it('filtra per scuola (evocation)', function () {
      var r = filterSpells(spells, { schools: ['evocation'] });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (s) { return s.school === 'evocation'; })).toBe(true);
    });

    it('filtra per componente verbale richiesta', function () {
      var r = filterSpells(spells, { components: { v: true } });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (s) { return s.components.v === true; })).toBe(true);
    });

    it('filtra solo gli incantesimi a concentrazione', function () {
      var r = filterSpells(spells, { concentration: true });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (s) { return s.concentration === true; })).toBe(true);
    });

    it('filtra solo i rituali', function () {
      var r = filterSpells(spells, { ritual: true });
      expect(r.length).toBeGreaterThan(0);
      expect(every(r, function (s) { return s.ritual === true; })).toBe(true);
    });

    it('combina classe AND livello', function () {
      var r = filterSpells(spells, { classes: ['wizard'], levels: [3] });
      expect(every(r, function (s) {
        return s.classes.indexOf('wizard') !== -1 && s.level === 3;
      })).toBe(true);
    });
  });
})();
