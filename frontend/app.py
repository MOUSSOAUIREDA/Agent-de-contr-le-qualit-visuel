"""Point d'entrée alternatif pour exécuter Streamlit depuis le sous-dossier."""

import runpy
from pathlib import Path

ROOT_APP = Path(__file__).resolve().parent.parent / "app.py"

if __name__ == "__main__":
    runpy.run_path(str(ROOT_APP), run_name="__main__")
