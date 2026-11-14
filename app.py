"""QualiGlass AI — Application Streamlit de Contrôle Qualité Visuel.

Détection et localisation automatique des défauts sur des bouteilles en verre.
Responsabilité Membre C (Interface Utilisateur) • Projet Defauts-Verre.
"""

from __future__ import annotations

import io
import json
from datetime import datetime
from typing import Any

import requests
import streamlit as st
from PIL import Image, ImageDraw, ImageEnhance, ImageOps

# -----------------------------------------------------------------------------
# 1. Configuration de la page Streamlit
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="QualiGlass AI — Contrôle Qualité Verre",
    page_icon="🍾",
    layout="wide",
    initial_sidebar_state="expanded",
)

# -----------------------------------------------------------------------------
# 2. Métadonnées des 5 classes ciblées (contrat/schema.py)
# -----------------------------------------------------------------------------
DEFECT_CLASSES: dict[str, dict[str, Any]] = {
    "Bubble": {
        "label": "Bubble",
        "fr": "Bulle d'air",
        "color": "#06b6d4",
        "rgb": (6, 182, 212),
        "desc": "Poche de gaz emprisonnée dans le verre lors du soufflage.",
    },
    "Plastering thread": {
        "label": "Plastering thread",
        "fr": "Fil / Cordon de verre",
        "color": "#a855f7",
        "rgb": (168, 85, 247),
        "desc": "Filament ou pli linéaire visible sur la paroi de la bouteille.",
    },
    "Black spot": {
        "label": "Black spot",
        "fr": "Tache noire / Inclusion",
        "color": "#f59e0b",
        "rgb": (245, 158, 11),
        "desc": "Inclusion solide opaque ou particule réfractaire carbonisée.",
    },
    "Oil": {
        "label": "Oil",
        "fr": "Trace d'huile",
        "color": "#f43f5e",
        "rgb": (244, 63, 94),
        "desc": "Contamination superficielle ou résidu de lubrifiant de moule.",
    },
    "Quenched grain": {
        "label": "Quenched grain",
        "fr": "Grain de trempe",
        "color": "#10b981",
        "rgb": (16, 185, 129),
        "desc": "Micro-cristallisation thermique liée à un recuit hétérogène.",
    },
}

