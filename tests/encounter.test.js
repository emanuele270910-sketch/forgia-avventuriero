/*
 * encounter.test.js — Logica del tracker dei mostri e integrità dei dati DM.
 * Usa i global `describe`/`it`/`expect` (framework.js) e `T` (env.js).
 */
(function () {
  'use strict';

  var E = T.encounter;
  var dm = T.dm;

  describe('Tracker mostri — creazione', function () {
    it('makeMonster normalizza nome e PF', function () {
      var m = E.makeMonster('  Goblin  ', 7);
      expect(m.name).toBe('Goblin');
      expect(m.maxHp).toBe(7);
      expect(m.currentHp).toBe(7);
    });

    it('assegna un id se non fornito', function () {
      var a = E.makeMonster('A', 10);
      var b = E.makeMonster('B', 10);
      expect(typeof a.id).toBe('string');
      expect(a.id.length).toBeGreaterThan(0);
      expect(a.id).not.toBe(b.id);
    });

    it('PF minimi pari a 1 anche con input non validi', function () {
      expect(E.makeMonster('X', 0).maxHp).toBe(1);
      expect(E.makeMonster('X', -5).maxHp).toBe(1);
      expect(E.makeMonster('X', 'abc').maxHp).toBe(1);
    });

    it('usa « Mostro » come nome di riserva se vuoto', function () {
      expect(E.makeMonster('', 10).name).toBe('Mostro');
      expect(E.makeMonster('   ', 10).name).toBe('Mostro');
    });

    it('ripristina lo stato salvato tramite opts', function () {
      var m = E.makeMonster('Orco', 15, { id: 'fisso', currentHp: 6, note: 'ferito', initiative: 12 });
      expect(m.id).toBe('fisso');
      expect(m.currentHp).toBe(6);
      expect(m.note).toBe('ferito');
      expect(m.initiative).toBe(12);
    });

    it('vincola currentHp ripristinato dentro [0, maxHp]', function () {
      expect(E.makeMonster('Orco', 15, { currentHp: 99 }).currentHp).toBe(15);
      expect(E.makeMonster('Orco', 15, { currentHp: -3 }).currentHp).toBe(0);
    });
  });

  describe('Tracker mostri — danni e cure', function () {
    it('applyDamage sottrae i PF senza scendere sotto 0', function () {
      var m = E.makeMonster('Goblin', 7);
      expect(E.applyDamage(m, 3).currentHp).toBe(4);
      expect(E.applyDamage(m, 99).currentHp).toBe(0);
    });

    it('applyHeal aggiunge i PF senza superare il massimo', function () {
      var m = E.applyDamage(E.makeMonster('Ogre', 59), 50); // 9 PF
      expect(E.applyHeal(m, 5).currentHp).toBe(14);
      expect(E.applyHeal(m, 999).currentHp).toBe(59);
    });

    it('non muta il mostro originale (funzioni pure)', function () {
      var m = E.makeMonster('Troll', 84);
      E.applyDamage(m, 10);
      expect(m.currentHp).toBe(84);
    });

    it('ignora importi negativi o non numerici', function () {
      var m = E.makeMonster('Goblin', 7);
      expect(E.applyDamage(m, -5).currentHp).toBe(7);
      expect(E.applyDamage(m, 'x').currentHp).toBe(7);
      expect(E.applyHeal(E.applyDamage(m, 4), -2).currentHp).toBe(3);
    });
  });

  describe('Tracker mostri — stato e percentuale', function () {
    it('clampHp vincola nell’intervallo', function () {
      expect(E.clampHp(-1, 10)).toBe(0);
      expect(E.clampHp(15, 10)).toBe(10);
      expect(E.clampHp(7, 10)).toBe(7);
    });

    it('hpPercent calcola la percentuale arrotondata', function () {
      expect(E.hpPercent(E.makeMonster('X', 10))).toBe(100);
      expect(E.hpPercent(E.applyDamage(E.makeMonster('X', 10), 5))).toBe(50);
      expect(E.hpPercent(E.applyDamage(E.makeMonster('X', 8), 8))).toBe(0);
    });

    it('status riflette i PF residui', function () {
      var m = E.makeMonster('X', 100);
      expect(E.status(m)).toBe('healthy');
      expect(E.status(E.applyDamage(m, 40))).toBe('wounded');   // 60%
      expect(E.status(E.applyDamage(m, 60))).toBe('bloodied');  // 40%
      expect(E.status(E.applyDamage(m, 80))).toBe('critical');  // 20%
      expect(E.status(E.applyDamage(m, 100))).toBe('dead');     // 0%
    });
  });

  describe('Dati DM', function () {
    it('espone sezioni di riferimento e mostri', function () {
      expect(Array.isArray(dm.sections)).toBe(true);
      expect(dm.sections.length).toBeGreaterThan(0);
      expect(Array.isArray(dm.monsters)).toBe(true);
      expect(dm.monsters.length).toBeGreaterThan(0);
    });

    it('ogni sezione ha id, titolo e tipo valido', function () {
      var kinds = { table: true, list: true, steps: true };
      dm.sections.forEach(function (s) {
        expect(typeof s.id).toBe('string');
        expect(s.id.length).toBeGreaterThan(0);
        expect(typeof s.title).toBe('string');
        expect(s.title.length).toBeGreaterThan(0);
        expect(kinds[s.kind]).toBeTruthy();
        if (s.kind === 'table') {
          expect(Array.isArray(s.columns)).toBe(true);
          expect(Array.isArray(s.rows)).toBe(true);
          s.rows.forEach(function (row) { expect(row.length).toBe(s.columns.length); });
        } else {
          expect(Array.isArray(s.items)).toBe(true);
          expect(s.items.length).toBeGreaterThan(0);
        }
      });
    });

    it('le sezioni hanno id univoci', function () {
      var seen = {};
      dm.sections.forEach(function (s) {
        expect(seen[s.id]).toBeFalsy();
        seen[s.id] = true;
      });
    });

    it('ogni mostro iconico ha nome e PF validi', function () {
      dm.monsters.forEach(function (mon) {
        expect(typeof mon.name).toBe('string');
        expect(mon.name.length).toBeGreaterThan(0);
        expect(typeof mon.hp).toBe('number');
        expect(mon.hp).toBeGreaterThan(0);
      });
    });
  });
})();
