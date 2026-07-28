/* ============================================================
   ❤️ Kod — le tour de rendez-vous (carrousel)
   ------------------------------------------------------------
   Orchestration au-dessus du module carrousel :
   - premier tour : le carrousel se crée avec les présents
   - arrivées tardives : réinsérées sans casser les paires jouées
   - l'historique dejaVues garantit zéro répétition même après
     une reconstruction du carrousel
   Chargeable dans le navigateur (window.KOD_RDV, après
   carrousel.js) et dans Node (module.exports) : testé en Node,
   exécuté par la console le soir J.
   ============================================================ */
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports)
    module.exports = fabrique(require("../carrousel/carrousel.js"));
  else racine.KOD_RDV = fabrique(racine.KOD_CARROUSEL);
})(typeof self !== "undefined" ? self : this, function (CAR) {
  "use strict";

  /* clé canonique d'une paire : "petit-grand" */
  function cle(a, b) { return a < b ? a + "-" + b : b + "-" + a; }

  /* ------------------------------------------------------------
     calculeTour({ ordre, rotation, dejaVues, presents })
     - ordre     : ordre du carrousel déjà en base (array) ou null
     - rotation  : prochaine rotation à jouer
     - dejaVues  : { "a-b": true } — paires déjà jouées
     - presents  : badges présents pour ce tour
     → { ordre, rotation, paires, repos, coins, nouveaux }
       ou null s'il n'y a pas de quoi former une seule paire.
     L'ordre ne fait que grandir : quelqu'un qui sort reste dans
     le carrousel (il peut revenir), la vie du bar fait le reste.
     ------------------------------------------------------------ */
  function calculeTour(opts) {
    opts = opts || {};
    var presents = (opts.presents || []).map(Number)
      .sort(function (a, b) { return a - b; });
    var ordre = (opts.ordre || []).map(Number);
    var rotation = opts.rotation || 0;

    var connu = {};
    ordre.forEach(function (b) { connu[b] = true; });
    var nouveaux = presents.filter(function (b) { return !connu[b]; });

    if (ordre.length + nouveaux.length < 2) return null;

    var carrousel;
    if (!ordre.length) {
      carrousel = CAR.creerCarrousel(presents);
      rotation = 0;
    } else if (nouveaux.length) {
      carrousel = CAR.ajouterArrivants(
        CAR.creerCarrousel(ordre), nouveaux, rotation).carrousel;
      rotation = 0; /* prochainePaires évite les paires déjà jouées */
    } else {
      carrousel = CAR.creerCarrousel(ordre);
    }

    var dejaSet = new Set(Object.keys(opts.dejaVues || {}));
    var res = CAR.prochainePaires(carrousel, rotation, dejaSet);
    if (!res || !res.paires.length) return null;

    return {
      ordre: carrousel.liste.filter(function (x) { return x !== null; }),
      rotation: res.rotation + 1,
      paires: res.paires,
      repos: res.repos,
      coins: CAR.repartirEnCoins(res.paires),
      nouveaux: nouveaux
    };
  }

  return { calculeTour: calculeTour, cle: cle };
});
