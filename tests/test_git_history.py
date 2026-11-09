
"""Tests sur l'historique Git : un commit par membre.

Ignorés si le dossier n'est pas un dépôt Git
(par exemple sur un kit fraîchement décompressé).
"""

import subprocess
from pathlib import Path

import pytest

MIN_AUTHORS = 2


@pytest.fixture(scope="module")
def git_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _git(root: Path, *args: str) -> str:
    return subprocess.run(
        ["git", *args],
        cwd=root,
        capture_output=True,
        text=True,
        check=True,
    ).stdout


def test_has_at_least_one_commit(git_root: Path):
    out = _git(git_root, "rev-list", "--count", "HEAD")
    assert int(out.strip()) >= 1


def test_each_member_has_committed(git_root: Path):
    out = _git(git_root, "shortlog", "-sn", "--all")
    authors = [
        line.split("\t", 1)[1].strip()
        for line in out.splitlines()
        if "\t" in line
    ]

    assert len(authors) >= MIN_AUTHORS, (
        f"{len(authors)} auteur(s) de commits, "
        f"{MIN_AUTHORS} attendus : {authors}"
    )


def test_venv_never_committed(git_root: Path):
    log = _git(
        git_root,
        "log",
        "--all",
        "--name-only",
        "--pretty=format:",
    )

    assert ".venv/" not in log, (
        ".venv/ a été commité au moins une fois : "
        "nettoyer l'historique ou recommencer le dépôt"
    )
