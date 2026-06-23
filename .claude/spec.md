# Specs

## 1. Présentation du projet

### 1.1 Contexte

Ce projet s’inscrit dans le cadre de la formation **Concepteur / Développeur d’Applications (CDA)**, d’une durée totale de 2 mois. Il constitue le **projet de fin de formation**, réalisé en groupe sur une période de **2 semaines**.

### 1.2 Présentation de l’équipe

| Nom     | Rôle pressenti | Compétences clés |
| ------- | -------------- | ---------------- |
| Marine  | [À déterminer] | [À déterminer]   |
| Azma    | [À déterminer] | [À déterminer]   |
| Mathieu | [À déterminer] | [À déterminer]   |
| Romain  | [À déterminer] | [À déterminer]   |

### 1.3 Pitch du projet

[Nom du projet] est une application mobile de quiz géolocalisé conçue pour divertir les passagers lors de trajets en voiture, notamment sur la route des vacances. En s’appuyant sur la position GPS de l’appareil, l’application interroge une base de questions et d’anecdotes liées aux lieux traversés, et les propose à l’utilisateur dès qu’il entre dans la zone géographique correspondante. Elle transforme ainsi un temps de trajet potentiellement long et monotone en une expérience ludique, mêlant culture générale et découverte du territoire parcouru.

---

## 2. Objectifs

### Objectifs fonctionnels du produit

_Ce que l’application doit accomplir pour l’utilisateur final._

- [ ] Divertir les passagers pendant un trajet en voiture grâce à un quiz interactif et géolocalisé
- [ ] Valoriser et faire découvrir les lieux traversés à travers des anecdotes culturelles et historiques contextualisées
- [ ] Permettre à l’utilisateur de créer un compte et de lancer une partie de quiz simplement
- [ ] Adapter dynamiquement le contenu proposé (questions, anecdotes) en fonction de la position GPS en temps réel

---

## 3. Description du produit

### 3.1 Public cible

Passagers d’un véhicule lors d’un trajet, les familles sur la route des vacances : parents et enfants.

### 3.2 Périmètre fonctionnel

**Fonctionnalités essentielles (MVP)**

- [ ] Application fonctionnelle
- [ ] Authentification (création de compte / connexion)
- [ ] Lancement d’un quiz avec géolocalisation en temps réel
- [ ] Jeu de questions limité sur un trajet déterminé, testable sur simulateurs iOS et Android

**Fonctionnalités secondaires (si le temps le permet)**

- [ ] Proposer des variantes de questions suivant le public (parents, enfants…)
- [ ] Retrouver l’historique des scores
- [ ] Partage du résultat sur les réseaux sociaux
- [ ] Quiz synchronisé entre plusieurs utilisateurs connectés

**Hors périmètre**

- [A trancher suivant les idées]

---

## 4. Choix technologiques

| Brique                      | Technologie envisagée                                              | Justification                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend mobile             | React Native (JavaScript ou TypeScript — **à trancher en équipe**) | Permet un développement cross-plateforme iOS/Android et l’accès aux capteurs natifs (GPS)                                                       |
| Backend / API               | Node.js + Express                                                  | Cohérent avec la stack vue en formation, simple à mettre en place pour exposer une API REST consommée par l’application mobile                  |
| Base de données             | MongoDB, avec index géospatial `2dsphere`                          | Vu en formation ; adapté nativement aux requêtes de proximité géographique nécessaires pour associer une question/anecdote à une zone traversée |
| Authentification            | JWT (JSON Web Token) ou Cookies                                    | Léger, standard avec une stack Node/Express                                                                                                     |
| Hébergement / déploiement   | Backend : (à déterminer) · BDD : MongoDB Atlas · App : Expo        | Solutions gratuites, adaptées à un projet de formation de 2 semaines                                                                            |
| Outils de gestion de projet | [À déterminer]                                                     |                                                                                                                                                 |
| Versioning                  | Git + GitHub                                                       | Standard, permet le travail collaboratif à 4                                                                                                    |

**Point à trancher en équipe : JavaScript vs TypeScript**

Une partie de l’équipe souhaite utiliser TypeScript, une autre ne maîtrise que JavaScript. Éléments à mettre en balance :

- TypeScript apporte un typage statique qui réduit certains bugs, en particulier utile sur la structure des échanges API ↔︎ BDD (questions, anecdotes, coordonnées GPS), mais ajoute une courbe d’apprentissage pour les membres qui ne le pratiquent pas.
- Le projet ne dure que 2 semaines : le temps de montée en compétence est à comparer au gain de robustesse apporté.
- Option intermédiaire envisageable : démarrer en JavaScript pour aller vite, et n’introduire TypeScript que sur les parties critiques si le temps le permet.

