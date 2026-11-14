"""API FastAPI : GET /health, POST /predict (image -> défauts localisés)."""

from __future__ import annotations

import io
import logging
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from backend.config import FORMATS_ACCEPTES, PIXELS_MAX, TAILLE_MAX_OCTETS
from backend.detector import Detecteur, charger_detecteur
from backend.schemas import HealthResponse, PredictResponse

journal = logging.getLogger("backend")
Image.MAX_IMAGE_PIXELS = PIXELS_MAX


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.detecteur = charger_detecteur()
    yield


app = FastAPI(
    title="defauts-verre API",
    description="Détection de défauts sur bouteilles en verre (YOLO).",
    version="0.1.0",
    lifespan=lifespan,
)
# Développement : pages locales (n'importe quel port) et frontend/index.html
# ouvert par double-clic (origine "null"). À restreindre en production.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|null)$",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-ms"],
)


def _detecteur(request: Request) -> Detecteur:
    detecteur = getattr(request.app.state, "detecteur", None)
    if detecteur is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé")
    return detecteur


def _lire_image(contenu: bytes) -> Image.Image:
    """Décode et valide l'image ; toute entrée invalide devient une HTTPException."""
    if not contenu:
        raise HTTPException(status_code=422, detail="Fichier vide")
    try:
        image = Image.open(io.BytesIO(contenu))
        image.verify()
        image = Image.open(io.BytesIO(contenu))
        if image.format not in FORMATS_ACCEPTES:
            raise HTTPException(
                status_code=415,
                detail=f"Format non supporté : {image.format}",
            )
        if image.width * image.height > PIXELS_MAX:
            raise HTTPException(status_code=422, detail="Image trop grande")
        return image.convert("RGB")
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        raise HTTPException(
            status_code=422, detail="Fichier illisible : image attendue"
        ) from None
    except Image.DecompressionBombError:
        raise HTTPException(status_code=422, detail="Image trop grande") from None


@app.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    """Le service est prêt si un détecteur est chargé."""
    return HealthResponse(status="OK", model=_detecteur(request).nom)


@app.post("/predict", response_model=PredictResponse)
def predict(
    request: Request,
    response: Response,
    file: Annotated[UploadFile, File(description="Image de bouteille")],
) -> PredictResponse:
    """Analyse une image et renvoie les défauts localisés."""
    debut = time.perf_counter()
    detecteur = _detecteur(request)

    contenu = file.file.read(TAILLE_MAX_OCTETS + 1)
    if len(contenu) > TAILLE_MAX_OCTETS:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux")
    image = _lire_image(contenu)

    try:
        detections = detecteur.detecter(image)
    except Exception:
        journal.exception("Panne du détecteur")
        raise HTTPException(status_code=500, detail="Erreur interne") from None

    duree_ms = (time.perf_counter() - debut) * 1000
    response.headers["X-Process-Time-ms"] = f"{duree_ms:.1f}"
    return PredictResponse(
        image=file.filename or "image",
        status="defects_detected" if detections else "no_defect",
        detections=detections,
    )
