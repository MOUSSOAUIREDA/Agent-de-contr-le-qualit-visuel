"""Contrat JSON de l'API (miroir de ce que le frontend lit)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

Classe = Literal[
    "Bubble",
    "Plastering thread",
    "Black spot",
    "Oil",
    "Quenched grain",
]
Statut = Literal["no_defect", "defects_detected"]


class Detection(BaseModel):
    """Un défaut localisé : classe, confiance, boîte (x1, y1, x2, y2) en pixels."""

    label: Classe
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: tuple[int, int, int, int]

    @model_validator(mode="after")
    def boite_valide(self) -> Detection:
        x1, y1, x2, y2 = self.bbox
        if x2 <= x1 or y2 <= y1:
            raise ValueError("bbox invalide : x2 > x1 et y2 > y1 attendus")
        return self


class PredictResponse(BaseModel):
    image: str
    status: Statut
    detections: list[Detection]

    @model_validator(mode="after")
    def statut_coherent(self) -> PredictResponse:
        attendu = "defects_detected" if self.detections else "no_defect"
        if self.status != attendu:
            raise ValueError("status incohérent avec detections")
        return self


class HealthResponse(BaseModel):
    status: str
    model: str
