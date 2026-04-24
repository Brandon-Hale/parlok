from parlok.state import StateStore


def test_mark_and_check_first_time(tmp_path):
    s = StateStore(tmp_path / "s.db")
    assert s.is_first_time("slack", "#sales") is True
    s.record_recipient("slack", "#sales")
    assert s.is_first_time("slack", "#sales") is False


def test_pending_approval_roundtrip(tmp_path):
    s = StateStore(tmp_path / "s.db")
    pid = s.create_pending("slack", "chat_postMessage", "#sales", "hi")
    rows = s.list_pending()
    assert len(rows) == 1 and rows[0]["id"] == pid
    s.resolve_pending(pid, "approved", "alice", None)
    rows = s.list_pending()
    assert rows == []
