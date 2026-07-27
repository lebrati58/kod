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

7. **Les critères d'appariement ne sont jamais affichés.** Ni à l'écran géant, ni sur le téléphone d'un autre participant, ni dans la console. Ils servent à filtrer les suggestions et à rien d'autre. L'âge et le désir d'enfants sont parmi les informations les plus intimes qu'on puisse demander — elles doivent être supprimées après la soirée, et il faut le dire à l'accueil : ça augmente le taux de réponses honnêtes.

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

### La première migration se fait par le mazal

**Décision prise après la première version de ce document.**

La toute première migration de la soirée **ne suit aucune question**. Chacun a déjà son mazal, calculé à l'accueil : le système l'envoie directement dans un coin, sans qu'il ait répondu à quoi que ce soit.

Le regroupement des sept mazalot en quatre coins est fixe :

| Coin | Mazalot | (ne jamais l'expliquer au participant) |
|---|---|---|
| **א** | חמה Hama · לבנה Levana | les deux lumières |
| **ב** | צדק Tzedek · נוגה Nogah | les deux bénéfiques |
| **ג** | מאדים Maadim · שבתאי Chabtaï | les deux sévères |
| **ד** | כוכב Kokhav | le messager, seul |

> **Le coin ד sera structurellement le plus petit** — un mazal sur sept, donc environ 14 personnes sur 100 contre une trentaine ailleurs. Ce n'est pas un bug. La console doit néanmoins le signaler à l'organisateur comme n'importe quel coin sous-peuplé.

**Toutes les migrations suivantes** se font normalement : le coin d'une personne est sa réponse à la question en cours.

### Étape 2 — le parcours du participant

#### L'accueil

À reprendre de `kod-accueil.html` : badge, date et lieu de naissance, jeu de la date hébraïque, révélation du mazal.

**S'y ajoutent les critères d'appariement ci-dessous**, posés avant que la soirée commence. Ils servent à filtrer les cinq numéros suggérés dans les coins.

**D'abord une question d'aiguillage :**

> **Tu cherches quoi, ce soir ?**
> · Rencontrer quelqu'un · Des amis, du monde · Un partenaire de projet ou de voyage · Je ne sais pas encore

**Si — et seulement si — la réponse est « rencontrer quelqu'un »**, on pose les trois questions suivantes. Sinon on les saute : quelqu'un venu se faire des amis n'a aucune raison de déclarer son désir d'enfants, et le lui demander casse le ton de la soirée.

**1. Ton âge**
Un seul chiffre. La tranche recherchée n'est **pas** demandée au participant : c'est l'organisateur qui fixe un écart d'âge maximum unique pour toute la soirée, depuis sa console (voir plus bas).

**2. Souhait d'avoir des enfants**
- Je souhaite avoir des enfants
- Je ne souhaite pas avoir d'enfants
- Je suis ouvert à la discussion, ça dépend de la personne

**3. Si la personne a déjà des enfants**
- J'accepte que la personne ait déjà des enfants
- Je préfère qu'elle n'en ait pas
- Sans préférence

Il faut aussi savoir si **la personne elle-même a des enfants** — sans quoi le critère 3 ne peut être appliqué. Une question de plus, à choix simple : oui / non.

Au total, l'accueil pose donc : le badge, la date et le lieu de naissance, la question d'aiguillage, et — pour ceux qui cherchent à rencontrer quelqu'un — l'âge et trois questions sur les enfants.

> **Attention au temps.** L'accueil doit rester sous les trois minutes, debout dans une file. Tout au pouce, aucun champ de texte, aucune saisie libre.

#### Le filtrage des suggestions

Les cinq numéros proposés dans un coin ne sont pas tirés au hasard. L'ordre de priorité est strict :

**1. Les filtres durs — la suggestion n'a jamais lieu si :**
- l'écart d'âge dépasse **la valeur fixée par l'organisateur dans la console**
- l'un veut des enfants et l'autre n'en veut pas — « ouvert à la discussion » est compatible avec les deux
- l'un a des enfants et l'autre a déclaré préférer que non

**2. Puis, parmi ceux qui restent :**
- priorité absolue aux personnes **jamais encore suggérées** — c'est ce qui fait passer chacun de 33 à 44 rencontres sur la soirée
- les suggestions sont **réciproques** : si le 47 est sur la liste du 15, le 15 est sur celle du 47. Sans ça, on envoie quelqu'un vers une personne qui ne l'attend pas.
- un ou deux des cinq partagent le mazal, quand c'est possible — c'est mis en évidence à l'écran

**3. Ceux qui ne cherchent pas à rencontrer quelqu'un** ne sont filtrés sur aucun de ces critères. Ils sont suggérés librement, et les critères des autres ne s'appliquent pas à eux.

#### L'écart d'âge maximum

**Au lancement de la soirée, la console demande à l'organisateur un seul nombre :** l'écart d'âge maximum toléré entre deux personnes suggérées. Par exemple 10 — un participant de 28 ans ne sera alors jamais suggéré à quelqu'un de plus de 38 ans ni de moins de 18.

- Valeur par défaut proposée : **10 ans**
- Modifiable **à tout moment pendant la soirée**, sans relancer quoi que ce soit
- Une valeur très haute (99) désactive de fait le filtre

> **Pourquoi côté organisateur et pas côté participant :** c'est deux questions de moins dans une file d'attente, un seul chiffre à régler au lieu de cent tranches à croiser, et surtout un rattrapage possible en direct. Si les listes de suggestions sortent trop maigres au premier tour, l'organisateur élargit et tout se débloque immédiatement.

> **Ne jamais afficher pourquoi deux personnes se sont vu proposer l'une l'autre.** Ni l'âge, ni les enfants, ni aucun critère. L'écran dit seulement « a répondu comme toi ». Le reste ne regarde personne.
#### La boucle de soirée

À reprendre de `kod-participant.html` : question → attente → coin → **les cinq numéros** → bouton « prêt ».

**Le bouton « prêt »** : visible immédiatement mais **grisé pendant 180 secondes**, avec décompte. Ensuite actif. Quand un coin atteint **60 %** de prêts, la console le signale à l'organisateur — qui décide.

**Les cinq numéros** : en arrivant dans son coin, le participant reçoit cinq numéros de badge de personnes présentes dans ce même coin, calculés selon les règles ci-dessus. Il peut en barrer un quand il l'a rencontré. Ce ne sont que des suggestions — personne n'est obligé.

Cinq est un chiffre calibré, pas arbitraire : à trois numéros chacun ne rencontre que 33 personnes dans la soirée, à cinq il en rencontre 44, et au-delà le gain devient nul pendant que la liste devient illisible dans un bar sombre.

**Le mazal ne trie personne.** Il sert uniquement à mettre en évidence un ou deux numéros de la liste — « même mazal que toi » — pour donner une raison d'aller voir celui-là en premier.

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
