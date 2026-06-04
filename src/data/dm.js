/*
 * dm.js — Materiale di riferimento per il Dungeon Master (dal Manuale SRD 5.1).
 * Tabelle e liste mostrate nella scheda « DM » come sezioni richiudibili.
 * Pattern UMD-lite: nel browser espone DND.dm, in Node module.exports.
 *
 * Struttura di una sezione:
 *   { id, title, icon, kind, ... }
 *   kind = 'table' -> { columns:[...], rows:[[...]], note? }
 *   kind = 'list'  -> { items:[...] }            (elenco puntato)
 *   kind = 'steps' -> { items:[...] }            (elenco numerato)
 */
(function (root, factory) {
  'use strict';
  var data = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = data; }
  if (root) { root.DND = root.DND || {}; root.DND.dm = data; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var sections = [
    {
      id: 'golden-rules',
      title: "Le tre regole d'oro",
      icon: '★',
      kind: 'list',
      items: [
        'Il divertimento del tavolo viene prima di tutto, incluse le regole.',
        '« Sì, e… » — accogli le idee dei giocatori, semmai aggiungendo conseguenze.',
        'Sii imparziale, ma generoso. Le regole servono il gioco, non il contrario.'
      ]
    },
    {
      id: 'cd',
      title: 'Classe Difficoltà (CD)',
      icon: '🎯',
      kind: 'table',
      columns: ['Difficoltà', 'CD'],
      rows: [
        ['Molto facile', '5'],
        ['Facile', '10'],
        ['Media', '15'],
        ['Difficile', '20'],
        ['Molto difficile', '25'],
        ['Quasi impossibile', '30']
      ],
      note: 'd20 + modificatore + bonus competenza ≥ CD → successo.'
    },
    {
      id: 'proficiency',
      title: 'Bonus di Competenza',
      icon: '➕',
      kind: 'table',
      columns: ['Livello PG', 'Bonus'],
      rows: [
        ['1–4', '+2'],
        ['5–8', '+3'],
        ['9–12', '+4'],
        ['13–16', '+5'],
        ['17–20', '+6']
      ]
    },
    {
      id: 'ability-mod',
      title: 'Modificatori di Caratteristica',
      icon: '💪',
      kind: 'table',
      columns: ['Punteggio', 'Mod.'],
      rows: [
        ['1', '−5'],
        ['2–3', '−4'],
        ['4–5', '−3'],
        ['6–7', '−2'],
        ['8–9', '−1'],
        ['10–11', '0'],
        ['12–13', '+1'],
        ['14–15', '+2'],
        ['16–17', '+3'],
        ['18–19', '+4'],
        ['20–21', '+5'],
        ['22–23', '+6'],
        ['24–25', '+7'],
        ['26–27', '+8'],
        ['28–29', '+9'],
        ['30', '+10']
      ],
      note: 'Formula rapida: (punteggio − 10) / 2, arrotondato per difetto.'
    },
    {
      id: 'advancement',
      title: 'Avanzamento di Livello (PE totali)',
      icon: '⏫',
      kind: 'table',
      columns: ['Livello', 'PE totali'],
      rows: [
        ['1', '0'],
        ['2', '300'],
        ['3', '900'],
        ['4', '2.700'],
        ['5', '6.500'],
        ['6', '14.000'],
        ['7', '23.000'],
        ['8', '34.000'],
        ['9', '48.000'],
        ['10', '64.000'],
        ['11', '85.000'],
        ['12', '100.000'],
        ['13', '120.000'],
        ['14', '140.000'],
        ['15', '165.000'],
        ['16', '195.000'],
        ['17', '225.000'],
        ['18', '265.000'],
        ['19', '305.000'],
        ['20', '355.000']
      ],
      note: 'In alternativa molti tavoli usano i Milestone: si sale di livello a un obiettivo narrativo.'
    },
    {
      id: 'cr-xp',
      title: 'Grado di Sfida (GS) → PE',
      icon: '👹',
      kind: 'table',
      columns: ['GS', 'PE'],
      rows: [
        ['0', '10'],
        ['1/8', '25'],
        ['1/4', '50'],
        ['1/2', '100'],
        ['1', '200'],
        ['2', '450'],
        ['3', '700'],
        ['4', '1.100'],
        ['5', '1.800'],
        ['6', '2.300'],
        ['7', '2.900'],
        ['8', '3.900'],
        ['9', '5.000'],
        ['10', '5.900'],
        ['11', '7.200'],
        ['12', '8.400'],
        ['13', '10.000'],
        ['14', '11.500'],
        ['15', '13.000'],
        ['16', '15.000'],
        ['17', '18.000'],
        ['18', '20.000'],
        ['19', '22.000'],
        ['20', '25.000'],
        ['21', '33.000'],
        ['22', '41.000'],
        ['23', '50.000'],
        ['24', '62.000'],
        ['30', '155.000']
      ]
    },
    {
      id: 'xp-budget',
      title: 'Budget PE per Incontro (per PG)',
      icon: '⚔️',
      kind: 'table',
      columns: ['Liv.', 'Facile', 'Medio', 'Difficile', 'Mortale'],
      rows: [
        ['1', '25', '50', '75', '100'],
        ['2', '50', '100', '150', '200'],
        ['3', '75', '150', '225', '400'],
        ['4', '125', '250', '375', '500'],
        ['5', '250', '500', '750', '1.100'],
        ['6', '300', '600', '900', '1.400'],
        ['7', '350', '750', '1.100', '1.700'],
        ['8', '450', '900', '1.400', '2.100'],
        ['9', '550', '1.100', '1.600', '2.400'],
        ['10', '600', '1.200', '1.900', '2.800'],
        ['11', '800', '1.600', '2.400', '3.600'],
        ['12', '1.000', '2.000', '3.000', '4.500'],
        ['13', '1.100', '2.200', '3.400', '5.100'],
        ['14', '1.250', '2.500', '3.800', '5.700'],
        ['15', '1.400', '2.800', '4.300', '6.400'],
        ['16', '1.600', '3.200', '4.800', '7.200'],
        ['17', '2.000', '3.900', '5.900', '8.800'],
        ['18', '2.100', '4.200', '6.300', '9.500'],
        ['19', '2.400', '4.900', '7.300', '10.900'],
        ['20', '2.800', '5.700', '8.500', '12.700']
      ],
      note: 'Somma il budget di ogni PG: è il totale di PE (già moltiplicati) che l’incontro può valere.'
    },
    {
      id: 'multipliers',
      title: 'Moltiplicatori di Gruppo (numero di mostri)',
      icon: '✖️',
      kind: 'table',
      columns: ['N° mostri', 'Moltiplicatore'],
      rows: [
        ['1 mostro', '×1'],
        ['2 mostri', '×1,5'],
        ['3–6 mostri', '×2'],
        ['7–10 mostri', '×2,5'],
        ['11–14 mostri', '×3'],
        ['15+ mostri', '×4']
      ],
      note: 'Moltiplica la somma dei PE dei mostri per questo valore, poi confronta col budget.'
    },
    {
      id: 'encounter-steps',
      title: 'Costruire un incontro di combattimento',
      icon: '🛠️',
      kind: 'steps',
      items: [
        'Somma il budget PE di ogni PG per la difficoltà desiderata.',
        'Scegli i mostri e somma i loro PE (dalla tabella GS → PE).',
        'Moltiplica il totale dei PE per il moltiplicatore di gruppo (in base al numero di mostri).',
        'Confronta il risultato col budget: se è vicino, l’incontro è calibrato.'
      ]
    },
    {
      id: 'creature-types',
      title: 'Tipi di Creatura',
      icon: '🐾',
      kind: 'list',
      items: [
        'Umanoide', 'Bestia', 'Drago', 'Non morto', 'Costrutto', 'Mostruosità',
        'Aberrazione', 'Fatato', 'Celestiale', 'Immondo (demone/diavolo)',
        'Elementale', 'Vegetale', 'Melma', 'Gigante'
      ]
    },
    {
      id: 'rarity-value',
      title: 'Rarità e valore degli oggetti magici',
      icon: '💎',
      kind: 'table',
      columns: ['Rarità', 'Valore indicativo'],
      rows: [
        ['Comune', '50–100 mo'],
        ['Non comune', '101–500 mo'],
        ['Raro', '501–5.000 mo'],
        ['Molto raro', '5.001–50.000 mo'],
        ['Leggendario', '50.001+ mo']
      ],
      note: 'Sintonia: 1 ora (riposo breve), massimo 3 oggetti sintonizzati per personaggio.'
    },
    {
      id: 'session-prep',
      title: 'Preparare una sessione',
      icon: '📋',
      kind: 'list',
      items: [
        'Scegli o costruisci l’avventura: dungeon, città, mistero, viaggio.',
        'Costruisci gli incontri: combattimento, sociale, esplorazione, enigma.',
        'Prepara gli appunti: mappa, lista PNG, statistiche dei mostri, oggetti da trovare.',
        'Anticipa le scelte: prepara dettagli, non sceneggiature rigide.',
        'Definisci l’hook (gancio): come i PG vengono coinvolti.'
      ]
    },
    {
      id: 'npc',
      title: 'Creare un PNG al volo',
      icon: '🎭',
      kind: 'list',
      items: [
        'Nome e breve descrizione fisica.',
        'Una motivazione che ne guida le azioni.',
        'Una « tic » o frase ricorrente che lo renda memorabile.',
        'Un atteggiamento di base verso i PG (amichevole, diffidente, ostile).',
        'Se combatte: usa il blocco di un umanoide (Bandito, Veterano, Mago, Cavaliere…) e personalizzalo.'
      ]
    },
    {
      id: 'variants',
      title: 'Regole opzionali (Variant Rules)',
      icon: '🎲',
      kind: 'list',
      items: [
        'Punti Eroe: 1 per riposo lungo, aggiunge +1d6 o ritira un d20.',
        'Confronti di abilità: due personaggi tirano prove opposte.',
        'Sfide di abilità: sequenza di prove cumulate (inseguimenti, viaggi difficili).',
        'Critico più letale: raddoppia anche i modificatori, non solo i dadi.',
        'Iniziativa di gruppo: un solo tiro per schieramento.',
        'Inseguimenti: turni di movimento con prove di Cos, Acrobazia, Atletica.'
      ]
    }
  ];

  // Mostri iconici pronti da aggiungere al tracker (PF medi da SRD 5.1).
  var monsters = [
    { name: 'Goblin', cr: '1/4', xp: 50, ac: 15, hp: 7, note: 'Scimitarra +4 (1d6+2). Fuggire come azione bonus.' },
    { name: 'Hobgoblin', cr: '1/2', xp: 100, ac: 18, hp: 11, note: 'Spada lunga +3 (1d8+1, +2d6 con alleato adiacente).' },
    { name: 'Orco', cr: '1/2', xp: 100, ac: 13, hp: 15, note: 'Ascia da guerra +5 (1d12+3). Aggressivo: muoversi verso il nemico come azione bonus.' },
    { name: 'Ogre', cr: '2', xp: 450, ac: 11, hp: 59, note: 'Grande. Mazza grande +6 (2d8+4).' },
    { name: 'Owlbear', cr: '3', xp: 700, ac: 13, hp: 59, note: 'Grande. Multiattacco: artigli + becco.' },
    { name: 'Troll', cr: '5', xp: 1800, ac: 15, hp: 84, note: 'Grande. Rigenerazione 10 (bloccata da fuoco/acido).' },
    { name: 'Mind Flayer', cr: '7', xp: 2900, ac: 15, hp: 71, note: 'Mind Blast: cono 18 m, TS Int CD 15 o 4d8 psichici e stordito.' },
    { name: 'Vampiro', cr: '13', xp: 10000, ac: 16, hp: 144, note: 'Leggendario. Rigenera, Charm, Figli della Notte.' },
    { name: 'Drago Rosso Antico', cr: '24', xp: 62000, ac: 22, hp: 546, note: 'Leggendario. Soffio di fuoco 26d6.' },
    { name: 'Tarrasque', cr: '30', xp: 155000, ac: 25, hp: 676, note: 'Rigenera, immune alla magia non leggendaria.' }
  ];

  return { sections: sections, monsters: monsters };
});
