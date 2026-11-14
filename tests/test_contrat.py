import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from contrat.schema import Reponse

# Charger les exemples JSON
EXEMPLE_PATH = Path(__file__).parents[1] / "contrat" / "exemple.json"

with open(EXEMPLE_PATH, encoding="utf-8") as file:
    exemples = json.load(file)


def test_exemples_valides():
    """Vérifier que les exemples respectent le contrat."""
    for exemple in exemples:
        Reponse.model_validate(exemple)


def test_liste_detections_vide():
    """Une réponse sans défaut doit être valide."""
    reponse = {"image": "bouteille_saine.jpg", "status": "no_defect", "detections": []}

    resultat = Reponse.model_validate(reponse)

    assert resultat.detections == []


def test_label_invalide():
    """Un label non autorisé doit provoquer une erreur."""
    reponse = {
        "image": "bouteille.jpg",
        "status": "defects_detected",
        "detections": [
            {"label": "rayure", "confidence": 0.95, "bbox": [100, 80, 200, 160]}
        ],
    }

    with pytest.raises(ValidationError):
        Reponse.model_validate(reponse)


def test_bbox_inversee():
    """Une bounding box inversée doit provoquer une erreur."""
    reponse = {
        "image": "bouteille.jpg",
        "status": "defects_detected",
        "detections": [
            {"label": "Bubble", "confidence": 0.95, "bbox": [200, 80, 100, 160]}
        ],
    }

    with pytest.raises(ValidationError):
        Reponse.model_validate(reponse)
