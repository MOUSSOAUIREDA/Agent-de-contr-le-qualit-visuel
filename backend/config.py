"""Réglages du backend, lus dans l'environnement."""

from __future__ import annotations

import os
from pathlib import Path

RACINE = Path(__file__).resolve().parents[1]

CLASSES = (
    "Bubble",
    "Plastering thread",
    "Black spot",
    "Oil",
    "Quenched grain",
)

TAILLE_MAX_OCTETS = 10 * 1024 * 1024
PIXELS_MAX = 50_000_000
FORMATS_ACCEPTES = frozenset({"JPEG", "PNG", "BMP", "WEBP"})

# Confiance minimale demandée à YOLO. À justifier par une mesure (courbe P/R).
SEUIL_CONFIANCE = float(os.environ.get("SEUIL_CONFIANCE", "0.25"))


def chemin_modele() -> Path:
    """YOLO_MODELE si définie, sinon models/best.pt dans le dépôt."""
    return Path(os.environ.get("YOLO_MODELE") or RACINE / "models" / "best.pt")


def mode_mock() -> bool:
    """BACKEND_MODE=mock : détecteur factice, pour travailler sans modèle."""
    return os.environ.get("BACKEND_MODE", "").lower() == "mock"
