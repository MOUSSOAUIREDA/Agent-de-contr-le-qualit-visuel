<<<<<<< HEAD
# Agent de contr�le qualit� visuel

## Pr�sentation
Syst�me intelligent de contr�le qualit� des bouteilles
en plastique utilisant le Deep Learning et YOLO26n.

## Technologies
- Python 3.11
- PyTorch
- YOLO26n
- FastAPI
- Streamlit

## Organisation
- TP1 : Cadrage et environnement
- TP2 : Dataset et entra�nement YOLO26n
- TP3 : API FastAPI
- TP4 : Tests et qualit�
- TP5 : Interface Streamlit
- TP6 : Packaging
=======
# defauts-verre : dépôt de l'équipe

Application fil rouge du cours *Développement et déploiement d'applications intelligentes*.

Ce projet consiste à développer une application web de détection automatique des défauts présents sur des bouteilles en verre à partir d'images, en utilisant des techniques de vision par ordinateur et un modèle YOLO.

Le dépôt évolue progressivement au fil des semaines. La première étape met en place le cadrage du projet, l'environnement de développement, les outils de qualité et l'organisation du travail en équipe.

**## Démarrage rapide**

Prérequis : Python 3.11, Git et Node.js (pour le frontend).

```bash
git clone <URL_DU_DEPOT>
cd defauts-verre

python -m venv .venv
```

Activation de l'environnement :

```bash
# Linux / macOS / Git Bash
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Installation des dépendances :

```bash
pip install -r requirements.txt
```

Puis vérifiez l'environnement :

```bash
python -m pytest -v       # exécution des tests
ruff check .              # analyse statique du code
ruff format --check .     # vérification du formatage
```

**## Par où commencer**

| Fichier / Dossier | Quand le consulter |
| --- | --- |
| `README.md` | Présentation du projet, installation et organisation |
| `docs/cadrage/00_presentation.md` | Pour comprendre le contexte du projet |
| `docs/cadrage/01_problematique_objectifs.md` | Pour comprendre la problématique et les objectifs |
| `docs/cadrage/02_perimetre_fonctionnel.md` | Pour connaître les fonctionnalités incluses et exclues |
| `docs/cadrage/03_exigences_fonctionnelles.md` | Pour consulter les exigences fonctionnelles |
| `docs/cadrage/04_exigences_non_fonctionnelles.md` | Pour consulter les contraintes de qualité |
| `docs/cadrage/05_criteres_validation.md` | Pour connaître les critères de validation |
| `tests/` | Pour consulter les tests automatisés |
| `pytest.ini` | Configuration de Pytest |
| `ruff.toml` | Configuration de Ruff |

**## Raccourcis**

Les principales commandes à utiliser depuis la racine du dépôt :

```bash
python -m pytest -v       # exécute tous les tests
python -m pytest -q       # résultat synthétique
python -m pytest tests/test_cadrage.py -v  # tests du cadrage

ruff check .              # analyse du code
ruff check --fix .        # corrections automatiques
ruff format .             # formatage du code
ruff format --check .     # vérification du formatage

git status                # état du dépôt
git branch                # branches locales
git log --oneline         # historique des commits
```

**## Structure**

```text
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
├── modele/               # préparation des données et modèle YOLO
├── backend/              # API FastAPI
└── frontend/             # interface utilisateur React
```

*Remarque : les dossiers `modele/`, `backend/` et `frontend/` représentent l'organisation cible ; leurs noms et leur contenu seront ajustés à l'arborescence réellement adoptée.*

**## Membres de l'équipe**

| Rôle | Nom | Identifiant GitHub | Responsabilité principale |
| --- | --- | --- | --- |
| Membre A | Mohamed Amine Aswab | [@login] | IA & Computer Vision : dataset, annotations, entraînement et évaluation YOLO |
| Membre B | Reda Moussaoui | [@login] | Backend : API FastAPI, gestion des images et intégration du modèle |
| Membre C | Mehdi Ammal | [@login] | Frontend : interface React, importation des images et visualisation des résultats |

**## Règles de travail du groupe**

Pour garantir une collaboration efficace :

- Chaque membre travaille sur une branche dédiée à sa fonctionnalité.
- `main` contient les versions stables du projet.
- `develop` sert à intégrer les fonctionnalités avant leur validation.
- Les modifications sont intégrées par Pull Request.
- Chaque fonctionnalité importante doit être accompagnée de tests lorsque cela est pertinent.
- Les modifications du contrat JSON doivent être discutées et validées collectivement.
- Les commits doivent être explicites et suivre une convention commune.

Exemples de messages de commit :

```bash
git commit -m "feat: add image upload endpoint"
git commit -m "fix: correct detection response"
git commit -m "docs: update project documentation"
git commit -m "test: add contract validation tests"
```

Chaque membre doit configurer sa propre identité Git :

```bash
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

**## Périmètre de la version initiale**

La première version se concentre sur l'analyse d'images individuelles de bouteilles en verre.

Le système doit identifier et localiser cinq catégories de défauts :

- Bubble
- Plastering thread
- Black spot
- Oil
- Quenched grain

Pour chaque détection, l'application affiche la classe prédite, le score de confiance et la bounding box correspondante.

L'analyse vidéo, la détection en temps réel, les statistiques de production et la décision industrielle Accept/Reject sont considérées comme des évolutions futures.

---

*Projet académique — Détection des défauts des bouteilles en verre.*
>>>>>>> afdb878bddf651aab620e17d734152dbcc64c1a7
