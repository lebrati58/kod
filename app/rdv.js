/* ============================================================
   ❤️ Kod — le tour de rendez-vous (carrousel femme ↔ homme)
   ------------------------------------------------------------
   On ne fait se rencontrer QUE des femmes et des hommes.
   Deux colonnes : les femmes gardent leur place, les hommes
   tournent d'un cran à chaque tour. Sur F femmes et H hommes,
   max(F, H) tours suffisent pour que chaque femme rencontre
   chaque homme exactement une fois — aucun tirage, aucun
   re-tirage, jamais de blocage.

   Effectifs inégaux : la colonne la plus courte est complétée
   par des fantômes. Tomber face au fantôme = tour de repos,
   et la rotation garantit que ce ne sont jamais les mêmes.

   Arrivées tardives : ajoutées au bout de leur colonne ;
   l'historique dejaVues évite toute répétition.

   Chargeable dans le navigateur (window.KOD_RDV) et dans Node
   (module.exports) : testé en Node, exécuté par la console.
   ============================================================ */
(function (racine, fabrique) {
  if (typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.KOD_RDV = fabrique();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var COINS = ["א", "ב", "ג", "ד"];

  /* clé canonique d'une paire : "petit-grand" */
  function cle(a, b) { return a < b ? a + "-" + b : b + "-" + a; }

  /* la colonne connue + les présents jamais vus, ajoutés au bout
     (l'ordre des anciens ne bouge JAMAIS : c'est lui qui porte
     la garantie de non-répétition) */
  function complete(anciens, presents) {
    var liste = (anciens || []).map(Number);
    var connu = {};
    liste.forEach(function (b) { connu[b] = true; });
    var nouveaux = [];
    (presents || []).map(Number).sort(function (a, b) { return a - b; })
      .forEach(function (b) {
        if (!connu[b]) { connu[b] = true; liste.push(b); nouveaux.push(b); }
      });
    return { liste: liste, nouveaux: nouveaux };
  }

  /* les paires de la rotation r : femme i ↔ homme (i+r) mod n.
     Une place au-delà de l'effectif réel = fantôme → repos. */
  function tourDe(F, H, r) {
    var n = Math.max(F.length, H.length);
    var paires = [], repos = [];
    for (var i = 0; i < n; i++) {
      var f = i < F.length ? F[i] : null;
      var j = (i + r) % n;
      var h = j < H.length ? H[j] : null;
      if (f != null && h != null) paires.push([f, h]);
      else if (f != null) repos.push(f);
      else if (h != null) repos.push(h);
    }
    return { paires: paires, repos: repos };
  }

  /* ------------------------------------------------------------
     calculeTour({ femmes, hommes, rotation, dejaVues,
                   presentsF, presentsH })
     - femmes/hommes : colonnes déjà en base (ou null au 1er tour)
     - rotation      : prochaine rotation à essayer
     - dejaVues      : { "a-b": true } — paires déjà jouées
     - presentsF/H   : badges présents ce tour, par genre
     → { femmes, hommes, rotation, paires, repos, coins, nouveaux }
       ou null s'il manque un des deux genres.
     Les paires sont TOUJOURS femme-homme : [badgeF, badgeH].
     ------------------------------------------------------------ */
  function calculeTour(opts) {
    opts = opts || {};
    var f = complete(opts.femmes, opts.presentsF);
    var h = complete(opts.hommes, opts.presentsH);
    if (!f.liste.length || !h.liste.length) return null;

    var n = Math.max(f.liste.length, h.liste.length);
    var deja = opts.dejaVues || {};
    var depuis = ((opts.rotation || 0) % n + n) % n;

    /* première rotation sans aucune paire déjà jouée ;
       à défaut (après des arrivées, la géométrie change), la moins répétitive */
    var best = null;
    for (var essai = 0; essai < n; essai++) {
      var r = (depuis + essai) % n;
      var t = tourDe(f.liste, h.liste, r);
      var rep = 0;
      t.paires.forEach(function (p) { if (deja[cle(p[0], p[1])]) rep++; });
      if (!best || rep < best.rep) best = { r: r, t: t, rep: rep };
      if (rep === 0) break;
    }
    if (!best) return null;

    /* LA garantie : une paire déjà jouée n'est JAMAIS rejouée.
       Les membres des paires répétées sont ré-appariés entre eux
       quand c'est possible, sinon ils se reposent ce tour-ci. */
    var paires = [], enTrop = [];
    best.t.paires.forEach(function (p) {
      if (deja[cle(p[0], p[1])]) enTrop.push(p); else paires.push(p);
    });
    var repos = best.t.repos.slice();
    if (enTrop.length) {
      var fs = enTrop.map(function (p) { return p[0]; });
      var hs = enTrop.map(function (p) { return p[1]; });
      var pris = {};
      fs.forEach(function (fb) {
        for (var i = 0; i < hs.length; i++) {
          if (pris[i] || deja[cle(fb, hs[i])]) continue;
          pris[i] = true;
          paires.push([fb, hs[i]]);
          return;
        }
        repos.push(fb);
      });
      hs.forEach(function (hb, i) { if (!pris[i]) repos.push(hb); });
    }
    if (!paires.length) return null;

    return {
      femmes: f.liste,
      hommes: h.liste,
      rotation: best.r + 1,
      paires: paires,
      repos: repos,
      coins: paires.map(function (p, i) {
        return { paire: p, coin: COINS[i % 4] };
      }),
      nouveaux: f.nouveaux.concat(h.nouveaux)
    };
  }

  return { calculeTour: calculeTour, cle: cle, COINS: COINS };
});
