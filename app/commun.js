/* ============================================================
   ❤️ Kod — socle commun (étape 1)
   ------------------------------------------------------------
   - Vérifie la configuration Firebase (bandeau si manquante)
   - Initialise l'app + la Realtime Database (SDK compat, CDN)
   - Horloge serveur : .info/serverTimeOffset
     → tout décompte affiché = finPrévue - (Date.now() + offset)
       JAMAIS de décompte local libre.
   - Constantes des quatre coins (la lettre prime, la couleur
     n'est qu'un renfort visuel)
   ============================================================ */

window.KOD = (function () {
  "use strict";

  /* ---------- les quatre coins ---------- */
  var LETTRES = ["א", "ב", "ג", "ד"];
  var COINS = {
    "א": { nom: "ROUGE", c: "#C22E2E", doux: "#FDF0F0" },
    "ב": { nom: "BLEU",  c: "#2C6FD1", doux: "#EEF4FD" },
    "ג": { nom: "JAUNE", c: "#A8760C", doux: "#FBF3E3" },
    "ד": { nom: "VERT",  c: "#1D7A52", doux: "#EBF6F1" }
  };

  /* ---------- durées (en secondes) ---------- */
  var DUREES = {
    QUESTION: 45,      // fenêtre de réponse
    MIGRATION: 60,     // compte à rebours plein écran
    PRET_PLANCHER: 180 // bouton « prêt » grisé
  };
  var SEUIL_PRET = 0.60; // 60 % de prêts dans un coin → alerte console

  /* ---------- bandeau d'alerte (config manquante, etc.) ---------- */
  function bandeau(msg) {
    var d = document.createElement("div");
    d.setAttribute("role", "alert");
    d.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:9999;" +
      "background:#B3261E;color:#fff;font:700 15px/1.45 system-ui,sans-serif;" +
      "padding:14px 18px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.35)";
    d.textContent = msg;
    (document.body || document.documentElement).appendChild(d);
  }

  /* ---------- la config est-elle remplie ? ---------- */
  function configOk() {
    var c = window.KOD_FIREBASE_CONFIG;
    if (!c || typeof c !== "object") return false;
    /* l'essentiel pour la Realtime Database : apiKey, databaseURL, projectId */
    var cles = ["apiKey", "databaseURL", "projectId"];
    for (var i = 0; i < cles.length; i++) {
      var v = c[cles[i]];
      if (typeof v !== "string" || !v || v.indexOf("COLLER_ICI") !== -1) return false;
    }
    /* aucun placeholder oublié ailleurs */
    for (var k in c) {
      if (typeof c[k] === "string" && c[k].indexOf("COLLER_ICI") !== -1) return false;
    }
    if (c.databaseURL.indexOf("https://") !== 0) return false;
    return true;
  }

  /* ---------- initialisation ----------
     Retourne { app, db, now(), TS } ou null (bandeau affiché). */
  function init() {
    if (typeof firebase === "undefined") {
      bandeau("⚠️ Firebase n'a pas pu être chargé (pas de réseau ?). Recharge la page.");
      return null;
    }
    if (!configOk()) {
      bandeau("⚠️ Configuration Firebase manquante — ouvre app/config.js et suis FIREBASE-SETUP.md");
      return null;
    }
    var app, db;
    try {
      app = firebase.initializeApp(window.KOD_FIREBASE_CONFIG);
      db = firebase.database();
    } catch (e) {
      bandeau("⚠️ Firebase n'a pas pu démarrer : " + (e && e.message ? e.message : e));
      return null;
    }

    /* décalage entre l'horloge du téléphone et celle du serveur */
    var offset = 0;
    db.ref(".info/serverTimeOffset").on("value", function (s) {
      offset = s.val() || 0;
    });

    return {
      app: app,
      db: db,
      /* l'heure « serveur » vue d'ici */
      now: function () { return Date.now() + offset; },
      TS: firebase.database.ServerValue.TIMESTAMP
    };
  }

  /* ---------- petits outils ---------- */
  function mmss(sec) {
    var s = Math.max(0, Math.ceil(sec));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  /* code de soirée : 4 lettres sans ambiguïté (pas de I, L, O, Q) */
  function codeAleatoire() {
    var A = "ABCDEFGHJKMNPRSTUVWXYZ", out = "";
    for (var i = 0; i < 4; i++) out += A[Math.floor(Math.random() * A.length)];
    return out;
  }

  /* mélange déterministe : le même badge revoit les réponses
     dans le même ordre après une reconnexion */
  function melange(tab, graine) {
    var a = tab.slice();
    var s = (graine >>> 0) || 1;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function litParamsURL() {
    var p = {};
    var q = (location.search || "").replace(/^\?/, "").split("&");
    for (var i = 0; i < q.length; i++) {
      if (!q[i]) continue;
      var kv = q[i].split("=");
      p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    }
    return p;
  }

  return {
    LETTRES: LETTRES,
    COINS: COINS,
    DUREES: DUREES,
    SEUIL_PRET: SEUIL_PRET,
    bandeau: bandeau,
    configOk: configOk,
    init: init,
    mmss: mmss,
    codeAleatoire: codeAleatoire,
    melange: melange,
    litParamsURL: litParamsURL
  };
})();
