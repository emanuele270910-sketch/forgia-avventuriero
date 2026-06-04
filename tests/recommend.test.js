/*
 * recommend.test.js — Motore di raccomandazione (Assistente Build).
 * Verifica: tetto di rarità per livello, livello massimo di incantesimo per
 * classe, vincoli generali (max 6 oggetti, budget sintonia <= 3, niente
 * artefatti), coerenza per classe, incantesimi suggeriti, e i punteggi di
 * affinità degli oggetti rispetto alla classe.
 */
(function () {
  'use strict';

  var data = { items: T.items, spells: T.spells };
  var recommendBuild = T.recommendBuild;
  var scoreItemForBuild = T.scoreItemForBuild;
  var maxSpellLevelFor = T.maxSpellLevelFor;
  var rarityCapOrderForLevel = T.rarityCapOrderForLevel;
  var RARITY_BY_ID = T.RARITY_BY_ID;

  function rarityOrder(id) { return RARITY_BY_ID[id].order; }
  function build(clazz, level, abilities) {
    return recommendBuild({ clazz: clazz, level: level, abilities: abilities || {} }, data);
  }
  function every(list, pred) {
    for (var i = 0; i < list.length; i++) { if (!pred(list[i])) { return false; } }
    return true;
  }
  function findItem(id) {
    return data.items.filter(function (i) { return i.id === id; })[0];
  }

  describe('Tetto di rarità per livello', function () {
    it('scala con il livello del personaggio', function () {
      expect(rarityCapOrderForLevel(3)).toBe(1);
      expect(rarityCapOrderForLevel(5)).toBe(2);
      expect(rarityCapOrderForLevel(11)).toBe(3);
      expect(rarityCapOrderForLevel(17)).toBe(4);
      expect(rarityCapOrderForLevel(20)).toBe(4);
    });
  });

  describe('Livello massimo di incantesimo per classe', function () {
    it('incantatori pieni (mago)', function () {
      expect(maxSpellLevelFor('wizard', 1)).toBe(1);
      expect(maxSpellLevelFor('wizard', 5)).toBe(3);
      expect(maxSpellLevelFor('wizard', 20)).toBe(9);
    });
    it('semi-incantatori (paladino)', function () {
      expect(maxSpellLevelFor('paladin', 1)).toBe(0);
      expect(maxSpellLevelFor('paladin', 2)).toBe(1);
      expect(maxSpellLevelFor('paladin', 5)).toBe(2);
    });
    it('il ranger al 17° livello arriva al 5° livello di incantesimo', function () {
      expect(maxSpellLevelFor('ranger', 17)).toBe(5);
    });
    it('i non incantatori (guerriero) non lanciano incantesimi', function () {
      expect(maxSpellLevelFor('fighter', 5)).toBe(0);
    });
  });

  describe('recommendBuild — vincoli generali', function () {
    it('una classe non valida restituisce valid=false', function () {
      expect(build('inesistente', 5).valid).toBe(false);
    });
    it('non raccomanda mai più di 6 oggetti', function () {
      expect(build('fighter', 20).items.length).toBeLessThanOrEqual(6);
    });
    it('non supera il budget di sintonia (3) e lo conteggia con precisione', function () {
      var r = build('wizard', 20);
      expect(r.attunementUsed).toBeLessThanOrEqual(3);
      var attuned = r.items.filter(function (p) { return p.attune; }).length;
      expect(r.attunementUsed).toBe(attuned);
    });
    it('non raccomanda artefatti nemmeno al 20° livello', function () {
      var r = build('fighter', 20);
      expect(every(r.items, function (p) { return p.item.rarity !== 'artifact'; })).toBe(true);
    });
  });

  describe('recommendBuild — coerenza degli oggetti per classe', function () {
    it('il guerriero al 3° livello riceve solo rarità entro il tetto', function () {
      var r = build('fighter', 3);
      expect(r.items.length).toBeGreaterThan(0);
      expect(every(r.items, function (p) { return rarityOrder(p.item.rarity) <= 1; })).toBe(true);
    });
    it('il guerriero non riceve bacchette/bastoni (oggetti da incantatore)', function () {
      var r = build('fighter', 12);
      var casterImpl = ['wand', 'staff', 'rod'];
      expect(every(r.items, function (p) { return casterImpl.indexOf(p.item.type) === -1; })).toBe(true);
    });
    it('il mago non riceve armi, armature o scudi', function () {
      var r = build('wizard', 10);
      var martial = ['weapon', 'armor', 'shield'];
      expect(r.items.length).toBeGreaterThan(0);
      expect(every(r.items, function (p) { return martial.indexOf(p.item.type) === -1; })).toBe(true);
    });
  });

  describe('recommendBuild — incantesimi suggeriti', function () {
    it('il guerriero non riceve incantesimi e ha nota "noncaster"', function () {
      var r = build('fighter', 5);
      expect(r.spells.length).toBe(0);
      expect(r.spellNote).toBe('noncaster');
    });
    it('il paladino al 1° livello non ha slot e ha nota "noslots"', function () {
      var r = build('paladin', 1);
      expect(r.maxSpellLevel).toBe(0);
      expect(r.spellNote).toBe('noslots');
    });
    it('il mago al 5° livello riceve solo incantesimi di livello <= 3 e della sua classe', function () {
      var r = build('wizard', 5);
      expect(r.spells.length).toBeGreaterThan(0);
      expect(every(r.spells, function (p) { return p.spell.level <= 3; })).toBe(true);
      expect(every(r.spells, function (p) { return p.spell.classes.indexOf('wizard') !== -1; })).toBe(true);
    });
  });

  describe('scoreItemForBuild — sinergia con la classe', function () {
    it('Headband of Intellect vale più per il mago che per il barbaro', function () {
      var headband = findItem('headband-of-intellect');
      var wiz = scoreItemForBuild(headband, { clazz: 'wizard' }).score;
      var bar = scoreItemForBuild(headband, { clazz: 'barbarian' }).score;
      expect(wiz).toBeGreaterThan(bar);
    });
    it('Gauntlets of Ogre Power valgono più per il guerriero che per il mago', function () {
      var gauntlets = findItem('gauntlets-of-ogre-power');
      var fig = scoreItemForBuild(gauntlets, { clazz: 'fighter' }).score;
      var wiz = scoreItemForBuild(gauntlets, { clazz: 'wizard' }).score;
      expect(fig).toBeGreaterThan(wiz);
    });
    it('le armi sono escluse a priori per le classi senza attacchi d\'arma (mago)', function () {
      var weapon = data.items.filter(function (i) { return i.type === 'weapon'; })[0];
      expect(scoreItemForBuild(weapon, { clazz: 'wizard' }).score).toBeLessThan(0);
    });
  });
})();
