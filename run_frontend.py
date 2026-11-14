"""Serveur local léger pour l'interface de contrôle qualité (Frontend TP5).

Permet de visualiser et tester l'interface utilisateur immédiatement
sans nécessiter l'installation de Node.js ou de npm.
"""

from __future__ import annotations

import http.server
import json
import socketserver
import sys
import webbrowser
from pathlib import Path
from typing import ClassVar

PORT = 3000
FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"


class QualityControlHandler(http.server.SimpleHTTPRequestHandler):
    """Gestionnaire HTTP servant les fichiers frontend et simulant l'API."""

    MOCK_DETECTIONS: ClassVar[list[dict]] = [
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
    ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def do_GET(self):
        """Gestion des requêtes GET."""
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "service": "qualiglass-mock"}')
            return

        return super().do_GET()

    def do_POST(self):
        """Gestion des requêtes POST pour simuler le endpoint /predict."""
        if self.path.startswith("/predict"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            # Réponse conforme au contrat d'équipe contrat/schema.py
            response_payload = {
                "image": "bouteille_analysee.jpg",
                "status": "defects_detected",
                "detections": [
                    {
                        "label": "Bubble",
                        "confidence": 0.94,
                        "bbox": [120, 80, 200, 160],
                    }
                ],
            }
            self.wfile.write(json.dumps(response_payload).encode("utf-8"))
            return

        self.send_error(404, "Endpoint non trouvé")

    def do_OPTIONS(self):
        """Support CORS pour les requêtes fetch."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def log_message(self, format_str, *args):
        """Journalisation condensée."""
        sys.stderr.write(f"[{self.log_date_time_string()}] {format_str % args}\n")


def main():
    """Démarre le serveur local et ouvre le navigateur."""
    if not FRONTEND_DIR.exists():
        print(f"Erreur : Le dossier {FRONTEND_DIR} n'existe pas.", file=sys.stderr)
        sys.exit(1)

    port = PORT
    server = None
    for attempt_port in range(PORT, PORT + 10):
        try:
            server = socketserver.TCPServer(("", attempt_port), QualityControlHandler)
            port = attempt_port
            break
        except OSError:
            continue

    if server is None:
        print("Erreur : Impossible de trouver un port libre.", file=sys.stderr)
        sys.exit(1)

    url = f"http://localhost:{port}"
    print("=" * 65)
    print("  QualiGlass AI — Interface de Contrôle Qualité Visuel")
    print(f"  Serveur actif sur : {url}")
    print("  Mode d'emploi :")
    print("   • Ouvrez l'interface dans votre navigateur")
    print("   • Cliquez sur un échantillon pour tester immédiatement")
    print("   • Ou glissez-déposez vos propres images de bouteilles")
    print("   • Appuyez sur Ctrl+C pour arrêter le serveur")
    print("=" * 65)

    webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur. Au revoir !")
        server.server_close()


if __name__ == "__main__":
    main()
