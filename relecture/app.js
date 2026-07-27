/* ============================================================
   Atelier de relecture — application
   ------------------------------------------------------------
   Projet autonome : pages statiques + Firebase Realtime
   Database (SDK compat via CDN). Aucune dépendance vers un
   autre projet.

   Accès par lien secret :
     ?s=<salle>              → relecteur
     ?s=<salle>&admin=<jeton> → administrateur

   Données sous relecture/<salle>/ :
     adminToken                : jeton admin (vérifié côté client)
     questions                 : tableau des questions (format d'entrée)
     relecteurs/<prenom>       : timestamp de première entrée
     votes/<id>/<prenom>       : "garder" | "revoir" | "supprimer"
     commentaires/<id>/<cid>   : {prenom, texte, ts, resolu}
     propositions/<id>/<pid>   : {prenom, type, cible, texte|coin, ts}
   ============================================================ */

(function () {
  "use strict";

  /* ---------- constantes ---------- */

  var COINS = [
    { lettre: "א", couleur: "Rouge" },
    { lettre: "ב", couleur: "Bleu" },
    { lettre: "ג", couleur: "Jaune" },
    { lettre: "ד", couleur: "Vert" }
  ];
  var LETTRES = ["א", "ב", "ג", "ד"];
  var VOTES = ["garder", "revoir", "supprimer"];
  var LIBELLES_VOTE = { garder: "Garder", revoir: "À revoir", supprimer: "Supprimer" };

  /* ---------- état ---------- */

  var params = new URLSearchParams(location.search);
  var salle = (params.get("s") || "").replace(/[^A-Za-z0-9_-]/g, "");
  var jetonAdmin = params.get("admin") || "";

  var db = null;
  var racine = null;         // ref relecture/<salle>
  var moi = "";              // mon prénom
  var estAdmin = false;
  var etat = null;           // dernier instantané complet de la salle
  var filtreActif = "toutes";
  var derniereEmpreinteQuestions = ""; // pour ne reconstruire les cartes que si besoin

  /* ---------- petits utilitaires ---------- */

  function $(sel) { return document.querySelector(sel); }

  function ech(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function montrerEcran(id) {
    ["ecran-invalide", "ecran-prenom", "ecran-chargement", "ecran-liste"].forEach(function (e) {
      document.getElementById(e).classList.toggle("cache", e !== id);
    });
  }

  function nettoyerPrenom(p) {
    return String(p || "").trim().replace(/[.#$\[\]\/\x00-\x1f]/g, "").slice(0, 20);
  }

  function listeEnFrancais(noms) {
    if (noms.length <= 1) return noms.join("");
    return noms.slice(0, -1).join(", ") + " et " + noms[noms.length - 1];
  }

  function telecharger(nom, contenu, type) {
    var blob = new Blob([contenu], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- lecture de l'état ---------- */

  function questionsCourantes() {
    var qs = (etat && etat.questions) || [];
    return Array.isArray(qs) ? qs.filter(Boolean) : Object.keys(qs).map(function (k) { return qs[k]; });
  }

  function relecteursConnus() {
    var r = (etat && etat.relecteurs) || {};
    return Object.keys(r).sort(function (a, b) { return (r[a] || 0) - (r[b] || 0); });
  }

  function votesDe(id) { return (etat && etat.votes && etat.votes[id]) || {}; }

  function commentairesDe(id) {
    var c = (etat && etat.commentaires && etat.commentaires[id]) || {};
    return Object.keys(c)
      .map(function (k) { var o = c[k]; o._cid = k; return o; })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  }

  function propositionsDe(id) {
    var p = (etat && etat.propositions && etat.propositions[id]) || {};
    return Object.keys(p)
      .map(function (k) { var o = p[k]; o._pid = k; return o; })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  }

  function poseProbleme(q) {
    var v = votesDe(q.id);
    var negatifs = Object.keys(v).filter(function (p) {
      return v[p] === "revoir" || v[p] === "supprimer";
    }).length;
    if (negatifs >= 2) return true;
    return commentairesDe(q.id).some(function (c) { return !c.resolu; });
  }

  function passeFiltre(q) {
    if (filtreActif === "avoter") return !votesDe(q.id)[moi];
    if (filtreActif === "probleme") return poseProbleme(q);
    if (filtreActif === "rire") return !!q.drole;
    return true;
  }

  /* ---------- construction des cartes (partie stable) ---------- */

  function htmlChoix(q) {
    return "<ul class=\"choix\">" + (q.choix || []).map(function (c, i) {
      return "<li><span class=\"lettre lettre-" + ech(c.coin) + "\" lang=\"he\" dir=\"rtl\">" +
        ech(c.coin) + "</span><span>" + ech(c.texte) + "</span></li>";
    }).join("") + "</ul>";
  }

  function construireCartes() {
    var qs = questionsCourantes();
    var conteneur = $("#liste-questions");
    conteneur.innerHTML = qs.map(function (q) {
      return (
        "<article class=\"carte\" id=\"carte-" + q.id + "\" data-id=\"" + q.id + "\">" +
          "<div class=\"q-entete\">" +
            "<span class=\"q-numero\">" + q.id + "</span>" +
            (q.drole ? "<span class=\"badge badge-rire\">fait rire</span>" : "") +
            "<span class=\"badge badge-manque cache\" id=\"manque-" + q.id + "\"></span>" +
          "</div>" +
          "<h2 class=\"q-texte\" id=\"texte-" + q.id + "\">" + ech(q.texte) + "</h2>" +
          "<div id=\"choix-" + q.id + "\">" + htmlChoix(q) + "</div>" +
          "<div class=\"votes-boutons\">" + VOTES.map(function (v) {
            return "<button class=\"btn-vote\" data-choix=\"" + v + "\">" + LIBELLES_VOTE[v] + "</button>";
          }).join("") + "</div>" +
          "<div class=\"votes-detail\" id=\"votes-" + q.id + "\"></div>" +
          "<div class=\"section-titre\">Commentaires</div>" +
          "<div id=\"commentaires-" + q.id + "\"></div>" +
          "<div class=\"ligne-envoi\">" +
            "<input type=\"text\" id=\"champ-com-" + q.id + "\" maxlength=\"500\" placeholder=\"Un commentaire…\">" +
            "<button class=\"btn-envoyer\" data-action=\"commenter\">Envoyer</button>" +
          "</div>" +
          "<div id=\"propositions-" + q.id + "\"></div>" +
          "<button class=\"btn-proposer\" data-action=\"ouvrir-proposition\">Proposer une correction</button>" +
          "<div class=\"form-proposition cache\" id=\"form-prop-" + q.id + "\"></div>" +
        "</article>"
      );
    }).join("");
    if (!qs.length) conteneur.innerHTML = "<p class=\"vide\">Aucune question dans cette salle.</p>";
  }

  /* ---------- mises à jour dynamiques ---------- */

  function majCarte(q) {
    var id = q.id;
    var carte = document.getElementById("carte-" + id);
    if (!carte) return;

    /* votes : boutons + prénoms */
    var v = votesDe(id);
    carte.querySelectorAll(".btn-vote").forEach(function (b) {
      b.classList.toggle("choisi", v[moi] === b.getAttribute("data-choix"));
    });
    var detail = VOTES.map(function (choix) {
      var noms = relecteursConnus().filter(function (p) { return v[p] === choix; });
      Object.keys(v).forEach(function (p) {
        if (v[p] === choix && noms.indexOf(p) === -1) noms.push(p);
      });
      if (!noms.length) return "";
      return "<div><b>" + LIBELLES_VOTE[choix] + "</b> : " + ech(listeEnFrancais(noms)) + "</div>";
    }).join("");
    document.getElementById("votes-" + id).innerHTML =
      detail || "<div>Personne n'a encore voté.</div>";

    /* repère : tout le monde n'a pas voté */
    var badge = document.getElementById("manque-" + id);
    var manquants = relecteursConnus().filter(function (p) { return !v[p]; });
    if (manquants.length && relecteursConnus().length) {
      badge.textContent = "manque : " + listeEnFrancais(manquants);
      badge.classList.remove("cache");
    } else {
      badge.classList.add("cache");
    }

    /* commentaires */
    var coms = commentairesDe(id);
    document.getElementById("commentaires-" + id).innerHTML = coms.map(function (c) {
      var boutons = "";
      if (c.prenom === moi) {
        boutons += "<button class=\"btn-mini\" data-action=\"supprimer-com\" data-cid=\"" +
          ech(c._cid) + "\">Supprimer</button>";
      }
      if (estAdmin) {
        boutons += "<button class=\"btn-mini\" data-action=\"resoudre-com\" data-cid=\"" +
          ech(c._cid) + "\">" + (c.resolu ? "Rouvrir" : "Résolu") + "</button>";
      }
      return "<div class=\"commentaire" + (c.resolu ? " resolu" : "") + "\">" +
        "<div class=\"corps\"><span class=\"auteur\">" + ech(c.prenom) + "</span> — " +
        ech(c.texte) + (c.resolu ? "<span class=\"tag-resolu\">résolu</span>" : "") +
        "</div>" + boutons + "</div>";
    }).join("");

    /* propositions */
    var props = propositionsDe(id);
    document.getElementById("propositions-" + id).innerHTML = (props.length
      ? "<div class=\"section-titre\">Propositions de correction</div>" : "") +
      props.map(function (p) {
        var quoi = "";
        if (p.type === "texte") {
          quoi = "nouveau texte de la question :<div class=\"prop-detail\">" + ech(p.texte) + "</div>";
        } else if (p.type === "reponse") {
          quoi = "nouveau texte de la réponse " + (Number(p.cible) + 1) +
            " :<div class=\"prop-detail\">" + ech(p.texte) + "</div>";
        } else if (p.type === "coin") {
          quoi = "réponse " + (Number(p.cible) + 1) + " → lettre " +
            "<span class=\"lettre lettre-" + ech(p.coin) + "\" lang=\"he\" dir=\"rtl\">" +
            ech(p.coin) + "</span>";
        }
        var actions = estAdmin
          ? "<div class=\"prop-actions\">" +
              "<button class=\"btn-accepter\" data-action=\"accepter-prop\" data-pid=\"" + ech(p._pid) + "\">Accepter</button>" +
              "<button class=\"btn-refuser\" data-action=\"refuser-prop\" data-pid=\"" + ech(p._pid) + "\">Refuser</button>" +
            "</div>"
          : "<div><small>en attente de l'admin</small></div>";
        return "<div class=\"proposition\"><span class=\"auteur\">" + ech(p.prenom) +
          "</span> propose — " + quoi + actions + "</div>";
      }).join("");
  }

  function appliquerFiltre() {
    var qs = questionsCourantes();
    var visibles = 0;
    qs.forEach(function (q) {
      var carte = document.getElementById("carte-" + q.id);
      if (!carte) return;
      var ok = passeFiltre(q);
      carte.style.display = ok ? "" : "none";
      if (ok) visibles++;
    });
    var videId = "message-filtre-vide";
    var ancien = document.getElementById(videId);
    if (ancien) ancien.remove();
    if (qs.length && !visibles) {
      var p = document.createElement("p");
      p.id = videId;
      p.className = "vide";
      p.textContent = "Aucune question ne correspond à ce filtre.";
      $("#liste-questions").appendChild(p);
    }
  }

  function toutRafraichir() {
    var qs = questionsCourantes();
    var empreinte = JSON.stringify(qs);
    if (empreinte !== derniereEmpreinteQuestions) {
      derniereEmpreinteQuestions = empreinte;
      construireCartes();
    }
    qs.forEach(majCarte);
    appliquerFiltre();
    $("#pied-relecteurs").textContent = relecteursConnus().length
      ? "Relecteurs : " + listeEnFrancais(relecteursConnus())
      : "";
  }

  /* ---------- actions ---------- */

  function voter(id, choix) {
    var ref = racine.child("votes/" + id + "/" + moi);
    if (votesDe(id)[moi] === choix) ref.remove();
    else ref.set(choix);
  }

  function commenter(id) {
    var champ = document.getElementById("champ-com-" + id);
    var texte = (champ.value || "").trim();
    if (!texte) return;
    racine.child("commentaires/" + id).push({
      prenom: moi, texte: texte, ts: Date.now(), resolu: false
    });
    champ.value = "";
  }

  function supprimerCommentaire(id, cid) {
    var coms = commentairesDe(id);
    var c = coms.filter(function (x) { return x._cid === cid; })[0];
    if (!c || c.prenom !== moi) return; /* on ne supprime que les siens */
    racine.child("commentaires/" + id + "/" + cid).remove();
  }

  function basculerResolu(id, cid) {
    if (!estAdmin) return;
    var c = ((etat.commentaires || {})[id] || {})[cid];
    if (!c) return;
    racine.child("commentaires/" + id + "/" + cid + "/resolu").set(!c.resolu);
  }

  /* ---- propositions ---- */

  function ouvrirFormProposition(q) {
    var form = document.getElementById("form-prop-" + q.id);
    if (!form.classList.contains("cache")) { form.classList.add("cache"); return; }
    var optionsReponses = (q.choix || []).map(function (c, i) {
      return "<option value=\"" + i + "\">Réponse " + (i + 1) + " (" + ech(c.coin) + ") — " +
        ech(c.texte.length > 40 ? c.texte.slice(0, 40) + "…" : c.texte) + "</option>";
    }).join("");
    var optionsLettres = LETTRES.map(function (l) {
      return "<option value=\"" + l + "\">" + l + "</option>";
    }).join("");
    form.innerHTML =
      "<label>Type de correction</label>" +
      "<select data-role=\"type\">" +
        "<option value=\"texte\">Nouveau texte de la question</option>" +
        "<option value=\"reponse\">Nouveau texte d'une réponse</option>" +
        "<option value=\"coin\">Changer la lettre d'une réponse</option>" +
      "</select>" +
      "<div data-role=\"zone-cible\" class=\"cache\">" +
        "<label>Quelle réponse ?</label>" +
        "<select data-role=\"cible\">" + optionsReponses + "</select>" +
      "</div>" +
      "<div data-role=\"zone-texte\">" +
        "<label>Nouveau texte</label>" +
        "<textarea data-role=\"texte\" maxlength=\"300\"></textarea>" +
      "</div>" +
      "<div data-role=\"zone-coin\" class=\"cache\">" +
        "<label>Nouvelle lettre</label>" +
        "<select data-role=\"coin\">" + optionsLettres + "</select>" +
      "</div>" +
      "<div class=\"form-actions\">" +
        "<button class=\"btn-envoyer\" data-action=\"envoyer-prop\">Soumettre</button>" +
        "<button class=\"btn-annuler\" data-action=\"annuler-prop\">Annuler</button>" +
      "</div>";
    form.querySelector("[data-role=texte]").value = q.texte;
    form.querySelector("[data-role=type]").addEventListener("change", function () {
      var t = this.value;
      form.querySelector("[data-role=zone-cible]").classList.toggle("cache", t === "texte");
      form.querySelector("[data-role=zone-texte]").classList.toggle("cache", t === "coin");
      form.querySelector("[data-role=zone-coin]").classList.toggle("cache", t !== "coin");
      var champTexte = form.querySelector("[data-role=texte]");
      if (t === "texte") champTexte.value = q.texte;
      else if (t === "reponse") {
        var i = Number(form.querySelector("[data-role=cible]").value);
        champTexte.value = (q.choix[i] || {}).texte || "";
      }
    });
    form.querySelector("[data-role=cible]").addEventListener("change", function () {
      if (form.querySelector("[data-role=type]").value === "reponse") {
        var i = Number(this.value);
        form.querySelector("[data-role=texte]").value = (q.choix[i] || {}).texte || "";
      }
    });
    form.classList.remove("cache");
  }

  function envoyerProposition(q) {
    var form = document.getElementById("form-prop-" + q.id);
    var type = form.querySelector("[data-role=type]").value;
    var prop = { prenom: moi, type: type, ts: Date.now() };
    if (type === "texte") {
      prop.cible = null;
      prop.texte = (form.querySelector("[data-role=texte]").value || "").trim();
      if (!prop.texte) return;
    } else if (type === "reponse") {
      prop.cible = Number(form.querySelector("[data-role=cible]").value);
      prop.texte = (form.querySelector("[data-role=texte]").value || "").trim();
      if (!prop.texte) return;
    } else {
      prop.cible = Number(form.querySelector("[data-role=cible]").value);
      prop.coin = form.querySelector("[data-role=coin]").value;
    }
    racine.child("propositions/" + q.id).push(prop);
    form.classList.add("cache");
    form.innerHTML = "";
  }

  function indexQuestion(id) {
    var qs = questionsCourantes();
    for (var i = 0; i < qs.length; i++) if (qs[i].id === id) return i;
    return -1;
  }

  function accepterProposition(id, pid) {
    if (!estAdmin) return;
    var p = ((etat.propositions || {})[id] || {})[pid];
    var idx = indexQuestion(id);
    if (!p || idx < 0) return;
    var base = "questions/" + idx;
    var maj;
    if (p.type === "texte") maj = racine.child(base + "/texte").set(p.texte);
    else if (p.type === "reponse") maj = racine.child(base + "/choix/" + p.cible + "/texte").set(p.texte);
    else if (p.type === "coin") maj = racine.child(base + "/choix/" + p.cible + "/coin").set(p.coin);
    else return;
    maj.then(function () {
      racine.child("propositions/" + id + "/" + pid).remove();
    });
  }

  function refuserProposition(id, pid) {
    if (!estAdmin) return;
    racine.child("propositions/" + id + "/" + pid).remove();
  }

  /* ---------- exports (admin) ---------- */

  function exporterJSON() {
    var donnees = {
      coins: COINS.map(function (c) { return { lettre: c.lettre, couleur: c.couleur }; }),
      questions: questionsCourantes().map(function (q) {
        return {
          id: q.id,
          texte: q.texte,
          drole: !!q.drole,
          choix: (q.choix || []).map(function (c) {
            return { texte: c.texte, coin: c.coin };
          })
        };
      })
    };
    /* même mise en forme que le fichier d'entrée : 2 espaces, pas de
       retour à la ligne final — l'export doit être octet pour octet
       dans le format d'origine */
    telecharger("questions.json", JSON.stringify(donnees, null, 2),
      "application/json;charset=utf-8");
  }

  function exporterSynthese() {
    var qs = questionsCourantes();
    var problemes = qs.filter(poseProbleme);
    var autres = qs.filter(function (q) { return !poseProbleme(q); });
    var lignes = [];
    lignes.push("# Relecture — synthèse");
    lignes.push("");
    lignes.push("_Générée le " + new Date().toLocaleString("fr-FR") + " — relecteurs : " +
      (listeEnFrancais(relecteursConnus()) || "aucun") + "_");
    lignes.push("");

    function bloc(q) {
      lignes.push("## " + q.id + ". " + q.texte + (q.drole ? " _(fait rire)_" : ""));
      lignes.push("");
      (q.choix || []).forEach(function (c) {
        lignes.push("- **" + c.coin + "** — " + c.texte);
      });
      lignes.push("");
      var v = votesDe(q.id);
      VOTES.forEach(function (choix) {
        var noms = Object.keys(v).filter(function (p) { return v[p] === choix; });
        if (noms.length) lignes.push("- " + LIBELLES_VOTE[choix] + " : " + listeEnFrancais(noms));
      });
      var manquants = relecteursConnus().filter(function (p) { return !v[p]; });
      if (manquants.length) lignes.push("- N'ont pas voté : " + listeEnFrancais(manquants));
      var coms = commentairesDe(q.id);
      if (coms.length) {
        lignes.push("");
        lignes.push("Commentaires :");
        coms.forEach(function (c) {
          lignes.push("- " + c.prenom + " : " + c.texte + (c.resolu ? " _(résolu)_" : ""));
        });
      }
      lignes.push("");
    }

    lignes.push("## ⚠️ Questions qui posent problème (" + problemes.length + ")");
    lignes.push("");
    if (!problemes.length) lignes.push("Aucune. ");
    problemes.forEach(bloc);
    lignes.push("---");
    lignes.push("");
    lignes.push("## Les autres questions (" + autres.length + ")");
    lignes.push("");
    autres.forEach(bloc);

    telecharger("relecture-synthese.md", lignes.join("\n"), "text/markdown;charset=utf-8");
  }

  /* ---------- délégation des clics ---------- */

  function brancherEvenements() {
    $("#liste-questions").addEventListener("click", function (ev) {
      var bouton = ev.target.closest("button");
      if (!bouton) return;
      var carte = ev.target.closest(".carte");
      if (!carte) return;
      var id = Number(carte.getAttribute("data-id"));
      var q = questionsCourantes()[indexQuestion(id)];
      if (!q) return;

      if (bouton.classList.contains("btn-vote")) {
        voter(id, bouton.getAttribute("data-choix"));
        return;
      }
      var action = bouton.getAttribute("data-action");
      if (action === "commenter") commenter(id);
      else if (action === "supprimer-com") supprimerCommentaire(id, bouton.getAttribute("data-cid"));
      else if (action === "resoudre-com") basculerResolu(id, bouton.getAttribute("data-cid"));
      else if (action === "ouvrir-proposition") ouvrirFormProposition(q);
      else if (action === "envoyer-prop") envoyerProposition(q);
      else if (action === "annuler-prop") {
        var f = document.getElementById("form-prop-" + id);
        f.classList.add("cache");
        f.innerHTML = "";
      }
      else if (action === "accepter-prop") accepterProposition(id, bouton.getAttribute("data-pid"));
      else if (action === "refuser-prop") refuserProposition(id, bouton.getAttribute("data-pid"));
    });

    /* entrée dans le champ commentaire = envoyer */
    $("#liste-questions").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && ev.target.id && ev.target.id.indexOf("champ-com-") === 0) {
        ev.preventDefault();
        commenter(Number(ev.target.id.slice("champ-com-".length)));
      }
    });

    document.querySelectorAll("#filtres .filtre").forEach(function (b) {
      b.addEventListener("click", function () {
        filtreActif = this.getAttribute("data-filtre");
        document.querySelectorAll("#filtres .filtre").forEach(function (x) {
          x.classList.toggle("actif", x === b);
        });
        appliquerFiltre();
      });
    });

    $("#btn-export-json").addEventListener("click", exporterJSON);
    $("#btn-export-synthese").addEventListener("click", exporterSynthese);
  }

  /* ---------- démarrage ---------- */

  function entrer(prenom) {
    moi = prenom;
    try { localStorage.setItem("relecture:" + salle + ":prenom", moi); } catch (e) {}
    racine.child("relecteurs/" + moi).transaction(function (v) { return v || Date.now(); });
    $("#badge-moi").textContent = moi + (estAdmin ? " · admin" : "");
    if (estAdmin) $("#barre-admin").classList.remove("cache");
    montrerEcran("ecran-liste");
    brancherEvenements();

    racine.on("value", function (snap) {
      etat = snap.val() || {};
      toutRafraichir();
    });

    firebase.database().ref(".info/connected").on("value", function (snap) {
      $("#bandeau-hors-ligne").classList.toggle("cache", snap.val() === true);
    });
  }

  function demarrer() {
    if (!salle) { montrerEcran("ecran-invalide"); return; }

    firebase.initializeApp(window.RELECTURE_FIREBASE_CONFIG);
    db = firebase.database();
    racine = db.ref("relecture/" + salle);

    racine.child("questions").once("value").then(function (snap) {
      if (!snap.exists()) { montrerEcran("ecran-invalide"); return; }
      return racine.child("adminToken").once("value").then(function (t) {
        estAdmin = !!jetonAdmin && jetonAdmin === t.val();

        var memo = "";
        try { memo = localStorage.getItem("relecture:" + salle + ":prenom") || ""; } catch (e) {}
        memo = nettoyerPrenom(memo);
        if (memo) { entrer(memo); return; }

        montrerEcran("ecran-prenom");
        $("#form-prenom").addEventListener("submit", function (ev) {
          ev.preventDefault();
          var p = nettoyerPrenom($("#champ-prenom").value);
          if (p) entrer(p);
        });
      });
    }).catch(function () {
      montrerEcran("ecran-invalide");
    });
  }

  demarrer();
})();
