/**
 * CARROUSEL — appariement déterministe sans répétition.
 *
 * Principe : on fige la première personne, toutes les autres tournent d'un cran
 * à chaque rotation. Sur N participants, N-1 rotations apparient tout le monde
 * avec tout le monde, exactement une fois. Aucun historique à stocker,
 * aucun re-tirage, jamais de blocage en fin de soirée.
 *
 * Nombre impair : on ajoute un participant fantôme. Celui qui tombe en face
 * de lui se repose ce tour-ci — et grâce au carrousel, ce n'est jamais deux
 * fois la même personne.
 */

const REPOS = null; // le fantôme

function creerCarrousel(numeros) {
  const liste = [...numeros];
  const impair = liste.length % 2 === 1;
  if (impair) liste.push(REPOS);
  return {
    liste,
    rotation: 0,
    taille: liste.length,
    tours: liste.length - 1, // nombre de rotations avant de recommencer
  };
}

/**
 * Renvoie les paires de la rotation demandée.
 * @returns {{paires: Array<[number,number]>, repos: number|null}}
 */
function pairesDe(carrousel, rotation) {
  const n = carrousel.taille;
  const fixe = carrousel.liste[0];
  const tournants = carrousel.liste.slice(1);   // n-1 éléments
  const m = n - 1;
  const k = ((rotation % m) + m) % m;

  // rotation vers la droite de k crans : l'élément i vient de (i - k) mod m
  const tourne = tournants.map((_, i) => tournants[(i - k + m * 2) % m]);
  const rangee = [fixe, ...tourne];

  const paires = [];
  let repos = null;
  for (let i = 0; i < n / 2; i++) {
    const a = rangee[i];
    const b = rangee[n - 1 - i];
    if (a === REPOS) { repos = b; continue; }
    if (b === REPOS) { repos = a; continue; }
    paires.push([a, b]);
  }
  return { paires, repos };
}

/**
 * Répartit les paires sur les quatre coins, au plus équilibré.
 */
const COINS = ['א', 'ב', 'ג', 'ד'];
function repartirEnCoins(paires) {
  return paires.map((paire, i) => ({ paire, coin: COINS[i % 4] }));
}

/**
 * Réinsère des arrivants sans casser les rotations déjà jouées.
 * Les nouveaux sont ajoutés à la fin ; les paires déjà formées restent valides
 * car la personne fixe et l'ordre des anciens ne changent pas.
 * On renvoie un nouveau carrousel et la rotation à partir de laquelle repartir.
 */
function ajouterArrivants(carrousel, nouveaux, rotationCourante) {
  const anciens = carrousel.liste.filter(x => x !== REPOS);
  const liste = [...anciens, ...nouveaux];
  const suivant = creerCarrousel(liste);
  // on repart à zéro sur le nouveau carrousel : les anciennes paires sont
  // mémorisées à part par l'appelant pour être évitées les premiers tours
  suivant.rotation = 0;
  return { carrousel: suivant, depuis: rotationCourante };
}

/**
 * Variante utile en soirée : évite les paires déjà vues quand le carrousel
 * a été reconstruit (après des arrivées tardives).
 */
function prochainePaires(carrousel, rotation, dejaVues) {
  const cle = ([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const max = carrousel.taille - 1;
  for (let essai = 0; essai < max; essai++) {
    const r = (rotation + essai) % max;
    const { paires, repos } = pairesDe(carrousel, r);
    const repetees = paires.filter(p => dejaVues.has(cle(p))).length;
    if (repetees === 0) return { paires, repos, rotation: r };
  }
  // aucune rotation totalement neuve : on prend la moins répétitive
  let best = null;
  for (let r = 0; r < max; r++) {
    const { paires, repos } = pairesDe(carrousel, r);
    const repetees = paires.filter(p => dejaVues.has(cle(p))).length;
    if (!best || repetees < best.repetees) best = { paires, repos, rotation: r, repetees };
  }
  return best;
}

module.exports = { creerCarrousel, pairesDe, repartirEnCoins, ajouterArrivants, prochainePaires, COINS };
