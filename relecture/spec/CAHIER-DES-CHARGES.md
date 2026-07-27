# Atelier de relecture — cahier des charges

*Projet autonome. Il n'a aucun lien avec le reste et ne doit en avoir aucun.*

---

## Ce qu'il faut construire

Un site web accessible par un lien. **Cinq personnes au maximum** l'ouvrent, relisent une liste de questions, donnent leur avis et proposent des corrections. **Tout le monde voit tout, en direct.**

Cinq, c'est petit — et ça simplifie tout. Pas de pagination, pas d'agrégation statistique, pas de gestion de charge. On peut afficher chaque avis nominativement sans que ça devienne illisible, et c'est justement ce qu'on veut.

Il n'y a pas d'autre fonctionnalité. Ce n'est pas un réseau social, il n'y a pas de profils, pas de notifications, pas d'historique de connexion.

---

## Qui l'utilise

**Cinq personnes au maximum**, non techniciennes, la plupart sur téléphone. Elles reçoivent un lien par WhatsApp, l'ouvrent, tapent leur prénom, et travaillent. **Aucune inscription, aucun mot de passe, aucun compte.**

Le lien secret suffit comme protection. Personne ne cherchera à saboter un questionnaire de soirée.

Puisqu'ils ne sont que cinq, **on affiche toujours qui a répondu quoi, nominativement**. Pas de « 3 votes pour garder » : on écrit « Sarah, David et Léa veulent garder ». Savoir qui pense quoi est plus utile qu'un total, et permet d'aller en parler directement.

---

## Les données

Le fichier `questions.json` fourni contient la liste de départ : 40 questions, chacune avec un texte, quatre réponses, et pour chaque réponse une lettre parmi `א`, `ב`, `ג`, `ד`.

```json
{
  "coins": [{"lettre":"א","couleur":"Rouge"}, …],
  "questions": [
    {
      "id": 1,
      "texte": "Un dimanche parfait, c'est quoi ?",
      "drole": false,
      "choix": [
        {"texte":"Une rando, partie tôt et sans plan","coin":"א"},
        {"texte":"Rideaux fermés, série, personne","coin":"ב"},
        …
      ]
    }
  ]
}
```

Les quatre lettres sont fixes et ne changent jamais. Leurs couleurs :

| Lettre | Couleur | Hex |
|---|---|---|
| **א** | Rouge | `#C22E2E` |
| **ב** | Bleu | `#2C6FD1` |
| **ג** | Jaune | `#A8760C` |
| **ד** | Vert | `#1D7A52` |

---

## Ce que fait l'outil

### Entrer

Un écran unique : « ton prénom ». On tape, on entre. Le prénom est retenu sur l'appareil pour ne pas le redemander à chaque fois.

### Voir les questions

Une liste. Pour chaque question :

- son numéro et son texte
- ses quatre réponses, chacune précédée de sa lettre à la bonne couleur
- une étiquette si la question est marquée « fait rire »
- le décompte des votes des autres

### Voter

Trois boutons par question : **garder**, **à revoir**, **supprimer**. Un vote par personne et par question, modifiable à tout moment.

Sous les boutons, **les prénoms de ceux qui ont voté quoi**, en direct. Et un repère visible sur les questions où **tout le monde n'a pas encore voté** — à cinq, l'avis manquant se remarque et se réclame.

### Commenter

Un champ de texte sous chaque question. Le commentaire s'affiche avec le prénom de son auteur. Chacun peut supprimer les siens, personne ne peut supprimer ceux des autres.

### Proposer une correction

C'est le point délicat, et il faut le faire exactement comme ça :

**Les relecteurs ne modifient jamais directement une question.** Ils soumettent une proposition : un nouveau texte, une nouvelle réponse, un changement de lettre. La proposition s'affiche sous la question, avec le prénom de son auteur.

**Une seule personne — l'administrateur — peut accepter ou refuser.** Accepter applique la modification. Refuser la retire.

> **Pourquoi :** à dix personnes qui écrivent en même temps, l'édition directe fait perdre du travail sans que personne s'en rende compte. La proposition suivie d'une validation évite ça entièrement, et c'est beaucoup plus simple à construire qu'une fusion de modifications concurrentes.

L'administrateur est reconnu par un lien distinct, avec un jeton dans l'adresse. Rien de plus.

### Filtrer

Quatre filtres : toutes · pas encore votées par moi · celles qui posent problème · celles qui font rire.

« Qui posent problème » veut dire : **au moins deux personnes sur cinq ont voté « à revoir » ou « supprimer »**, ou bien il y a un commentaire non résolu. À cinq relecteurs, deux avis négatifs suffisent à justifier qu'on rouvre le sujet.

### Exporter

Deux boutons pour l'administrateur :

- **Exporter le JSON** — la liste à jour, dans le format d'entrée exactement. C'est ce fichier qui repart vers la soirée.
- **Exporter la synthèse** — un document lisible : les questions qui posent problème en premier, avec les votes et les commentaires.

---

## Le temps réel

Quand quelqu'un vote ou commente, **les autres doivent le voir sans recharger la page.**

Un rafraîchissement automatique toutes les dix secondes suffit largement. **Cinq personnes qui relisent tranquillement n'ont besoin d'aucune infrastructure temps réel** — pas de websockets, pas de file de messages. Prends le plus simple qui marche.

---

## Contraintes

**Sur téléphone d'abord.** La plupart des relecteurs seront sur mobile. Gros boutons, tout au pouce, rien à survoler.

**Aucune donnée personnelle.** Un prénom, c'est tout. Pas d'e-mail, pas de compte, pas de suivi.

**Ça doit survivre à un rafraîchissement de page et à une perte de réseau.** Les votes et commentaires sont enregistrés côté serveur au moment où on les fait.

**Une sauvegarde du JSON par jour**, quelque part. Ce fichier est le fruit de plusieurs semaines de travail ; le perdre serait le seul vrai échec possible de ce projet.

---

## Ce qu'il ne faut pas faire

- Pas de comptes, pas de mots de passe, pas d'e-mails
- Pas de notifications
- Pas d'édition directe et simultanée du texte des questions
- Pas de fusion automatique de modifications concurrentes
- Pas de lien avec un autre projet, quel qu'il soit
- Pas de statistiques, de graphiques ni de tableaux de bord — à cinq, on lit les prénoms
- Rien qui suppose plus de cinq utilisateurs : ni pagination, ni recherche d'utilisateur, ni rôles multiples

---

## Sur la technologie

Rien n'est imposé. Ce qui compte : **un lien qui s'ouvre chez tout le monde, et des données qui ne se perdent pas.** Choisis ce que tu déploies le plus vite et le plus sûrement.

C'est un très petit outil : cinq utilisateurs, une liste de quarante questions, trois boutons. **S'il prend plus de deux jours, c'est qu'il est parti trop loin** — relis la section « ce qu'il ne faut pas faire ».