**Décision à acter en équipe avant le démarrage du développement.**

---

## 5. Contraintes

### 5.1 Contraintes techniques

- **Précision et fiabilité du GPS** : il faudra définir un rayon ou une zone tampon autour de chaque point d’intérêt, car la position GPS n’est jamais parfaitement exacte (variations de quelques mètres à quelques dizaines de mètres selon l’environnement).
- **Connectivité réseau pendant le trajet** : un road trip traverse souvent des zones avec une couverture réseau faible ou inexistante (zones rurales, tunnels). Il faudra décider si l’application fonctionne en mode dégradé/hors-ligne (cache local des questions à proximité) ou si elle nécessite une connexion permanente.
- **Consommation de batterie** : le suivi GPS en continu est gourmand en énergie, ce qui peut être un frein à l’usage réel sur un long trajet.

### 5.2 Contraintes de temps

2 semaines.

---

## 6. Méthodologie de travail

### 6.1 Organisation

_fréquence des points d’équipe, outils de communication, suivi des tâches._

[À compléter]

### 6.2 Répartition des rôles

[À compléter]

### 6.3 Outils collaboratifs

| Usage              | Outil         |
| ------------------ | ------------- |
| Gestion de tâches  | [À compléter] |
| Communication      | [À compléter] |
| Code / versioning  | [À compléter] |
| Documentation      | [À compléter] |
| Design / maquettes | [À compléter] |

---

## 7. Étapes du projet

_Section à détailler et à attribuer après le cadrage_

| Phase                           | Description                                                                              | Échéance estimée | Statut |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ---------------- | ------ |
| 1. Cadrage                      |                                                                                          |                  |        |
| 2. Conception / maquettes       |                                                                                          |                  |        |
| 3. Constitution du contenu      | Recherche, rédaction et géocodage des questions/anecdotes nécessaires à la démonstration |                  |        |
| 4. Développement                |                                                                                          |                  |        |
| 5. Tests                        |                                                                                          |                  |        |
| 6. Recette / corrections        |                                                                                          |                  |        |
| 7. Préparation de la soutenance |                                                                                          |                  |        |

---

## 8. Livrables attendus

- [ ] Application fonctionnelle (buildée ou lancée via Expo)
- [ ] Code source sur dépôt Git
- [ ] Documentation technique
- [ ] Support de présentation pour la soutenance
- [ ] Vidéo de démonstration (utile compte tenu de la contrainte de simulation GPS)

---

## 9. Risques identifiés

| Risque                                                                                               | Probabilité  | Impact                                | Mesure de mitigation                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capacité des simulateurs iOS/Android à simuler un déplacement GPS continu — **à valider / à tester** | À déterminer | Moyen (impacte la démo en soutenance) | Tester en amont la simulation de trajet GPS sur les simulateurs ; si non concluant, prévoir un jeu de coordonnées scénarisées pour rejouer un trajet |
|                                                                                                      |              |                                       |                                                                                                                                                      |

---

## 10. Annexes

_Liens utiles, références, sources d’inspiration, maquettes, etc._

[À compléter]

### 10.1 Schéma simplifié des collections principales (MongoDB)

```
Utilisateurs (users)
- _id
- nom
- email
- motDePasse (hashé)
- dateCreation

Questions / Anecdotes (questions)
- _id
- texte
- choixReponses: [String]
- bonneReponse
- anecdote
- localisation: { type: "Point", coordinates: [longitude, latitude] }  → index 2dsphere
- rayonDeclenchement (en mètres)
- publicCible: "parent" | "enfant" | "tous"

Parties / Scores (sessions)
- _id
- utilisateurId (référence)
- trajetId ou nomTrajet
- dateDebut / dateFin
- questionsRepondues: [{ questionId, reponseDonnee, correcte }]
- scoreTotal
```

_Schéma indicatif à ajuster_

### 10.2 Schéma des routes de l’API (à compléter)

| Méthode | Route                     | Description                                               |
| ------- | ------------------------- | --------------------------------------------------------- |
| POST    | /api/auth/register        | Création d’un compte utilisateur                          |
| POST    | /api/auth/login           | Connexion utilisateur                                     |
| GET     | /api/questions/nearby     | Récupération des questions à proximité d’une position GPS |
| POST    | /api/sessions             | Création d’une nouvelle partie / session de quiz          |
| PATCH   | /api/sessions/:id         | Mise à jour du score / des questions répondues            |
| GET     | /api/sessions/:id/history | Historique des scores d’un utilisateur                    |
