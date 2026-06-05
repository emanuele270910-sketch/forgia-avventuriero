/*
 * changelog.test.js — Integrità della cronologia versioni (Patch Notes).
 * Verifica struttura, tipi, unicità delle versioni e che ogni riga di modifica
 * sia una stringa non vuota. Usa i global `describe`/`it`/`expect` e `T`.
 */
(function () {
  'use strict';

  var changelog = T.changelog;

  function isStringArray(arr) {
    if (!Array.isArray(arr)) { return false; }
    for (var i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) { return false; }
    }
    return true;
  }

  describe('Cronologia versioni (Patch Notes)', function () {
    it('è un array non vuoto', function () {
      expect(Array.isArray(changelog)).toBe(true);
      expect(changelog.length).toBeGreaterThanOrEqual(1);
    });

    it('ogni voce ha versione, data e titolo come stringhe non vuote', function () {
      changelog.forEach(function (v) {
        expect(typeof v.version).toBe('string');
        expect(v.version.length).toBeGreaterThan(0);
        expect(typeof v.date).toBe('string');
        expect(v.date.length).toBeGreaterThan(0);
        expect(typeof v.title).toBe('string');
        expect(v.title.length).toBeGreaterThan(0);
      });
    });

    it('i gruppi added/improved/fixed sono array di stringhe non vuote', function () {
      changelog.forEach(function (v) {
        expect(isStringArray(v.added)).toBe(true);
        expect(isStringArray(v.improved)).toBe(true);
        expect(isStringArray(v.fixed)).toBe(true);
      });
    });

    it('ogni voce elenca almeno una modifica', function () {
      changelog.forEach(function (v) {
        var total = v.added.length + v.improved.length + v.fixed.length;
        expect(total).toBeGreaterThanOrEqual(1);
      });
    });

    it('ha numeri di versione univoci', function () {
      var seen = {};
      changelog.forEach(function (v) {
        expect(seen[v.version]).toBeFalsy();
        seen[v.version] = true;
      });
    });
  });
})();
