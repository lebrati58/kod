/* Tests du carrousel femme ↔ homme (app/rdv.js).
   `node test_rdv.js` — simule ce que la console fera le soir J,
   avec l'état tel qu'il vit dans Firebase (femmes, hommes, rotation, dejaVues). */

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

/* un état « base » qu'on fait vivre de tour en tour, comme la console */
function joueTour(etat, presentsF, presentsH) {
  const res = calculeTour({
    femmes: etat.femmes, hommes: etat.hommes, rotation: etat.rotation,
    dejaVues: etat.dejaVues, presentsF, presentsH
  });
  if (!res) return null;
  etat.femmes = res.femmes;
  etat.hommes = res.hommes;
  etat.rotation = res.rotation;
  res.paires.forEach(p => { etat.dejaVues[cle(p[0], p[1])] = true; });
  return res;
}

const etatVide = () => ({ femmes: null, hommes: null, rotation: 0, dejaVues: {} });

/* femmes = 1..n, hommes = 101..100+m : jamais de collision de badges */
const F = n => badges(n, 1);
const H = n => badges(n, 101);

/* ---------- que des paires femme-homme, couverture complète ---------- */
{
  const etat = etatVide();
  const vues = new Set();
  let doublons = 0, mixiteKO = 0, doublonDansTour = 0;
  for (let t = 0; t < 8; t++) {
    const res = joueTour(etat, F(8), H(8));
    const duTour = new Set();
    res.paires.forEach(p => {
      if (!(p[0] <= 8 && p[1] >= 101)) mixiteKO++; /* [femme, homme] toujours */
      const k = cle(p[0], p[1]);
      if (vues.has(k)) doublons++;
      vues.add(k);
      p.forEach(b => { if (duTour.has(b)) doublonDansTour++; duTour.add(b); });
    });
  }
  check(mixiteKO === 0, 'toutes les paires sont femme \u2194 homme, jamais autre chose');
  check(doublons === 0, '8 F + 8 H \u00b7 8 tours \u00b7 0 r\u00e9p\u00e9tition');
  check(vues.size === 64, 'les 64 paires femme\u2013homme possibles sont couvertes');
  check(doublonDansTour === 0, 'personne deux fois dans le m\u00eame tour');
}

/* ---------- effectifs inégaux : repos tournant, jamais les mêmes d'affilée ---------- */
{
  const etat = etatVide();
  const reposComptes = {};
  let doublons = 0;
  const vues = new Set();
  for (let t = 0; t < 12; t++) {
    const res = joueTour(etat, F(9), H(12));
    check2: {
      if (res.paires.length !== 9) { check(false, 'in\u00e9gaux : 9 paires par tour (tour ' + t + ')'); break check2; }
    }
    res.paires.forEach(p => {
      const k = cle(p[0], p[1]);
      if (vues.has(k)) doublons++;
      vues.add(k);
    });
    res.repos.forEach(b => { reposComptes[b] = (reposComptes[b] || 0) + 1; });
  }
  check(doublons === 0, '9 F + 12 H \u00b7 12 tours \u00b7 0 r\u00e9p\u00e9tition');
  check(vues.size === 108, 'les 108 paires possibles sont couvertes en 12 tours');
  const maxRepos = Math.max(...Object.values(reposComptes));
  const hommesAuRepos = Object.keys(reposComptes).length;
  check(hommesAuRepos === 12, 'le repos tourne sur les 12 hommes');
  check(maxRepos === 3, 'repos \u00e9quitable : 3 par homme sur 12 tours (36 places de repos)');
}

/* ---------- arrivées tardives : zéro répétition après ajout ---------- */
{
  const etat = etatVide();
  const vues = new Set();
  let doublons = 0;
  for (let t = 0; t < 4; t++) {
    const res = joueTour(etat, F(10), H(10));
    res.paires.forEach(p => vues.add(cle(p[0], p[1])));
  }
  /* 3 femmes et 5 hommes arrivent */
  for (let t = 0; t < 10; t++) {
    const res = joueTour(etat, F(13), H(15));
    res.paires.forEach(p => {
      const k = cle(p[0], p[1]);
      if (vues.has(k)) doublons++;
      vues.add(k);
    });
  }
  check(doublons === 0, '10+10 puis +3 F +5 H : 10 tours suivants, 0 r\u00e9p\u00e9tition');
  check(etat.femmes.length === 13 && etat.hommes.length === 15,
    'le carrousel conna\u00eet bien 13 femmes et 15 hommes');
}

/* ---------- coins : valides et équilibrés ---------- */
{
  const etat = etatVide();
  const res = joueTour(etat, F(16), H(16));
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
  check(calculeTour({ presentsF: F(5), presentsH: [] }) === null,
    'aucun homme → pas de tour');
  check(calculeTour({ presentsF: [], presentsH: H(5) }) === null,
    'aucune femme → pas de tour');
  check(calculeTour({ presentsF: [], presentsH: [] }) === null,
    'personne → pas de tour');
  const un = calculeTour({ presentsF: [3], presentsH: [101] });
  check(un && un.paires.length === 1 && un.repos.length === 0,
    '1 femme + 1 homme → une paire, pas de repos');
}

/* ---------- soirée réaliste : 30 F + 36 H, 20 tours ---------- */
{
  const etat = etatVide();
  const vues = new Set();
  let doublons = 0;
  for (let t = 0; t < 20; t++) {
    const res = joueTour(etat, F(30), H(36));
    res.paires.forEach(p => {
      const k = cle(p[0], p[1]);
      if (vues.has(k)) doublons++;
      vues.add(k);
    });
  }
  check(doublons === 0, '30 F + 36 H \u00b7 20 tours \u00b7 ' + vues.size + ' paires \u00b7 0 r\u00e9p\u00e9tition');
}

console.log('');
console.log(tout ? 'TOUT PASSE' : 'DES ÉCHECS — ne pas déployer');
process.exit(tout ? 0 : 1);
