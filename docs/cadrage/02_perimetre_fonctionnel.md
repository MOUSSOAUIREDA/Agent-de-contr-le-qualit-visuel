
# Périmètre fonctionnel

## 1. Périmètre de la version initiale (V1)

La première version de l'application se limite à l'analyse d'images individuelles de bouteilles en verre.

L'utilisateur importe une image depuis l'interface web. L'application transmet cette image au backend, qui fait appel au modèle de détection.

Les résultats sont ensuite retournés à l'interface pour être affichés.

## 2. Fonctionnalités incluses

La V1 comprend les fonctionnalités suivantes :

- Importation d'une image individuelle.
- Vérification du format et de la validité de l'image.
- Analyse de l'image par le modèle IA.
- Détection des défauts présents.
- Identification de la classe de chaque défaut.
- Localisation des défauts par bounding boxes.
- Affichage des scores de confiance.
- Affichage d'un résultat indiquant qu'aucun défaut n'a été détecté lorsque la liste des prédictions est vide.

## 3. Classes de défauts ciblées

Le dataset GC(od) documente cinq catégories de défauts :

| Classe | Description |
|---|---|
| Bubble | Présence de bulles dans le verre |
| Plastering thread | Défaut de type fil ou cordon de verre |
| Black spot | Présence d'une tache noire |
| Oil | Présence d'une contamination de type huile |
| Quenched grain | Défaut de type grain de trempe |

Les définitions techniques et les exemples visuels de chaque catégorie seront précisés lors de l'étude du dataset.

## 4. Fonctionnalités exclues de la V1

Les fonctionnalités suivantes ne seront pas développées dans la première version :

- Analyse de flux vidéo en temps réel.
- Connexion à une caméra industrielle.
- Suivi des bouteilles entre plusieurs images.
- Comptage automatique des bouteilles.
- Génération de statistiques de production.
- Système d'alertes industrielles.
- Classification de la gravité des défauts.
- Décision automatique Accept/Reject.

## 5. Évolutions futures

Ces fonctionnalités pourront être envisagées dans des versions ultérieures :

- Analyse de vidéos.
- Intégration de caméras industrielles.
- Suivi des bouteilles sur une chaîne de production.
- Analyse statistique des défauts.
- Classification selon des niveaux de gravité.
- Application de règles de contrôle qualité pour prendre des décisions Accept/Reject.
