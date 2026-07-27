# Le prompt pour améliorer les questions

*À copier-coller dans Claude, ChatGPT ou n'importe quel autre modèle. Colle tes questions actuelles à la fin, à la place de la dernière ligne.*

*Le bouton « Copier le prompt IA » de l'éditeur fait ça tout seul, avec tes questions déjà dedans.*

---

```
Tu m'aides à améliorer les questions d'une soirée qui s'appelle Kod.

LE CONTEXTE
Une centaine de personnes de la communauté franco-israélienne, dans un bar à Tel Aviv. Chacun répond à une question sur son téléphone, et sa réponse l'envoie physiquement dans un des quatre coins de la salle, identifiés par les lettres hébraïques א, ב, ג, ד. Les gens ne savent pas comment le tri fonctionne — c'est ce flou qui les pousse à se parler. Ce n'est pas strictement une soirée de rencontres : certains cherchent l'amour, d'autres des amis ou des partenaires de voyage.

LES RÈGLES ABSOLUES
1. Aucune réponse n'est meilleure qu'une autre. S'il existe une bonne réponse, la question trie en "sait / sait pas" au lieu de trier par affinité — et le jeu "trouvez pourquoi vous êtes ensemble" devient insoluble. C'est la règle la plus importante.
2. Exactement quatre réponses par question, une par coin.
3. Chaque réponse doit être choisie par une part réelle de la salle. Une réponse que personne ne coche vide un coin ; une réponse trop consensuelle en sature un.
4. Les réponses doivent être courtes — lisibles d'un coup d'œil sur un téléphone, dans un bar sombre et bruyant.
5. Rien qui puisse humilier, ni faire passer quelqu'un pour un ignorant, un pauvre ou un mauvais croyant.
6. Le ton peut être drôle, et il doit l'être souvent. Le rire vient de la reconnaissance ("c'est exactement moi") beaucoup plus que de la blague.

CE QUE JE TE DEMANDE
Pour chaque question ci-dessous :
- dis-moi si elle respecte les règles, et sinon pourquoi
- réécris-la si elle peut être plus vivante, plus drôle ou plus discriminante
- vérifie que les quatre réponses sont vraiment distinctes et vraiment équilibrées
- signale celles qui sont ennuyeuses, trop attendues, ou qui ne feront bouger personne

Ajoute ensuite des questions nouvelles dans le même esprit, en variant les axes : rythme de vie, rapport aux autres, goûts, valeurs, amour, famille, argent, tradition.

Rends-moi le résultat dans exactement ce format JSON :
[{"texte":"...","drole":true,"choix":[{"texte":"...","coin":"א"},{"texte":"...","coin":"ב"},{"texte":"...","coin":"ג"},{"texte":"...","coin":"ד"}]}]

VOICI LES QUESTIONS ACTUELLES
[colle ici le contenu de kod-questions.json]
```

---

## Comment t'en servir

1. **Depuis l'éditeur**, clique sur « Copier le prompt IA » — tes questions sont déjà incluses. Colle dans le modèle de ton choix.
2. **Récupère le JSON** que le modèle te rend.
3. **Reviens dans l'éditeur**, importe le fichier, relis tout, corrige à la main ce qui sonne faux.

> **Ne fais jamais confiance au résultat sans relire.** Un modèle produit vite des réponses qui se ressemblent trop, ou une question où l'une des réponses est visiblement « la bonne ». C'est toi qui connais ta salle.

## Le piège à surveiller en relisant

**La quatrième réponse.** Sur une question à quatre choix, les trois premières viennent facilement et la quatrième est souvent bâclée — un remplissage que personne ne cochera. Résultat : un coin vide le soir J.

Quand tu relis, demande-toi pour chaque réponse : **est-ce que je connais au moins dix personnes dans la salle qui vont cocher celle-là ?** Si la réponse est non, elle est à réécrire.
