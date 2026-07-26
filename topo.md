# Le topo — où on en est

*Deux projets distincts, dix fichiers, et quatre décisions encore ouvertes.*

---

## D'abord : tu as deux applications, pas une

C'est le point le plus important de ce document, parce qu'elles se ressemblent de plus en plus et qu'on a failli les confondre plusieurs fois.

| | **❤️ Kod** | **Cœur Code** |
|---|---|---|
| Ce que c'est | Une soirée de **questions** | Une soirée de **speed dating** |
| Ce qui trie | Ta réponse à la question en cours | Un algorithme d'appariement |
| Les quatre coins | Là où t'envoie ta réponse | Là où se tiennent les rencontres |
| L'unité de temps | La question | Le **RDV** de 5 minutes |
| Le final | Les mises en relation par badge | Les cœurs mutuels |
| Le public | Tout le monde, pas que du dating | Des gens venus rencontrer quelqu'un |

**Ce qu'elles partagent :** le numéro de badge comme seule identité, les deux QR codes à la porte pour capter le genre sans que personne le tape, les quatre coins de la salle, et l'anonymat.

**À décider un jour :** est-ce que Kod devient le début de soirée de Cœur Code, ou est-ce que ce sont deux soirées séparées ? Aujourd'hui rien ne tranche, et ce n'est pas urgent.

---

# Cœur Code — l'état des lieux

## Le principe

Une soirée de rencontres **entièrement anonyme**. Personne ne donne son nom, son prénom, son téléphone ou son mail. Chacun porte un badge numéroté et devient ce numéro pour la soirée. À l'écran, dans la salle, dans le système : « 34 », jamais « David ».

## L'entrée

**Deux QR codes à la porte**, un pour les femmes, un pour les hommes. C'est comme ça que le système connaît le genre — nécessaire pour apparier — sans que personne ait à le déclarer.

**Un badge numéroté**, porté sur la poitrine, lisible à trois mètres. La personne recopie son numéro dans l'app.

**Dix questions, deux minutes, tout au pouce.** Quatre servent vraiment à apparier : l'âge, chabbat, cachère, les enfants. Les six autres colorent le profil : le quartier, le style de flirt, ce qu'on fait si quelqu'un plaît, pourquoi on est venu, et la promesse finale.

> Ce qui a été **retiré** du formulaire, et qu'il ne faut pas y remettre : le métier, la taille, le plus gros défaut, le plus gros atout, ce que dirait l'ex, les deux drapeaux. Sept champs à taper debout dans une file, ça ne se remplit pas. Ces questions sont excellentes — elles sont réservées pour l'écran géant entre deux RDV.

## Le déroulé d'un RDV

1. **Le système apparie** et répartit les rencontres sur les quatre coins.
2. **Les gens rejoignent leur coin** — א Rouge, ב Bleu, ג Jaune, ד Vert — et se trouvent par numéro de badge.
3. **Cinq minutes.** Prolongeables d'une minute depuis la console.
4. **Vote secret** : ❤ ou ✖. Personne ne voit le vote de personne.
5. **Si les deux ont mis ❤**, et seulement dans ce cas, le système leur pose la question suivante.

## La question du cœur mutuel

> **« Veux-tu rester le reste de la soirée avec cette personne ? »**

Elle ne part **jamais** à quelqu'un dont le like n'était pas réciproque. Les deux répondent séparément, **sans savoir que l'autre les a likés**.

- **Les deux disent oui** → ils restent appariés pour les RDV suivants. Le couple est « figé », il apparaît dans son coin avec un cadenas.
- **Un seul dit oui** → les deux repartent dans le circuit, **sans aucune explication**. Celui qui a dit oui croira simplement que l'autre ne l'avait pas liké.
- **Les deux disent non** → pareil, et le match reste en mémoire pour la révélation finale.

**On ne dit jamais qui a refusé.** C'est un mensonge par omission, et il est là pour protéger.

**Réglages actuels, modifiables en une ligne :** pas avant le **RDV 3**, et **quatre couples figés maximum**. Ces deux chiffres ne sont pas décoratifs — chaque couple figé retire deux personnes du circuit pour tous les autres.

## Le moteur d'appariement

