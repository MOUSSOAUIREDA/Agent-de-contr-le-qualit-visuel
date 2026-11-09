
# Exigences fonctionnelles

## 1. Importation d'une image

**EF-01 :** L'application doit permettre à l'utilisateur d'importer une image depuis son appareil.

**EF-02 :** L'application doit accepter uniquement les formats d'image définis par le projet.

**EF-03 :** L'application doit informer l'utilisateur lorsque le fichier importé est invalide ou non pris en charge.

## 2. Analyse de l'image

**EF-04 :** Le backend doit transmettre l'image valide au modèle de détection.

**EF-05 :** Le modèle doit identifier les défauts appartenant aux classes définies dans le projet.

**EF-06 :** Le modèle doit retourner la classe prédite, le score de confiance et les coordonnées de chaque défaut détecté.

## 3. Présentation des résultats

**EF-07 :** L'application doit afficher l'image analysée avec les bounding boxes correspondant aux défauts détectés.

**EF-08 :** L'application doit afficher la classe de chaque défaut détecté.

**EF-09 :** L'application doit afficher le score de confiance associé à chaque détection.

**EF-10 :** Lorsque le modèle ne détecte aucun défaut, l'application doit afficher un message indiquant qu'aucun défaut n'a été détecté.

## 4. Gestion des erreurs

**EF-11 :** L'application doit informer l'utilisateur lorsqu'une image ne peut pas être analysée.

**EF-12 :** Le backend doit retourner une réponse structurée en cas d'erreur.

## 5. Contrat de communication

**EF-13 :** Le backend doit retourner les résultats dans un format JSON commun au frontend.

**EF-14 :** Chaque détection doit contenir les informations suivantes :
- Classe du défaut.
- Score de confiance.
- Coordonnées de la bounding box.

**EF-15 :** Une réponse sans détection doit contenir une liste vide de détections.
