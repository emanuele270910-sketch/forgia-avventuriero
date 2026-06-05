/*
 * names.js — Generatore di nomi per PNG, taverne e luoghi (logica pura, niente DOM).
 * RNG iniettabile (opts) per test deterministici. Pattern UMD-lite:
 * nel browser espone DND.names, in Node module.exports.
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; root.DND.names = mod; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var maleGiven = [
    'Aldric', 'Bram', 'Cedric', 'Doran', 'Edmar', 'Fendrel', 'Gareth', 'Halbrek',
    'Ivor', 'Joren', 'Kael', 'Lothar', 'Magnus', 'Nerian', 'Orin', 'Perrin',
    'Quillon', 'Roderic', 'Soren', 'Theron', 'Ulric', 'Varic', 'Willem', 'Yorath',
    'Corvin', 'Dax', 'Eamon', 'Gildas'
  ];

  var femaleGiven = [
    'Alenia', 'Brunild', 'Caelia', 'Dahlia', 'Elspeth', 'Fiora', 'Gwendyl', 'Helsa',
    'Isolde', 'Jessa', 'Kaelis', 'Lirien', 'Mirella', 'Nadira', 'Orla', 'Phaedra',
    'Quenna', 'Rowena', 'Sariel', 'Thessaly', 'Una', 'Vesper', 'Wynne', 'Ysolde',
    'Zaria', 'Brisa', 'Cora', 'Elara'
  ];

  var surname = [
    'Ombralunga', 'Pietrabianca', 'Mantoscuro', 'Forgiaferro', 'Valfonda', 'Corvonero',
    'Spadargento', 'Fiammacupa', 'Rocciagrigia', 'Ventofreddo', 'Lunapallida', 'Boscoprofondo',
    'Cuordacciaio', 'Soleardente', 'Ferroantico', 'Stellacaduta', 'Vallescura', 'Brumalda',
    'Thornwood', 'Ravenscar', 'Greycastle', 'Blackwood', 'Strongarm', 'Marlowe',
    'Brennan', 'Castagni', 'Falconeri', 'Lupieri'
  ];

  var tavern = [
    'Il Drago Dorato', 'La Rosa Nera', 'Il Boccale Schiumante', 'La Sirena Ubriaca',
    'Il Grifone Rampante', 'La Lanterna Verde', 'Il Cinghiale Bianco', 'La Corona Spezzata',
    "Il Calice d'Argento", 'La Volpe Astuta', 'Il Corvo e la Quercia', 'La Spada Arrugginita',
    'Il Pony Zoppo', 'La Luna Rossa', "Il Tridente d'Oro", 'La Botte Sfondata',
    "Il Lupo e l'Agnello", 'La Torre Pendente', 'Il Gatto Nero', 'La Rosa dei Venti',
    "Il Martello e l'Incudine", 'La Stella del Nord', 'Il Vecchio Faro', 'La Quercia Cava'
  ];

  var place = [
    'Valfonda', 'Pietraforte', 'Corvospino', 'Ponte Corvo', 'Roccabruna', 'Borgonebbia',
    'Lago Sereno', 'Colle del Vento', 'Selva Oscura', 'Riva Tetra', 'Montecupo', 'Fontechiara',
    'Vallenera', 'Capo Tempesta', 'Forte Aldano', 'Guado Lungo', 'Torre Spezzata', 'Acquaviva',
    'Pietralba', 'Castelgrigio', 'Solitaria', 'Verdivalle', 'Cima Ghiaccio', 'Porto Cenere'
  ];

  var pools = {
    maleGiven: maleGiven, femaleGiven: femaleGiven, surname: surname,
    tavern: tavern, place: place
  };

  var kinds = ['png', 'maschile', 'femminile', 'taverna', 'luogo'];

  // Sceglie un elemento dell'array usando l'RNG fornito (default Math.random),
  // restando sempre dentro i limiti anche se l'RNG restituisce 1.
  function pick(arr, rng) {
    var r = (typeof rng === 'function') ? rng : Math.random;
    var i = Math.floor(r() * arr.length);
    if (i < 0) { i = 0; }
    if (i >= arr.length) { i = arr.length - 1; }
    return arr[i];
  }

  function fullName(given, rng) {
    return pick(given, rng) + ' ' + pick(surname, rng);
  }

  // Genera un nome per la categoria richiesta:
  //   'maschile' | 'femminile' | 'png' (genere casuale) | 'taverna' | 'luogo'
  function generate(kind, rng) {
    switch (kind) {
      case 'maschile': return fullName(maleGiven, rng);
      case 'femminile': return fullName(femaleGiven, rng);
      case 'taverna': return pick(tavern, rng);
      case 'luogo': return pick(place, rng);
      case 'png':
      default:
        return fullName(pick([maleGiven, femaleGiven], rng), rng);
    }
  }

  // Genera `n` nomi (minimo 1) della categoria richiesta.
  function generateMany(n, kind, rng) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < 1) { n = 1; }
    var out = [];
    for (var i = 0; i < n; i++) { out.push(generate(kind, rng)); }
    return out;
  }

  return {
    pools: pools,
    kinds: kinds,
    generate: generate,
    generateMany: generateMany
  };
});
