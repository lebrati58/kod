# ❤️ Kod & Cœur Code — les fichiers

Chaque fichier `.html` est **autonome** : aucune installation, aucune dépendance à charger.
Tu l'ouvres dans un navigateur, sur téléphone ou sur ordinateur, et il tourne.
Les seules ressources externes sont les polices Google — sans réseau, il s'affiche
avec les polices du système, tout reste utilisable.

---

## ❤️ Kod — la soirée de questions

| Fichier | Ce que c'est |
|---|---|
| `kod-accueil.html` | L'accueil : badge, date et lieu, QCM sur la date hébraïque, révélation du mazal |
| `kod-console.html` | Ta console : lancer les questions, voir les quatre coins, le vote « prêt » |
| `kod-question-ouverte.html` | La question à texte libre, avec nuage de mots sur l'écran géant |
| `kod-prototype.html` | La toute première maquette des trois interfaces |
| `kod-questions.md` | Les 28 questions, lisibles |
| `kod-questions.json` | Les 28 questions, exploitables par le code |
| `kod-conducteur.md` | Le déroulé de la soirée, de 20h à 23h |

**Les quatre coins :** א Rouge · ב Bleu · ג Jaune · ד Vert.
Ils nomment un endroit, ils ne portent aucun profil.
Ta réponse à la question en cours décide de ton coin, et tout est rebattu à la question suivante.

---

## Cœur Code — la soirée de speed dating

| Fichier | Ce que c'est |
|---|---|
| `coeurcode-entree.html` | Le questionnaire d'entrée, dix écrans, entièrement anonyme |
| `coeurcode-console.html` | Ta console : les RDV de 5 minutes, les coins, les cœurs mutuels |
| `coeurcode-questions-entree.md` | La logique des questions et de l'appariement |

---

## Le récapitulatif

`topo.md` — l'état des deux projets, ce qui est décidé, ce qui reste ouvert.

---

## Réglages rapides

Tout est en haut des scripts, sur une ligne.

**`kod-console.html`**
- `PLANCHER = 180` — secondes pendant lesquelles le bouton « prêt » reste grisé
- `SEUIL = 0.60` — part d'un coin qui doit se dire prête
- `ORDRE` — l'ordre de passage des questions ; il ouvre sur le Yanuka

**`coeurcode-console.html`**
- `DUREE = 300` — durée d'un RDV en secondes
- `RDV_MINIMUM = 3` — avant ce RDV, on ne propose pas de rester ensemble
- `COUPLES_MAX = 4` — plafond de couples figés

---

## Ce qui manque encore

Tous ces fichiers tournent dans **un seul navigateur**, avec des participants simulés.
Pour la vraie soirée il faut un serveur : cent téléphones qui affichent la même chose
au même instant, un chronomètre calculé côté serveur — sinon les téléphones dérivent —
et une reprise de session quand quelqu'un perd la 4G.

C'est la prochaine étape, et c'est elle qui décide de la technologie.
