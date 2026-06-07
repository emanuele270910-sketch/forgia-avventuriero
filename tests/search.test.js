/*
 * search.test.js — Ricerca testuale su oggetti e incantesimi.
 * Verifica: query vuota => tutti, riscontro per sottostringa, insensibilità a
 * maiuscole e accenti, nessun riscontro => 0.
 */
(function () {
  'use strict';

  var items = T.items;
  var spells = T.spells;
  var searchItems = T.searchItems;
  var searchSpells = T.searchSpells;

  function ids(list) { return list.map(function (x) { return x.id; }); }

  describe('Ricerca oggetti', function () {
    it('una query vuota restituisce tutti gli oggetti', function () {
      expect(searchItems(items, '').length).toBe(items.length);
    });

    it('trova la Sacca Magica cercando il nome italiano "sacca"', function () {
      expect(ids(searchItems(items, 'sacca'))).toContain('bag-of-holding');
    });

    it('trova ancora con il nome inglese "bag" (id canonico)', function () {
      expect(ids(searchItems(items, 'bag'))).toContain('bag-of-holding');
    });

    it('è insensibile a maiuscole/minuscole', function () {
      var upper = searchItems(items, 'BAG').length;
      var lower = searchItems(items, 'bag').length;
      expect(upper).toBe(lower);
      expect(upper).toBeGreaterThan(0);
    });

    it('una stringa senza riscontri restituisce 0 risultati', function () {
      expect(searchItems(items, 'zzzznoncesiste').length).toBe(0);
    });
  });

  describe('Ricerca incantesimi', function () {
    it('una query vuota restituisce tutti gli incantesimi', function () {
      expect(searchSpells(spells, '').length).toBe(spells.length);
    });

    it('trova la Palla di Fuoco cercando il nome italiano "palla"', function () {
      expect(ids(searchSpells(spells, 'palla'))).toContain('fireball');
    });

    it('trova ancora con il nome inglese "fireball" (id canonico)', function () {
      expect(ids(searchSpells(spells, 'fireball'))).toContain('fireball');
    });

    it('è insensibile agli accenti ("velocita" trova "velocità")', function () {
      expect(searchSpells(spells, 'velocita').length).toBeGreaterThan(0);
    });

    it('una stringa senza riscontri restituisce 0 risultati', function () {
      expect(searchSpells(spells, 'zzzznoncesiste').length).toBe(0);
    });
  });
})();
