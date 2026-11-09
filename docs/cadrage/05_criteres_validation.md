
# Critères de validation

## 1. Validation fonctionnelle

| ID | Critère | Méthode de vérification |
|---|---|---|
| CV-01 | Importation d'une image valide | Tester l'upload depuis l'interface |
| CV-02 | Rejet d'un fichier non pris en charge | Importer un fichier invalide |
| CV-03 | Détection des défauts | Tester sur des images annotées |
| CV-04 | Localisation des défauts | Vérifier les bounding boxes |
| CV-05 | Affichage des classes | Vérifier les labels affichés |
| CV-06 | Affichage des scores de confiance | Vérifier les valeurs retournées |
| CV-07 | Gestion d'une image sans défaut détecté | Tester une image sans détection |
| CV-08 | Communication frontend/backend | Vérifier les échanges API |

## 2. Évaluation du modèle IA

Le modèle sera évalué sur un ensemble de données de test distinct de celui utilisé pour l'entraînement.

Les métriques envisagées sont :

- Precision : proportion des détections positives qui sont correctes.
- Recall : proportion des défauts réels qui sont détectés.
- mAP@50 : qualité moyenne des détections avec un seuil IoU de 0.5.
- mAP@50-95 : performance moyenne sur plusieurs seuils IoU.

Les résultats seront analysés globalement et par classe de défaut.

Les objectifs numériques seront définis après une première expérimentation.

## 3. Validation de l'application

La validation finale reposera sur une démonstration complète du scénario suivant :

1. L'utilisateur importe une image.
2. L'application transmet l'image au backend.
3. Le backend exécute le modèle IA.
4. Le modèle retourne les détections.
5. Le backend transmet les résultats au frontend.
6. L'interface affiche l'image annotée et les informations associées.

## 4. Conditions de validation

Le projet sera considéré comme fonctionnel lorsque :

- L'importation d'une image valide fonctionne.
- L'analyse est exécutée sans erreur.
- Les détections sont retournées dans le format attendu.
- Les bounding boxes sont correctement affichées.
- Les classes et scores de confiance sont visibles.
- Le cas sans détection est correctement géré.

## 5. Limites de validation

La V1 ne sera pas évaluée sur :

- La prise de décision industrielle Accept/Reject.
- Le traitement vidéo en temps réel.
- Le suivi des bouteilles sur une chaîne de production.
- La génération d'alertes industrielles.
