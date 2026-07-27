# Atelier de relecture

Petit site autonome pour relire les 40 questions de la soirée, à cinq maximum.
Aucune dépendance vers un autre projet — seules la base Firebase est partagée,
sous le chemin séparé `relecture/`.

## Liens

- Relecteurs : `https://lebrati58.github.io/kod/relecture/?s=u9QMVddOFMnA`
- Admin (Lili) : `https://lebrati58.github.io/kod/relecture/?s=u9QMVddOFMnA&admin=DDEN173q_3QR`

Le lien secret suffit comme protection (voir `spec/CAHIER-DES-CHARGES.md`, qui fait foi).

## Fichiers

- `index.html` — la page unique
- `style.css` — styles (mobile d'abord)
- `app.js` — toute la logique (Firebase Realtime Database, SDK compat par CDN)
- `config.js` — configuration Firebase (copie indépendante)
- `spec/` — cahier des charges et questions de départ

## Données

Tout vit sous `relecture/u9QMVddOFMnA/` dans la Realtime Database :
`adminToken`, `questions` (format d'entrée), `relecteurs/<prenom>`,
`votes/<id>/<prenom>`, `commentaires/<id>/<cid>`, `propositions/<id>/<pid>`.

L'export JSON (bouton admin) régénère exactement le format d'entrée.
