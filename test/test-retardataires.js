/* ============================================================
   ❤️ Kod — test « retardataires » (Node, sans dépendance)
   Lancer :  node test/test-retardataires.js
   ------------------------------------------------------------
   Des participants arrivent ENTRE deux migrations (~21h30,
   en plein milieu de soirée). Le moteur des cinq numéros donne
   la priorité absolue aux paires jamais suggérées : les
   retardataires doivent donc recevoir des numéros dès leur
   PREMIÈRE migration, apparaître dans les listes des anciens,
   et la réciprocité doit tenir.
   ============================================================ */
"use strict";
var SUGG = require("../app/suggestions.js");

var echecs = 0;
function ok(cond, nom) {
  if (cond) console.log("  ✓ " + nom);
  else { console.error("  ✗ ÉCHEC : " + nom); echecs++; }
}
function graine(s) {
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function noteDeja(deja, paires) {
  paires.forEach(function (p) {
    (deja[p[0]] = deja[p[0]] || {})[p[1]] = true;
    (deja[p[1]] = deja[p[1]] || {})[p[0]] = true;
  });
}
function reciprocite(listes) {
  var ok2 = true;
  Object.keys(listes).forEach(function (b) {
    listes[b].forEach(function (e) {
      if (!listes[e.n] || !listes[e.n].some(function (x) { return x.n === +b; })) ok2 = false;
    });
  });
  return ok2;
}

/* ---------- 1. coin saturé : les anciens se connaissent tous déjà ---------- */
console.log("\n1. Petit coin saturé + 2 retardataires");
/* 6 anciens dans le même coin : au tour 1, TOUTES leurs paires sortent
   (6 personnes, k=5 → graphe complet). Le tour 2 n'a donc de neuf que
   les retardataires. */
var anciens = {}, coins1 = {};
for (var i = 1; i <= 6; i++) { anciens[i] = { cherche: "amis", mazal: i % 7 }; coins1[i] = "א"; }
var deja = {};
var t1 = SUGG.calcule({ coins: coins1, participants: anciens, dejaSuggere: {}, ecart: 10, rnd: graine(3) });
noteDeja(deja, t1.paires);
ok(t1.paires.length === 15, "tour 1 : les 15 paires possibles entre 6 anciens sont épuisées");

/* deux retardataires (badges 71, 72) arrivent, scannent, font l'accueil */
var parts2 = {}, coins2 = {};
Object.keys(anciens).forEach(function (b) { parts2[b] = anciens[b]; coins2[b] = "א"; });
parts2[71] = { cherche: "amis", mazal: 0 };
parts2[72] = { cherche: "amis", mazal: 3 };
coins2[71] = "א"; coins2[72] = "א";
var t2 = SUGG.calcule({ coins: coins2, participants: parts2, dejaSuggere: deja, ecart: 10, rnd: graine(9) });
ok(t2.listes[71].length === 5 && t2.listes[72].length === 5,
   "les deux retardataires reçoivent 5 numéros dès leur première migration");
ok(reciprocite(t2.listes), "réciprocité : si 71 voit 3, alors 3 voit 71");
var neuves71 = t2.listes[71].every(function (e) { return !(deja[71] && deja[71][e.n]); });
ok(neuves71, "toutes les paires du retardataire sont neuves (jamais suggérées)");
var anciensAvecNouveau = Object.keys(anciens).filter(function (b) {
  return (t2.listes[b] || []).some(function (e) { return e.n === 71 || e.n === 72; });
}).length;
ok(anciensAvecNouveau >= 4,
   "les retardataires apparaissent dans les listes des anciens (" + anciensAvecNouveau + "/6)");

/* ---------- 2. grande soirée réaliste : 40 anciens, 2 tours, puis 8 retardataires ---------- */
console.log("\n2. Soirée réaliste : 40 anciens, deux tours joués, 8 retardataires arrivent");
var R = function (age, souhait, a, accepte, mz) {
  return { cherche: "rencontre", age: age, enfSouhait: souhait, enfA: a, enfAccepte: accepte, mazal: mz };
};
var parts = {}, dejaG = {};
for (var b2 = 1; b2 <= 40; b2++) {
  parts[b2] = b2 % 8 === 0
    ? { cherche: "amis", mazal: b2 % 7 }
    : R(27 + (b2 % 12), ["oui", "ouvert", "ouvert"][b2 % 3], b2 % 6 === 0 ? "oui" : "non",
        ["oui", "egal", "egal"][b2 % 3], b2 % 7);
}
/* deux tours avec des répartitions différentes (réponses différentes) */
[11, 22].forEach(function (g, tour) {
  var c = {};
  Object.keys(parts).forEach(function (b3) { c[b3] = ["א", "ב", "ג", "ד"][(+b3 + tour * 2) % 4]; });
  var r = SUGG.calcule({ coins: c, participants: parts, dejaSuggere: dejaG, ecart: 10, rnd: graine(g) });
  noteDeja(dejaG, r.paires);
});
/* 8 retardataires (badges 61-68) arrivent à 21h30, répondent à la question
   suivante, et se retrouvent répartis dans les quatre coins */
for (var b4 = 61; b4 <= 68; b4++) {
  parts[b4] = R(28 + (b4 % 10), "ouvert", "non", "egal", b4 % 7);
}
var coins3 = {};
Object.keys(parts).forEach(function (b5) { coins3[b5] = ["א", "ב", "ג", "ד"][+b5 % 4]; });
var t3 = SUGG.calcule({ coins: coins3, participants: parts, dejaSuggere: dejaG, ecart: 10, rnd: graine(77) });

var tousServis = true, tailles = [];
for (var b6 = 61; b6 <= 68; b6++) {
  var l = t3.listes[b6] || [];
  tailles.push(l.length);
  if (l.length < 1) tousServis = false;
}
ok(tousServis, "chaque retardataire reçoit des numéros à sa première migration (" + tailles.join(", ") + ")");
ok(reciprocite(t3.listes), "réciprocité conservée sur tout le tour 3");
var pairesNouveau = t3.paires.filter(function (p) { return +p[0] >= 61 || +p[1] >= 61; });
var toutesNeuves = pairesNouveau.every(function (p) { return !(dejaG[p[0]] && dejaG[p[0]][p[1]]); });
ok(toutesNeuves, "aucune paire impliquant un retardataire n'avait déjà été suggérée");
var vusParAnciens = 0;
for (var b7 = 1; b7 <= 40; b7++) {
  if ((t3.listes[b7] || []).some(function (e) { return e.n >= 61 && e.n <= 68; })) vusParAnciens++;
}
ok(vusParAnciens >= 8, "les retardataires figurent bien dans les listes des anciens (" + vusParAnciens + " anciens en voient un)");
/* les filtres durs s'appliquent aussi aux retardataires */
var dursOk = true;
Object.keys(t3.listes).forEach(function (b8) {
  t3.listes[b8].forEach(function (e) {
    if (!SUGG.compatibles(parts[b8], parts[e.n], 10)) dursOk = false;
  });
});
ok(dursOk, "aucune paire suggérée ne viole un filtre dur, retardataires compris");

console.log("");
if (echecs) { console.error("✗ " + echecs + " test(s) en échec."); process.exit(1); }
console.log("✓ Tous les tests « retardataires » passent.");
