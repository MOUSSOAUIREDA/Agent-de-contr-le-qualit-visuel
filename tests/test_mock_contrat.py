"""Conformité des données de simulation frontend avec le contrat Pydantic."""

from contrat.schema import Reponse

MOCK_FRONTEND_SAMPLES = [
    {
        "image": "bouteille_avec_defaut.jpg",
        "status": "defects_detected",
        "detections": [
            {
                "label": "Bubble",
                "confidence": 0.94,
                "bbox": [120, 80, 200, 160],
            }
        ],
    },
    {
        "image": "bouteille_saine.jpg",
        "status": "no_defect",
        "detections": [],
    },
    {
        "image": "bouteille_multi_defauts.jpg",
        "status": "defects_detected",
        "detections": [
            {
                "label": "Black spot",
                "confidence": 0.91,
                "bbox": [140, 180, 175, 215],
            },
            {
                "label": "Oil",
                "confidence": 0.87,
                "bbox": [220, 260, 290, 320],
            },
            {
                "label": "Quenched grain",
                "confidence": 0.79,
                "bbox": [95, 340, 145, 390],
            },
        ],
    },
    {
        "image": "bouteille_fil_verre.jpg",
        "status": "defects_detected",
        "detections": [
            {
                "label": "Plastering thread",
                "confidence": 0.88,
                "bbox": [160, 110, 240, 290],
            }
        ],
    },
]


def test_mock_frontend_samples_conformity():
    """Valider que chaque échantillon du frontend respecte le schéma officiel."""
    for sample in MOCK_FRONTEND_SAMPLES:
        validated = Reponse.model_validate(sample)
        assert validated.image == sample["image"]
        assert validated.status == sample["status"]
        assert len(validated.detections) == len(sample["detections"])
