/* ============================================================
   ❤️ Kod — les cinq numéros (calcul centralisé)
   ------------------------------------------------------------
   Chargeable dans le navigateur (window.KOD_SUGG) et dans
   Node (module.exports) : le même code est testé en Node
   et exécuté par la console le soir J.

   Règles (cahier des charges v2) :
   - Les suggestions sont RÉCIPROQUES : construites par paires.
     Si 47 est sur la liste de 15, 15 est sur celle de 47.
   - Filtres durs, UNIQUEMENT entre deux personnes qui ont
     répondu « rencontrer quelqu'un » (accueil du 28/07 :
     chabbat / cachère / enfants — plus de question d'âge) :
       · chabbat : « sacré, on ne négocie pas » et « un samedi
         comme les autres » ne sont jamais suggérés ensemble
       · cachère : « strictement » et « pas du tout » non plus
       · enfants : en veut (ou en reveut) ↔ n'en veut pas/plus ;
         « on verra bien » est compatible avec tout le monde
       · écart d'âge : conservé si des âges existent en base
         (rétro-compatibilité), sinon sans effet
   - Ceux qui ne cherchent pas à rencontrer quelqu'un sont
     suggérés librement : aucun critère ne s'applique à eux
     ni contre eux.
   - Priorité absolue aux paires jamais encore suggérées de
     toute la soirée (historique dejaSuggere).
   - Quand c'est possible, 1 ou 2 numéros de la liste partagent
     le mazal (flag mz, mis en évidence à l'écran — le mazal ne
     trie personne, il donne juste une raison d'aller voir).
   - Moins de candidats compatibles → liste plus courte, sans
     explication. Jamais plus de 5.
   ============================================================ */
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.KOD_SUGG = fabrique();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* mazal (0 = dimanche/חמה … 6 = chabbat/שבתאי) → coin.
     Regroupement FIXE, jamais expliqué au participant :
     א: חמה + לבנה · ב: צדק + נוגה · ג: מאדים + שבתאי · ד: כוכב */
  var MAZAL_COIN = ["א", "א", "ג", "ד", "ב", "ב", "ג"];

  function coinDuMazal(m) {
    return (typeof m === "number" && m >= 0 && m <= 6) ? MAZAL_COIN[m] : null;
  }

  function chercheRencontre(p) { return !!p && p.cherche === "rencontre"; }

  /* Les filtres durs. Vrai si la paire a le droit d'exister. */
  function compatibles(pa, pb, ecart) {
    /* les critères ne s'appliquent qu'entre deux personnes qui
       cherchent toutes les deux à rencontrer quelqu'un */
    if (!chercheRencontre(pa) || !chercheRencontre(pb)) return true;
    if (typeof ecart !== "number") ecart = 10;
    if (ecart < 99 &&
        typeof pa.age === "number" && typeof pb.age === "number" &&
        Math.abs(pa.age - pb.age) > ecart) return false;
    /* chabbat : 0 sacré · 1 vendredi famille · 2 samedi ordinaire · 3 ça dépend */
    if ((pa.chabbat === 0 && pb.chabbat === 2) ||
        (pa.chabbat === 2 && pb.chabbat === 0)) return false;
    /* cachère : 0 strictement · 1 maison · 2 pas du tout · 3 semblant */
    if ((pa.cachere === 0 && pb.cachere === 2) ||
        (pa.cachere === 2 && pb.cachere === 0)) return false;
    /* enfants : 0 en veut · 1 en a + en reveut · 2 en a, stop · 3 non merci · 4 on verra */
    var veutA = pa.enfants === 0 || pa.enfants === 1,
        pasA  = pa.enfants === 2 || pa.enfants === 3,
        veutB = pb.enfants === 0 || pb.enfants === 1,
        pasB  = pb.enfants === 2 || pb.enfants === 3;
    if ((veutA && pasB) || (pasA && veutB)) return false;
    /* anciens champs (rétro-compatibilité, sans effet si absents) */
    if ((pa.enfSouhait === "oui" && pb.enfSouhait === "non") ||
        (pa.enfSouhait === "non" && pb.enfSouhait === "oui")) return false;
    if ((pa.enfA === "oui" && pb.enfAccepte === "non") ||
        (pb.enfA === "oui" && pa.enfAccepte === "non")) return false;
    return true;
  }

  /* ------------------------------------------------------------
     calcule({ coins, participants, dejaSuggere, ecart, k, rnd })
     - coins        : { badge: "א"|"ב"|"ג"|"ד" } — qui est dans quel coin
     - participants : { badge: { cherche, chabbat, cachere,
                                 enfants, mazal } }
     - dejaSuggere  : { badge: { autre: true } } — historique soirée
     - ecart        : écart d'âge max (console) ; 99 = désactivé
     - k            : taille de liste (5)
     - rnd          : générateur aléatoire injectable (tests)
     → { listes: { badge: [ { n, mz } ] }, paires: [ [a,b], … ] }
       paires = toutes les paires suggérées ce tour, à ajouter
       à dejaSuggere par la console.
     ------------------------------------------------------------ */
  function calcule(opts) {
    opts = opts || {};
    var coins = opts.coins || {};
    var participants = opts.participants || {};
    var deja = opts.dejaSuggere || {};
    var ecart = (typeof opts.ecart === "number") ? opts.ecart : 10;
    var k = opts.k || 5;
    var rnd = opts.rnd || Math.random;

    var parCoin = {};
    Object.keys(coins).forEach(function (b) {
      var c = coins[b];
      if (c !== "א" && c !== "ב" && c !== "ג" && c !== "ד") return;
      (parCoin[c] = parCoin[c] || []).push(b);
    });

    var listes = {}, compte = {}, compteMz = {};
    Object.keys(coins).forEach(function (b) {
      listes[b] = []; compte[b] = 0; compteMz[b] = 0;
    });
    var paires = [];

    function dejaVu(a, b) {
      return !!(deja[a] && deja[a][b]) || !!(deja[b] && deja[b][a]);
    }
    function memeMazal(a, b) {
      var pa = participants[a] || {}, pb = participants[b] || {};
      return typeof pa.mazal === "number" && pa.mazal === pb.mazal;
    }

    Object.keys(parCoin).forEach(function (coin) {
      var gens = parCoin[coin];
      var neuves = [], anciennes = [];
      for (var i = 0; i < gens.length; i++) {
        for (var j = i + 1; j < gens.length; j++) {
          var a = gens[i], b = gens[j];
          if (!compatibles(participants[a], participants[b], ecart)) continue;
          var p = { a: a, b: b, mz: memeMazal(a, b), r: rnd(), pris: false };
          (dejaVu(a, b) ? anciennes : neuves).push(p);
        }
      }
      /* priorité absolue aux paires jamais encore suggérées,
         puis on complète avec les anciennes si les listes sont courtes */
      [neuves, anciennes].forEach(function (pool) {
        pool.sort(function (x, y) { return x.r - y.r; });
        for (;;) {
          var choisi = null, meilleur = Infinity;
          for (var t = 0; t < pool.length; t++) {
            var q = pool[t];
            if (q.pris || compte[q.a] >= k || compte[q.b] >= k) continue;
            var s = compte[q.a] + compte[q.b];
            /* léger bonus au même mazal tant que chacun en a moins de 2 :
               « 1 ou 2 de la liste partagent le mazal, quand c'est possible » */
            if (q.mz && compteMz[q.a] < 2 && compteMz[q.b] < 2) s -= 0.5;
            if (s < meilleur) { meilleur = s; choisi = q; }
          }
          if (!choisi) break;
          choisi.pris = true;
          listes[choisi.a].push({ n: +choisi.b, mz: choisi.mz });
          listes[choisi.b].push({ n: +choisi.a, mz: choisi.mz });
          compte[choisi.a]++; compte[choisi.b]++;
          if (choisi.mz) { compteMz[choisi.a]++; compteMz[choisi.b]++; }
          paires.push([choisi.a, choisi.b]);
        }
      });
    });

    /* listes lisibles dans un bar sombre : numéros croissants */
    Object.keys(listes).forEach(function (b) {
      listes[b].sort(function (x, y) { return x.n - y.n; });
    });

    return { listes: listes, paires: paires };
  }

  return {
    MAZAL_COIN: MAZAL_COIN,
    coinDuMazal: coinDuMazal,
    compatibles: compatibles,
    calcule: calcule
  };
});
