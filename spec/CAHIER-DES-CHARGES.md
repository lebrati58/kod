# ❤️ Kod — cahier des charges

*À lire en premier. Ce document dit quoi construire, dans quel ordre, et ce qu'il ne faut surtout pas casser.*

---

## Le contexte en trente secondes

**Kod** est une web app qui anime une soirée d'environ **100 personnes dans un bar**, à Tel Aviv, pour la communauté franco-israélienne. Un organisateur pilote depuis son téléphone. Les participants répondent à des questions sur leur téléphone, et **leur réponse les envoie physiquement dans un des quatre coins de la salle**.

Les fichiers HTML joints sont des **maquettes fonctionnelles, pas l'application**. Le design, les textes, les calculs et les règles y sont justes et vérifiés — mais tout tourne dans un seul navigateur, avec des participants simulés.

**Ce qu'il faut construire, c'est la partie serveur** : que cent téléphones affichent la même chose au même instant.

---

## Les règles à ne jamais casser

1. **Le coin d'une personne = sa réponse à la question en cours.** Aucun cumul, aucun score, aucun profil. Tout est rebattu à chaque question. C'est le cœur du concept — un algorithme qui « mémorise » les réponses le détruirait.

2. **On n'explique jamais le système aux participants.** Aucune interface ne doit révéler la mécanique.

3. **L'organisateur décide toujours.** Le système signale, il ne déclenche jamais le passage à la question suivante tout seul.

4. **Le chronomètre est calculé côté serveur.** Chaque téléphone affiche `fin_prévue - maintenant`, jamais son propre décompte : sinon cent téléphones dérivent les uns des autres.

5. **La reprise de session est obligatoire.** Quelqu'un qui perd la 4G ou verrouille son téléphone doit retrouver l'état exact en revenant. Identifiant : son numéro de badge.

6. **Anonymat total.** Ni nom, ni prénom, ni e-mail, ni téléphone. Le numéro de badge est la seule identité.

---

## Ce qui existe déjà, et qui sert de référence

| Fichier | À quoi ça sert pour toi |
|---|---|
| `kod-conducteur.md` | **Le fil conducteur.** Le déroulé complet de la soirée. À lire avant tout le reste. |
| `kod-accueil.html` | L'accueil, terminé. Contient le calcul du **mazal** et de la **date hébraïque** — code à reprendre tel quel, il est vérifié. |
| `kod-participant.html` | L'écran du participant pendant la soirée : question, coin, mission mazal, bouton « prêt ». |
| `kod-console.html` | La console de l'organisateur. |
| `kod-question-ouverte.html` | La question en texte libre et son nuage de mots. |
| `kod-questions.json` | Les 40 questions, structurées. `coin` vaut `א`, `ב`, `ג` ou `ד`. |
| `kod-questions.md` | Les mêmes, lisibles, avec les notes d'usage. |

**Reprends le HTML et le CSS de ces maquettes.** Le design est validé : contrastes mesurés, gros boutons, lisible dans un bar sombre. Ne le refais pas.

---

## Les quatre coins

| Lettre | Couleur | Hex |
|---|---|---|
| **א** | Rouge | `#C22E2E` |
| **ב** | Bleu | `#2C6FD1` |
| **ג** | Jaune | `#A8760C` |
| **ד** | Vert | `#1D7A52` |

La **lettre** identifie le coin — elle se lit de loin et s'annonce au micro. La couleur n'est qu'un renfort visuel. Ne jamais utiliser la couleur seule.

---

## Ce qu'il faut construire

### Étape 1 — le socle temps réel

**C'est la seule étape qui compte. Rien d'autre ne doit être commencé avant qu'elle tourne.**

L'organisateur lance une question depuis sa console → les cent téléphones l'affichent dans la seconde → le chronomètre est identique partout → les réponses remontent → les résultats s'affichent sur l'écran géant.

Ce qu'il faut :

