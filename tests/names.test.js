/*
 * names.test.js — Generatore di nomi per PNG, taverne e luoghi.
 * Usa i global `describe`/`it`/`expect` (framework.js) e `T` (env.js).
 */
(function () {
  'use strict';

  var N = T.names;
  var zero = function () { return 0; };

  describe('Generatore di nomi PNG', function () {
    it('espone i pool e le categorie', function () {
      expect(typeof N.generate).toBe('function');
      expect(typeof N.generateMany).toBe('function');
      expect(Array.isArray(N.kinds)).toBe(true);
      expect(N.kinds.length).toBeGreaterThan(0);
      expect(Array.isArray(N.pools.maleGiven)).toBe(true);
      expect(N.pools.maleGiven.length).toBeGreaterThan(0);
      expect(N.pools.surname.length).toBeGreaterThan(0);
    });

    it('nome maschile deterministico con rng=0 (primo nome + primo cognome)', function () {
      expect(N.generate('maschile', zero)).toBe(N.pools.maleGiven[0] + ' ' + N.pools.surname[0]);
    });

    it('nome femminile deterministico con rng=0', function () {
      expect(N.generate('femminile', zero)).toBe(N.pools.femaleGiven[0] + ' ' + N.pools.surname[0]);
    });

    it('taverna e luogo restituiscono una voce dei rispettivi pool', function () {
      expect(N.generate('taverna', zero)).toBe(N.pools.tavern[0]);
      expect(N.generate('luogo', zero)).toBe(N.pools.place[0]);
    });

    it('ogni categoria restituisce una stringa non vuota', function () {
      N.kinds.forEach(function (k) {
        var s = N.generate(k);
        expect(typeof s).toBe('string');
        expect(s.length).toBeGreaterThan(0);
      });
    });

    it('generateMany restituisce esattamente n nomi (minimo 1)', function () {
      expect(N.generateMany(5, 'png')).toHaveLength(5);
      expect(N.generateMany(0, 'png')).toHaveLength(1);
    });

    it('un rng vicino a 1 non esce dai limiti (niente « undefined »)', function () {
      var almostOne = function () { return 0.9999999; };
      expect(N.generate('maschile', almostOne).indexOf('undefined')).toBe(-1);
      expect(N.generate('taverna', almostOne).indexOf('undefined')).toBe(-1);
    });
  });
})();
