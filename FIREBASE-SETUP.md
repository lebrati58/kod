# 🔥 Brancher Kod sur Firebase — pas à pas

*Pour Lili. Aucune connaissance technique nécessaire. Compte 15 minutes, un ordinateur, et un compte Google (Gmail).*

> **État actuel : déjà branché. ✅**
> Le projet **kod-soiree** existe, la Realtime Database (europe-west1) répond, et la
> configuration est déjà remplie dans `app/config.js`. Les étapes 1, 2, 3 et 5 sont faites.
> **Il reste une seule chose à faire : l'étape 4** (coller les règles de sécurité) — la base
> est pour l'instant en « mode test », qui ouvre tout et **expire au bout de 30 jours**.
> Ce guide complet reste là au cas où il faudrait un jour tout recréer de zéro.

Firebase, c'est le service de Google qui va faire parler les cent téléphones entre eux, en temps réel. C'est **gratuit** pour une soirée comme la nôtre (le plan gratuit accepte 100 connexions en même temps).

---

## Étape 1 — Créer le projet

1. Va sur **https://console.firebase.google.com** et connecte-toi avec ton compte Google.
2. Clique sur **« Créer un projet »** (ou « Add project » si c'est en anglais).
3. Nom du projet : tape **kod** (ou ce que tu veux). Clique **Continuer**.
4. On te propose « Google Analytics » : **désactive-le** (bouton à décocher), on n'en a pas besoin. Clique **Créer le projet**.
5. Attends quelques secondes, puis clique **Continuer**. Tu arrives sur le tableau de bord du projet.

## Étape 2 — Ajouter une application Web

1. Sur la page d'accueil du projet, tu vois des icônes rondes (iOS, Android, et **`</>`**). Clique sur **`</>`** (c'est l'application Web).
2. Surnom de l'application : tape **kod-web**. **Ne coche pas** « Firebase Hosting ».
3. Clique **Enregistrer l'application**.
4. Firebase t'affiche alors un morceau de code avec un bloc qui ressemble à ça :

   ```
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "kod-xxxx.firebaseapp.com",
     projectId: "kod-xxxx",
     storageBucket: "kod-xxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

   **⚠️ Ne ferme pas cette page** (ou note où la retrouver : ⚙️ Paramètres du projet → tout en bas, « Tes applications »). C'est CE bloc qu'on va copier à l'étape 5.
5. Clique **Continuer vers la console**.

## Étape 3 — Créer la base de données temps réel

1. Dans le menu de gauche, clique sur **Créer** (ou « Build ») puis **Realtime Database**.
   ⚠️ Attention : c'est bien **« Realtime Database »**, PAS « Firestore Database ». Ce sont deux choses différentes.
2. Clique **Créer une base de données**.
3. Emplacement : choisis **Belgique (europe-west1)** — c'est le plus proche.
4. Règles de sécurité : choisis **« Démarrer en mode test »**, puis **Activer**.
5. La base est créée. En haut de la page, tu vois une adresse du genre :

   ```
   https://kod-xxxx-default-rtdb.europe-west1.firebasedatabase.app
   ```

   C'est le **databaseURL**. Note-le (ou garde l'onglet ouvert), on en a besoin à l'étape 5.

## Étape 4 — Coller les règles de sécurité

Le « mode test » ouvre toute la base à tout le monde et **expire au bout de 30 jours**. On le remplace tout de suite par nos règles : elles n'ouvrent que le dossier des soirées, et vérifient que les données ont la bonne forme.

1. Toujours dans **Realtime Database**, clique sur l'onglet **Règles** (« Rules »).
2. Efface tout ce qui est dans la zone de texte.
3. Ouvre le fichier **`database.rules.json`** (à la racine du projet Kod, à côté de ce document), copie **tout** son contenu, et colle-le dans la zone de texte.
4. Clique **Publier** (« Publish »). Si un avertissement s'affiche, c'est normal, valide.

## Étape 5 — Copier la configuration dans l'application

1. Ouvre le fichier **`app/config.js`** du projet Kod.
2. Tu y vois sept lignes avec **"COLLER_ICI"**. Remplace chacune par la valeur du bloc `firebaseConfig` de l'étape 2, **entre guillemets**, par exemple :

   ```js
   window.KOD_FIREBASE_CONFIG = {
     apiKey: "AIzaSyB...",
     authDomain: "kod-xxxx.firebaseapp.com",
     databaseURL: "https://kod-xxxx-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "kod-xxxx",
     storageBucket: "kod-xxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

   ⚠️ **Le `databaseURL` n'apparaît pas toujours** dans le bloc que Firebase affiche. Si c'est le cas, ajoute-le toi-même : c'est l'adresse notée à l'étape 3 (celle qui contient `europe-west1.firebasedatabase.app`).
3. Enregistre le fichier, puis publie-le sur GitHub (commit + push, comme d'habitude).

## Étape 6 — Vérifier que tout marche

Une fois le site en ligne sur GitHub Pages (une ou deux minutes après le push) :

1. Ouvre **https://lebrati58.github.io/kod/app/console.html** sur ton téléphone.
   - Si un bandeau rouge « Configuration Firebase manquante » s'affiche → l'étape 5 n'est pas bonne, revérifie `app/config.js`.
2. Appuie sur **« Créer une soirée »** → un code de 4 lettres apparaît en haut. 🎉 La base répond.
3. Ouvre **https://lebrati58.github.io/kod/app/ecran.html** sur un ordinateur, entre le code → l'écran affiche « Kod » et le code en géant.
4. Ouvre **https://lebrati58.github.io/kod/app/participant.html?g=f** sur un autre téléphone, entre le code et un numéro de badge (par exemple 34) → sur la console, le compteur « connectés » passe à 1.
5. Depuis la console, choisis une question et **« Lancer »** → elle apparaît dans la seconde sur le téléphone participant et sur l'écran géant, avec le même chronomètre partout.
6. Réponds sur le téléphone participant → ta lettre s'affiche, et la console voit la réponse arriver.
7. **Teste la reprise de session** : ferme complètement l'onglet du participant, rouvre la même adresse → il retrouve son écran exact, sans rien retaper.
8. Pour le test des 100 connexions : ouvre **https://lebrati58.github.io/kod/app/test-charge.html** sur un ordinateur, entre le code, laisse 100, et **« Lancer la simulation »**. Le compteur « connectés » de la console doit monter vers 100, et les réponses tomber en direct.

## Les adresses à retenir

| Qui | Adresse |
|---|---|
| Console (toi) | `https://lebrati58.github.io/kod/app/console.html` |
| Écran géant | `https://lebrati58.github.io/kod/app/ecran.html` |
| QR femmes | `https://lebrati58.github.io/kod/app/participant.html?g=f` |
| QR hommes | `https://lebrati58.github.io/kod/app/participant.html?g=h` |
| Test de charge | `https://lebrati58.github.io/kod/app/test-charge.html` |

## Si ça coince

- **Bandeau rouge « Configuration Firebase manquante »** → il reste un "COLLER_ICI" dans `app/config.js`, ou le push n'est pas encore en ligne.
- **« Aucune soirée avec le code … »** → la soirée n'a pas été créée depuis la console, ou tu t'es trompée d'une lettre.
- **« Écriture refusée » / permission denied** → les règles de l'étape 4 n'ont pas été publiées, ou le mode test a expiré. Refais l'étape 4.
- **Rien ne bouge en temps réel** → vérifie que le `databaseURL` dans `config.js` est bien celui en `europe-west1.firebasedatabase.app`.

> **Pour plus tard** : ces règles sont ouvertes (n'importe qui connaissant un code de soirée peut écrire dedans). C'est voulu pour l'instant — pas de compte, pas de mot de passe, anonymat total. On durcira avant la vraie soirée (codes de soirée non devinables + verrouillage de la console).
