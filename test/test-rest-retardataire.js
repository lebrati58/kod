/* ============================================================
   ❤️ Kod — test RÉEL « retardataire » contre la base Firebase
   Lancer :  node test/test-rest-retardataire.js
   ------------------------------------------------------------
   Rejoue le scénario du soir J : la soirée est en PHASE COIN
   (migration après une question), un retardataire arrive,
   scanne le QR, termine son accueil. On vérifie exactement ce
   que LIT son téléphone (état, suggestions, réponses) et ce
   que LIT la console (compteur de nouveaux). Puis la question
   suivante est lancée, il répond, la migration distribue les
   cinq numéros : il doit en recevoir, réciprocité comprise.
   La session TSTR est SUPPRIMÉE à la fin, succès ou échec.
   ============================================================ */
"use strict";
var SUGG = require("../app/suggestions.js");
var BASE = "https://kod-soiree-default-rtdb.europe-west1.firebasedatabase.app";
var CODE = "TSTR";

var echecs = 0;
function ok(cond, nom) {
  if (cond) console.log("  ✓ " + nom);
  else { console.error("  ✗ ÉCHEC : " + nom); echecs++; }
}
function url(chemin) { return BASE + "/sessions/" + CODE + chemin + ".json"; }
async function put(chemin, val) {
  var r = await fetch(url(chemin), { method: "PUT", body: JSON.stringify(val) });
  if (!r.ok) throw new Error("PUT " + chemin + " → HTTP " + r.status);
  return r.json();
}
async function patch(chemin, val) {
  var r = await fetch(url(chemin), { method: "PATCH", body: JSON.stringify(val) });
  if (!r.ok) throw new Error("PATCH " + chemin + " → HTTP " + r.status);
  return r.json();
}
async function get(chemin) {
  var r = await fetch(url(chemin));
  if (!r.ok) throw new Error("GET " + chemin + " → HTTP " + r.status);
  return r.json();
}
async function del(chemin) {
  var r = await fetch(url(chemin), { method: "DELETE" });
  if (!r.ok) throw new Error("DELETE " + chemin + " → HTTP " + r.status);
}

/* le même calcul que la console (calculeSuggestions) */
function calculeEtPrepare(coins, parts, deja, qKey) {
  var res = SUGG.calcule({ coins: coins, participants: parts, dejaSuggere: deja, ecart: 10 });
  var maj = {};
  Object.keys(res.listes).forEach(function (b) {
    maj["suggestions/" + b] = { qId: qKey, liste: res.listes[b] };
  });
  res.paires.forEach(function (p) {
    maj["dejaSuggere/" + p[0] + "/" + p[1]] = true;
    maj["dejaSuggere/" + p[1] + "/" + p[0]] = true;
  });
  return { res: res, maj: maj };
}

