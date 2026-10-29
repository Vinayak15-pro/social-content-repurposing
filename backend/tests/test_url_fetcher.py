import pytest
from fastapi import HTTPException
from app.services.url_fetcher import validate_url_safe

def test_url_fetcher_blocks_localhost():
    with pytest.raises(HTTPException) as exc:
        validate_url_safe("http://localhost:8080/admin")
    assert exc.value.status_code == 400
    assert "localhost" in exc.value.detail.lower()

def test_url_fetcher_blocks_loopback_ip():
    with pytest.raises(HTTPException) as exc:
        validate_url_safe("http://127.0.0.1:3000")
    assert exc.value.status_code == 400

def test_url_fetcher_blocks_invalid_schemes():
    with pytest.raises(HTTPException) as exc:
        validate_url_safe("ftp://example.com/file.txt")
    assert exc.value.status_code == 400
    assert "scheme" in exc.value.detail.lower()

def test_url_fetcher_blocks_file_scheme():
    with pytest.raises(HTTPException) as exc:
        validate_url_safe("file:///etc/passwd")
    assert exc.value.status_code == 400
