/* ============================================================
   ❤️ Kod — test RÉEL contre la base Firebase (API REST)
   Lancer :  node test/test-rest.js
   ------------------------------------------------------------
   Crée une session TEST, rejoue le parcours v2 côté données :
   accueil (mazal + critères) → première migration mazal →
   calcul des cinq numéros (le même moteur que la console) →
   rencontres barrées → fin de soirée (effacement âge/enfants).
   La session TEST est SUPPRIMÉE à la fin, succès ou échec.
   ============================================================ */
"use strict";
var SUGG = require("../app/suggestions.js");
var BASE = "https://kod-soiree-default-rtdb.europe-west1.firebasedatabase.app";
var CODE = "TEST";

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

async function main() {
  console.log("\n1. Création de la session " + CODE);
  await put("/state", {
    phase: "attente", qId: null, qNum: 0, q: null,
    phaseAt: Date.now(), dureeMs: null, ecartAge: 10, createdAt: Date.now()
  });
  var etat = await get("/state");
  ok(etat && etat.phase === "attente" && etat.ecartAge === 10,
     "state écrit et relu (phase attente, écart d'âge 10)");

  console.log("\n2. Douze participants passent l'accueil v2");
  var parts = {};
  for (var b = 901; b <= 912; b++) {
    var rencontre = b % 4 !== 0; /* 9 sur 12 cherchent */
    parts[b] = rencontre
      ? { genre: b % 2 ? "f" : "h", online: true, lastSeen: Date.now(),
          mazal: b % 7, cherche: "rencontre", accueilFait: true,
          age: 25 + (b % 15),
          enfSouhait: ["oui", "non", "ouvert"][b % 3],
          enfA: b % 5 === 0 ? "oui" : "non",
          enfAccepte: ["oui", "non", "egal"][b % 3] }
      : { genre: b % 2 ? "f" : "h", online: true, lastSeen: Date.now(),
          mazal: b % 7, cherche: "amis", accueilFait: true };
  }
  await patch("/participants", parts);
  var relus = await get("/participants");
  ok(relus && Object.keys(relus).length === 12, "12 participants écrits et relus");
  ok(relus["901"] && relus["901"].mazal === parts[901].mazal &&
     relus["901"].cherche === "rencontre" && typeof relus["901"].age === "number",
     "les champs d'accueil (mazal, cherche, age, enfants) sont bien en base");

  console.log("\n3. Première migration par le mazal + cinq numéros");
  await patch("/state", { phase: "migration", migration: "mazal", qId: 0, qNum: 0,
                          phaseAt: Date.now(), dureeMs: 60000 });
  /* le même calcul que la console : coins d'après le mazal */
  var coins = {};
  Object.keys(parts).forEach(function (b2) {
    var c = SUGG.coinDuMazal(parts[b2].mazal);
    if (c) coins[b2] = c;
  });
  var res = SUGG.calcule({ coins: coins, participants: parts, dejaSuggere: {}, ecart: 10 });
  var maj = {};
  Object.keys(res.listes).forEach(function (b3) {
    maj["suggestions/" + b3] = { qId: 0, liste: res.listes[b3] };
  });
  res.paires.forEach(function (p) {
    maj["dejaSuggere/" + p[0] + "/" + p[1]] = true;
    maj["dejaSuggere/" + p[1] + "/" + p[0]] = true;
  });
  await patch("", maj); /* update multi-chemins, comme la console */
  var sugg = await get("/suggestions");
  ok(sugg && Object.keys(sugg).length === Object.keys(res.listes).length,
     "suggestions écrites pour tous les gens des coins (" + Object.keys(sugg).length + ")");
  var recip = true, structOk = true;
  Object.keys(sugg).forEach(function (b4) {
    var l = sugg[b4].liste || [];
    if (sugg[b4].qId !== 0) structOk = false;
    l.forEach(function (e) {
      if (typeof e.n !== "number" || typeof e.mz !== "boolean") structOk = false;
      var la = (sugg[e.n] && sugg[e.n].liste) || [];
      if (!la.some(function (x) { return x.n === +b4; })) recip = false;
    });
  });
  ok(structOk, "structure { qId, liste: [{ n, mz }] } relue à l'identique");
  ok(recip, "réciprocité vérifiée dans la base elle-même");
  var deja = await get("/dejaSuggere");
  ok(deja && Object.keys(deja).length > 0, "l'historique dejaSuggere est en base");

  console.log("\n4. Une rencontre barrée survit à la relecture (reprise)");
  var premier = Object.keys(sugg).find(function (b5) { return (sugg[b5].liste || []).length; });
  var autre = sugg[premier].liste[0].n;
  await put("/rencontres/" + premier + "/" + autre, true);
  var renc = await get("/rencontres/" + premier);
  ok(renc && renc[autre] === true, "rencontres/" + premier + "/" + autre + " = true relu");

  console.log("\n5. Fin de soirée : effacement de l'âge et des réponses enfants");
  var majFin = { "state/phase": "fin" };
  Object.keys(parts).forEach(function (b6) {
    ["age", "enfSouhait", "enfA", "enfAccepte"].forEach(function (k) {
      majFin["participants/" + b6 + "/" + k] = null;
    });
  });
  await patch("", majFin);
  var apres = await get("/participants");
  var purge = Object.keys(apres).every(function (b7) {
    var p = apres[b7];
    return p.age === undefined && p.enfSouhait === undefined &&
           p.enfA === undefined && p.enfAccepte === undefined;
  });
  ok(purge, "plus aucun âge ni réponse enfants en base après « Terminer »");
  var finEtat = await get("/state/phase");
  ok(finEtat === "fin", "phase = fin");

  console.log("");
  if (echecs) { console.error("✗ " + echecs + " test(s) REST en échec."); process.exitCode = 1; }
  else console.log("✓ Tous les tests REST passent.");
}

main().catch(function (e) {
  console.error("✗ Erreur : " + (e && e.message ? e.message : e));
  process.exitCode = 1;
}).finally(async function () {
  try {
    await del("");
    var reste = await get("/state");
    console.log(reste === null
      ? "🧹 Session TEST supprimée de la base."
      : "⚠️ La session TEST n'a pas été entièrement nettoyée !");
  } catch (e2) {
    console.error("⚠️ Nettoyage : " + e2.message);
  }
});
