# ❤️ Kod — dossier de production

*L'état réel des choses, et tout ce qu'il faut préparer.*

---

## D'abord, la vérité sur l'état d'avancement

**Il n'existe pas encore de version de production complète.** Le serveur n'est pas construit, donc les cent téléphones ne peuvent pas encore être synchronisés. Voilà ce qui est réellement utilisable :

| | État | Utilisable le soir J ? |
|---|---|---|
| **L'accueil** (`kod-accueil.html`) | Terminé | **Oui, tel quel.** Aucun serveur nécessaire. |
| **Les panneaux** (`kod-panneaux.html`) | Terminé | **Oui.** À imprimer. |
| **Les questions** (`.md` / `.json`) | Terminé | **Oui.** Utilisables au micro même sans app. |
| **Le conducteur** | Terminé | **Oui.** C'est ton document de pilotage. |
| L'écran participant | Maquette | Non — attend le serveur |
| La console | Maquette | Non — participants simulés |
| L'écran géant | Pas construit | Non |
| La fin de soirée | Pas construite | Non |

**Ce que ça veut dire concrètement :** si la soirée avait lieu demain, elle se jouerait en **plan B** — questions au micro, mains levées, coins annoncés à la voix. Ça marche, c'est moins joli, et personne ne s'en apercevrait sauf toi. L'accueil et le mazal, eux, fonctionneraient pour de vrai sur chaque téléphone.

---

## Ce qu'il faut préparer, matériellement

### Les badges

- **Numérotés de 1 à 120**, gros chiffres, lisibles à trois mètres
- Épingles ou clips — pas de colle, ça tombe
- **Deux piles séparées à la porte**, une par genre, associées aux deux QR codes
- Prévois **20 % de marge** : des gens perdent leur badge, d'autres arrivent sans être inscrits

> Le numéro est la seule identité de la soirée. Sans badge lisible, la mission mazal et les mises en relation finales ne fonctionnent pas.

### Les deux QR codes

- **Un pour les femmes, un pour les hommes**, imprimés en A4, plastifiés
- C'est comme ça que le système connaît le genre sans que personne le tape
- Teste-les avec trois téléphones différents avant le jour J — c'est le point de panne le plus bête et le plus fréquent

### Les panneaux

Quatre A3 en couleur, un par coin, à accrocher **au-dessus des têtes**. Fichier `kod-panneaux.html`, bouton « Imprimer ».

### Le repérage de la salle

À faire **avant** le jour J, et à noter dans le conducteur :

- Où sont les quatre coins, précisément
- Lequel est le plus grand — c'est là qu'il faudra envoyer les réponses qui font l'unanimité
- Où est l'écran géant, et est-il visible des quatre coins ?
- Où se tient l'organisateur pour voir toute la salle

### Le son et l'écran

- **Un micro qui marche.** Tu vas parler par-dessus cent personnes.
- **De quoi couper la musique net** — c'est ce qui déclenche les migrations
- L'écran géant : vérifie la source, le câble, et la résolution avec le vrai matériel

---

## Le déroulé, en résumé

*Le détail est dans `kod-conducteur.md`.*

| Heure | Ce qui se passe |
|---|---|
| 20h00 | Accueil : QR, badge, mazal sur le téléphone |
| 20h45 | Ouverture au micro — cinq minutes, pas six |
| 20h50 | Trois questions **assis**, personne ne bouge |
| 21h05 | **La première migration** — le moment le plus important |
| 21h12 | Cycles question → migration → discussion |
| 22h15 | La rupture : la question de la salle |
| 22h50 | Question en texte libre, puis les trois choix |
| 23h00 | Les liens en privé, et la sortie |

---

## Les cinq règles de l'animateur

1. **Ne jamais expliquer le système.**
2. **Toujours être dans le coin le plus petit** — le grand s'anime tout seul.
3. **Couper une question qui tombe à plat, immédiatement.**
4. **Ne jamais couper une conversation qui marche.**
5. **Regarder la salle, pas la console.**

---

## Les trois choses qui peuvent rater

**Le réseau.** Chacun est sur sa propre 4G, pas sur le wifi du bar. Ça sera irrégulier. Le plan B doit rester possible à tout moment — questions au micro, mains levées.

**Le déséquilibre des coins.** Une question sur trois enverra plus de 40 % de la salle au même endroit. C'est mathématique. Ça se transforme en numéro, ça ne se combat pas.

**Le coin à six personnes.** Une question sur sept. C'est le vrai danger, et la seule parade c'est ta présence physique.

---

## La prochaine étape

Envoie `kod-a-construire.zip` au développement. Le cahier des charges dit quoi construire et dans quel ordre.

**Une seule chose compte en premier : le socle temps réel.** L'organisateur lance une question, cent téléphones l'affichent dans la seconde, le chronomètre est identique partout. Tant que ça ne tourne pas avec cent connexions, rien d'autre ne doit être commencé.
