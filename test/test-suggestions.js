/* ============================================================
   ❤️ Kod — test du calcul des cinq numéros (Node, sans dépendance)
   Lancer :  node test/test-suggestions.js
   ============================================================ */
"use strict";
var SUGG = require("../app/suggestions.js");

var echecs = 0;
function ok(cond, nom) {
  if (cond) { console.log("  ✓ " + nom); }
  else { console.error("  ✗ ÉCHEC : " + nom); echecs++; }
}

/* générateur déterministe : les tests sont reproductibles */
function graine(s) {
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ---------- 1. le regroupement mazal → coin ---------- */
console.log("\n1. Regroupement des mazalot en quatre coins");
ok(SUGG.coinDuMazal(0) === "א" && SUGG.coinDuMazal(1) === "א", "חמה + לבנה → א");
ok(SUGG.coinDuMazal(4) === "ב" && SUGG.coinDuMazal(5) === "ב", "צדק + נוגה → ב");
ok(SUGG.coinDuMazal(2) === "ג" && SUGG.coinDuMazal(6) === "ג", "מאדים + שבתאי → ג");
ok(SUGG.coinDuMazal(3) === "ד", "כוכב → ד (seul, structurellement le plus petit)");
ok(SUGG.coinDuMazal(7) === null && SUGG.coinDuMazal(null) === null, "valeur hors bornes → null");

/* ---------- 2. les filtres durs ---------- */
console.log("\n2. Filtres durs (uniquement entre deux « rencontrer quelqu'un »)");
var R = function (age, souhait, a, accepte) {
  return { cherche: "rencontre", age: age, enfSouhait: souhait, enfA: a, enfAccepte: accepte, mazal: 0 };
};
ok(!SUGG.compatibles(R(25), R(40), 10), "écart d'âge 15 > 10 → jamais suggérés");
ok(SUGG.compatibles(R(25), R(34), 10), "écart d'âge 9 ≤ 10 → possible");
ok(SUGG.compatibles(R(20), R(60), 99), "écart 40 mais console à 99 → filtre désactivé");
ok(!SUGG.compatibles(R(30, "oui"), R(30, "non"), 10), "l'un veut des enfants, l'autre non → jamais");
ok(SUGG.compatibles(R(30, "oui"), R(30, "ouvert"), 10), "« ouvert » compatible avec « oui »");
ok(SUGG.compatibles(R(30, "non"), R(30, "ouvert"), 10), "« ouvert » compatible avec « non »");
ok(!SUGG.compatibles(R(30, "oui", "oui"), R(30, "oui", "non", "non"), 10),
   "l'un a des enfants, l'autre préfère pas → jamais");
ok(SUGG.compatibles(R(30, "oui", "oui"), R(30, "oui", "non", "egal"), 10),
   "l'un a des enfants, l'autre sans préférence → possible");
ok(SUGG.compatibles({ cherche: "amis" }, R(25), 10),
   "l'un vient pour des amis → aucun critère ne s'applique");
ok(SUGG.compatibles({ cherche: "amis", age: 55 }, R(25, "oui"), 10),
   "critères de l'autre jamais appliqués contre un non-« rencontre »");

/* ---------- 3. réciprocité + taille ≤ 5 ---------- */
console.log("\n3. Réciprocité et taille des listes (40 personnes, un coin)");
var coins = {}, parts = {};
for (var i = 1; i <= 40; i++) {
  coins[i] = "א";
  var rencontre = i % 10 !== 0; /* ~90 % cherchent */
  parts[i] = rencontre
    ? R(25 + (i % 21), ["oui", "non", "ouvert"][i % 3], i % 4 === 0 ? "oui" : "non",
        ["oui", "non", "egal"][i % 3])
    : { cherche: "amis", mazal: i % 7 };
  parts[i].mazal = i % 7;
}
var res = SUGG.calcule({ coins: coins, participants: parts, dejaSuggere: {}, ecart: 10, rnd: graine(7) });
var recip = true, taille = true, durs = true;
Object.keys(res.listes).forEach(function (b) {
  if (res.listes[b].length > 5) taille = false;
  res.listes[b].forEach(function (e) {
    if (!res.listes[e.n].some(function (x) { return x.n === +b; })) recip = false;
    if (!SUGG.compatibles(parts[b], parts[e.n], 10)) durs = false;
  });
});
ok(recip, "si 47 est sur la liste de 15, 15 est sur celle de 47 (toutes paires)");
ok(taille, "aucune liste ne dépasse 5 numéros");
ok(durs, "aucune paire suggérée ne viole un filtre dur");
var moyenne = Object.keys(res.listes).reduce(function (a, b) { return a + res.listes[b].length; }, 0) / 40;
ok(moyenne >= 3, "listes bien remplies (moyenne " + moyenne.toFixed(1) + " ≥ 3)");

/* flag mz cohérent */
var mzOk = true;
Object.keys(res.listes).forEach(function (b) {
  res.listes[b].forEach(function (e) {
    if (e.mz !== (parts[b].mazal === parts[e.n].mazal)) mzOk = false;
  });
});
ok(mzOk, "le flag « même mazal » correspond exactement aux mazalot");

/* ---------- 4. jamais-resuggérés en priorité absolue ---------- */
console.log("\n4. Priorité absolue aux jamais-encore-suggérés");
var deja = {};
res.paires.forEach(function (p) {
  (deja[p[0]] = deja[p[0]] || {})[p[1]] = true;
  (deja[p[1]] = deja[p[1]] || {})[p[0]] = true;
});
var res2 = SUGG.calcule({ coins: coins, participants: parts, dejaSuggere: deja, ecart: 10, rnd: graine(99) });
var reutilisees = res2.paires.filter(function (p) {
  return deja[p[0]] && deja[p[0]][p[1]];
}).length;
console.log("  (tour 2 : " + res2.paires.length + " paires, dont " + reutilisees + " déjà vues)");
ok(reutilisees === 0 || reutilisees < res2.paires.length * 0.15,
   "le tour 2 suggère (quasi) uniquement des paires neuves");
/* les anciennes ne servent qu'à COMPLÉTER : personne à 0 alors que du neuf existait */
var t2recip = true;
Object.keys(res2.listes).forEach(function (b) {
  res2.listes[b].forEach(function (e) {
    if (!res2.listes[e.n].some(function (x) { return x.n === +b; })) t2recip = false;
  });
});
ok(t2recip, "réciprocité conservée au tour 2");

/* ---------- 5. moins de 5 candidats → liste plus courte ---------- */
console.log("\n5. Petits coins et cas limites");
var res3 = SUGG.calcule({
  coins: { 1: "ד", 2: "ד", 3: "ד" },
  participants: { 1: R(30), 2: R(31), 3: R(32) },
  dejaSuggere: {}, ecart: 10, rnd: graine(1)
});
ok(res3.listes[1].length === 2 && res3.listes[2].length === 2 && res3.listes[3].length === 2,
   "coin de 3 → chacun reçoit 2 numéros, sans explication");
var res4 = SUGG.calcule({
  coins: { 9: "ב" }, participants: { 9: R(30) }, dejaSuggere: {}, ecart: 10, rnd: graine(1)
});
ok(res4.listes[9].length === 0, "personne seule dans un coin → liste vide (pas d'erreur)");
var res5 = SUGG.calcule({
  coins: { 1: "א", 2: "א" },
  participants: { 1: R(20), 2: R(45) },
  dejaSuggere: {}, ecart: 10, rnd: graine(1)
});
ok(res5.listes[1].length === 0 && res5.listes[2].length === 0,
   "deux incompatibles seuls dans un coin → listes vides");

/* les incompatibles ne se voient jamais, même sur 200 tirages */
var jamais = true;
for (var t = 0; t < 200; t++) {
  var r = SUGG.calcule({
    coins: { 1: "א", 2: "א", 3: "א", 4: "א" },
    participants: { 1: R(25, "oui"), 2: R(26, "non"), 3: R(27, "ouvert"), 4: { cherche: "projet" } },
    dejaSuggere: {}, ecart: 10, rnd: graine(t + 1)
  });
  if (r.listes[1].some(function (e) { return e.n === 2; })) jamais = false;
  if (r.listes[2].some(function (e) { return e.n === 1; })) jamais = false;
}
ok(jamais, "« veut des enfants » et « n'en veut pas » ne se croisent sur aucun des 200 tirages");

/* ---------- 6. le mazal met en évidence sans trier ---------- */
console.log("\n6. Le mazal met en évidence, il ne trie pas");
var coins6 = {}, parts6 = {};
for (var m = 1; m <= 20; m++) {
  coins6[m] = "ג";
  parts6[m] = { cherche: "amis", mazal: m <= 6 ? 2 : 6 }; /* 6 Maadim, 14 Chabtaï */
}
var res6 = SUGG.calcule({ coins: coins6, participants: parts6, dejaSuggere: {}, ecart: 10, rnd: graine(4) });
var aDuMz = 0;
Object.keys(res6.listes).forEach(function (b) {
  if (res6.listes[b].some(function (e) { return e.mz; })) aDuMz++;
});
ok(aDuMz >= 10, "la plupart des listes contiennent au moins un « même mazal » (" + aDuMz + "/20)");

console.log("");
if (echecs) { console.error("✗ " + echecs + " test(s) en échec."); process.exit(1); }
console.log("✓ Tous les tests passent.");