**Filtres durs** — la rencontre n'a pas lieu :
- écart d'âge supérieur à 12 ans
- extrêmes opposés sur la pratique de chabbat
- l'un qui veut des enfants face à l'autre qui n'en veut pas

**Puis un score d'affinité** : être venu pour la même chose pèse lourd, l'écart d'âge, la proximité sur chabbat et cachère, le quartier, et le fait de ne pas avoir le même style de flirt — deux timides ne se parlent pas.

**Et par-dessus tout, l'équité.** Celui qui a eu le moins de RDV passe en tête ; l'affinité ne départage qu'à égalité. Ce n'est pas un détail moral, c'est ce qui fait fonctionner la soirée : sans cette règle, certains finissaient avec 2 RDV et d'autres avec 8. Avec elle, **tout le monde est entre 6 et 8 — et le total de rencontres augmente**, de 165 à 171 sur huit RDV.

Enfin : **jamais deux fois les mêmes personnes**.

## Ce que dit la simulation, sur 22 femmes et 26 hommes

| | |
|---|---|
| Rencontres par RDV | 20 à 22 |
| Personnes sans date à chaque RDV | **4 à 8** |
| RDV par personne sur la soirée | 6 à 8 |
| Total de rencontres sur 8 RDV | 171 |

**Les 4 à 8 personnes sans date sont le vrai sujet de la soirée.** La console te les affiche nommément, en rouge. La consigne : les envoyer au bar **ensemble**. Quatre personnes libres au bar, c'est une rencontre possible. Quatre personnes assises seules dans leur coin, c'est quatre mauvais souvenirs.

## La console

Elle remplace le tableur. Sur téléphone, au pouce, dans le noir.

- Chronomètre de 5:00 en gros, qui vire au rouge dans les 30 dernières secondes
- Les quatre coins avec leurs duos, qui passent au vert quand les deux ont voté
- Les sans-date en rouge, nommément
- Lancer le RDV · +1 minute · Clore · Entracte · Révéler les matches · Proposer de rester ensemble · Redistribuer les coins
- Journal horodaté de tout ce que tu as fait

**Trois alertes automatiques :**
- il manque des votes et tu t'apprêtes à lancer le RDV suivant → les matches seraient faux
- six personnes ou plus sans date → envoie-les au bar ensemble
- des couples figés **et** huit personnes sans date → arrête de proposer de rester ensemble

---

# Les fichiers

**Cœur Code**
- `coeurcode-entree.html` — le questionnaire d'entrée, dix écrans, anonyme
- `coeurcode-console.html` — la console de la soirée
- `coeurcode-questions-entree.md` — la logique des questions et l'appariement

**Kod**
- `kod-accueil.html` — badge, date, lieu, révélation du mazal, puis QCM sur la date hébraïque
- `kod-console.html` — la console des questions, ouverture sur le Yanuka
- `kod-questions.md` / `.json` — les 28 questions
- `kod-conducteur.md` — le déroulé de la soirée, de 20h à 23h
- `kod-prototype.html` — la première maquette des trois interfaces
- `kod-question-ouverte.html` — la question à texte libre avec nuage de mots

---

# Ce qui reste ouvert

**1. La sortie d'un couple figé.** Deux personnes qui se figent au RDV 3 et qui regrettent au RDV 4 sont coincées jusqu'à la fin. Il faut un bouton discret « je préfère retourner dans le circuit », qui libère sans prévenir l'autre autrement que par le fait de ne plus être apparié.

**2. Comment un match se concrétise après la soirée.** Sans nom ni téléphone, il faut choisir : tout se règle dans la salle, ou bien un canal aveugle en fin de soirée où chacun donne un contact uniquement s'il a un match, transmis à ce match seul.

**3. Le déséquilibre hommes-femmes.** Aucun algorithme ne le corrige. 26 hommes pour 22 femmes produisent mécaniquement des gens sans date à chaque tour. Ça se règle à la billetterie, en amont.

**4. Et le gros morceau : le serveur.** Tout ce qui existe aujourd'hui tourne dans un seul navigateur, avec des participants simulés. La vraie soirée demande que cent téléphones affichent la même chose au même moment, avec un chronomètre calculé côté serveur — sinon les téléphones dérivent — et une reprise de session si quelqu'un perd le réseau. C'est l'étape qui décide de la technologie, et c'est la prochaine.
