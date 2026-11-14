"""Tests de l'API : contrat, entrées invalides, pannes, démarrage."""

from __future__ import annotations

import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.config import CLASSES
from backend.detector import normaliser_etiquette
from backend.main import app
from backend.schemas import Detection, PredictResponse

BULLE = Detection(label="Bubble", confidence=0.9, bbox=(10, 10, 30, 30))


class Faux:
    """Détecteur de test : renvoie une liste fixe, ou plante."""

    nom = "faux"

    def __init__(self, sortie=None, panne=None):
        self.sortie = sortie or []
        self.panne = panne

    def detecter(self, image):
        if self.panne:
            raise self.panne
        return self.sortie


def image_octets(format_="PNG", taille=(64, 48)) -> bytes:
    tampon = io.BytesIO()
    Image.new("RGB", taille, (10, 120, 60)).save(tampon, format_)
    return tampon.getvalue()


def envoyer(client, contenu, nom="b.png", type_="image/png"):
    return client.post("/predict", files={"file": (nom, contenu, type_)})


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("BACKEND_MODE", "mock")
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"


def test_bouteille_saine(client):
    client.app.state.detecteur = Faux([])
    r = envoyer(client, image_octets(), nom="saine.png")
    assert r.status_code == 200
    assert r.json() == {"image": "saine.png", "status": "no_defect", "detections": []}


def test_bouteille_defectueuse_respecte_le_contrat(client):
    client.app.state.detecteur = Faux([BULLE])
    r = envoyer(client, image_octets())
    assert r.status_code == 200
    corps = PredictResponse.model_validate(r.json())
    assert corps.status == "defects_detected"
    assert r.json()["detections"][0]["bbox"] == [10, 10, 30, 30]
    assert all(d.label in CLASSES for d in corps.detections)


def test_le_mode_mock_repond(client):
    r = envoyer(client, image_octets())
    assert r.status_code == 200
    assert r.json()["status"] == "defects_detected"


def test_temps_de_traitement_dans_un_en_tete(client):
    r = envoyer(client, image_octets())
    assert float(r.headers["X-Process-Time-ms"]) >= 0


@pytest.mark.parametrize(
    ("contenu", "attendu"),
    [
        (b"", 422),
        (b"ceci n'est pas une image", 422),
        (image_octets()[:40], 422),
        (image_octets("GIF"), 415),
    ],
    ids=["vide", "texte", "image-tronquee", "format-gif"],
)
def test_entrees_invalides(client, contenu, attendu):
    assert envoyer(client, contenu).status_code == attendu


def test_champ_file_absent(client):
    assert client.post("/predict").status_code == 422


def test_fichier_trop_volumineux(client, monkeypatch):
    monkeypatch.setattr("backend.main.TAILLE_MAX_OCTETS", 10)
    assert envoyer(client, image_octets()).status_code == 413


def test_503_sans_detecteur(client):
    client.app.state.detecteur = None
    assert envoyer(client, image_octets()).status_code == 503
    assert client.get("/health").status_code == 503


def test_panne_du_detecteur_donne_500_sans_message_interne(client):
    client.app.state.detecteur = Faux(panne=RuntimeError("secret interne"))
    r = envoyer(client, image_octets())
    assert r.status_code == 500
    assert "secret interne" not in r.text


def test_refus_de_demarrer_sans_modele(monkeypatch, tmp_path):
    monkeypatch.delenv("BACKEND_MODE", raising=False)
    monkeypatch.setenv("YOLO_MODELE", str(tmp_path / "absent.pt"))
    with pytest.raises(FileNotFoundError), TestClient(app):
        pass


def test_etiquettes_du_modele():
    assert normaliser_etiquette("plastering_thread") == "Plastering thread"
    assert normaliser_etiquette("BLACK SPOT") == "Black spot"
    with pytest.raises(ValueError, match="inconnue"):
        normaliser_etiquette("scratch")


@pytest.mark.parametrize("bbox", [(10, 10, 10, 30), (30, 30, 10, 10)])
def test_bbox_invalide_refusee(bbox):
    with pytest.raises(ValueError, match="bbox"):
        Detection(label="Oil", confidence=0.5, bbox=bbox)


@pytest.mark.parametrize(
    "origine",
    ["http://localhost:3000", "http://localhost:3004", "http://127.0.0.1:5173", "null"],
)
def test_cors_accepte_les_pages_locales(client, origine):
    r = client.get("/health", headers={"Origin": origine})
    assert r.headers["access-control-allow-origin"] == origine


def test_cors_refuse_un_site_externe(client):
    r = client.get("/health", headers={"Origin": "https://site-externe.example"})
    assert "access-control-allow-origin" not in r.headers


def test_cors_expose_le_temps_de_traitement(client):
    r = client.post(
        "/predict",
        files={"file": ("b.png", image_octets(), "image/png")},
        headers={"Origin": "http://localhost:3000"},
    )
    assert "X-Process-Time-ms" in r.headers["access-control-expose-headers"]
