/*
 * builds.test.js — Logica delle build personalizzate e dell'assistente a regole.
 * Usa i global `describe`/`it`/`expect` (framework.js) e `T` (env.js).
 */
(function () {
  'use strict';

  var B = T.builds;

  // ---- Fixtures: dataset minimo iniettato via ctx (niente dipendenze reali) --
  var ITEMS = {
    sword:   { id: 'sword',   type: 'weapon',   rarity: 'rare',      attunement: false },
    bow:     { id: 'bow',     type: 'weapon',   rarity: 'common',    attunement: false },
    plate:   { id: 'plate',   type: 'armor',    rarity: 'rare',      attunement: false },
    plate2:  { id: 'plate2',  type: 'armor',    rarity: 'rare',      attunement: false },
    shield1: { id: 'shield1', type: 'shield',   rarity: 'common',    attunement: false },
    shield2: { id: 'shield2', type: 'shield',   rarity: 'common',    attunement: false },
    ring1:   { id: 'ring1',   type: 'ring',     rarity: 'rare',      attunement: true },
    ring2:   { id: 'ring2',   type: 'ring',     rarity: 'rare',      attunement: true },
    cloak:   { id: 'cloak',   type: 'wondrous', rarity: 'rare',      attunement: true },
    amulet:  { id: 'amulet',  type: 'wondrous', rarity: 'rare',      attunement: true },
    relic:   { id: 'relic',   type: 'wondrous', rarity: 'legendary', attunement: false },
    relic2:  { id: 'relic2',  type: 'wondrous', rarity: 'legendary', attunement: false },
    relic3:  { id: 'relic3',  type: 'wondrous', rarity: 'artifact',  attunement: false },
    potion:  { id: 'potion',  type: 'potion',   rarity: 'common',    attunement: false }
  };
  var SPELLS = {
    fireball: { id: 'fireball', classes: ['wizard', 'sorcerer'] },
    cure:     { id: 'cure',     classes: ['cleric', 'bard'] },
    bless:    { id: 'bless',    classes: ['cleric', 'paladin'] }
  };
  var CLASSES = {
    fighter: { id: 'fighter', caster: false },
    wizard:  { id: 'wizard',  caster: true },
    cleric:  { id: 'cleric',  caster: true }
  };
  var CTX = { itemById: ITEMS, spellById: SPELLS, classById: CLASSES };

  function codes(arr) { return arr.map(function (x) { return x.code; }); }
  function byCode(arr, code) { return arr.filter(function (x) { return x.code === code; })[0]; }
  function build(name, clazz, opts) { return B.makeBuild(name, clazz, opts); }
  function evalB(b) { return B.evaluateBuild(b, CTX); }

  describe('Build — creazione (makeBuild)', function () {
    it('normalizza nome e classe (trim)', function () {
      var b = B.makeBuild('  La mia build  ', '  fighter  ');
      expect(b.name).toBe('La mia build');
      expect(b.clazz).toBe('fighter');
      expect(b.itemIds).toEqual([]);
      expect(b.spellIds).toEqual([]);
    });

    it('usa « Nuova build » come nome di riserva', function () {
      expect(B.makeBuild('', 'wizard').name).toBe('Nuova build');
      expect(B.makeBuild('   ', '').name).toBe('Nuova build');
    });

    it('assegna un id se non fornito', function () {
      var a = B.makeBuild('A', '');
      var b = B.makeBuild('B', '');
      expect(typeof a.id).toBe('string');
      expect(a.id.length).toBeGreaterThan(0);
      expect(a.id).not.toBe(b.id);
    });

    it('ripristina id, oggetti e incantesimi da opts deduplicandoli', function () {
      var b = B.makeBuild('X', 'wizard', {
        id: 'fisso', itemIds: ['a', 'a', '  b  ', ''], spellIds: ['s', 's']
      });
      expect(b.id).toBe('fisso');
      expect(b.itemIds).toEqual(['a', 'b']);
      expect(b.spellIds).toEqual(['s']);
    });
  });

  describe('Build — oggetti e incantesimi (add/remove)', function () {
    it('addItem aggiunge senza mutare l\'originale', function () {
      var b0 = B.makeBuild('T', 'fighter');
      var b1 = B.addItem(b0, 'sword');
      expect(b1.itemIds).toEqual(['sword']);
      expect(b0.itemIds).toEqual([]); // purezza
    });

    it('addItem non duplica un id già presente', function () {
      var b = B.addItem(B.addItem(B.makeBuild('T', 'fighter'), 'sword'), 'sword');
      expect(b.itemIds).toEqual(['sword']);
    });

    it('addItem ignora un id vuoto', function () {
      var b = B.addItem(B.makeBuild('T', 'fighter'), '   ');
      expect(b.itemIds).toEqual([]);
    });

    it('removeItem toglie l\'id indicato', function () {
      var b = B.addItem(B.addItem(B.makeBuild('T', 'fighter'), 'sword'), 'bow');
      expect(B.removeItem(b, 'sword').itemIds).toEqual(['bow']);
    });

    it('addSpell/removeSpell funzionano come per gli oggetti', function () {
      var b = B.addSpell(B.makeBuild('T', 'wizard'), 'fireball');
      expect(b.spellIds).toEqual(['fireball']);
      expect(B.addSpell(b, 'fireball').spellIds).toEqual(['fireball']); // no doppioni
      expect(B.removeSpell(b, 'fireball').spellIds).toEqual([]);
    });
  });

  describe('Build — rinomina e classe', function () {
    it('rename aggiorna il nome (trim) e mantiene quello vecchio se vuoto', function () {
      var b = B.makeBuild('Vecchio', 'fighter');
      expect(B.rename(b, '  Nuovo  ').name).toBe('Nuovo');
      expect(B.rename(b, '   ').name).toBe('Vecchio');
    });

    it('setClass aggiorna la classe (trim) senza mutare l\'originale', function () {
      var b = B.makeBuild('T', 'fighter');
      expect(B.setClass(b, '  wizard ').clazz).toBe('wizard');
      expect(b.clazz).toBe('fighter');
    });
  });

  describe('Build — interrogazioni (hasItem/hasSpell)', function () {
    it('hasItem/hasSpell riconoscono la presenza (con trim)', function () {
      var b = B.addSpell(B.addItem(B.makeBuild('T', 'wizard'), 'sword'), 'fireball');
      expect(B.hasItem(b, '  sword ')).toBe(true);
      expect(B.hasItem(b, 'bow')).toBe(false);
      expect(B.hasSpell(b, 'fireball')).toBe(true);
      expect(B.hasSpell(b, 'cure')).toBe(false);
    });
  });

  describe('Assistente Build — valutazione (evaluateBuild)', function () {
    it('build vuota: punteggio 0 e verdetto « empty »', function () {
      var r = evalB(B.makeBuild('Vuota', 'fighter'));
      expect(r.score).toBe(0);
      expect(r.verdict).toBe('empty');
      expect(r.itemCount).toBe(0);
      expect(r.spellCount).toBe(0);
      expect(r.attunementUsed).toBe(0);
      expect(r.attunementMax).toBe(B.MAX_ATTUNEMENT);
      expect(codes(r.suggestions)).toContain('empty');
    });

    it('conta solo oggetti/incantesimi riconosciuti (ignora id ignoti)', function () {
      var r = evalB(build('T', 'fighter', { itemIds: ['sword', 'nope'], spellIds: ['fireball', 'ghost'] }));
      expect(r.itemCount).toBe(1);
      expect(r.spellCount).toBe(1);
    });

    it('supera il budget di sintonia (attune-over)', function () {
      var r = evalB(build('T', 'fighter', { itemIds: ['ring1', 'ring2', 'cloak', 'amulet'] }));
      expect(r.attunementUsed).toBe(4);
      expect(codes(r.warnings)).toContain('attune-over');
      expect(byCode(r.warnings, 'attune-over').used).toBe(4);
      expect(byCode(r.warnings, 'attune-over').max).toBe(B.MAX_ATTUNEMENT);
      expect(r.score).toBe(80);
      expect(r.verdict).toBe('great');
    });

    it('sintonia nei limiti + arma: positivi attune-ok e has-weapon', function () {
      var r = evalB(build('T', 'fighter', { itemIds: ['ring1', 'sword'] }));
      expect(r.attunementUsed).toBe(1);
      expect(codes(r.positives)).toContain('attune-ok');
      expect(codes(r.positives)).toContain('has-weapon');
      expect(r.warnings).toHaveLength(0);
      expect(r.score).toBe(100);
      expect(r.verdict).toBe('great');
    });

    it('segnala doppioni di slot unici (armatura e scudo)', function () {
      var armor = evalB(build('T', 'fighter', { itemIds: ['plate', 'plate2', 'sword'] }));
      expect(codes(armor.warnings)).toContain('dup-slot');
      expect(byCode(armor.warnings, 'dup-slot').type).toBe('armor');
      expect(byCode(armor.warnings, 'dup-slot').count).toBe(2);
      expect(armor.score).toBe(90);

      var shield = evalB(build('T', 'fighter', { itemIds: ['shield1', 'shield2', 'sword'] }));
      expect(byCode(shield.warnings, 'dup-slot').type).toBe('shield');
    });

    it('incantesimi su classe non incantatrice (noncaster-spells)', function () {
      var r = evalB(build('T', 'fighter', { itemIds: ['sword'], spellIds: ['fireball'] }));
      expect(codes(r.warnings)).toContain('noncaster-spells');
      expect(byCode(r.warnings, 'noncaster-spells').clazz).toBe('fighter');
      expect(r.score).toBe(88);
    });

    it('incantatore senza incantesimi (caster-no-spells)', function () {
      var r = evalB(build('T', 'wizard', { itemIds: ['sword'] }));
      expect(r.isCaster).toBe(true);
      expect(codes(r.suggestions)).toContain('caster-no-spells');
      expect(byCode(r.suggestions, 'caster-no-spells').clazz).toBe('wizard');
      expect(r.score).toBe(92);
    });

    it('incantesimi della classe: positivo spells-onclass', function () {
      var r = evalB(build('T', 'wizard', { spellIds: ['fireball'] }));
      expect(codes(r.positives)).toContain('spells-onclass');
      expect(byCode(r.positives, 'spells-onclass').count).toBe(1);
      expect(r.score).toBe(100);
    });

    it('incantesimi fuori classe: warning spells-offclass', function () {
      var r = evalB(build('T', 'wizard', { spellIds: ['cure'] }));
      expect(codes(r.warnings)).toContain('spells-offclass');
      expect(byCode(r.warnings, 'spells-offclass').count).toBe(1);
      expect(r.score).toBe(96);
    });

    it('classe non scelta (no-class)', function () {
      var r = evalB(build('T', '', { itemIds: ['sword'] }));
      expect(r.isCaster).toBe(false);
      expect(codes(r.suggestions)).toContain('no-class');
      expect(r.score).toBe(94);
    });

    it('nessun modo di attaccare (no-offense)', function () {
      var r = evalB(build('T', 'fighter', { itemIds: ['potion'] }));
      expect(codes(r.suggestions)).toContain('no-offense');
      expect(codes(r.positives)).not.toContain('has-weapon');
    });

    it('troppi oggetti leggendari/artefatti (too-legendary)', function () {
      var r = evalB(build('T', 'fighter', { itemIds: ['relic', 'relic2', 'relic3', 'sword'] }));
      expect(codes(r.warnings)).toContain('too-legendary');
      expect(byCode(r.warnings, 'too-legendary').count).toBe(3);
      expect(r.score).toBe(94);
    });

    it('build problematica: verdetto « review » con punteggio basso', function () {
      var r = evalB(build('Caos', 'fighter', {
        itemIds: ['plate', 'plate2', 'shield1', 'shield2', 'ring1', 'ring2', 'cloak', 'amulet', 'relic', 'relic2', 'relic3'],
        spellIds: ['fireball', 'cure']
      }));
      expect(r.itemCount).toBe(11);
      expect(r.spellCount).toBe(2);
      expect(r.attunementUsed).toBe(4);
      expect(r.score).toBe(50);
      expect(r.verdict).toBe('review');
    });

    it('non muta la build originale (funzione pura)', function () {
      var b = build('T', 'fighter', { itemIds: ['sword'] });
      evalB(b);
      expect(b.itemIds).toEqual(['sword']);
      expect(b.clazz).toBe('fighter');
    });
  });
})();
