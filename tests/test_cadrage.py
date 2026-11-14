from pathlib import Path

import pytest

# Racine du projet
ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs" / "cadrage"


# Documents attendus
FICHIERS = [
    "00_presentation.md",
    "01_problematique_objectifs.md",
    "02_perimetre_fonctionnel.md",
    "03_exigences_fonctionnelles.md",
    "04_exigences_non_fonctionnelles.md",
    "05_criteres_validation.md",
]


def lire_document(nom):
    """Lire un document de cadrage."""
    chemin = DOCS_DIR / nom

    assert chemin.exists(), f"Document manquant : {nom}"

    return chemin.read_text(encoding="utf-8")


# --------------------------------------------------
# 1. Vérification de l'existence des documents
# --------------------------------------------------


@pytest.mark.parametrize("nom", FICHIERS)
def test_existence_documents(nom):
    assert (DOCS_DIR / nom).is_file()


# --------------------------------------------------
# 2. Vérification de la présentation du projet
# --------------------------------------------------


def test_presentation_projet():
    contenu = lire_document("00_presentation.md").lower()

    mots_attendus = [
        "contexte",
        "présentation",
        "équipe",
        "technologies",
    ]

    for mot in mots_attendus:
        assert mot in contenu, f"Rubrique manquante : {mot}"


# --------------------------------------------------
# 3. Vérification de la problématique et des objectifs
# --------------------------------------------------


def test_problematique_objectifs():
    contenu = lire_document("01_problematique_objectifs.md").lower()

    mots_attendus = [
        "problématique",
        "objectif général",
        "objectifs spécifiques",
        "résultats attendus",
    ]

    for mot in mots_attendus:
        assert mot in contenu, f"Élément manquant : {mot}"


# --------------------------------------------------
# 4. Vérification du périmètre fonctionnel
# --------------------------------------------------


def test_perimetre_v1():
    contenu = lire_document("02_perimetre_fonctionnel.md").lower()

    mots_attendus = [
        "version initiale",
        "importation",
        "bounding boxes",
        "fonctionnalités exclues",
        "évolutions futures",
    ]

    for mot in mots_attendus:
        assert mot in contenu, f"Élément manquant : {mot}"


def test_classes_defauts():
    contenu = lire_document("02_perimetre_fonctionnel.md")

    classes = [
        "Bubble",
        "Plastering thread",
        "Black spot",
        "Oil",
        "Quenched grain",
    ]

    for classe in classes:
        assert classe in contenu, f"Classe absente : {classe}"


# --------------------------------------------------
# 5. Vérification des exigences fonctionnelles
# --------------------------------------------------


def test_exigences_fonctionnelles():
    contenu = lire_document("03_exigences_fonctionnelles.md")

    for identifiant in range(1, 16):
        exigence = f"EF-{identifiant:02d}"
        assert exigence in contenu, f"Exigence fonctionnelle manquante : {exigence}"


# --------------------------------------------------
# 6. Vérification des exigences non fonctionnelles
# --------------------------------------------------


def test_exigences_non_fonctionnelles():
    contenu = lire_document("04_exigences_non_fonctionnelles.md")

    rubriques = [
        "Performance",
        "Fiabilité",
        "Ergonomie",
        "Maintenabilité",
        "Sécurité",
        "Reproductibilité",
    ]

    for rubrique in rubriques:
        assert rubrique in contenu, f"Rubrique manquante : {rubrique}"


# --------------------------------------------------
# 7. Vérification des critères de validation
# --------------------------------------------------


def test_criteres_validation():
    contenu = lire_document("05_criteres_validation.md")

    mots_attendus = [
        "Validation fonctionnelle",
        "Évaluation du modèle",
        "Precision",
        "Recall",
        "mAP@50",
        "mAP@50-95",
        "Conditions de validation",
    ]

    for mot in mots_attendus:
        assert mot in contenu, f"Élément manquant : {mot}"


# --------------------------------------------------
# 8. Vérification de la cohérence du périmètre
# --------------------------------------------------


def test_decision_industrielle_exclue_de_v1():
    contenu = lire_document("02_perimetre_fonctionnel.md").lower()

    assert "accept/reject" in contenu
    assert "fonctionnalités exclues" in contenu
    assert "évolutions futures" in contenu
