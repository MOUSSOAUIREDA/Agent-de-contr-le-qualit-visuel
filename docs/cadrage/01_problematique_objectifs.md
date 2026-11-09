
# Problématique et objectifs

## 1. Problématique

Comment développer une application basée sur la vision par ordinateur capable de détecter et de localiser automatiquement les défauts présents sur des bouteilles en verre à partir d'images ?

Cette problématique implique plusieurs difficultés :
- Identifier les différentes catégories de défauts.
- Localiser précisément les défauts dans l'image.
- Obtenir des prédictions suffisamment fiables.
- Présenter les résultats de manière compréhensible pour l'utilisateur.

## 2. Objectif général

Développer une application web permettant de détecter et de localiser automatiquement les défauts présents sur des bouteilles en verre à partir d'images, en utilisant un modèle de détection d'objets basé sur le Deep Learning.

## 3. Objectifs spécifiques

Le projet vise à :

1. Étudier un dataset adapté à la détection des défauts sur les contenants en verre.
2. Identifier les différentes classes de défauts.
3. Préparer les données pour l'entraînement du modèle.
4. Entraîner ou adapter un modèle de détection d'objets.
5. Évaluer les performances du modèle.
6. Développer une API permettant d'exposer les prédictions.
7. Développer une interface permettant d'importer une image et de visualiser les résultats.

## 4. Résultats attendus

À la fin du projet, l'application devra permettre :
- L'importation d'une image de bouteille.
- L'analyse automatique de cette image.
- La détection des défauts présents.
- La localisation des défauts à l'aide de bounding boxes.
- L'affichage de la classe et du score de confiance de chaque détection.
- L'affichage d'un message lorsqu'aucun défaut n'est détecté.
