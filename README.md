defauts-verre — Détection automatique des défauts des bouteilles en verre
Présentation du projet

Application intelligente de contrôle qualité visuel permettant de détecter automatiquement les défauts présents sur des bouteilles en verre à partir d'images.

Le projet utilise des techniques de vision par ordinateur et de Deep Learning, notamment le modèle YOLO, afin d'identifier et de localiser les défauts sur les bouteilles.

Ce projet est réalisé dans le cadre du cours Développement et déploiement d'applications intelligentes.

Technologies utilisées
Python 3.11
PyTorch
YOLO
FastAPI
React
Pytest
Ruff
Git et GitHub
Démarrage rapide
Prérequis
Python 3.11
Git
Node.js (pour le frontend React)
1. Cloner le dépôt
bash
git clone <URL_DU_DEPOT>
cd defauts-verre

2. Créer un environnement virtuel
bash
python -m venv .venv

3. Activer l'environnement
bash
# Linux / macOS / Git Bash
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1

4. Installer les dépendances
bash
pip install -r requirements.txt

5. Vérifier l'environnement
bash
python -m pytest -v
ruff check .
ruff format --check .

6. Lancer l'interface utilisateur Streamlit (Frontend - TP5)
```bash
streamlit run app.py
```
*(ou `streamlit run frontend/app.py`)*

L'application s'ouvre automatiquement dans votre navigateur à l'adresse `http://localhost:8501`.

- **Autres options disponibles :**
  - Serveur Python autonome : `python run_frontend.py` (ou double-cliquer sur `frontend/index.html`).
  - Mode React / Vite (si Node.js est installé) : `cd frontend && npm install && npm run dev`.

Organisation du projet

Le projet évolue progressivement au fil des étapes du cours :

TP1 : Cadrage du projet et configuration de l'environnement.
TP2 : Préparation du dataset et entraînement du modèle YOLO.
TP3 : Développement de l'API avec FastAPI.
TP4 : Tests automatisés et contrôle qualité du code.
TP5 : Développement de l'interface utilisateur.
TP6 : Packaging et préparation du déploiement.
Structure du dépôt
text
defauts-verre/
├── README.md
├── requirements.txt
├── pytest.ini
├── ruff.toml
├── .gitignore
│
├── docs/
│   └── cadrage/
│       ├── 00_presentation.md
│       ├── 01_problematique_objectifs.md
│       ├── 02_perimetre_fonctionnel.md
│       ├── 03_exigences_fonctionnelles.md
│       ├── 04_exigences_non_fonctionnelles.md
│       └── 05_criteres_validation.md
│
├── contrat/
│   ├── __init__.py
│   └── schemas.py
│
├── tests/
│   ├── test_cadrage.py
│   └── test_contrat.py
│
├── modele/               # Dataset et modèle YOLO
├── backend/              # API FastAPI
└── frontend/             # Interface utilisateur React


Remarque : les dossiers modele/, backend/ et frontend/ représentent l'organisation cible du projet. Leur contenu sera complété progressivement.

Documentation
Fichier	Description
README.md	Présentation et installation du projet
docs/cadrage/00_presentation.md	Contexte général
docs/cadrage/01_problematique_objectifs.md	Problématique et objectifs
docs/cadrage/02_perimetre_fonctionnel.md	Périmètre fonctionnel
docs/cadrage/03_exigences_fonctionnelles.md	Exigences fonctionnelles
docs/cadrage/04_exigences_non_fonctionnelles.md	Exigences de qualité
docs/cadrage/05_criteres_validation.md	Critères de validation
Commandes utiles
Exécution des tests
bash
python -m pytest -v
python -m pytest -q
python -m pytest tests/test_cadrage.py -v

Vérification de la qualité du code
bash
ruff check .
ruff check --fix .
ruff format .
ruff format --check .

Gestion du dépôt Git
bash
git status
git branch
git log --oneline

Membres de l'équipe
Membre	Nom	Identifiant GitHub	Responsabilité
Membre A	Mohamed Amine Aswab	@login	IA et Computer Vision : dataset, annotations, entraînement et évaluation du modèle YOLO
Membre B	Reda Moussaoui	@login	Backend : API FastAPI, gestion des images et intégration du modèle
Membre C	Mehdi Ammal	@login	Frontend : interface utilisateur, importation des images et visualisation des résultats
Règles de travail en équipe

Afin de garantir une collaboration efficace :

Chaque membre travaille sur une branche dédiée à sa fonctionnalité.
La branche main contient les versions stables du projet.
La branche develop permet d'intégrer les fonctionnalités avant validation.
Les modifications sont intégrées via des Pull Requests.
Les fonctionnalités importantes doivent être accompagnées de tests lorsque cela est pertinent.
Toute modification du contrat JSON doit être discutée et validée collectivement.
Les commits doivent être explicites et respecter une convention commune.
Exemples de messages de commit
bash
git commit -m "feat: add image upload endpoint"
git commit -m "fix: correct detection response"
git commit -m "docs: update project documentation"
git commit -m "test: add contract validation tests"

Configuration de Git

Chaque membre doit configurer sa propre identité Git :

bash
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"

Périmètre fonctionnel de la version initiale

La première version de l'application se concentre sur l'analyse d'images individuelles de bouteilles en verre.

Le système doit détecter et localiser cinq catégories de défauts :

Bubble
Plastering thread
Black spot
Oil
Quenched grain

Pour chaque défaut détecté, l'application doit afficher :

La classe prédite.
Le score de confiance.
La boîte englobante (Bounding Box) localisant le défaut.
Évolutions futures

Les fonctionnalités suivantes pourront être ajoutées dans les prochaines versions :

Analyse vidéo.
Détection en temps réel.
Statistiques de production.
Classification industrielle Accept/Reject.

Projet académique — Détection automatique des défauts des bouteilles en verre.