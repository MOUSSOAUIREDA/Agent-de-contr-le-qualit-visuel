
# Exigences non fonctionnelles

## 1. Performance

**ENF-01 :** Le temps d'analyse d'une image doit être raisonnable pour permettre une utilisation fluide de l'application.

**ENF-02 :** Le système doit éviter les traitements inutiles lors de l'analyse des images.

La durée cible d'analyse sera définie après les premiers tests sur le matériel disponible.

## 2. Fiabilité

**ENF-03 :** Le système doit retourner une réponse structurée pour chaque analyse réussie.

**ENF-04 :** Le système doit gérer les erreurs liées aux images invalides ou aux échecs d'inférence.

**ENF-05 :** Les prédictions doivent respecter les classes et le format définis dans le contrat de communication.

## 3. Ergonomie

**ENF-06 :** L'interface doit être simple et compréhensible.

**ENF-07 :** L'utilisateur doit pouvoir identifier facilement les défauts détectés.

**ENF-08 :** Les résultats doivent être présentés de manière lisible.

## 4. Maintenabilité

**ENF-09 :** Le code doit être organisé en composants distincts.

**ENF-10 :** Le modèle IA, le backend et le frontend doivent être développés de manière à faciliter leur évolution indépendante.

**ENF-11 :** Les dépendances du projet doivent être documentées.

## 5. Sécurité

**ENF-12 :** Le backend doit vérifier les fichiers reçus avant leur traitement.

**ENF-13 :** Les fichiers importés doivent être traités de manière à éviter les accès non autorisés aux ressources du serveur.

## 6. Reproductibilité

**ENF-14 :** Les paramètres et les conditions d'entraînement du modèle doivent être documentés.

**ENF-15 :** Les versions des principales dépendances doivent être conservées afin de faciliter la reproduction de l'environnement.
