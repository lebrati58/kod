/* Tests de l'orchestration des tours de rendez-vous (app/rdv.js).
   `node test_rdv.js` — simule ce que la console fera le soir J,
   avec l'état tel qu'il vit dans Firebase (ordre, rotation, dejaVues). */

const { calculeTour, cle } = require('../app/rdv.js');

let tout = true;
function check(cond, msg) {
  console.log((cond ? '✓' : '✗ ÉCHEC —') + ' ' + msg);
  if (!cond) tout = false;
}

function badges(n, depuis) {
  const d = depuis || 1;
  return Array.from({ length: n }, (_, i) => d + i);
}

/* un état « base » qu'on fait vivre de tour en tour */
function joueTour(etat, presents) {
  const res = calculeTour({
    ordre: etat.ordre, rotation: etat.rotation,
    dejaVues: etat.dejaVues, presents
  });
  if (!res) return null;
  /* comme la console : on mémorise ordre, rotation, paires jouées */
  etat.ordre = res.ordre;
  etat.rotation = res.rotation;
  res.paires.forEach(p => { etat.dejaVues[cle(p[0], p[1])] = true; });
  return res;
}

/* ---------- 10 personnes, 9 tours : couverture complète ---------- */
{
  const etat = { ordre: null, rotation: 0, dejaVues: {} };
  const vues = new Set();
  let doublons = 0, doublonDansTour = 0;
  for (let t = 0; t < 9; t++) {
    const res = joueTour(etat, badges(10));
    const duTour = new Set();
    res.paires.forEach(p => {
      const k = cle(p[0], p[1]);
      if (vues.has(k)) doublons++;
      vues.add(k);
      p.forEach(b => { if (duTour.has(b)) doublonDansTour++; duTour.add(b); });
    });
    if (res.repos !== null) duTour.add(res.repos);
  }
  check(doublons === 0, '10 personnes · 9 tours · 0 répétition');
  check(vues.size === 45, 'toutes les 45 paires possibles sont couvertes');
  check(doublonDansTour === 0, 'personne deux fois dans le même tour');
}

/* ---------- impair : un repos par tour, jamais le même ---------- */
{
  const etat = { ordre: null, rotation: 0, dejaVues: {} };
  const reposVus = new Set();
  let reposManquant = false;
  for (let t = 0; t < 11; t++) {
    const res = joueTour(etat, badges(11));
    if (res.repos === null) reposManquant = true;
    else reposVus.add(res.repos);
  }
  check(!reposManquant, 'impair : quelqu\u2019un se repose à chaque tour');
  check(reposVus.size === 11, 'impair (11 pers.) : 11 tours, 11 repos différents');
}

/* ---------- arrivées tardives : zéro répétition après reconstruction ---------- */
{
  const etat = { ordre: null, rotation: 0, dejaVues: {} };
  const vues = new Set();
  let doublons = 0;
  for (let t = 0; t < 4; t++) {
    joueTour(etat, badges(12));
  }
  Object.keys(etat.dejaVues).forEach(k => vues.add(k));
  /* 5 nouveaux arrivent (17 au total, impair) */
  for (let t = 0; t < 8; t++) {
    const res = joueTour(etat, badges(17));
    res.paires.forEach(p => {
      const k = cle(p[0], p[1]);
      if (vues.has(k)) doublons++;
      vues.add(k);
    });
  }
  check(doublons === 0, '12 + 5 arrivants : 8 tours suivants, 0 répétition');
  check(etat.ordre.length === 17, 'le carrousel connaît bien les 17 badges');
}

/* ---------- coins : valides et équilibrés ---------- */
{
  const etat = { ordre: null, rotation: 0, dejaVues: {} };
  const res = joueTour(etat, badges(32));
  const parCoin = {};
  const LETTRES = ['א', 'ב', 'ג', 'ד'];
  let coinsOk = true;
  res.coins.forEach(c => {
    if (LETTRES.indexOf(c.coin) === -1) coinsOk = false;
    parCoin[c.coin] = (parCoin[c.coin] || 0) + 1;
  });
  const vals = LETTRES.map(l => parCoin[l] || 0);
  check(coinsOk, 'les coins sont א ב ג ד');
  check(Math.max(...vals) - Math.min(...vals) <= 1,
    'coins équilibrés à une paire près : ' + JSON.stringify(parCoin));
}

/* ---------- garde-fous ---------- */
{
  check(calculeTour({ presents: [7] }) === null, 'une seule personne → pas de tour');
  check(calculeTour({ presents: [] }) === null, 'personne → pas de tour');
  const deux = calculeTour({ presents: [3, 8] });
  check(deux && deux.paires.length === 1 && deux.repos === null,
    'deux personnes → une paire, pas de repos');
}

console.log('');
console.log(tout ? 'TOUT PASSE' : 'DES ÉCHECS — ne pas déployer');
process.exit(tout ? 0 : 1);
