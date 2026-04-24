import parlok


def test_public_surface_is_importable():
    assert hasattr(parlok, "Adapter")
    assert hasattr(parlok, "ToolCall")
    assert hasattr(parlok, "Decision")
    assert hasattr(parlok, "DecisionKind")
    assert hasattr(parlok, "Firewall")


def test_version_is_set():
    assert parlok.__version__ == "0.1.0"


def test_all_exports_match_dunder_all():
    expected = {"Adapter", "ToolCall", "Decision", "DecisionKind", "Firewall"}
    assert set(parlok.__all__) == expected
