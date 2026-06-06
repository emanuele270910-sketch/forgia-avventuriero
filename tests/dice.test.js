/*
 * dice.test.js — Logica pura del lancio dei dadi (src/core/dice.js).
 * Usa i global `describe`/`it`/`expect` (framework.js) e `T` (env.js).
 * L'RNG è iniettabile, quindi i tiri possono essere resi deterministici.
 */
(function () {
  'use strict';

  var DICE = T.dice;

  // RNG deterministico: restituisce in sequenza i valori dati (ciclico).
  function seqRng(values) {
    var i = 0;
    return function () { var v = values[i % values.length]; i++; return v; };
  }
  var ZERO = function () { return 0; };        // ogni dado -> 1 (valore minimo)
  var ALMOST_ONE = function () { return 0.999999; }; // ogni dado -> faccia massima

  describe('dice: elenco dei dadi', function () {
    it('espone i 7 dadi classici di D&D', function () {
      expect(DICE.DICE).toHaveLength(7);
      expect(DICE.DICE.map(function (d) { return d.sides; })).toEqual([4, 6, 8, 10, 12, 20, 100]);
    });
    it('ogni dado ha etichetta coerente con le facce', function () {
      DICE.DICE.forEach(function (d) { expect(d.label).toBe('d' + d.sides); });
    });
    it('MAX_COUNT vale 20', function () {
      expect(DICE.MAX_COUNT).toBe(20);
    });
  });

  describe('dice: rollDie', function () {
    it('con rng=0 restituisce 1 e con rng~1 restituisce il massimo', function () {
      expect(DICE.rollDie(20, ZERO)).toBe(1);
      expect(DICE.rollDie(20, ALMOST_ONE)).toBe(20);
      expect(DICE.rollDie(6, ALMOST_ONE)).toBe(6);
    });
    it('resta sempre entro [1, facce] con rng casuale', function () {
      for (var i = 0; i < 300; i++) {
        var v = DICE.rollDie(20);
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('dice: roll', function () {
    it('tira il numero giusto di dadi e somma correttamente', function () {
      var r = DICE.roll({ count: 3, sides: 6, modifier: 0 }, ZERO);
      expect(r.rolls).toEqual([1, 1, 1]);
      expect(r.sum).toBe(3);
      expect(r.total).toBe(3);
      expect(r.count).toBe(3);
      expect(r.sides).toBe(6);
    });
    it('aggiunge il modificatore positivo al totale ma non alla somma', function () {
      var r = DICE.roll({ count: 2, sides: 6, modifier: 3 }, ZERO);
      expect(r.sum).toBe(2);
      expect(r.total).toBe(5);
      expect(r.modifier).toBe(3);
    });
    it('gestisce un modificatore negativo', function () {
      var r = DICE.roll({ count: 1, sides: 20, modifier: -2 }, ZERO);
      expect(r.sum).toBe(1);
      expect(r.total).toBe(-1);
    });
    it('usa una sequenza di rng per facce diverse', function () {
      // 0 -> 1, 0.5 -> floor(0.5*6)+1 = 4, 0.999999 -> 6
      var r = DICE.roll({ count: 3, sides: 6, modifier: 0 }, seqRng([0, 0.5, 0.999999]));
      expect(r.rolls).toEqual([1, 4, 6]);
      expect(r.sum).toBe(11);
    });
    it('limita la quantità a MAX_COUNT e ad almeno 1', function () {
      expect(DICE.roll({ count: 999, sides: 6 }, ZERO).rolls).toHaveLength(20);
      expect(DICE.roll({ count: 0, sides: 6 }, ZERO).rolls).toHaveLength(1);
      expect(DICE.roll({ count: -5, sides: 6 }, ZERO).rolls).toHaveLength(1);
    });
    it('applica valori di default sensati', function () {
      var r = DICE.roll({}, ZERO);
      expect(r.count).toBe(1);
      expect(r.sides).toBe(20);
      expect(r.modifier).toBe(0);
      expect(r.rolls).toHaveLength(1);
    });
    it('total è sempre sum + modifier (proprietà su tiri casuali)', function () {
      for (var i = 0; i < 100; i++) {
        var r = DICE.roll({ count: 4, sides: 8, modifier: 2 });
        expect(r.total).toBe(r.sum + r.modifier);
        expect(r.rolls).toHaveLength(4);
      }
    });
    it('ogni faccia di un d100 resta entro [1, 100]', function () {
      for (var i = 0; i < 200; i++) {
        var r = DICE.roll({ count: 2, sides: 100 });
        r.rolls.forEach(function (v) {
          expect(v).toBeGreaterThanOrEqual(1);
          expect(v).toBeLessThanOrEqual(100);
        });
      }
    });
  });

  describe('dice: notation', function () {
    it('formatta gli spec in notazione NdS+M', function () {
      expect(DICE.notation({ count: 2, sides: 6, modifier: 3 })).toBe('2d6+3');
      expect(DICE.notation({ count: 1, sides: 20, modifier: -1 })).toBe('1d20-1');
      expect(DICE.notation({ count: 3, sides: 8, modifier: 0 })).toBe('3d8');
    });
  });

  describe('dice: parse', function () {
    it('analizza le notazioni valide', function () {
      expect(DICE.parse('2d6+3')).toEqual({ count: 2, sides: 6, modifier: 3 });
      expect(DICE.parse('d20')).toEqual({ count: 1, sides: 20, modifier: 0 });
      expect(DICE.parse('10d10-2')).toEqual({ count: 10, sides: 10, modifier: -2 });
      expect(DICE.parse('  4 d 6 + 2 ')).toEqual({ count: 4, sides: 6, modifier: 2 });
    });
    it('restituisce null per input non validi', function () {
      expect(DICE.parse('ciao')).toBe(null);
      expect(DICE.parse('')).toBe(null);
      expect(DICE.parse('2x6')).toBe(null);
      expect(DICE.parse(42)).toBe(null);
    });
  });

  describe('dice: clampInt', function () {
    it('forza interi entro i limiti e usa il fallback', function () {
      expect(DICE.clampInt('abc', 1, 10, 5)).toBe(5);
      expect(DICE.clampInt(50, 1, 10, 5)).toBe(10);
      expect(DICE.clampInt(-3, 1, 10, 5)).toBe(1);
      expect(DICE.clampInt(3.9, 1, 10, 5)).toBe(3);
    });
  });
})();
