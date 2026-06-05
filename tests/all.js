/*
 * all.js — Runner Node (facoltativo). Esegue l'intera suite da riga di comando:
 *     node tests/all.js
 * Nel browser usa invece tests.html. I file di test usano i global `describe`,
 * `it`, `expect` (framework.js) e `T` (env.js); richiederli qui in quest'ordine
 * popola quei global prima che i test si registrino.
 */
'use strict';

require('./framework.js'); // espone describe/it/expect/TestRunner sul global
require('./env.js');       // espone T (moduli + dataset) sul global

require('./data.test.js');
require('./search.test.js');
require('./filter.test.js');
require('./recommend.test.js');
require('./encounter.test.js');
require('./names.test.js');

var report = TestRunner.run();

var GREEN = '\x1b[32m', RED = '\x1b[31m', DIM = '\x1b[2m', BOLD = '\x1b[1m', RESET = '\x1b[0m';
var currentSuite = null;

report.results.forEach(function (r) {
  if (r.suite !== currentSuite) {
    currentSuite = r.suite;
    console.log('\n' + BOLD + currentSuite + RESET);
  }
  if (r.pass) {
    console.log('  ' + GREEN + '✓' + RESET + ' ' + DIM + r.name + RESET);
  } else {
    console.log('  ' + RED + '✗ ' + r.name + RESET);
    console.log('      ' + RED + r.error + RESET);
  }
});

console.log(
  '\n' + BOLD + 'Risultato: ' + RESET +
  GREEN + report.passed + ' superati' + RESET + ', ' +
  (report.failed ? RED : DIM) + report.failed + ' falliti' + RESET +
  ' su ' + report.total + '.'
);

process.exitCode = report.failed === 0 ? 0 : 1;
