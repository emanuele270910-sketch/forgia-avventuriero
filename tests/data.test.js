/*
 * data.test.js — Integrità dei dataset oggetti e incantesimi.
 * Verifica campi obbligatori, valori entro le enumerazioni, id univoci e
 * copertura completa (tutte le rarità, tutti i livelli e tutte le scuole).
 * Usa i global `describe`/`it`/`expect` (framework.js) e `T` (env.js).
 */
(function () {
  'use strict';

  var items = T.items;
  var spells = T.spells;
  var RARITY_BY_ID = T.RARITY_BY_ID;
  var ITEM_TYPE_BY_ID = T.ITEM_TYPE_BY_ID;
  var SCHOOL_BY_ID = T.SCHOOL_BY_ID;
  var CLASS_BY_ID = T.CLASS_BY_ID;
  var CASTING_TIME_BY_ID = T.CASTING_TIME_BY_ID;

  function allUnique(values) {
    var seen = {};
    for (var i = 0; i < values.length; i++) {
      if (seen[values[i]]) { return false; }
      seen[values[i]] = true;
    }
    return true;
  }

  describe('Dataset oggetti', function () {
    it('contiene un numero consistente di oggetti (>= 40)', function () {
      expect(items.length).toBeGreaterThanOrEqual(40);
    });

    it('ogni oggetto ha i campi obbligatori con i tipi corretti', function () {
      items.forEach(function (item) {
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.name).toBe('string');
        expect(item.name.length).toBeGreaterThan(0);
        expect(typeof item.descrizione).toBe('string');
        expect(item.descrizione.length).toBeGreaterThan(0);
        expect(typeof item.attunement).toBe('boolean');
        expect(typeof item.source).toBe('string');
      });
    });

    it('usa solo rarità e tipi riconosciuti', function () {
      items.forEach(function (item) {
        expect(RARITY_BY_ID[item.rarity]).toBeTruthy();
        expect(ITEM_TYPE_BY_ID[item.type]).toBeTruthy();
      });
    });

    it('ha id univoci', function () {
      expect(allUnique(items.map(function (i) { return i.id; }))).toBe(true);
    });

    it('copre tutte le rarità definite', function () {
      var present = {};
      items.forEach(function (i) { present[i.rarity] = true; });
      Object.keys(RARITY_BY_ID).forEach(function (r) {
        expect(present[r]).toBeTruthy();
      });
    });
  });

  describe('Dataset incantesimi', function () {
    it('contiene un numero consistente di incantesimi (>= 80)', function () {
      expect(spells.length).toBeGreaterThanOrEqual(80);
    });

    it('ogni incantesimo ha i campi obbligatori con i tipi corretti', function () {
      spells.forEach(function (sp) {
        expect(typeof sp.id).toBe('string');
        expect(sp.id.length).toBeGreaterThan(0);
        expect(typeof sp.name).toBe('string');
        expect(sp.name.length).toBeGreaterThan(0);
        expect(typeof sp.descrizione).toBe('string');
        expect(sp.descrizione.length).toBeGreaterThan(0);
        expect(typeof sp.level).toBe('number');
        expect(sp.level).toBeGreaterThanOrEqual(0);
        expect(sp.level).toBeLessThanOrEqual(9);
        expect(typeof sp.concentration).toBe('boolean');
        expect(typeof sp.ritual).toBe('boolean');
        expect(typeof sp.components).toBe('object');
      });
    });

    it('usa solo scuole e tempi di lancio riconosciuti', function () {
      spells.forEach(function (sp) {
        expect(SCHOOL_BY_ID[sp.school]).toBeTruthy();
        expect(CASTING_TIME_BY_ID[sp.castingTime]).toBeTruthy();
      });
    });

    it('ogni incantesimo ha almeno una classe, tutte valide e incantatrici', function () {
      spells.forEach(function (sp) {
        expect(Array.isArray(sp.classes)).toBe(true);
        expect(sp.classes.length).toBeGreaterThan(0);
        sp.classes.forEach(function (c) {
          var info = CLASS_BY_ID[c];
          expect(info).toBeTruthy();
          expect(info.caster).toBe(true);
        });
      });
    });

    it('ha id univoci', function () {
      expect(allUnique(spells.map(function (s) { return s.id; }))).toBe(true);
    });

    it('copre tutti i livelli da 0 a 9', function () {
      var present = {};
      spells.forEach(function (s) { present[s.level] = true; });
      for (var l = 0; l <= 9; l++) { expect(present[l]).toBeTruthy(); }
    });

    it('copre tutte le scuole di magia', function () {
      var present = {};
      spells.forEach(function (s) { present[s.school] = true; });
      Object.keys(SCHOOL_BY_ID).forEach(function (s) {
        expect(present[s]).toBeTruthy();
      });
    });
  });
})();
