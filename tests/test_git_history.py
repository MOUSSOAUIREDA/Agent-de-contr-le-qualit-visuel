"""Tests sur l'historique Git : un commit par membre du binôme.

Ignorés si le dossier n'est pas un dépôt Git (par exemple sur un kit fraîchement décompressé).
"""
import shutil
import subprocess
from pathlib import Path

import pytest

MIN_AUTHORS = 3  


def _git(root: Path, *args: str) -> str:
    return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, check=True).stdout


@pytest.fixture(scope="module")
def git_root() -> Path:
    return Path(__file__).resolve().parents[1]


def test_has_at_least_one_commit(git_root: Path):
    assert _git(git_root, "rev-list", "--count", "HEAD").strip() != "0"


def test_each_member_has_committed(git_root: Path):
    out = _git(git_root, "shortlog", "-sn", "--all")
    authors = [line.split("\t", 1)[1].strip() for line in out.splitlines() if "\t" in line]
    assert len(authors) >= MIN_AUTHORS, (
        f"{len(authors)} auteur(s) de commits, {MIN_AUTHORS} attendus (un par membre du binôme) : {authors}"
    )


def test_venv_never_committed(git_root: Path):
    log = _git(git_root, "log", "--all", "--name-only", "--pretty=format:")
    assert ".venv/" not in log, ".venv/ a été commité au moins une fois : nettoyer l'historique ou recommencer le dépôt"
