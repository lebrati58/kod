# Carrousel — appariement sans répétition

Module autonome, sans dépendance. `node test_carrousel.js` pour vérifier.

## Le principe

On fige la première personne, toutes les autres tournent d'un cran à chaque
rotation. Sur N participants, **N-1 rotations apparient tout le monde avec tout
le monde, exactement une fois**. Aucun tirage aléatoire, aucun re-tirage, aucun
historique à stocker — et jamais de blocage en fin de soirée.

## Utilisation

```js
const { creerCarrousel, pairesDe, repartirEnCoins,
        ajouterArrivants, prochainePaires } = require('./carrousel');

// au démarrage
let carrousel = creerCarrousel([1, 2, 3, ..., 66]);

// à chaque bloc de 3 questions
const { paires, repos } = pairesDe(carrousel, numeroDuBloc);
const avecCoins = repartirEnCoins(paires);
// → [{ paire: [1, 66], coin: 'א' }, { paire: [2, 65], coin: 'ב' }, …]
```

## Nombre impair

Un participant fantôme est ajouté automatiquement. Celui qui tombe en face de
lui **se repose ce tour-ci**, et le carrousel garantit que ce n'est jamais deux
fois la même personne : sur 67 participants, 67 tours, 67 personnes différentes
au repos.

`pairesDe()` renvoie son numéro dans `repos`. À afficher gentiment sur son
téléphone — jamais « tu n'as personne », plutôt « ce tour-ci tu es libre, va au
bar, vous êtes plusieurs ».

## Arrivées tardives

```js
const res = ajouterArrivants(carrousel, [100, 101, …], rotationCourante);
carrousel = res.carrousel;

// ensuite, pour éviter les paires déjà jouées :
const { paires, repos, rotation } = prochainePaires(carrousel, rot, dejaVues);
```

`dejaVues` est un `Set` de clés `"petit-grand"`. Vérifié : après l'ajout de 20
personnes à 66, les blocs suivants ne produisent aucune répétition.

## Ce qui est vérifié

- 66 personnes, 65 rotations, 2145 paires, **0 répétition**
- toutes les paires possibles sont couvertes exactement une fois
- impair : quelqu'un se repose à chaque tour, jamais deux fois la même personne
- personne n'apparaît deux fois dans le même tour
- coins équilibrés à une paire près
- petits effectifs (4, 5, 8, 9) : aucune répétition
- 66 + 20 arrivants en cours de soirée : aucune répétition
