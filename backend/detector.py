"""Les détecteurs : YOLO réel, et un détecteur factice pour le développement."""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Protocol

from PIL import Image

from backend.config import CLASSES, SEUIL_CONFIANCE, chemin_modele, mode_mock
from backend.schemas import Detection

journal = logging.getLogger("backend")

_CANONIQUES = {nom.lower(): nom for nom in CLASSES}


def normaliser_etiquette(nom: str) -> str:
    """'plastering_thread' ou 'Plastering Thread' -> 'Plastering thread'."""
    cle = nom.strip().replace("_", " ").replace("-", " ").lower()
    if cle not in _CANONIQUES:
        raise ValueError(f"étiquette inconnue du contrat : {nom!r}")
    return _CANONIQUES[cle]


class Detecteur(Protocol):
    """Ce que l'API attend d'un détecteur."""

    nom: str

    def detecter(self, image: Image.Image) -> list[Detection]: ...


class YoloDetecteur:
    """Modèle YOLO chargé une seule fois, au démarrage de l'API."""

    def __init__(self, chemin: Path, seuil: float = SEUIL_CONFIANCE) -> None:
        if not chemin.exists():
            raise FileNotFoundError(
                f"{chemin} absent : entraînez le modèle (Membre A), "
                "ou lancez avec BACKEND_MODE=mock pour développer sans modèle."
            )
        from ultralytics import YOLO

        self._modele = YOLO(str(chemin))
        self._seuil = seuil
        self._verrou = threading.Lock()
        # Vérifié au démarrage : une étiquette inconnue empêche de démarrer.
        self._noms = {
            int(i): normaliser_etiquette(n) for i, n in self._modele.names.items()
        }
        self.nom = f"yolo ({chemin.name})"

    def detecter(self, image: Image.Image) -> list[Detection]:
        with self._verrou:
            resultats = self._modele.predict(image, conf=self._seuil, verbose=False)
        sortie: list[Detection] = []
        for resultat in resultats:
            for boite in resultat.boxes:
                x1, y1, x2, y2 = (round(v) for v in boite.xyxy[0].tolist())
                sortie.append(
                    Detection(
                        label=self._noms[int(boite.cls[0])],  # type: ignore[arg-type]
                        confidence=round(float(boite.conf[0]), 4),
                        bbox=(x1, y1, x2, y2),
                    )
                )
        return sortie


class MockDetecteur:
    """Répond toujours une bulle au centre : pour développer sans modèle."""

    nom = "mock (aucun modèle chargé)"

    def detecter(self, image: Image.Image) -> list[Detection]:
        largeur, hauteur = image.size
        x1, y1 = largeur // 4, hauteur // 4
        x2, y2 = max(x1 + 1, largeur // 2), max(y1 + 1, hauteur // 2)
        return [Detection(label="Bubble", confidence=0.94, bbox=(x1, y1, x2, y2))]


def charger_detecteur() -> Detecteur:
    """Choisit le détecteur ; sans modèle (hors mock), l'API refuse de démarrer."""
    if mode_mock():
        journal.warning("Mode mock : aucune vraie détection.")
        return MockDetecteur()
    detecteur = YoloDetecteur(chemin_modele())
    journal.info("Modèle chargé : %s", detecteur.nom)
    return detecteur
