import re

import pytest

import parlok
from parlok.cli import main


def test_init_writes_starter(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    rc = main(["init"])
    assert rc == 0
    assert (tmp_path / "parlok.yaml").exists()
    assert "version: 1" in (tmp_path / "parlok.yaml").read_text()


def test_init_refuses_overwrite(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "parlok.yaml").write_text("existing")
    rc = main(["init"])
    assert rc == 1


def test_init_force_overwrites(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "parlok.yaml").write_text("existing")
    rc = main(["init", "--force"])
    assert rc == 0
    assert "version: 1" in (tmp_path / "parlok.yaml").read_text()


def test_lint_good(tmp_path):
    p = tmp_path / "p.yaml"
    p.write_text("version: 1\npolicies:\n  - name: x\n    decision: allow\n")
    assert main(["lint", str(p)]) == 0


def test_lint_bad(tmp_path):
    p = tmp_path / "p.yaml"
    p.write_text("version: 2\npolicies: []\n")
    rc = main(["lint", str(p)])
    assert rc == 1


def test_version_flag_prints_version(capsys):
    with pytest.raises(SystemExit) as exc:
        main(["--version"])
    assert exc.value.code == 0
    out = capsys.readouterr().out.strip()
    assert out.startswith("parlok ")
    assert re.match(r"^parlok \d+\.\d+\.\d+", out), out
    # matches the same version the package reports
    assert out.split(" ", 1)[1].startswith(parlok.__version__.split("+", 1)[0])


def test_short_version_flag(capsys):
    with pytest.raises(SystemExit):
        main(["-V"])
    assert capsys.readouterr().out.startswith("parlok ")


def test_test_cmd_runs(tmp_path, capsys):
    p = tmp_path / "p.yaml"
    p.write_text("version: 1\npolicies:\n  - name: x\n    decision: allow\n")
    rc = main(["test", str(p)])
    assert rc == 0
    out = capsys.readouterr().out
    assert "decision" in out.lower()