- Une **session de soirée** avec un code, créée par l'organisateur
- Une **connexion temps réel** (websocket ou équivalent) vers tous les téléphones
- Un **état de soirée** côté serveur : question en cours, timestamp de fin, réponses reçues
- Une **reprise de session** par numéro de badge
- Trois clients : **participant**, **écran géant**, **console**

> **Ne construis rien d'autre tant que ça ne tourne pas avec cent connexions simultanées.** Le reste est du confort ; ça, c'est la soirée.

### Étape 2 — le parcours du participant

- L'accueil (à reprendre de `kod-accueil.html`) : badge, date et lieu, jeu de la date hébraïque, révélation du mazal
- La boucle de soirée (à reprendre de `kod-participant.html`) : question → attente → coin → mission mazal → bouton « prêt »

**Le bouton « prêt »** : visible immédiatement mais **grisé pendant 180 secondes**, avec décompte. Ensuite actif. Quand un coin atteint **60 %** de prêts, la console le signale à l'organisateur — qui décide.

**La mission mazal** : en arrivant dans son coin, le participant voit combien de personnes de ce coin partagent son mazal. Le serveur calcule ce nombre réel. S'il est seul, le message change (voir la maquette). Le mazal ne trie personne : il sert uniquement à donner une raison d'aborder quelqu'un.

### Étape 3 — l'écran géant

Manque entièrement. Il lui faut :

- La question en cours, en très gros, lisible à quinze mètres
- Les résultats **en barres qui montent progressivement** — une barre qui apparaît pleine ne produit aucune réaction dans la salle
- Le plan de salle : quatre quadrants, les points qui migrent
- Un compte à rebours plein écran pour les migrations
- Les messages libres envoyés depuis la console
- Le nuage de mots pour la question en texte libre

### Étape 4 — la fin de soirée

- La question en texte libre et son nuage de mots
- « Trois numéros que tu aimerais revoir » — puis **uniquement les réciproques**, **uniquement en privé**
- Le portrait de la salle par mazal : « ce soir, vous étiez quatorze sous נוגה »

> **Point critique :** celui qui n'a aucun lien réciproque ne doit **jamais** recevoir « personne ne t'a choisi ». Chez lui, l'écran des liens ne s'affiche simplement pas. Il repart avec son mazal et sa date hébraïque, comme tout le monde.

---

## Contraintes du terrain

**Chacun est sur sa propre 4G**, pas sur le wifi du bar. Le réseau sera irrégulier. Prévoir la reconnexion automatique et le rattrapage d'état.

**Le bar est sombre et bruyant.** Gros boutons, fort contraste, tout au pouce.

**L'organisateur est debout, dans le noir, avec un verre à la main.** Sa console doit être utilisable d'une main.

**Le plan B doit rester possible** : si le réseau lâche complètement, la soirée se joue au micro et à l'écran géant. Ne jamais construire quelque chose qui empêche ça.

---

## Ce qui est déjà décidé, et qu'il ne faut pas rediscuter

- **12 questions dans la soirée** (la bibliothèque en contient 40 pour avoir de la réserve et pouvoir remplacer en direct)
- **Les discussions s'allongent** : 6 minutes, puis 7, puis 8
- **Une question sur trois enverra plus de 40 % de la salle dans le même coin.** C'est mathématique, ça ne se corrige pas. La console doit juste alerter l'organisateur.
- **Une question sur sept laissera un coin sous 8 personnes.** La console doit l'alerter aussi — c'est le vrai danger de la soirée.

---

## Sur la technologie

Rien n'est arrêté. Ce qui compte : **le temps réel doit être simple et fiable**, et l'ensemble doit tenir cent connexions simultanées sans réglage exotique. Choisis ce que tu maîtrises le mieux ; on ne changera pas de pile en cours de route.

Les calculs du mazal et de la date hébraïque **n'ont aucune dépendance** — ils utilisent le calendrier hébraïque du navigateur et une guématria écrite à la main. Reprends-les tels quels depuis `kod-accueil.html`, ils sont vérifiés sur une dizaine de dates de référence, y compris les années à treize mois et la bascule au coucher du soleil.
