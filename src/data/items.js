/*
 * items.js — Database oggetti magici (basato sull'SRD 5.1, contenuto open).
 * Nomi canonici in inglese, descrizioni in italiano (parafrasate).
 *
 * Schema di ogni oggetto:
 *   id            string  univoco (kebab-case)
 *   name          string  nome canonico inglese
 *   type          string  weapon|armor|shield|wondrous|ring|rod|staff|wand|potion|scroll
 *   rarity        string  common|uncommon|rare|very-rare|legendary|artifact
 *   attunement    bool
 *   attunementNote string facoltativo ("da un incantatore", ...)
 *   bonus         object  campi strutturati (vedi sotto), tutti facoltativi:
 *                   weaponBonus, acBonus, saveBonus, abilityCheckBonus  (numeri)
 *                   setAbility   { ability:'str', score:19 }
 *                   abilityBonus { con:2 }
 *                   spellAttackBonus, spellSaveDcBonus (numeri)
 *                   resist       ['fire', ...]
 *                   extra        string (effetto sintetico)
 *   tags          string[]
 *   descrizione   string  italiano
 *   source        string
 */
(function (root, factory) {
  'use strict';
  var data = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = data; }
  if (root) { root.DND = root.DND || {}; root.DND.items = data; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return [
    // ---------------- COMUNI ----------------
    {
      id: "potion-of-healing", name: "Potion of Healing", type: "potion", rarity: "common",
      attunement: false, bonus: { extra: "Recupera 2d4+2 punti ferita" },
      tags: ["cura", "consumabile"],
      descrizione: "Bevendo questa pozione dal liquido rosso scintillante recuperi 2d4+2 punti ferita. Berla richiede un'azione.",
      source: "SRD"
    },
    {
      id: "potion-of-climbing", name: "Potion of Climbing", type: "potion", rarity: "common",
      attunement: false, bonus: { extra: "Velocità di scalata pari al movimento per 1 ora" },
      tags: ["movimento", "consumabile"],
      descrizione: "Per 1 ora ottieni una velocità di scalata pari alla tua velocità di base e vantaggio alle prove per scalare.",
      source: "SRD"
    },
    {
      id: "spell-scroll-cantrip", name: "Spell Scroll (Trucchetto)", type: "scroll", rarity: "common",
      attunement: false, bonus: { extra: "Lancia il trucchetto inscritto senza componenti" },
      tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un trucchetto. Lanciarlo non consuma slot e non richiede componenti materiali; la pergamena si consuma all'uso.",
      source: "SRD"
    },

    // ---------------- NON COMUNI ----------------
    {
      id: "weapon-plus-1", name: "Weapon, +1", type: "weapon", rarity: "uncommon",
      attunement: false, bonus: { weaponBonus: 1 },
      tags: ["arma", "bonus"],
      descrizione: "Ottieni un bonus di +1 ai tiri per colpire e ai danni effettuati con quest'arma magica.",
      source: "SRD"
    },
    {
      id: "shield-plus-1", name: "Shield, +1", type: "shield", rarity: "uncommon",
      attunement: false, bonus: { acBonus: 1 },
      tags: ["scudo", "difesa"],
      descrizione: "Mentre impugni questo scudo ottieni un bonus di +1 alla Classe Armatura, oltre al normale bonus dello scudo.",
      source: "SRD"
    },
    {
      id: "bag-of-holding", name: "Bag of Holding", type: "wondrous", rarity: "uncommon",
      attunement: false, bonus: { extra: "Spazio extradimensionale: 250 kg, 1,8 metri cubi" },
      tags: ["contenitore", "utilità"],
      descrizione: "Questa borsa apre su uno spazio extradimensionale capace di contenere fino a 250 kg senza superare i 18 kg di peso esterno.",
      source: "SRD"
    },
    {
      id: "cloak-of-protection", name: "Cloak of Protection", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { acBonus: 1, saveBonus: 1 },
      tags: ["difesa", "tiri salvezza"],
      descrizione: "Ottieni un bonus di +1 alla Classe Armatura e ai tiri salvezza mentre indossi questo mantello.",
      source: "SRD"
    },
    {
      id: "gauntlets-of-ogre-power", name: "Gauntlets of Ogre Power", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { setAbility: { ability: "str", score: 19 } },
      tags: ["forza", "melee"],
      descrizione: "Il tuo punteggio di Forza diventa 19 mentre indossi questi guanti, se non è già superiore.",
      source: "SRD"
    },
    {
      id: "headband-of-intellect", name: "Headband of Intellect", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { setAbility: { ability: "int", score: 19 } },
      tags: ["intelligenza", "incantatore"],
      descrizione: "Il tuo punteggio di Intelligenza diventa 19 mentre indossi questa fascia, se non è già superiore.",
      source: "SRD"
    },
    {
      id: "bracers-of-archery", name: "Bracers of Archery", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "+2 ai danni con armi a distanza con cui sei competente" },
      tags: ["distanza", "danni"],
      descrizione: "Ottieni competenza con archi lunghi e corti e un bonus di +2 ai danni con qualsiasi arma a distanza.",
      source: "SRD"
    },
    {
      id: "boots-of-striding-and-springing", name: "Boots of Striding and Springing", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "Velocità 9 m e salto triplicato" },
      tags: ["movimento"],
      descrizione: "La tua velocità diventa 9 metri se inferiore e la distanza dei tuoi salti è triplicata.",
      source: "SRD"
    },
    {
      id: "cloak-of-elvenkind", name: "Cloak of Elvenkind", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "Vantaggio a Furtività, svantaggio a chi ti percepisce" },
      tags: ["furtività"],
      descrizione: "Le prove per percepirti hanno svantaggio e tu hai vantaggio alle prove di Destrezza (Furtività) per nasconderti.",
      source: "SRD"
    },
    {
      id: "goggles-of-night", name: "Goggles of Night", type: "wondrous", rarity: "uncommon",
      attunement: false, bonus: { extra: "Scurovisione 18 m" },
      tags: ["percezione"],
      descrizione: "Indossando questi occhiali ottieni scurovisione fino a 18 metri; nell'oscurità vedi in scala di grigi.",
      source: "SRD"
    },
    {
      id: "pearl-of-power", name: "Pearl of Power", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "Recupera uno slot incantesimo di livello max 3°" },
      tags: ["incantatore", "slot"],
      descrizione: "Con un'azione puoi recuperare uno slot incantesimo speso di livello pari o inferiore al 3°. Utilizzabile una volta al giorno.",
      source: "SRD"
    },
    {
      id: "wand-of-magic-missiles", name: "Wand of Magic Missiles", type: "wand", rarity: "uncommon",
      attunement: false, bonus: { extra: "7 cariche: lancia Magic Missile" },
      tags: ["incantatore", "attacco"],
      descrizione: "Ha 7 cariche; spendendone una o più lanci Magic Missile a livelli superiori. Recupera 1d6+1 cariche all'alba.",
      source: "SRD"
    },
    {
      id: "immovable-rod", name: "Immovable Rod", type: "rod", rarity: "uncommon",
      attunement: false, bonus: { extra: "Si blocca nello spazio: regge fino a 3.600 kg" },
      tags: ["utilità"],
      descrizione: "Premendo il pulsante la bacchetta resta fissata nello spazio, sostenendo fino a 3.600 kg finché non viene disattivata.",
      source: "SRD"
    },
    {
      id: "stone-of-good-luck", name: "Stone of Good Luck (Luckstone)", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { saveBonus: 1, abilityCheckBonus: 1 },
      tags: ["fortuna", "tiri salvezza"],
      descrizione: "Mentre porti con te questa gemma ottieni un bonus di +1 alle prove di caratteristica e ai tiri salvezza.",
      source: "SRD"
    },
    {
      id: "ring-of-mind-shielding", name: "Ring of Mind Shielding", type: "ring", rarity: "uncommon",
      attunement: true, bonus: { extra: "Immune a lettura del pensiero e a magie che rivelano allineamento" },
      tags: ["protezione mentale"],
      descrizione: "Sei immune agli effetti che leggono i tuoi pensieri, determinano se menti o rivelano allineamento ed emozioni.",
      source: "SRD"
    },
    {
      id: "slippers-of-spider-climbing", name: "Slippers of Spider Climbing", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "Scali superfici e soffitti con le mani libere" },
      tags: ["movimento"],
      descrizione: "Puoi muoverti su superfici verticali e a testa in giù sui soffitti lasciando le mani libere, con velocità di scalata pari al movimento.",
      source: "SRD"
    },
    {
      id: "mithral-armor", name: "Mithral Armor", type: "armor", rarity: "uncommon",
      attunement: false, bonus: { extra: "Nessuno svantaggio a Furtività; ignora requisito di Forza" },
      tags: ["armatura", "furtività"],
      descrizione: "Versione leggera di un'armatura media o pesante: non impone svantaggio alle prove di Furtività né requisiti di Forza.",
      source: "SRD"
    },
    {
      id: "wand-of-the-war-mage-plus-1", name: "Wand of the War Mage, +1", type: "wand", rarity: "uncommon",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { spellAttackBonus: 1, extra: "Ignori la copertura leggera contro i tuoi incantesimi" },
      tags: ["incantatore", "attacco magico"],
      descrizione: "Mentre la impugni ottieni un bonus di +1 ai tiri per colpire degli incantesimi e ignori la copertura leggera dei bersagli.",
      source: "SRD"
    },
    {
      id: "potion-of-greater-healing", name: "Potion of Greater Healing", type: "potion", rarity: "uncommon",
      attunement: false, bonus: { extra: "Recupera 4d4+4 punti ferita" },
      tags: ["cura", "consumabile"],
      descrizione: "Bevendo questa pozione recuperi 4d4+4 punti ferita.",
      source: "SRD"
    },
    {
      id: "eyes-of-the-eagle", name: "Eyes of the Eagle", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "Vantaggio a Percezione basata sulla vista" },
      tags: ["percezione"],
      descrizione: "Queste lenti ti concedono vantaggio alle prove di Saggezza (Percezione) basate sulla vista; distingui i dettagli a 1,5 km.",
      source: "SRD"
    },
    {
      id: "hat-of-disguise", name: "Hat of Disguise", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { extra: "Lancia Disguise Self a volontà" },
      tags: ["illusione", "inganno"],
      descrizione: "Indossandolo puoi lanciare Disguise Self a volontà; l'illusione si adatta a ciò che indossi e impugni.",
      source: "SRD"
    },

    // ---------------- RARI ----------------
    {
      id: "weapon-plus-2", name: "Weapon, +2", type: "weapon", rarity: "rare",
      attunement: false, bonus: { weaponBonus: 2 },
      tags: ["arma", "bonus"],
      descrizione: "Ottieni un bonus di +2 ai tiri per colpire e ai danni effettuati con quest'arma magica.",
      source: "SRD"
    },
    {
      id: "armor-plus-1", name: "Armor, +1", type: "armor", rarity: "rare",
      attunement: false, bonus: { acBonus: 1 },
      tags: ["armatura", "difesa"],
      descrizione: "Ottieni un bonus di +1 alla Classe Armatura mentre indossi questa armatura.",
      source: "SRD"
    },
    {
      id: "ring-of-protection", name: "Ring of Protection", type: "ring", rarity: "rare",
      attunement: true, bonus: { acBonus: 1, saveBonus: 1 },
      tags: ["difesa", "tiri salvezza"],
      descrizione: "Ottieni un bonus di +1 alla Classe Armatura e a tutti i tiri salvezza mentre indossi questo anello.",
      source: "SRD"
    },
    {
      id: "amulet-of-health", name: "Amulet of Health", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { setAbility: { ability: "con", score: 19 } },
      tags: ["costituzione", "punti ferita"],
      descrizione: "Il tuo punteggio di Costituzione diventa 19 mentre indossi questo amuleto, se non è già superiore.",
      source: "SRD"
    },
    {
      id: "belt-of-hill-giant-strength", name: "Belt of Hill Giant Strength", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { setAbility: { ability: "str", score: 21 } },
      tags: ["forza", "melee"],
      descrizione: "Il tuo punteggio di Forza diventa 21 mentre indossi questa cintura, se non è già superiore.",
      source: "SRD"
    },
    {
      id: "bracers-of-defense", name: "Bracers of Defense", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { acBonus: 2, extra: "Solo se non indossi armatura né scudo" },
      tags: ["difesa", "incantatore", "monaco"],
      descrizione: "Se non indossi armatura né impugni uno scudo, ottieni un bonus di +2 alla Classe Armatura.",
      source: "SRD"
    },
    {
      id: "flame-tongue", name: "Flame Tongue", type: "weapon", rarity: "rare",
      attunement: true, bonus: { extra: "+2d6 danni da fuoco mentre è infiammata" },
      tags: ["arma", "fuoco"],
      descrizione: "Con un'azione bonus puoi far divampare la lama, infliggendo 2d6 danni da fuoco aggiuntivi a ogni colpo.",
      source: "SRD"
    },
    {
      id: "sun-blade", name: "Sun Blade", type: "weapon", rarity: "rare",
      attunement: true, bonus: { weaponBonus: 2, extra: "Danni radiosi; danni extra ai non morti" },
      tags: ["arma", "radioso", "non morti"],
      descrizione: "Una lama di pura luce solare: +2 a colpire e danni, infligge danni radiosi e colpisce più duramente i non morti.",
      source: "SRD"
    },
    {
      id: "boots-of-speed", name: "Boots of Speed", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { extra: "Raddoppia la velocità; gli attacchi d'opportunità contro di te hanno svantaggio" },
      tags: ["movimento"],
      descrizione: "Con un'azione bonus puoi raddoppiare la tua velocità per 10 minuti; gli attacchi di opportunità contro di te hanno svantaggio.",
      source: "SRD"
    },
    {
      id: "cloak-of-displacement", name: "Cloak of Displacement", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { extra: "Gli attacchi contro di te hanno svantaggio" },
      tags: ["difesa", "illusione"],
      descrizione: "L'immagine proiettata fa sì che gli attacchi contro di te abbiano svantaggio, finché non subisci danni.",
      source: "SRD"
    },
    {
      id: "winged-boots", name: "Winged Boots", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { extra: "Velocità di volo pari al movimento" },
      tags: ["volo", "movimento"],
      descrizione: "Puoi volare con velocità pari al tuo movimento fino a 4 ore, anche frazionate, ricaricando 2 ore al giorno.",
      source: "SRD"
    },
    {
      id: "ring-of-free-action", name: "Ring of Free Action", type: "ring", rarity: "rare",
      attunement: true, bonus: { extra: "Immune a terreno difficile e a effetti che bloccano/rallentano" },
      tags: ["movimento", "libertà"],
      descrizione: "Il terreno difficile non ti costa movimento extra e non puoi essere paralizzato o trattenuto magicamente.",
      source: "SRD"
    },
    {
      id: "ring-of-resistance", name: "Ring of Resistance", type: "ring", rarity: "rare",
      attunement: true, bonus: { resist: ["a scelta"], extra: "Resistenza a un tipo di danno" },
      tags: ["difesa", "resistenza"],
      descrizione: "Ottieni resistenza a un tipo di danno determinato dalla gemma incastonata nell'anello.",
      source: "SRD"
    },
    {
      id: "staff-of-healing", name: "Staff of Healing", type: "staff", rarity: "rare",
      attunement: true, attunementNote: "da bardo, chierico o druido",
      bonus: { extra: "10 cariche: Cure Wounds, Lesser Restoration, Mass Cure Wounds" },
      tags: ["incantatore", "cura"],
      descrizione: "Ha 10 cariche con cui lanciare incantesimi di guarigione come Cure Wounds e Mass Cure Wounds.",
      source: "SRD"
    },
    {
      id: "wand-of-fireballs", name: "Wand of Fireballs", type: "wand", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { extra: "7 cariche: lancia Fireball (3°+)" },
      tags: ["incantatore", "fuoco", "area"],
      descrizione: "Ha 7 cariche; spendendone una o più lanci Fireball a livelli sempre più alti. Recupera 1d6+1 cariche all'alba.",
      source: "SRD"
    },
    {
      id: "wand-of-the-war-mage-plus-2", name: "Wand of the War Mage, +2", type: "wand", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { spellAttackBonus: 2, extra: "Ignori la copertura leggera contro i tuoi incantesimi" },
      tags: ["incantatore", "attacco magico"],
      descrizione: "Mentre la impugni ottieni un bonus di +2 ai tiri per colpire degli incantesimi e ignori la copertura leggera.",
      source: "SRD"
    },
    {
      id: "dagger-of-venom", name: "Dagger of Venom", type: "weapon", rarity: "rare",
      attunement: false, bonus: { weaponBonus: 1, extra: "Una volta al giorno ricopri la lama di veleno (2d10, TS COS)" },
      tags: ["arma", "veleno"],
      descrizione: "Pugnale +1; una volta al giorno puoi rivestirne la lama di veleno che infligge 2d10 danni aggiuntivi e può avvelenare.",
      source: "SRD"
    },
    {
      id: "elven-chain", name: "Elven Chain", type: "armor", rarity: "rare",
      attunement: false, bonus: { acBonus: 1, extra: "Considerata leggera; competenza inclusa" },
      tags: ["armatura", "difesa"],
      descrizione: "Cotta di maglia finissima: +1 alla CA, la indossi come fosse leggera e sei competente anche senza addestramento.",
      source: "SRD"
    },
    {
      id: "necklace-of-fireballs", name: "Necklace of Fireballs", type: "wondrous", rarity: "rare",
      attunement: false, bonus: { extra: "Sfere staccabili che esplodono come Fireball" },
      tags: ["fuoco", "area", "consumabile"],
      descrizione: "Porta diverse sfere: staccandone una e lanciandola crei una Fireball di livello variabile senza tiro per colpire.",
      source: "SRD"
    },

    // ---------------- MOLTO RARI ----------------
    {
      id: "weapon-plus-3", name: "Weapon, +3", type: "weapon", rarity: "very-rare",
      attunement: false, bonus: { weaponBonus: 3 },
      tags: ["arma", "bonus"],
      descrizione: "Ottieni un bonus di +3 ai tiri per colpire e ai danni effettuati con quest'arma magica.",
      source: "SRD"
    },
    {
      id: "armor-plus-2", name: "Armor, +2", type: "armor", rarity: "very-rare",
      attunement: false, bonus: { acBonus: 2 },
      tags: ["armatura", "difesa"],
      descrizione: "Ottieni un bonus di +2 alla Classe Armatura mentre indossi questa armatura.",
      source: "SRD"
    },
    {
      id: "belt-of-fire-giant-strength", name: "Belt of Fire Giant Strength", type: "wondrous", rarity: "very-rare",
      attunement: true, bonus: { setAbility: { ability: "str", score: 25 } },
      tags: ["forza", "melee"],
      descrizione: "Il tuo punteggio di Forza diventa 25 mentre indossi questa cintura, se non è già superiore.",
      source: "SRD"
    },
    {
      id: "frost-brand", name: "Frost Brand", type: "weapon", rarity: "very-rare",
      attunement: true, bonus: { weaponBonus: 0, resist: ["fire"], extra: "+1d6 danni da freddo; resistenza al fuoco" },
      tags: ["arma", "freddo", "resistenza"],
      descrizione: "Infligge 1d6 danni da freddo aggiuntivi, ti concede resistenza al fuoco e può spegnere le fiamme vicine.",
      source: "SRD"
    },
    {
      id: "staff-of-power", name: "Staff of Power", type: "staff", rarity: "very-rare",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { acBonus: 2, saveBonus: 2, spellAttackBonus: 2, weaponBonus: 2, extra: "20 cariche: molti incantesimi offensivi" },
      tags: ["incantatore", "difesa", "attacco magico"],
      descrizione: "Concede +2 a CA, tiri salvezza e tiri per colpire degli incantesimi, e custodisce 20 cariche di incantesimi potenti.",
      source: "SRD"
    },
    {
      id: "staff-of-fire", name: "Staff of Fire", type: "staff", rarity: "very-rare",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { resist: ["fire"], extra: "10 cariche: Burning Hands, Fireball, Wall of Fire" },
      tags: ["incantatore", "fuoco"],
      descrizione: "Ti concede resistenza al fuoco e 10 cariche per lanciare incantesimi di fuoco come Fireball e Wall of Fire.",
      source: "SRD"
    },
    {
      id: "manual-of-gainful-exercise", name: "Manual of Gainful Exercise", type: "wondrous", rarity: "very-rare",
      attunement: false, bonus: { abilityBonus: { str: 2 }, extra: "Aumenta anche il massimo di Forza di 2" },
      tags: ["forza", "permanente"],
      descrizione: "Studiandolo per 48 ore in 6 giorni il tuo punteggio e massimo di Forza aumentano di 2. Il libro poi perde la magia.",
      source: "SRD"
    },
    {
      id: "tome-of-clear-thought", name: "Tome of Clear Thought", type: "wondrous", rarity: "very-rare",
      attunement: false, bonus: { abilityBonus: { int: 2 }, extra: "Aumenta anche il massimo di Intelligenza di 2" },
      tags: ["intelligenza", "permanente", "incantatore"],
      descrizione: "Studiandolo per 48 ore in 6 giorni il tuo punteggio e massimo di Intelligenza aumentano di 2.",
      source: "SRD"
    },
    {
      id: "tome-of-leadership-and-influence", name: "Tome of Leadership and Influence", type: "wondrous", rarity: "very-rare",
      attunement: false, bonus: { abilityBonus: { cha: 2 }, extra: "Aumenta anche il massimo di Carisma di 2" },
      tags: ["carisma", "permanente", "incantatore"],
      descrizione: "Studiandolo per 48 ore in 6 giorni il tuo punteggio e massimo di Carisma aumentano di 2.",
      source: "SRD"
    },
    {
      id: "tome-of-understanding", name: "Tome of Understanding", type: "wondrous", rarity: "very-rare",
      attunement: false, bonus: { abilityBonus: { wis: 2 }, extra: "Aumenta anche il massimo di Saggezza di 2" },
      tags: ["saggezza", "permanente", "incantatore"],
      descrizione: "Studiandolo per 48 ore in 6 giorni il tuo punteggio e massimo di Saggezza aumentano di 2.",
      source: "SRD"
    },
    {
      id: "ring-of-regeneration", name: "Ring of Regeneration", type: "ring", rarity: "very-rare",
      attunement: true, bonus: { extra: "Rigeneri 1d6 PF ogni 10 minuti; ricresci arti" },
      tags: ["cura", "rigenerazione"],
      descrizione: "Mentre hai almeno 1 PF rigeneri 1d6 punti ferita ogni 10 minuti e puoi rigenerare arti perduti in poche ore.",
      source: "SRD"
    },
    {
      id: "rod-of-absorption", name: "Rod of Absorption", type: "rod", rarity: "very-rare",
      attunement: true, bonus: { extra: "Assorbi incantesimi a bersaglio singolo e ne riusi l'energia" },
      tags: ["incantatore", "difesa"],
      descrizione: "Con una reazione assorbi un incantesimo diretto solo a te, immagazzinandone i livelli per alimentare i tuoi incantesimi.",
      source: "SRD"
    },
    {
      id: "wand-of-polymorph", name: "Wand of Polymorph", type: "wand", rarity: "very-rare",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { extra: "7 cariche: lancia Polymorph" },
      tags: ["incantatore", "trasmutazione"],
      descrizione: "Ha 7 cariche; spendendone una lanci Polymorph (CD 15). Recupera 1d6+1 cariche all'alba.",
      source: "SRD"
    },

    // ---------------- LEGGENDARI ----------------
    {
      id: "armor-plus-3", name: "Armor, +3", type: "armor", rarity: "legendary",
      attunement: false, bonus: { acBonus: 3 },
      tags: ["armatura", "difesa"],
      descrizione: "Ottieni un bonus di +3 alla Classe Armatura mentre indossi questa armatura.",
      source: "SRD"
    },
    {
      id: "belt-of-storm-giant-strength", name: "Belt of Storm Giant Strength", type: "wondrous", rarity: "legendary",
      attunement: true, bonus: { setAbility: { ability: "str", score: 29 } },
      tags: ["forza", "melee"],
      descrizione: "Il tuo punteggio di Forza diventa 29 mentre indossi questa cintura, se non è già superiore.",
      source: "SRD"
    },
    {
      id: "holy-avenger", name: "Holy Avenger", type: "weapon", rarity: "legendary",
      attunement: true, attunementNote: "da un paladino",
      bonus: { weaponBonus: 3, saveBonus: 1, extra: "+2d10 radiosi contro immondi e non morti; aura di TS" },
      tags: ["arma", "radioso", "paladino"],
      descrizione: "Spada sacra +3: infligge 2d10 danni radiosi a immondi e non morti e crea un'aura che concede bonus ai tiri salvezza agli alleati.",
      source: "SRD"
    },
    {
      id: "robe-of-the-archmagi", name: "Robe of the Archmagi", type: "wondrous", rarity: "legendary",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { spellSaveDcBonus: 2, spellAttackBonus: 2, extra: "CA base 15 + DES; vantaggio ai TS contro magia" },
      tags: ["incantatore", "difesa", "attacco magico"],
      descrizione: "Imposta la CA a 15 + Destrezza, concede vantaggio ai tiri salvezza contro incantesimi e +2 alla CD e ai tiri per colpire degli incantesimi.",
      source: "SRD"
    },
    {
      id: "staff-of-the-magi", name: "Staff of the Magi", type: "staff", rarity: "legendary",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { spellAttackBonus: 2, extra: "50 cariche; assorbi incantesimi; molti incantesimi potenti" },
      tags: ["incantatore", "attacco magico"],
      descrizione: "Bastone leggendario con 50 cariche: lancia decine di incantesimi, assorbe quelli nemici e concede +2 ai tiri per colpire magici.",
      source: "SRD"
    },
    {
      id: "vorpal-sword", name: "Vorpal Sword", type: "weapon", rarity: "legendary",
      attunement: true, bonus: { weaponBonus: 3, extra: "Con un 20 naturale puoi decapitare il bersaglio" },
      tags: ["arma", "critico"],
      descrizione: "Spada +3 che ignora la resistenza ai tagli; con un colpo critico può mozzare la testa di una creatura.",
      source: "SRD"
    },
    {
      id: "defender", name: "Defender", type: "weapon", rarity: "legendary",
      attunement: true, bonus: { weaponBonus: 3, extra: "Puoi trasferire parte del bonus dalla CA per difenderti" },
      tags: ["arma", "difesa"],
      descrizione: "Spada +3 il cui bonus può essere ripartito a ogni turno tra tiri per colpire/danni e Classe Armatura.",
      source: "SRD"
    },
    {
      id: "ring-of-spell-turning", name: "Ring of Spell Turning", type: "ring", rarity: "legendary",
      attunement: true, bonus: { saveBonus: 0, extra: "Vantaggio ai TS contro incantesimi a bersaglio singolo; può rifletterli" },
      tags: ["incantatore", "difesa"],
      descrizione: "Hai vantaggio ai tiri salvezza contro incantesimi e, con un salvezza riuscito su un incantesimo a bersaglio singolo, puoi rifletterlo sul lanciatore.",
      source: "SRD"
    },
    {
      id: "sphere-of-annihilation", name: "Sphere of Annihilation", type: "wondrous", rarity: "legendary",
      attunement: false, bonus: { extra: "Sfera di nulla che disintegra la materia che tocca" },
      tags: ["distruzione", "pericoloso"],
      descrizione: "Una sfera nera di 60 cm di pura distruzione: annienta qualsiasi materia che la attraversa. Controllarla richiede prove di Intelligenza (Arcano).",
      source: "SRD"
    },

    // ================= AGGIUNTE: categorie più scarse =================
    // ---- Comuni ----
    { id: "spell-scroll-1", name: "Spell Scroll (1° livello)", type: "scroll", rarity: "common",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 1° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 1° livello. Lanciarlo non consuma slot né componenti materiali; la pergamena si distrugge all'uso.", source: "SRD" },
    { id: "moon-touched-sword", name: "Moon-Touched Sword", type: "weapon", rarity: "common",
      attunement: false, bonus: { extra: "Emana luce fioca per 4,5 m; conta come magica" }, tags: ["arma", "luce"],
      descrizione: "Nell'oscurità la lama emana luce fioca entro 4,5 metri. È considerata magica per superare resistenze e immunità.", source: "XGtE" },
    { id: "ruby-of-the-war-mage", name: "Ruby of the War Mage", type: "wondrous", rarity: "common",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "Usi un'arma semplice come focus di incantesimo" }, tags: ["incantatore", "focus"],
      descrizione: "Fissata a un'arma semplice, ti permette di usarla come focus per gli incantesimi arcani.", source: "XGtE" },
    { id: "wand-of-pyrotechnics", name: "Wand of Pyrotechnics", type: "wand", rarity: "common",
      attunement: false, bonus: { extra: "7 cariche: piccoli fuochi d'artificio innocui" }, tags: ["utilità", "luce"],
      descrizione: "Ha 7 cariche; spendendone una crei scoppi luminosi e scintille colorate inoffensive. Recupera 1d6+1 cariche all'alba.", source: "XGtE" },
    { id: "staff-of-birdcalls", name: "Staff of Birdcalls", type: "staff", rarity: "common",
      attunement: false, bonus: { extra: "10 cariche: riproduce versi di uccello" }, tags: ["utilità", "suono"],
      descrizione: "Ha 10 cariche con cui riprodurre richiami di uccelli registrati. Una volta vuoto, con un 1 può scoppiare in un volo di corvi illusori.", source: "XGtE" },
    { id: "staff-of-flowers", name: "Staff of Flowers", type: "staff", rarity: "common",
      attunement: false, bonus: { extra: "10 cariche: fa sbocciare un fiore reale" }, tags: ["utilità", "natura"],
      descrizione: "Ha 10 cariche; spendendone una fai sbocciare un fiore vero da un'estremità del bastone. Recupera 1d6+4 cariche all'alba.", source: "XGtE" },
    { id: "enduring-spellbook", name: "Enduring Spellbook", type: "wondrous", rarity: "common",
      attunement: false, bonus: { extra: "Indistruttibile da fuoco, acqua e usura" }, tags: ["incantatore", "utilità"],
      descrizione: "Questo libro degli incantesimi (o altro tomo) non si deteriora con l'età ed è immune a fuoco e immersione in acqua.", source: "XGtE" },
    { id: "bead-of-nourishment", name: "Bead of Nourishment", type: "wondrous", rarity: "common",
      attunement: false, bonus: { extra: "Sostituisce cibo e acqua di un giorno" }, tags: ["consumabile", "utilità"],
      descrizione: "Questa perlina profumata, ingerita, dissolve la fame e ti nutre come un giorno intero di cibo e acqua.", source: "XGtE" },

    // ---- Pozioni ----
    { id: "potion-of-water-breathing", name: "Potion of Water Breathing", type: "potion", rarity: "uncommon",
      attunement: false, bonus: { extra: "Respiri sott'acqua per 1 ora" }, tags: ["consumabile", "movimento"],
      descrizione: "Per 1 ora dopo averla bevuta puoi respirare normalmente sott'acqua. Il liquido verde profuma di mare.", source: "SRD" },
    { id: "potion-of-resistance", name: "Potion of Resistance", type: "potion", rarity: "uncommon",
      attunement: false, bonus: { resist: ["a scelta"], extra: "Resistenza a un tipo di danno per 1 ora" }, tags: ["consumabile", "difesa"],
      descrizione: "Per 1 ora ottieni resistenza a un tipo di danno determinato dalla pozione.", source: "SRD" },
    { id: "potion-of-animal-friendship", name: "Potion of Animal Friendship", type: "potion", rarity: "uncommon",
      attunement: false, bonus: { extra: "Lanci Animal Friendship (CD 13) per 1 ora" }, tags: ["consumabile", "natura"],
      descrizione: "Per 1 ora puoi lanciare a volontà Animal Friendship (CD del tiro salvezza 13) sulle bestie a portata.", source: "SRD" },
    { id: "oil-of-slipperiness", name: "Oil of Slipperiness", type: "potion", rarity: "uncommon",
      attunement: false, bonus: { extra: "Effetto come Freedom of Movement per 8 ore" }, tags: ["consumabile", "movimento"],
      descrizione: "Spalmato sul corpo replica Freedom of Movement per 8 ore; versato a terra crea un'area scivolosa come Grease.", source: "SRD" },
    { id: "potion-of-growth", name: "Potion of Growth", type: "potion", rarity: "uncommon",
      attunement: false, bonus: { extra: "Aumenti di taglia (come Enlarge) per 1d4 ore" }, tags: ["consumabile", "trasmutazione"],
      descrizione: "Per 1d4 ore cresci di una categoria di taglia, come il lato 'ingrandire' dell'incantesimo Enlarge/Reduce.", source: "SRD" },
    { id: "potion-of-heroism", name: "Potion of Heroism", type: "potion", rarity: "rare",
      attunement: false, bonus: { extra: "10 PF temporanei e Bless per 1 ora" }, tags: ["consumabile", "potenziamento"],
      descrizione: "Per 1 ora ottieni 10 punti ferita temporanei e sei sotto l'effetto di Bless (senza concentrazione).", source: "SRD" },
    { id: "potion-of-superior-healing", name: "Potion of Superior Healing", type: "potion", rarity: "rare",
      attunement: false, bonus: { extra: "Recupera 8d4+8 punti ferita" }, tags: ["cura", "consumabile"],
      descrizione: "Bevendo questa pozione recuperi 8d4+8 punti ferita.", source: "SRD" },
    { id: "potion-of-clairvoyance", name: "Potion of Clairvoyance", type: "potion", rarity: "rare",
      attunement: false, bonus: { extra: "Effetto come l'incantesimo Clairvoyance" }, tags: ["consumabile", "divinazione"],
      descrizione: "Bevendola ottieni l'effetto dell'incantesimo Clairvoyance, creando un sensore invisibile di vista o udito.", source: "SRD" },
    { id: "potion-of-gaseous-form", name: "Potion of Gaseous Form", type: "potion", rarity: "rare",
      attunement: false, bonus: { extra: "Diventi nebbia (come Gaseous Form) per 1 ora" }, tags: ["consumabile", "trasmutazione"],
      descrizione: "Per 1 ora, o finché non termini l'effetto, assumi forma gassosa come l'omonimo incantesimo.", source: "SRD" },
    { id: "potion-of-diminution", name: "Potion of Diminution", type: "potion", rarity: "rare",
      attunement: false, bonus: { extra: "Rimpicciolisci (come Reduce) per 1d4 ore" }, tags: ["consumabile", "trasmutazione"],
      descrizione: "Per 1d4 ore diminuisci di una categoria di taglia, come il lato 'rimpicciolire' di Enlarge/Reduce.", source: "SRD" },
    { id: "oil-of-etherealness", name: "Oil of Etherealness", type: "potion", rarity: "rare",
      attunement: false, bonus: { extra: "Entri nel Piano Etereo per 1 ora" }, tags: ["consumabile", "viaggio planare"],
      descrizione: "Spalmato sul corpo ti fa entrare nel Piano Etereo, come l'incantesimo Etherealness, per 1 ora.", source: "SRD" },
    { id: "potion-of-invisibility", name: "Potion of Invisibility", type: "potion", rarity: "very-rare",
      attunement: false, bonus: { extra: "Invisibile per 1 ora o finché attacchi/lanci" }, tags: ["consumabile", "illusione"],
      descrizione: "Per 1 ora diventi invisibile; l'effetto termina se attacchi o lanci un incantesimo.", source: "SRD" },
    { id: "potion-of-speed", name: "Potion of Speed", type: "potion", rarity: "very-rare",
      attunement: false, bonus: { extra: "Effetto come Haste per 1 minuto" }, tags: ["consumabile", "movimento"],
      descrizione: "Per 1 minuto ottieni gli effetti di Haste (senza concentrazione); allo scadere subisci 1 turno di spossatezza.", source: "SRD" },
    { id: "potion-of-flying", name: "Potion of Flying", type: "potion", rarity: "very-rare",
      attunement: false, bonus: { extra: "Velocità di volo pari al movimento per 1 ora" }, tags: ["consumabile", "volo"],
      descrizione: "Per 1 ora ottieni una velocità di volo pari alla tua velocità di base e la capacità di librarti.", source: "SRD" },
    { id: "potion-of-supreme-healing", name: "Potion of Supreme Healing", type: "potion", rarity: "very-rare",
      attunement: false, bonus: { extra: "Recupera 10d4+20 punti ferita" }, tags: ["cura", "consumabile"],
      descrizione: "Bevendo questa pozione recuperi 10d4+20 punti ferita.", source: "SRD" },

    // ---- Pergamene ----
    { id: "spell-scroll-2", name: "Spell Scroll (2° livello)", type: "scroll", rarity: "uncommon",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 2° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 2° livello. Lanciarlo non consuma slot né componenti materiali; la pergamena si distrugge all'uso.", source: "SRD" },
    { id: "spell-scroll-3", name: "Spell Scroll (3° livello)", type: "scroll", rarity: "uncommon",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 3° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 3° livello. Un incantatore non di classe deve superare una prova per usarla.", source: "SRD" },
    { id: "spell-scroll-4", name: "Spell Scroll (4° livello)", type: "scroll", rarity: "rare",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 4° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 4° livello. La pergamena si distrugge all'uso.", source: "SRD" },
    { id: "spell-scroll-5", name: "Spell Scroll (5° livello)", type: "scroll", rarity: "rare",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 5° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 5° livello. La pergamena si distrugge all'uso.", source: "SRD" },
    { id: "spell-scroll-6", name: "Spell Scroll (6° livello)", type: "scroll", rarity: "very-rare",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 6° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 6° livello. La CD per usarla senza averla in lista è 16.", source: "SRD" },
    { id: "spell-scroll-7", name: "Spell Scroll (7° livello)", type: "scroll", rarity: "very-rare",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 7° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 7° livello. La pergamena si distrugge all'uso.", source: "SRD" },
    { id: "spell-scroll-8", name: "Spell Scroll (8° livello)", type: "scroll", rarity: "legendary",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 8° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene un incantesimo di 8° livello. La CD per usarla fuori lista è 18.", source: "SRD" },
    { id: "spell-scroll-9", name: "Spell Scroll (9° livello)", type: "scroll", rarity: "legendary",
      attunement: false, bonus: { extra: "Lancia un incantesimo di 9° livello inscritto" }, tags: ["incantesimo", "consumabile"],
      descrizione: "Contiene il più potente degli incantesimi, di 9° livello. La CD per usarla fuori lista è 19.", source: "SRD" },

    // ---- Anelli ----
    { id: "ring-of-swimming", name: "Ring of Swimming", type: "ring", rarity: "uncommon",
      attunement: false, bonus: { extra: "Velocità di nuoto di 12 m" }, tags: ["movimento"],
      descrizione: "Mentre indossi questo anello hai una velocità di nuoto di 12 metri.", source: "SRD" },
    { id: "ring-of-jumping", name: "Ring of Jumping", type: "ring", rarity: "uncommon",
      attunement: true, bonus: { extra: "Lanci Jump su te stesso come azione bonus" }, tags: ["movimento"],
      descrizione: "Puoi lanciare Jump su te stesso a volontà con un'azione bonus, triplicando la distanza dei tuoi salti.", source: "SRD" },
    { id: "ring-of-water-walking", name: "Ring of Water Walking", type: "ring", rarity: "uncommon",
      attunement: false, bonus: { extra: "Cammini su superfici liquide" }, tags: ["movimento"],
      descrizione: "Puoi muoverti sulla superficie di liquidi (acqua, fango, lava) come fosse terreno solido.", source: "SRD" },
    { id: "ring-of-warmth", name: "Ring of Warmth", type: "ring", rarity: "uncommon",
      attunement: true, bonus: { resist: ["cold"], extra: "Sopporti il freddo intenso fino a -45 °C" }, tags: ["difesa", "resistenza"],
      descrizione: "Ottieni resistenza al freddo e resti a tuo agio in ambienti gelidi fino a -45 °C.", source: "SRD" },
    { id: "ring-of-feather-falling", name: "Ring of Feather Falling", type: "ring", rarity: "rare",
      attunement: true, bonus: { extra: "Nessun danno da caduta; scendi lentamente" }, tags: ["difesa", "movimento"],
      descrizione: "Quando cadi, scendi a 18 metri al round senza subire danni da caduta e atterri in piedi.", source: "SRD" },
    { id: "ring-of-the-ram", name: "Ring of the Ram", type: "ring", rarity: "rare",
      attunement: true, bonus: { extra: "3 cariche: raggio di forza che colpisce e spinge" }, tags: ["attacco", "spinta"],
      descrizione: "Ha 3 cariche; spendendone fino a 3 lanci un colpo di forza a testa d'ariete che infligge danni e spinge il bersaglio.", source: "SRD" },
    { id: "ring-of-spell-storing", name: "Ring of Spell Storing", type: "ring", rarity: "rare",
      attunement: true, bonus: { extra: "Immagazzina fino a 5 livelli di incantesimi" }, tags: ["incantatore", "utilità"],
      descrizione: "Custodisce fino a 5 livelli complessivi di incantesimi, lanciati da chi lo indossa usando i parametri di chi li ha inseriti.", source: "SRD" },
    { id: "ring-of-evasion", name: "Ring of Evasion", type: "ring", rarity: "rare",
      attunement: true, bonus: { extra: "3 cariche: trasforma un TS su Destrezza fallito in riuscito" }, tags: ["difesa", "tiri salvezza"],
      descrizione: "Ha 3 cariche; con una reazione puoi spenderne una per riuscire automaticamente in un tiro salvezza su Destrezza.", source: "SRD" },
    { id: "ring-of-x-ray-vision", name: "Ring of X-ray Vision", type: "ring", rarity: "rare",
      attunement: true, bonus: { extra: "Vedi attraverso materia solida per 1 minuto" }, tags: ["percezione", "divinazione"],
      descrizione: "Con un'azione vedi attraverso oggetti solidi entro 9 metri per 1 minuto; un uso ripetuto comporta spossatezza.", source: "SRD" },
    { id: "ring-of-telekinesis", name: "Ring of Telekinesis", type: "ring", rarity: "very-rare",
      attunement: true, bonus: { extra: "Lanci Telekinesis a volontà" }, tags: ["incantatore", "utilità"],
      descrizione: "Mentre lo indossi puoi lanciare Telekinesis a volontà, ma solo su oggetti non indossati né trasportati.", source: "SRD" },
    { id: "ring-of-invisibility", name: "Ring of Invisibility", type: "ring", rarity: "legendary",
      attunement: true, bonus: { extra: "Diventi invisibile a volontà" }, tags: ["illusione", "furtività"],
      descrizione: "Con un'azione diventi invisibile e resti tale finché non lo decidi tu o finché non attacchi.", source: "SRD" },
    { id: "ring-of-three-wishes", name: "Ring of Three Wishes", type: "ring", rarity: "legendary",
      attunement: false, bonus: { extra: "3 cariche: lancia Wish" }, tags: ["incantatore", "potere assoluto"],
      descrizione: "Custodisce 3 cariche; spendendone una lanci l'incantesimo Wish. Le cariche non si recuperano.", source: "SRD" },

    // ---- Bacchette da combattimento (Rod) ----
    { id: "rod-of-the-pact-keeper-1", name: "Rod of the Pact Keeper, +1", type: "rod", rarity: "uncommon",
      attunement: true, attunementNote: "da un warlock", bonus: { spellAttackBonus: 1, spellSaveDcBonus: 1, extra: "Azione bonus: recuperi uno slot da warlock (1/riposo lungo)" }, tags: ["incantatore", "warlock"],
      descrizione: "Concede +1 ai tiri per colpire e alla CD degli incantesimi da warlock e, una volta per riposo lungo, recupera uno slot incantesimo speso.", source: "SRD" },
    { id: "rod-of-the-pact-keeper-2", name: "Rod of the Pact Keeper, +2", type: "rod", rarity: "rare",
      attunement: true, attunementNote: "da un warlock", bonus: { spellAttackBonus: 2, spellSaveDcBonus: 2, extra: "Azione bonus: recuperi uno slot da warlock (1/riposo lungo)" }, tags: ["incantatore", "warlock"],
      descrizione: "Concede +2 ai tiri per colpire e alla CD degli incantesimi da warlock e recupera uno slot speso una volta per riposo lungo.", source: "SRD" },
    { id: "rod-of-rulership", name: "Rod of Rulership", type: "rod", rarity: "rare",
      attunement: true, bonus: { extra: "Comandi creature entro 36 m (TS Saggezza CD 15)" }, tags: ["ammaliamento", "comando"],
      descrizione: "Con un'azione imponi obbedienza: ogni creatura entro 36 metri deve superare un TS su Saggezza (CD 15) o ti considera alleato per 8 ore.", source: "SRD" },
    { id: "rod-of-security", name: "Rod of Security", type: "rod", rarity: "very-rare",
      attunement: false, bonus: { extra: "Trasporti il gruppo in un paradiso extradimensionale" }, tags: ["utilità", "viaggio planare"],
      descrizione: "Attivandola, tu e fino a 199 creature consenzienti entrate in un rifugio idilliaco dove non passa il tempo e si recupera la salute.", source: "SRD" },
    { id: "rod-of-lordly-might", name: "Rod of Lordly Might", type: "rod", rarity: "legendary",
      attunement: true, bonus: { weaponBonus: 3, extra: "Si trasforma in varie armi e ha poteri multipli" }, tags: ["arma", "versatile"],
      descrizione: "Una mazza +3 che si trasforma in spada, ascia, lancia o rampino e racchiude numerosi poteri attivabili con i suoi pulsanti.", source: "SRD" },
    { id: "rod-of-resurrection", name: "Rod of Resurrection", type: "rod", rarity: "legendary",
      attunement: true, attunementNote: "da chierico, paladino o druido", bonus: { extra: "5 cariche: Heal e Resurrection" }, tags: ["cura", "incantatore"],
      descrizione: "Ha 5 cariche; spendendole lanci Heal (1 carica) o Resurrection (5 cariche). Recupera 1 carica all'alba.", source: "SRD" },

    // ---- Bastoni (Staff) ----
    { id: "staff-of-the-python", name: "Staff of the Python", type: "staff", rarity: "uncommon",
      attunement: true, attunementNote: "da chierico, druido o warlock", bonus: { extra: "Trasforma il bastone in un serpente costrittore obbediente" }, tags: ["evocazione", "natura"],
      descrizione: "Con un'azione bonus lanci a terra il bastone, che diventa un serpente costrittore gigante sotto il tuo controllo.", source: "SRD" },
    { id: "staff-of-the-adder", name: "Staff of the Adder", type: "staff", rarity: "uncommon",
      attunement: true, attunementNote: "da chierico, druido o warlock", bonus: { extra: "La testa diventa un serpente velenoso che morde" }, tags: ["arma", "veleno"],
      descrizione: "Con un'azione bonus la cima del bastone diventa la testa di un serpente velenoso per 1 minuto, con cui puoi attaccare.", source: "SRD" },
    { id: "staff-of-charming", name: "Staff of Charming", type: "staff", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "10 cariche: Charm Person, Command, Comprehend Languages" }, tags: ["incantatore", "ammaliamento"],
      descrizione: "Ha 10 cariche per lanciare Charm Person, Command o Comprehend Languages, e può assorbire incantesimi di ammaliamento diretti a te.", source: "SRD" },
    { id: "staff-of-the-woodlands", name: "Staff of the Woodlands", type: "staff", rarity: "rare",
      attunement: true, attunementNote: "da un druido", bonus: { spellAttackBonus: 2, spellSaveDcBonus: 2, extra: "6 cariche: incantesimi naturali; diventa un albero" }, tags: ["incantatore", "druido", "natura"],
      descrizione: "Concede +2 ai tiri per colpire e alla CD degli incantesimi, 6 cariche di magie naturali e il potere di trasformarsi in un albero.", source: "SRD" },
    { id: "staff-of-swarming-insects", name: "Staff of Swarming Insects", type: "staff", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "10 cariche: Giant Insect, Insect Plague, nube di insetti" }, tags: ["incantatore", "evocazione"],
      descrizione: "Ha 10 cariche per evocare sciami: puoi circondarti di insetti che danneggiano chi si avvicina o lanciare Insect Plague.", source: "SRD" },
    { id: "staff-of-striking", name: "Staff of Striking", type: "staff", rarity: "very-rare",
      attunement: true, bonus: { weaponBonus: 3, extra: "10 cariche: +1d6 forza per carica spesa al colpo" }, tags: ["arma", "forza"],
      descrizione: "Bastone ferrato +3; ha 10 cariche e a ogni colpo puoi spenderne fino a 3 per infliggere +1d6 danni da forza ciascuna.", source: "SRD" },
    { id: "staff-of-frost", name: "Staff of Frost", type: "staff", rarity: "very-rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { resist: ["cold"], extra: "10 cariche: Cone of Cold, Ice Storm, Wall of Ice" }, tags: ["incantatore", "freddo"],
      descrizione: "Ti concede resistenza al freddo e 10 cariche per lanciare incantesimi gelidi come Cone of Cold e Wall of Ice.", source: "SRD" },
    { id: "staff-of-thunder-and-lightning", name: "Staff of Thunder and Lightning", type: "staff", rarity: "very-rare",
      attunement: true, bonus: { weaponBonus: 2, extra: "Poteri di fulmine e tuono, uno per tipo al giorno" }, tags: ["arma", "fulmine", "tuono"],
      descrizione: "Bastone +2 ai tiri per colpire e ai danni che racchiude poteri di scarica elettrica, tuono assordante e una potente esplosione combinata.", source: "SRD" },

    // ---- Bacchette (Wand) ----
    { id: "wand-of-magic-detection", name: "Wand of Magic Detection", type: "wand", rarity: "uncommon",
      attunement: false, bonus: { extra: "3 cariche: lancia Detect Magic" }, tags: ["divinazione", "utilità"],
      descrizione: "Ha 3 cariche; spendendone una lanci Detect Magic. Recupera 1d3 cariche all'alba.", source: "SRD" },
    { id: "wand-of-secrets", name: "Wand of Secrets", type: "wand", rarity: "uncommon",
      attunement: false, bonus: { extra: "3 cariche: rivela porte e trappole nascoste" }, tags: ["divinazione", "utilità"],
      descrizione: "Ha 3 cariche; spendendone una la bacchetta indica una porta o una trappola segreta entro 9 metri.", source: "SRD" },
    { id: "wand-of-web", name: "Wand of Web", type: "wand", rarity: "uncommon",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "7 cariche: lancia Web (CD 15)" }, tags: ["incantatore", "controllo"],
      descrizione: "Ha 7 cariche; spendendone una lanci Web (CD 15). Recupera 1d6+1 cariche all'alba.", source: "SRD" },
    { id: "wand-of-enemy-detection", name: "Wand of Enemy Detection", type: "wand", rarity: "rare",
      attunement: true, bonus: { extra: "7 cariche: percepisci nemici nascosti entro 18 m" }, tags: ["divinazione", "percezione"],
      descrizione: "Ha 7 cariche; attivandola percepisci per 1 minuto la direzione delle creature ostili entro 18 metri, anche invisibili.", source: "SRD" },
    { id: "wand-of-fear", name: "Wand of Fear", type: "wand", rarity: "rare",
      attunement: true, bonus: { extra: "7 cariche: spaventi una o più creature (TS Saggezza)" }, tags: ["ammaliamento", "controllo"],
      descrizione: "Ha 7 cariche; puoi imporre paura a un bersaglio o emettere un cono di terrore che fa fuggire chi fallisce il TS su Saggezza.", source: "SRD" },
    { id: "wand-of-paralysis", name: "Wand of Paralysis", type: "wand", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "7 cariche: paralizzi un bersaglio (TS Costituzione CD 15)" }, tags: ["incantatore", "controllo"],
      descrizione: "Ha 7 cariche; spendendone una un raggio paralizza una creatura che fallisce il TS su Costituzione (CD 15) per 1 minuto.", source: "SRD" },
    { id: "wand-of-lightning-bolts", name: "Wand of Lightning Bolts", type: "wand", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "7 cariche: lancia Lightning Bolt (3°+)" }, tags: ["incantatore", "fulmine", "area"],
      descrizione: "Ha 7 cariche; spendendone una o più lanci Lightning Bolt a livelli superiori. Recupera 1d6+1 cariche all'alba.", source: "SRD" },
    { id: "wand-of-binding", name: "Wand of Binding", type: "wand", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "7 cariche: Hold Monster o vantaggio contro condizioni" }, tags: ["incantatore", "controllo"],
      descrizione: "Ha 7 cariche per lanciare Hold Monster o, spendendone una, ottenere vantaggio contro tentativi di paralisi e immobilizzazione.", source: "SRD" },
    { id: "wand-of-wonder", name: "Wand of Wonder", type: "wand", rarity: "rare",
      attunement: true, attunementNote: "da un incantatore", bonus: { extra: "7 cariche: effetto magico casuale" }, tags: ["incantatore", "caos"],
      descrizione: "Ha 7 cariche; ogni uso scatena un effetto magico casuale (dalla nebbia alle palle di fuoco) imprevedibile anche per chi la impugna.", source: "SRD" },

    // ---- Leggendari (aggiunta) ----
    { id: "deck-of-many-things", name: "Deck of Many Things", type: "wondrous", rarity: "legendary",
      attunement: false, bonus: { extra: "Carte dagli effetti meravigliosi o catastrofici" }, tags: ["caos", "destino", "pericoloso"],
      descrizione: "Pescare una carta da questo mazzo altera il destino: ricchezze, poteri e desideri, ma anche prigionia, morte e nemici planari.", source: "SRD" },

    // ---------------- ARTEFATTO (esempio illustrativo) ----------------
    {
      id: "corona-del-fato", name: "Crown of the Sundered Fate", type: "wondrous", rarity: "artifact",
      attunement: true, attunementNote: "da chi supera una prova di volontà",
      bonus: { acBonus: 2, saveBonus: 2, spellSaveDcBonus: 1, abilityBonus: { cha: 2 }, extra: "Proprietà benefiche e maledizioni latenti del livello artefatto" },
      tags: ["artefatto", "esempio", "potere assoluto"],
      descrizione: "Esempio illustrativo di artefatto: corona forgiata da un destino spezzato che dona enormi poteri (CA, tiri salvezza e magia) ma cela maledizioni che il GM rivela col tempo.",
      source: "Esempio"
    },
    { id: "cuore-del-vulcano", name: "Heart of the Slumbering Volcano", type: "wondrous", rarity: "artifact",
      attunement: true, attunementNote: "da un incantatore",
      bonus: { resist: ["fire"], spellSaveDcBonus: 2, spellAttackBonus: 2, extra: "Domini il fuoco: immunità alle fiamme e poteri vulcanici da artefatto" },
      tags: ["artefatto", "esempio", "fuoco", "potere assoluto"],
      descrizione: "Esempio illustrativo di artefatto: gemma incandescente che racchiude un vulcano dormiente. Concede immunità al fuoco e magie devastanti, ma rischia di consumare chi non ne domina la sete di distruzione.",
      source: "Esempio" },

    // ---------------- AGGIUNTE (update 1.2.0) ----------------
    {
      id: "adamantine-armor", name: "Adamantine Armor", type: "armor", rarity: "uncommon",
      attunement: false, bonus: { extra: "Ogni colpo critico contro di te diventa un colpo normale" },
      tags: ["armatura", "difesa"],
      descrizione: "Quest'armatura è rinforzata con adamantio. Mentre la indossi, ogni colpo critico messo a segno contro di te diventa un colpo normale.",
      source: "SRD"
    },
    {
      id: "boots-of-elvenkind", name: "Boots of Elvenkind", type: "wondrous", rarity: "uncommon",
      attunement: false, bonus: { extra: "Passi silenziosi: vantaggio alla Furtività per muoverti senza far rumore" },
      tags: ["furtività", "movimento"],
      descrizione: "Mentre indossi questi stivali i tuoi passi non fanno alcun rumore: hai vantaggio alle prove di Destrezza (Furtività) basate sul muoverti in silenzio.",
      source: "SRD"
    },
    {
      id: "brooch-of-shielding", name: "Brooch of Shielding", type: "wondrous", rarity: "uncommon",
      attunement: true, bonus: { resist: ["force"], extra: "Immune ai danni di dardo incantato (magic missile)" },
      tags: ["difesa", "protezione"],
      descrizione: "Mentre indossi questa spilla hai resistenza ai danni da forza e sei immune ai danni inflitti dall'incantesimo dardo incantato.",
      source: "SRD"
    },
    {
      id: "mace-of-smiting", name: "Mace of Smiting", type: "weapon", rarity: "rare",
      attunement: false, bonus: { weaponBonus: 1, extra: "+3 a colpire e danni contro i costrutti; con un 20 naturale può distruggere un costrutto" },
      tags: ["arma", "costrutti"],
      descrizione: "Questa mazza concede +1 ai tiri per colpire e ai danni, che diventano +3 contro i costrutti. Con un 20 naturale infligge danni extra e può distruggere un costrutto.",
      source: "SRD"
    },
    {
      id: "periapt-of-wound-closure", name: "Periapt of Wound Closure", type: "wondrous", rarity: "rare",
      attunement: true, bonus: { extra: "Ti stabilizzi automaticamente e raddoppi i PF recuperati con i dadi vita" },
      tags: ["cura", "sopravvivenza"],
      descrizione: "Mentre indossi questo ciondolo ti stabilizzi automaticamente quando sei morente e raddoppi i punti ferita recuperati spendendo i dadi vita.",
      source: "SRD"
    },
    {
      id: "dwarven-thrower", name: "Dwarven Thrower", type: "weapon", rarity: "very-rare",
      attunement: true, attunementNote: "da un nano",
      bonus: { weaponBonus: 3, extra: "Se lanciato torna subito in mano; danni extra, ancora maggiori contro i giganti" },
      tags: ["arma", "lancio", "nani"],
      descrizione: "Questo martello da guerra concede +3 ai tiri per colpire e ai danni. Puoi lanciarlo: dopo l'attacco torna immediatamente nella tua mano e infligge danni extra, devastanti contro i giganti.",
      source: "SRD"
    },

    // ---------------- ARMI CORPO A CORPO (update 1.3.0) ----------------
    {
      id: "sword-of-life-stealing", name: "Sword of Life Stealing", type: "weapon", rarity: "rare",
      attunement: true, bonus: { extra: "Con un 20 naturale: +3d6 danni necrotici e altrettanti PF temporanei" },
      tags: ["arma", "spada", "necrotico"],
      descrizione: "Quando colpisci una creatura con un 20 naturale, la lama ne drena la forza vitale: infligge 3d6 danni necrotici aggiuntivi e tu guadagni un numero di punti ferita temporanei pari ai danni extra.",
      source: "SRD"
    },
    {
      id: "sword-of-wounding", name: "Sword of Wounding", type: "weapon", rarity: "rare",
      attunement: true, bonus: { extra: "Le ferite sanguinano: 1d4 danni a inizio turno e PF massimi ridotti finché non si rimargina" },
      tags: ["arma", "spada", "necrotico"],
      descrizione: "Quando colpisci, il bersaglio subisce una ferita persistente. All'inizio di ogni suo turno perde 1d4 punti ferita per ciascuna ferita e i suoi PF massimi calano, finché non riesce in una prova di Costituzione per fermare l'emorragia.",
      source: "SRD"
    },
    {
      id: "dragon-slayer", name: "Dragon Slayer", type: "weapon", rarity: "rare",
      attunement: true, bonus: { weaponBonus: 1, extra: "+3d6 danni contro i draghi e le creature draconiche" },
      tags: ["arma", "spada", "draghi"],
      descrizione: "Questa spada concede +1 ai tiri per colpire e ai danni. Contro i draghi e le creature draconiche infligge 3d6 danni aggiuntivi a ogni colpo.",
      source: "SRD"
    },
    {
      id: "giant-slayer", name: "Giant Slayer", type: "weapon", rarity: "rare",
      attunement: true, bonus: { weaponBonus: 1, extra: "+2d6 danni contro i giganti, che possono cadere a terra" },
      tags: ["arma", "spada", "ascia", "giganti"],
      descrizione: "Quest'arma (un'ascia o una spada) concede +1 ai tiri per colpire e ai danni. Contro i giganti infligge 2d6 danni aggiuntivi e, se non superano un tiro salvezza, li fa cadere proni.",
      source: "SRD"
    },
    {
      id: "berserker-axe", name: "Berserker Axe", type: "weapon", rarity: "rare",
      attunement: true, bonus: { weaponBonus: 1, extra: "Aumenta i tuoi PF massimi; maledetta: in combattimento puoi essere costretto ad attaccare" },
      tags: ["arma", "ascia", "maledizione"],
      descrizione: "Ascia +1 che aumenta i tuoi punti ferita massimi mentre sei sintonizzato. È però maledetta: quando subisci danni in battaglia puoi essere costretto ad avventarti sul nemico più vicino.",
      source: "SRD"
    },
    {
      id: "mace-of-disruption", name: "Mace of Disruption", type: "weapon", rarity: "rare",
      attunement: true, bonus: { extra: "+2d6 danni radiosi a immondi e non morti; possono essere spaventati o distrutti" },
      tags: ["arma", "mazza", "radioso", "non morti"],
      descrizione: "Contro immondi e non morti questa mazza infligge 2d6 danni radiosi aggiuntivi. Se il colpo li riduce in fin di vita vengono distrutti, altrimenti restano spaventati da te.",
      source: "SRD"
    },
    {
      id: "sword-of-sharpness", name: "Sword of Sharpness", type: "weapon", rarity: "very-rare",
      attunement: true, bonus: { extra: "Danni massimi agli oggetti; con un 20 naturale +4d6 da taglio e può amputare un arto" },
      tags: ["arma", "spada", "taglio"],
      descrizione: "Lama straordinariamente affilata: contro gli oggetti i dadi di danno sono sempre al massimo. Con un 20 naturale infliggi 4d6 danni da taglio aggiuntivi e puoi mozzare di netto un arto del bersaglio.",
      source: "SRD"
    },
    {
      id: "nine-lives-stealer", name: "Nine Lives Stealer", type: "weapon", rarity: "very-rare",
      attunement: true, bonus: { weaponBonus: 2, extra: "Con un colpo critico può uccidere all'istante un bersaglio sotto i 100 PF (cariche limitate)" },
      tags: ["arma", "spada", "morte"],
      descrizione: "Spada +2 che intrappola le anime. Con un colpo critico contro una creatura che ha meno di 100 punti ferita, questa deve superare un tiro salvezza o morire all'istante. Dispone di un numero limitato di cariche.",
      source: "SRD"
    },
    {
      id: "dancing-sword", name: "Dancing Sword", type: "weapon", rarity: "very-rare",
      attunement: true, bonus: { extra: "Con un'azione bonus la lanci in aria: vola e combatte da sola per qualche turno" },
      tags: ["arma", "spada", "volante"],
      descrizione: "Con un'azione bonus puoi lanciare in aria questa spada: inizia a fluttuare e attacca da sola un bersaglio a tua scelta entro pochi metri, per poi tornare nella tua mano dopo qualche turno.",
      source: "SRD"
    },
    {
      id: "luck-blade", name: "Luck Blade", type: "weapon", rarity: "legendary",
      attunement: true, bonus: { weaponBonus: 1, saveBonus: 1, extra: "Una volta al giorno ritira un tiro fallito; può custodire un incantesimo Desiderio" },
      tags: ["arma", "spada", "fortuna"],
      descrizione: "Spada +1 che concede anche +1 a tutti i tiri salvezza mentre la impugni. Una volta al giorno puoi ripetere un tiro per colpire, una prova di caratteristica o un tiro salvezza fallito; può inoltre racchiudere un raro incantesimo Desiderio.",
      source: "SRD"
    },

    // ============ ARSENALE DA MISCHIA (update 1.4.0 / 1.5.0) ============
    // Armi da mischia UFFICIALI di D&D 5e (SRD, Manuale del DM, Guida di
    // Xanathar, avventure ufficiali). Raggruppate per rarità.

    // --- Comuni ---
    {
      id: "silvered-shortsword", name: "Silvered Shortsword", type: "weapon", rarity: "common",
      attunement: false, bonus: { extra: "Conta come arma d'argento e come magica" },
      tags: ["arma", "spada", "argento"],
      descrizione: "Lama placcata d'argento: conta come arma d'argento (efficace contro licantropi e certi immondi) e come magica per superare resistenze e immunità.",
      source: "SRD"
    },

    // --- Non comuni ---
    {
      id: "trident-of-fish-command", name: "Trident of Fish Command", type: "weapon", rarity: "uncommon",
      attunement: true, bonus: { extra: "Spendi una carica per ammaliare una bestia acquatica (TS Saggezza)" },
      tags: ["arma", "tridente", "acqua"],
      descrizione: "Spendendo una delle sue cariche puoi tentare di soggiogare una bestia acquatica entro 18 metri, che deve riuscire in un tiro salvezza su Saggezza o restare ammaliata. Le cariche si recuperano all'alba.",
      source: "SRD"
    },
    {
      id: "weapon-of-warning", name: "Weapon of Warning", type: "weapon", rarity: "uncommon",
      attunement: true, bonus: { extra: "Tu e i compagni vicini non potete essere colti di sorpresa; vantaggio all'iniziativa" },
      tags: ["arma", "iniziativa", "guardia"],
      descrizione: "Mentre sei sintonizzato, tu e i tuoi compagni entro 9 metri non potete essere colti di sorpresa (a meno di essere incapacitati) e hai vantaggio ai tiri per l'iniziativa.",
      source: "SRD"
    },
    {
      id: "sword-of-vengeance", name: "Sword of Vengeance", type: "weapon", rarity: "uncommon",
      attunement: true, bonus: { weaponBonus: 1, extra: "Maledetta: uno spirito vendicativo può costringerti a non smettere di combattere" },
      tags: ["arma", "spada", "maledizione"],
      descrizione: "Spada +1 abitata da uno spirito assetato di vendetta. È maledetta: mentre sei sintonizzato, se inizi il turno senza poter vedere un nemico potresti essere costretto a raggiungere e attaccare la creatura ostile più vicina.",
      source: "SRD"
    },
    {
      id: "vicious-weapon", name: "Vicious Weapon", type: "weapon", rarity: "uncommon",
      attunement: false, bonus: { extra: "Con un 20 naturale infliggi 7 danni extra del tipo dell'arma" },
      tags: ["arma", "critico"],
      descrizione: "Quando ottieni un 20 naturale al tiro per colpire con quest'arma, il bersaglio subisce 7 danni aggiuntivi dello stesso tipo inflitto dall'arma.",
      source: "SRD"
    },
    {
      id: "javelin-of-lightning", name: "Javelin of Lightning", type: "weapon", rarity: "uncommon",
      attunement: false, bonus: { extra: "Lanciato, diventa una saetta: 4d6 danni da fulmine in linea (TS Destrezza)" },
      tags: ["arma", "giavellotto", "fulmine", "lancio"],
      descrizione: "Questo giavellotto può essere scagliato come un fulmine: si trasforma in una saetta lunga 30 metri che infligge 4d6 danni da fulmine alle creature sulla linea (tiro salvezza su Destrezza per dimezzare), poi torna a essere un normale giavellotto.",
      source: "SRD"
    },

    // --- Rari ---
    {
      id: "mace-of-terror", name: "Mace of Terror", type: "weapon", rarity: "rare",
      attunement: true, bonus: { extra: "Spendi una carica per terrorizzare i nemici entro 9 m (TS Saggezza)" },
      tags: ["arma", "mazza", "paura"],
      descrizione: "Spendendo una carica e usando un'azione, emani un'ondata di terrore: ogni creatura a tua scelta entro 9 metri deve superare un tiro salvezza su Saggezza o restare spaventata da te per 1 minuto.",
      source: "SRD"
    },

    // --- Molto rari ---
    {
      id: "scimitar-of-speed", name: "Scimitar of Speed", type: "weapon", rarity: "very-rare",
      attunement: true, bonus: { weaponBonus: 2, extra: "Puoi attaccare con quest'arma usando un'azione bonus" },
      tags: ["arma", "scimitarra", "velocità"],
      descrizione: "Scimitarra +2 dalla leggerezza innaturale. A ogni tuo turno puoi effettuare un attacco aggiuntivo con essa usando un'azione bonus.",
      source: "SRD"
    },

    // --- Leggendari ---
    {
      id: "hammer-of-thunderbolts", name: "Hammer of Thunderbolts", type: "weapon", rarity: "legendary",
      attunement: true, bonus: { weaponBonus: 1, extra: "Colpi tonanti; con un 20 naturale contro un gigante può ucciderlo all'istante" },
      tags: ["arma", "maglio", "giganti", "tuono"],
      descrizione: "Maglio +1 dei tuoni: ogni colpo rimbomba come una saetta. Con un 20 naturale contro un gigante, questi deve riuscire in un tiro salvezza su Costituzione o morire all'istante. Sfruttato appieno, può essere scagliato per liberare tuoni devastanti.",
      source: "SRD"
    },
    {
      id: "blackrazor", name: "Blackrazor", type: "weapon", rarity: "legendary",
      attunement: true, bonus: { weaponBonus: 3, extra: "Spadone senziente divora-anime: chi uccidi gli dona PF temporanei e bonus a te" },
      tags: ["arma", "spadone", "senziente", "anime", "necrotico"],
      descrizione: "Spadone +3 nero come la notte, senziente e affamato di anime. Quando riduci a 0 punti ferita una creatura, la spada ne divora l'anima: ottieni punti ferita temporanei e, finché durano, bonus alle prove e un attacco aggiuntivo. Non può cibarsi di non morti né di costrutti.",
      source: "Manuale del DM"
    },

    // --- Artefatti ---
    {
      id: "sword-of-kas", name: "Sword of Kas", type: "weapon", rarity: "artifact",
      attunement: true, bonus: { weaponBonus: 3, extra: "Spadone forgiato per uccidere Vecna; critici ampliati, danni necrotici e poteri oscuri" },
      tags: ["arma", "spada", "artefatto", "leggenda"],
      descrizione: "L'arma del temibile luogotenente del lich Vecna. Spada +3 dalla volontà spietata: amplia la portata dei colpi critici, infligge danni necrotici aggiuntivi e concede poteri sovrannaturali a chi la brandisce, spingendolo però alla violenza e alla conquista.",
      source: "Manuale del DM"
    },
    {
      id: "axe-of-the-dwarvish-lords", name: "Axe of the Dwarvish Lords", type: "weapon", rarity: "artifact",
      attunement: true, bonus: { weaponBonus: 3, extra: "Ascia bipenne sacra ai nani; scurovisione, resistenze e maestria da leggendario forgiatore" },
      tags: ["arma", "ascia", "artefatto", "nani"],
      descrizione: "L'artefatto sacro dei re nani. Ascia bipenne +3 che dona a chi la brandisce scurovisione, comprensione delle lingue naniche, resistenza a fuoco e veleno e l'abilità di un leggendario forgiatore. Può evocare elementali e incenerire i nemici.",
      source: "Manuale del DM"
    },
    {
      id: "wand-of-orcus", name: "Wand of Orcus", type: "weapon", rarity: "artifact",
      attunement: true, bonus: { weaponBonus: 3, extra: "Si impugna come una mazza +3; necromanzia, evoca non morti e corrompe il portatore" },
      tags: ["arma", "mazza", "artefatto", "non morti", "necromanzia"],
      descrizione: "Il bastone-mazza del Principe dei Non Morti, sormontato da un teschio. Funziona come una mazza magica +3 che infligge danni necrotici aggiuntivi. Permette di lanciare potenti incantesimi di morte ed evocare orde di non morti, ma corrompe l'anima di chi osa brandirlo.",
      source: "Manuale del DM"
    },
    {
      id: "sword-of-zariel", name: "Sword of Zariel", type: "weapon", rarity: "artifact",
      attunement: true, bonus: { weaponBonus: 3, extra: "Lama celestiale dell'arcidiavolo caduta; a chi ne è degno dona immunità al fuoco, volo e poteri radiosi" },
      tags: ["arma", "spada", "artefatto", "celestiale", "radioso"],
      descrizione: "La spada un tempo appartenuta all'angelo Zariel, prima della sua caduta. Spada lunga +3 che, in mano a chi ne è degno, concede immunità al fuoco, ali per volare, resistenza ai danni e la capacità di colpire e curare con luce radiosa: un faro di speranza nell'Avernus.",
      source: "Discesa nell'Avernus"
    }
  ];
});
