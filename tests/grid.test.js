/*
 * grid.test.js — Logica pura della Griglia di combattimento.
 * Codici stanza, modello pedine, distanze (Chebyshev) e sanificazione remota.
 */
(function () {
  'use strict';

  var G = T.grid;

  // RNG deterministico: restituisce in sequenza i valori forniti (poi 0).
  function seqRng(values) {
    var i = 0;
    return function () { return i < values.length ? values[i++] : 0; };
  }

  describe('Griglia · codici stanza', function () {
    it('genera un codice della lunghezza giusta e con soli caratteri ammessi', function () {
      var code = G.makeRoomCode();
      expect(code.length).toBe(G.CODE_LEN);
      expect(G.isValidCode(code)).toBe(true);
    });

    it('è deterministico con un RNG iniettato', function () {
      var code = G.makeRoomCode(seqRng([0, 0, 0, 0, 0]));
      expect(code).toBe(G.CODE_ALPHABET.charAt(0).repeat(G.CODE_LEN));
    });

    it('normalizeCode mette in maiuscolo, toglie i simboli e taglia alla lunghezza', function () {
      expect(G.normalizeCode('  ab-3k9zzz ')).toBe('AB3K9');
      expect(G.normalizeCode('a b!c@d#e$f')).toBe('ABCDE');
    });

    it('isValidCode rifiuta lunghezze sbagliate e caratteri ambigui', function () {
      expect(G.isValidCode('ABCD')).toBe(false);     // troppo corto
      expect(G.isValidCode('ABCDEF')).toBe(false);   // troppo lungo
      expect(G.isValidCode('ABCD0')).toBe(false);    // 0 non è nell'alfabeto
      expect(G.isValidCode('ABCDE')).toBe(true);
    });
  });

  describe('Griglia · dimensioni e pedine', function () {
    it('makeGrid applica i valori di default e i limiti', function () {
      expect(G.makeGrid()).toEqual({ cols: G.DEFAULT_COLS, rows: G.DEFAULT_ROWS });
      var big = G.makeGrid(9999, 9999);
      expect(big.cols).toBe(G.MAX_DIM);
      expect(big.rows).toBe(G.MAX_DIM);
      var small = G.makeGrid(1, 1);
      expect(small.cols).toBe(G.MIN_DIM);
    });

    it('makeToken imposta i default e blocca le coordinate dentro la griglia', function () {
      var grid = G.makeGrid(10, 10);
      var t = G.makeToken({ kind: 'pc', label: 'Borin', x: 50, y: -3 }, grid);
      expect(t.kind).toBe('pc');
      expect(t.label).toBe('Borin');
      expect(t.x).toBe(9);   // bloccato a cols-1
      expect(t.y).toBe(0);   // bloccato a 0
      expect(typeof t.id).toBe('string');
    });

    it('makeToken normalizza un tipo sconosciuto a "monster" e taglia l\'etichetta', function () {
      var t = G.makeToken({ kind: 'drago', label: 'x'.repeat(100) });
      expect(t.kind).toBe('monster');
      expect(t.label.length).toBe(G.MAX_LABEL);
    });

    it('clampTokenToGrid riporta una pedina fuori bordo dentro la griglia', function () {
      var grid = G.makeGrid(8, 8);
      var t = { id: 'a', kind: 'monster', label: '', color: '#ef4444', x: 99, y: 99 };
      G.clampTokenToGrid(t, grid);
      expect(t.x).toBe(7);
      expect(t.y).toBe(7);
    });
  });

  describe('Griglia · distanze (Chebyshev, 5e)', function () {
    it('conta la diagonale come una sola casella', function () {
      var a = { x: 0, y: 0 }, b = { x: 1, y: 1 };
      expect(G.cellsBetween(a, b)).toBe(1);
      expect(G.distanceM(a, b)).toBe(1.5);
      expect(G.distanceFt(a, b)).toBe(5);
    });

    it('usa il massimo tra le due differenze', function () {
      var a = { x: 0, y: 0 }, b = { x: 3, y: 4 };
      expect(G.cellsBetween(a, b)).toBe(4);
      expect(G.distanceM(a, b)).toBe(6);
      expect(G.distanceFt(a, b)).toBe(20);
    });

    it('distanza zero su sé stessa', function () {
      var a = { x: 2, y: 2 };
      expect(G.cellsBetween(a, a)).toBe(0);
      expect(G.distanceLabel(a, a)).toContain('0');
    });
  });

  describe('Griglia · sanificazione stato remoto', function () {
    it('un input vuoto/non valido dà uno stato vuoto coerente', function () {
      var s = G.sanitizeState(null);
      expect(Array.isArray(s.tokens)).toBe(true);
      expect(s.tokens.length).toBe(0);
      expect(s.grid.cols).toBe(G.DEFAULT_COLS);
    });

    it('accetta le pedine sia come array sia come oggetto (mappa Firebase)', function () {
      var asObj = G.sanitizeState({ grid: { cols: 10, rows: 10 }, tokens: { k1: { kind: 'pc', x: 1, y: 1 } } });
      expect(asObj.tokens.length).toBe(1);
      expect(asObj.tokens[0].kind).toBe('pc');
      var asArr = G.sanitizeState({ tokens: [{ kind: 'monster', x: 0, y: 0 }, { kind: 'pc', x: 1, y: 1 }] });
      expect(asArr.tokens.length).toBe(2);
    });

    it('limita il numero di pedine a MAX_TOKENS', function () {
      var many = [];
      for (var i = 0; i < G.MAX_TOKENS + 25; i++) { many.push({ kind: 'monster', x: 0, y: 0 }); }
      var s = G.sanitizeState({ tokens: many });
      expect(s.tokens.length).toBe(G.MAX_TOKENS);
    });

    it('riporta le coordinate remote dentro la griglia dichiarata', function () {
      var s = G.sanitizeState({ grid: { cols: 12, rows: 12 }, tokens: [{ kind: 'monster', x: 999, y: 999 }] });
      expect(s.tokens[0].x).toBe(11);
      expect(s.tokens[0].y).toBe(11);
    });
  });
})();