# -----------------------------------------------------------------------------
# 3. Injection CSS sur-mesure (Design Industriel Moderne / Dark Glassmorphism)
# -----------------------------------------------------------------------------
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, sans-serif;
    }
    code, pre, .font-mono {
        font-family: 'JetBrains Mono', monospace !important;
    }
    .qc-header {
        background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7));
        border: 1px solid rgba(51, 65, 85, 0.6);
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 24px;
    }
    .qc-badge-team {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .verdict-pass {
        background: linear-gradient(90deg, rgba(6,78,59,0.4), rgba(15,23,42,0.8));
        border: 1.5px solid rgba(16, 185, 129, 0.5);
        border-radius: 14px;
        padding: 16px 20px;
        color: #ecfdf5;
        margin-bottom: 16px;
    }
    .verdict-fail {
        background: linear-gradient(90deg, rgba(136,19,55,0.4), rgba(15,23,42,0.8));
        border: 1.5px solid rgba(244, 63, 94, 0.5);
        border-radius: 14px;
        padding: 16px 20px;
        color: #fff1f2;
        margin-bottom: 16px;
    }
    .metric-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(51, 65, 85, 0.5);
        border-radius: 12px;
        padding: 14px;
        text-align: center;
    }
    .defect-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(51, 65, 85, 0.6);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 10px;
    }
    .defect-card:hover {
        border-color: rgba(6, 182, 212, 0.6);
        background: rgba(30, 41, 59, 0.7);
    }
    .stButton>button {
        border-radius: 10px;
        font-weight: 600;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# -----------------------------------------------------------------------------
# 4. État global de la session (Session State)
# -----------------------------------------------------------------------------
if "history" not in st.session_state:
    st.session_state.history = []

if "stats" not in st.session_state:
    st.session_state.stats = {"total": 0, "passed": 0, "failed": 0}

if "current_image" not in st.session_state:
    st.session_state.current_image = None

if "current_filename" not in st.session_state:
    st.session_state.current_filename = None

if "analysis_result" not in st.session_state:
    st.session_state.analysis_result = None


# -----------------------------------------------------------------------------
# 5. Génération d'images d'échantillons réalistes
# -----------------------------------------------------------------------------
def create_sample_bottle_image(
    bubble: bool = False,
    black_spot: bool = False,
    oil: bool = False,
    thread: bool = False,
    grain: bool = False,
    width: int = 400,
    height: int = 500,
) -> Image.Image:
    """Génère une image de bouteille en verre réaliste avec Pillow."""
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    for x in range(0, width, 50):
        draw.line([(x, 0), (x, height)], fill=(30, 41, 59), width=1)
    for y in range(0, height, 50):
        draw.line([(0, y), (width, y)], fill=(30, 41, 59), width=1)

    bottle_pts = [
        (170, 40),
        (230, 40),
        (230, 80),
        (280, 150),
        (310, 220),
        (310, 450),
        (290, 470),
        (110, 470),
        (90, 450),
        (90, 220),
        (120, 150),
        (170, 80),
    ]
    draw.polygon(bottle_pts, fill=(6, 78, 59), outline=(52, 211, 153), width=2)
    draw.line([(105, 220), (105, 440)], fill=(167, 243, 208), width=3)
    draw.line([(135, 150), (175, 90)], fill=(167, 243, 208), width=2)
    draw.ellipse([(170, 32), (230, 48)], fill=(4, 120, 87), outline=(110, 231, 183))

    if bubble:
        draw.ellipse(
            [(140, 100), (180, 140)],
            fill=(8, 145, 178),
            outline=(103, 232, 249),
            width=2,
        )
        draw.ellipse([(145, 105), (155, 115)], fill=(255, 255, 255))

    if black_spot:
        draw.polygon(
            [(145, 185), (170, 188), (165, 210), (142, 205)],
            fill=(24, 24, 27),
            outline=(113, 113, 122),
        )

    if oil:
        draw.ellipse(
            [(225, 265), (285, 315)],
            fill=(225, 29, 72),
            outline=(251, 113, 133),
            width=2,
        )

    if thread:
        pts = [(180, 120), (170, 170), (220, 220), (190, 280)]
        for i in range(len(pts) - 1):
            draw.line([pts[i], pts[i + 1]], fill=(233, 213, 255), width=4)
            draw.line([pts[i], pts[i + 1]], fill=(168, 85, 247), width=2)

    if grain:
        draw.ellipse(
            [(105, 350), (135, 380)],
            fill=(16, 185, 129),
            outline=(110, 231, 183),
            width=2,
        )
        draw.point(
            [(115, 360), (120, 365), (125, 355), (110, 370)],
            fill=(255, 255, 255),
        )

    return img


# Échantillons pré-configurés conformes à contrat/exemple.json
MOCK_SAMPLES: list[dict[str, Any]] = [
    {
        "id": "sample-bubble",
        "name": "Bouteille avec Bulle",
        "desc": "Conforme à l'exemple officiel contrat/exemple.json.",
        "data": {
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
        "generator": lambda: create_sample_bottle_image(bubble=True),
    },
    {
        "id": "sample-clean",
        "name": "Bouteille Saine",
        "desc": "Bouteille saine conforme (status: no_defect, EF-10).",
        "data": {
            "image": "bouteille_saine.jpg",
            "status": "no_defect",
            "detections": [],
        },
        "generator": lambda: create_sample_bottle_image(),
    },
    {
        "id": "sample-multi",
        "name": "Bouteille Multi-Défauts",
        "desc": "Bouteille avec tache noire, huile et grain de trempe.",
        "data": {
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
        "generator": lambda: create_sample_bottle_image(
            black_spot=True, oil=True, grain=True
        ),
    },
    {
        "id": "sample-thread",
        "name": "Bouteille Fil de Verre",
        "desc": "Filament / cordon de surface (Plastering thread 88%).",
        "data": {
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
        "generator": lambda: create_sample_bottle_image(thread=True),
    },
]


# -----------------------------------------------------------------------------
# 6. Moteur de détection (Simulation ou Appel FastAPI Membre B)
# -----------------------------------------------------------------------------
def simulate_detection(filename: str, width: int, height: int) -> dict[str, Any]:
    """Génère une détection de simulation plausible conforme au contrat."""
    classes = list(DEFECT_CLASSES.keys())
    hash_val = sum(ord(c) for c in filename)
    has_defect = hash_val % 5 != 0

    if not has_defect:
        return {
            "image": filename,
            "status": "no_defect",
            "detections": [],
        }

    count = (hash_val % 3) + 1
    detections = []
    for i in range(count):
        label = classes[(hash_val + i) % len(classes)]
        confidence = round(0.72 + ((hash_val * (i + 1)) % 26) / 100.0, 2)
        box_w = max(35, int(width * (0.12 + 0.04 * i)))
        box_h = max(35, int(height * (0.10 + 0.04 * i)))
        x_min = int(width * 0.25 + (hash_val * 37 + i * 20) % int(width * 0.4))
        y_min = int(height * 0.15 + (hash_val * 53 + i * 40) % int(height * 0.6))

        detections.append(
            {
                "label": label,
                "confidence": min(0.99, confidence),
                "bbox": [
                    x_min,
                    y_min,
                    min(width - 5, x_min + box_w),
                    min(height - 5, y_min + box_h),
                ],
            }
        )

    return {
        "image": filename,
        "status": "defects_detected",
        "detections": detections,
    }


def analyze_with_fastapi(
    image_bytes: bytes, filename: str, api_url: str
) -> dict[str, Any]:
    """Appelle l'endpoint FastAPI développé par le Membre B."""
    files = {"file": (filename, image_bytes, "image/jpeg")}
    response = requests.post(f"{api_url}/predict", files=files, timeout=10)
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict) or "status" not in data or "detections" not in data:
        raise ValueError("Réponse API invalide : champs requis manquants.")
    return data


# -----------------------------------------------------------------------------
# 7. Dessin des Bounding Boxes sur l'image
# -----------------------------------------------------------------------------
def draw_annotated_image(
    image: Image.Image,
    detections: list[dict[str, Any]],
    min_confidence: float = 0.5,
    active_classes: list[str] | None = None,
    show_boxes: bool = True,
    show_labels: bool = True,
    show_scores: bool = True,
    brightness: float = 1.0,
    contrast: float = 1.0,
    invert: bool = False,
) -> Image.Image:
    """Annote l'image avec les boîtes englobantes et étiquettes."""
    res_img = image.copy()
    if brightness != 1.0:
        enhancer = ImageEnhance.Brightness(res_img)
        res_img = enhancer.enhance(brightness)
    if contrast != 1.0:
        enhancer = ImageEnhance.Contrast(res_img)
        res_img = enhancer.enhance(contrast)
    if invert:
        res_img = ImageOps.invert(res_img.convert("RGB"))

    if not show_boxes:
        return res_img

    draw = ImageDraw.Draw(res_img)

    for det in detections:
        conf = det.get("confidence", 0.0)
        label = det.get("label", "Unknown")

        if conf < min_confidence:
            continue
        if active_classes and label not in active_classes:
            continue

        x_min, y_min, x_max, y_max = det["bbox"]
        meta = DEFECT_CLASSES.get(label, {"rgb": (6, 182, 212), "color": "#06b6d4"})
        color = meta["rgb"]

        draw.rectangle([(x_min, y_min), (x_max, y_max)], outline=color, width=3)

        corner = min(12, max(4, int(min(x_max - x_min, y_max - y_min) / 3)))
        draw.line(
            [(x_min, y_min + corner), (x_min, y_min), (x_min + corner, y_min)],
            fill=(255, 255, 255),
            width=2,
        )
        draw.line(
            [(x_max - corner, y_min), (x_max, y_min), (x_max, y_min + corner)],
            fill=(255, 255, 255),
            width=2,
        )
        draw.line(
            [(x_min, y_max - corner), (x_min, y_max), (x_min + corner, y_max)],
            fill=(255, 255, 255),
            width=2,
        )
        draw.line(
            [(x_max - corner, y_max), (x_max, y_max), (x_max, y_max - corner)],
            fill=(255, 255, 255),
            width=2,
        )

        if show_labels:
            text = f"{label} {int(conf * 100)}%" if show_scores else label
            tag_h = 18
            tag_w = len(text) * 8 + 8
            tag_y = max(0, y_min - tag_h)
            draw.rectangle(
                [(x_min, tag_y), (x_min + tag_w, tag_y + tag_h)],
                fill=(15, 23, 42),
            )
            draw.rectangle(
                [(x_min, tag_y), (x_min + tag_w, tag_y + tag_h)],
                outline=color,
                width=1,
            )
            draw.text((x_min + 4, tag_y + 2), text, fill=(255, 255, 255))

    return res_img


# -----------------------------------------------------------------------------
# 8. Barre Latérale (Sidebar) : Mode, Connexion & Paramètres
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🍾 QualiGlass AI")
    st.markdown(
        "<span class='qc-badge-team'>Membre C : Frontend Streamlit</span>",
        unsafe_allow_html=True,
    )
    st.markdown("---")

    st.markdown("#### ⚙️ Mode d'exécution")
    app_mode = st.radio(
        "Sélection du moteur IA :",
        ["Mode Démo / Simulation", "Mode Live API (FastAPI)"],
        index=0,
    )

    api_url = "http://localhost:8000"
    if app_mode == "Mode Live API (FastAPI)":
        api_url = st.text_input(
            "Adresse de l'API FastAPI", value="http://localhost:8000"
        )
        try:
            r = requests.get(f"{api_url}/health", timeout=1)
            if r.status_code == 200:
                st.success("🟢 Backend FastAPI en ligne")
            else:
                st.warning(f"🟡 Backend accessible ({r.status_code})")
        except Exception:
            st.error("🔴 Backend hors-ligne (Fallback simulation)")

    st.markdown("---")

    st.markdown("#### 🎯 Paramètres de Détection")
    min_confidence = st.slider(
        "Seuil de confiance minimum",
        min_value=0.40,
        max_value=0.99,
        value=0.50,
        step=0.01,
        format="%d%%",
    )

    st.markdown("##### Filtre des 5 classes :")
    selected_classes = []
    for cls_name, meta in DEFECT_CLASSES.items():
        if st.checkbox(f"{cls_name} ({meta['fr']})", value=True):
            selected_classes.append(cls_name)

    st.markdown("---")
    st.markdown("#### 👁️ Affichage & Filtres")
    show_boxes = st.checkbox("Afficher les boîtes englobantes", value=True)
    show_labels = st.checkbox("Afficher les étiquettes", value=True)
    show_scores = st.checkbox("Afficher les scores %", value=True)

    with st.expander("🔬 Améliorations Optiques du Verre"):
        opt_brightness = st.slider("Luminosité", 0.5, 2.0, 1.0, 0.05)
        opt_contrast = st.slider("Contraste", 0.5, 2.5, 1.0, 0.05)
        opt_invert = st.checkbox("Inverser les couleurs")


# -----------------------------------------------------------------------------
# 9. En-tête Principal
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div class="qc-header">
        <h1 style="margin:0; font-size:24px; font-weight:800; color:#ffffff;">
            QualiGlass AI — Contrôle Qualité Visuel
        </h1>
        <p style="margin:4px 0 0 0; font-size:13px; color:#94a3b8;">
            Détection automatique et localisation des défauts sur bouteilles en verre
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

kpi_cols = st.columns(4)
with kpi_cols[0]:
    st.markdown(
        f"<div class='metric-card'>"
        f"<div style='font-size:11px; color:#94a3b8;'>TOTAL INSPECTIONS</div>"
        f"<div style='font-size:22px; font-weight:800; color:#fff;'>"
        f"{st.session_state.stats['total']}</div></div>",
        unsafe_allow_html=True,
    )
with kpi_cols[1]:
    st.markdown(
        f"<div class='metric-card'>"
        f"<div style='font-size:11px; color:#34d399;'>CONFORMES (PASS)</div>"
        f"<div style='font-size:22px; font-weight:800; color:#34d399;'>"
        f"{st.session_state.stats['passed']}</div></div>",
        unsafe_allow_html=True,
    )
with kpi_cols[2]:
    st.markdown(
        f"<div class='metric-card'>"
        f"<div style='font-size:11px; color:#fb7185;'>REJETS QUALITÉ</div>"
        f"<div style='font-size:22px; font-weight:800; color:#fb7185;'>"
        f"{st.session_state.stats['failed']}</div></div>",
        unsafe_allow_html=True,
    )
with kpi_cols[3]:
    total = st.session_state.stats["total"]
    yield_rate = (
        round((st.session_state.stats["passed"] / total) * 100, 1)
        if total > 0
        else 100.0
    )
    st.markdown(
        f"<div class='metric-card'>"
        f"<div style='font-size:11px; color:#38bdf8;'>TAUX DE RENDEMENT</div>"
        f"<div style='font-size:22px; font-weight:800; color:#38bdf8;'>"
        f"{yield_rate}%</div></div>",
        unsafe_allow_html=True,
    )

st.write("")

# -----------------------------------------------------------------------------
# 10. Sélection d'échantillons ou Importation utilisateur (EF-01 à EF-03)
# -----------------------------------------------------------------------------
st.markdown("#### 🧪 1. Charger une bouteille de test ou importer une image")

sample_cols = st.columns(4)
for idx, sample in enumerate(MOCK_SAMPLES):
    with sample_cols[idx]:
        if st.button(
            f"🧪 {sample['name']}", key=sample["id"], use_container_width=True
        ):
            img = sample["generator"]()
            st.session_state.current_image = img
            st.session_state.current_filename = sample["data"]["image"]
            st.session_state.analysis_result = sample["data"]

            is_pass = (
                sample["data"]["status"] == "no_defect"
                or len(sample["data"]["detections"]) == 0
            )
            st.session_state.stats["total"] += 1
            if is_pass:
                st.session_state.stats["passed"] += 1
            else:
                st.session_state.stats["failed"] += 1

            st.session_state.history.append(
                {
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "image": sample["data"]["image"],
                    "status": sample["data"]["status"],
                    "detections_count": len(sample["data"]["detections"]),
                }
            )
            st.rerun()

uploaded_file = st.file_uploader(
    "Ou importez une image (JPG, PNG, WEBP, BMP — Max 20 Mo) :",
    type=["jpg", "jpeg", "png", "webp", "bmp"],
)

if uploaded_file is not None:
    if st.session_state.current_filename != uploaded_file.name:
        try:
            file_bytes = uploaded_file.read()
            loaded_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            st.session_state.current_image = loaded_img
            st.session_state.current_filename = uploaded_file.name

            if app_mode == "Mode Live API (FastAPI)":
                try:
                    result = analyze_with_fastapi(
                        file_bytes, uploaded_file.name, api_url
                    )
                except Exception as err:
                    st.warning(f"Backend inaccessible ({err}), simulation.")
                    result = simulate_detection(
                        uploaded_file.name, loaded_img.width, loaded_img.height
                    )
            else:
                result = simulate_detection(
                    uploaded_file.name, loaded_img.width, loaded_img.height
                )

            st.session_state.analysis_result = result

            is_pass = result["status"] == "no_defect" or len(result["detections"]) == 0
            st.session_state.stats["total"] += 1
            if is_pass:
                st.session_state.stats["passed"] += 1
            else:
                st.session_state.stats["failed"] += 1

            st.session_state.history.append(
                {
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "image": uploaded_file.name,
                    "status": result["status"],
                    "detections_count": len(result["detections"]),
                }
            )
            st.rerun()
        except Exception as e:
            st.error(f"Erreur lors de la lecture du fichier : {e}")

# -----------------------------------------------------------------------------
# 11. Affichage des Résultats & Visualiseur Optique (EF-07 à EF-15)
# -----------------------------------------------------------------------------
if (
    st.session_state.current_image is not None
    and st.session_state.analysis_result is not None
):
    st.markdown("---")
    st.markdown("#### 🔬 2. Résultats de l'inspection optique")

    result = st.session_state.analysis_result
    all_detections = result.get("detections", [])
    valid_detections = [
        d
        for d in all_detections
        if d.get("confidence", 0.0) >= min_confidence
        and (not selected_classes or d.get("label") in selected_classes)
    ]
    is_healthy = len(valid_detections) == 0

    if is_healthy:
        st.markdown(
            """
            <div class="verdict-pass">
                <div style="font-size:17px; font-weight:800; color:#34d399;">
                    ✓ CONFORME — Bouteille Validée (QC PASS)
                </div>
                <div style="font-size:12px; color:#a7f3d0; margin-top:3px;">
                    Aucun défaut détecté par le système d'inspection (EF-10).
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            f"""
            <div class="verdict-fail">
                <div style="font-size:17px; font-weight:800; color:#fb7185;">
                    ⚠️ NON CONFORME — {len(valid_detections)} Défaut(s) Détecté(s)
                </div>
                <div style="font-size:12px; color:#fecdd3; margin-top:3px;">
                    Anomalies critiques identifiées sur la bouteille en verre.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    view_col, details_col = st.columns([6, 4])

    with view_col:
        tab_annotated, tab_raw, tab_compare = st.tabs(
            [
                "🎯 Image Annotée (IA)",
                "📷 Image Brute",
                "⚖️ Comparaison",
            ]
        )

        annotated_img = draw_annotated_image(
            st.session_state.current_image,
            valid_detections,
            min_confidence=min_confidence,
            active_classes=selected_classes,
            show_boxes=show_boxes,
            show_labels=show_labels,
            show_scores=show_scores,
            brightness=opt_brightness,
            contrast=opt_contrast,
            invert=opt_invert,
        )

        with tab_annotated:
            st.image(
                annotated_img,
                caption=f"{annotated_img.width} × {annotated_img.height} px",
                use_container_width=True,
            )

        with tab_raw:
            st.image(
                st.session_state.current_image,
                caption="Image originale brute",
                use_container_width=True,
            )

        with tab_compare:
            comp_cols = st.columns(2)
            with comp_cols[0]:
                st.image(st.session_state.current_image, use_container_width=True)
            with comp_cols[1]:
                st.image(annotated_img, use_container_width=True)

    with details_col:
        st.markdown(f"##### 📋 Liste des Défauts ({len(valid_detections)})")

        if len(valid_detections) == 0:
            st.info("Aucun défaut détecté avec les filtres actuels.")
        else:
            for det in valid_detections:
                lbl = det["label"]
                conf = det["confidence"]
                x1, y1, x2, y2 = det["bbox"]
                w, h = x2 - x1, y2 - y1
                meta = DEFECT_CLASSES.get(
                    lbl, {"color": "#38bdf8", "fr": lbl, "desc": ""}
                )
                m_color = meta["color"]
                m_fr = meta["fr"]
                m_desc = meta.get("desc", "")

                st.markdown(
                    f"""
                    <div class="defect-card">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="color:#fff;">{lbl} ({m_fr})</strong>
                            <span style="color:{m_color}; font-weight:700;">
                                {int(conf * 100)}%
                            </span>
                        </div>
                        <div style="font-size:11px; color:#cbd5e1;">
                            BBox: [{x1}, {y1}, {x2}, {y2}] • {w} × {h} px
                        </div>
                        <p style="margin:4px 0 0 0; font-size:11px; color:#64748b;">
                            {m_desc}
                        </p>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        st.markdown("##### 💾 Traçabilité & Export")
        contract_json = json.dumps(
            {
                "image": st.session_state.current_filename,
                "status": ("no_defect" if is_healthy else "defects_detected"),
                "detections": valid_detections,
            },
            indent=2,
            ensure_ascii=False,
        )

        dl_cols = st.columns(2)
        with dl_cols[0]:
            st.download_button(
                label="📥 Exporter JSON",
                data=contract_json,
                file_name="inspection_result.json",
                mime="application/json",
                use_container_width=True,
            )
        with dl_cols[1]:
            report_text = (
                f"CERTIFICAT QUALIGLASS AI\n"
                f"Date: {datetime.now()}\n"
                f"Fichier: {st.session_state.current_filename}\n"
                f"Verdict: {'PASS' if is_healthy else 'REJET'}\n"
                f"Defauts: {len(valid_detections)}\n"
            )
            st.download_button(
                label="📄 Rapport Fiche",
                data=report_text,
                file_name="rapport.txt",
                mime="text/plain",
                use_container_width=True,
            )

    if len(st.session_state.history) > 1:
        st.markdown("---")
        st.markdown("#### 📜 Historique de la session")
        hist_table = [
            {
                "Heure": h["time"],
                "Image": h["image"],
                "Statut": ("PASS" if h["status"] == "no_defect" else "REJET"),
                "Défauts": h["detections_count"],
            }
            for h in reversed(st.session_state.history)
        ]
        st.dataframe(hist_table, use_container_width=True)