async function main() {
  var debut = Date.now();

  console.log("\n1. Soirée " + CODE + " en cours : question 22 jouée, salle en PHASE COIN");
  var Q = { id: 22, texte: "Question de test", choix: [
    { coin: "א", texte: "a" }, { coin: "ב", texte: "b" },
    { coin: "ג", texte: "c" }, { coin: "ד", texte: "d" }] };
  await put("/state", {
    phase: "migration", migration: null, qId: 22, qNum: 1, q: Q,
    phaseAt: debut - 120000, dureeMs: 60000, ecartAge: 10,
    tourLanceA: debut - 180000, createdAt: debut - 3600000
  });
  var parts = {}, reps = {};
  for (var b = 901; b <= 908; b++) {
    parts[b] = { genre: b % 2 ? "f" : "h", online: true,
      arriveA: debut - 3000000, lastSeen: debut,
      mazal: b % 7, cherche: "amis", accueilFait: true };
    reps[b] = { coin: ["א", "ב"][b % 2], at: debut - 150000 };
  }
  await patch("/participants", parts);
  await patch("/reponses/22", reps);
  var coins22 = {};
  Object.keys(reps).forEach(function (b2) { coins22[b2] = reps[b2].coin; });
  var c1 = calculeEtPrepare(coins22, parts, {}, 22);
  await patch("", c1.maj);
  ok(Object.keys(c1.res.listes).length === 8, "8 anciens dans les coins, cinq numéros distribués");

  console.log("\n2. Le badge 972 arrive à 21h30, scanne, termine son accueil");
  /* exactement ce que fait participant.html : update + arriveA à la première fois */
  await patch("/participants/972", {
    genre: "f", online: true, lastSeen: Date.now(), arriveA: Date.now(),
    mazal: 4, cherche: "rencontre", age: 31,
    enfSouhait: "ouvert", enfA: "non", enfAccepte: "egal", accueilFait: true
  });

  console.log("\n3. Ce que LIT son téléphone à cet instant (phase coin)");
  var etat = await get("/state");
  ok(etat && etat.phase === "migration" && etat.qId === 22,
     "state : phase migration, question 22 → l'app affiche « Bienvenue » + coin du mazal");
  ok(SUGG.coinDuMazal(4) === "ב",
     "son mazal (4 = צדק) donne bien un coin : ב — grande lettre + couleur, jamais d'écran vide");
  var sesSugg = await get("/suggestions/972");
  ok(sesSugg === null,
     "suggestions/972 absent → l'app n'affiche AUCUNE liste (dégradé propre, juste le coin)");
  var saRep = await get("/reponses/22/972");
  ok(saRep === null, "aucune réponse à la question en cours → il n'est compté dans aucun coin-réponse");

  console.log("\n4. Ce que LIT la console : le compteur de nouveaux");
  var tousParts = await get("/participants");
  var tourLanceA = etat.tourLanceA;
  var nouveaux = Object.keys(tousParts).filter(function (b3) {
    return typeof tousParts[b3].arriveA === "number" && tousParts[b3].arriveA > tourLanceA;
  });
  ok(nouveaux.length === 1 && nouveaux[0] === "972",
     "1 nouveau depuis la dernière question : le badge 972 (les 8 anciens ne comptent pas)");

  console.log("\n5. Question suivante lancée : le compteur retombe, 972 répond");
  var lanceA = Date.now();
  await patch("/state", { phase: "question", qId: 30, qNum: 2,
    q: Q, migration: null, phaseAt: lanceA, dureeMs: 45000, tourLanceA: lanceA });
  var etat2 = await get("/state");
  var nouveaux2 = Object.keys(tousParts).filter(function (b4) {
    return typeof tousParts[b4].arriveA === "number" && tousParts[b4].arriveA > etat2.tourLanceA;
  });
  ok(nouveaux2.length === 0, "compteur remis à zéro au lancement de la question suivante");
  var reps30 = { 972: { coin: "א", at: Date.now() } };
  for (var b5 = 901; b5 <= 908; b5++) reps30[b5] = { coin: ["א", "ג"][b5 % 2], at: Date.now() };
  await patch("/reponses/30", reps30);

  console.log("\n6. Migration : les cinq numéros incluent le retardataire, réciprocité en base");
  var deja = (await get("/dejaSuggere")) || {};
  var partsMaj = await get("/participants");
  var coins30 = {};
  Object.keys(reps30).forEach(function (b6) { coins30[b6] = reps30[b6].coin; });
  var c2 = calculeEtPrepare(coins30, partsMaj, deja, 30);
  await patch("", c2.maj);
  var sugg972 = await get("/suggestions/972");
  ok(sugg972 && sugg972.qId === 30 && sugg972.liste && sugg972.liste.length >= 1,
     "972 reçoit des numéros dès sa première migration (" +
     (sugg972 && sugg972.liste ? sugg972.liste.length : 0) + " numéros)");
  var toutes = await get("/suggestions");
  var recip = true;
  (sugg972.liste || []).forEach(function (e) {
    var la = (toutes[e.n] && toutes[e.n].liste) || [];
    if (!la.some(function (x) { return x.n === 972; })) recip = false;
  });
  ok(recip, "réciprocité vérifiée DANS la base : chacun de ses numéros a 972 sur sa liste");
  var chezAnciens = Object.keys(toutes).filter(function (b7) {
    return b7 !== "972" && (toutes[b7].liste || []).some(function (x) { return x.n === 972; });
  }).length;
  ok(chezAnciens >= 1, "972 apparaît dans les listes des anciens (" + chezAnciens + ")");

  console.log("");
  if (echecs) { console.error("✗ " + echecs + " test(s) REST en échec."); process.exitCode = 1; }
  else console.log("✓ Tous les tests REST « retardataire » passent.");
}

main().catch(function (e) {
  console.error("✗ Erreur : " + (e && e.message ? e.message : e));
  process.exitCode = 1;
}).finally(async function () {
  try {
    await del("");
    var reste = await get("/state");
    console.log(reste === null
      ? "🧹 Session " + CODE + " supprimée de la base."
      : "⚠️ La session " + CODE + " n'a pas été entièrement nettoyée !");
  } catch (e2) {
    console.error("⚠️ Nettoyage : " + e2.message);
  }
});
