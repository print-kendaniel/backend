import time
import threading
from typing import Optional
from urllib.parse import urlsplit

_TTL_SECONDS = 24 * 60 * 60  # phishing/scam status rarely flips within a day
_store: dict[str, tuple[float, dict]] = {}
_lock = threading.Lock()


def _normalize(scan_type: str, url: str) -> str:
    parts = urlsplit(url.lower().strip())
    netloc = parts.netloc.removeprefix("www.")
    path = parts.path.rstrip("/")
    return f"{scan_type}:{netloc}{path}"


def get_cached_verdict(scan_type: str, url: str) -> Optional[dict]:
    key = _normalize(scan_type, url)
    with _lock:
        entry = _store.get(key)
        if entry is None:
            return None
        expires_at, verdict = entry
        if expires_at < time.time():
            del _store[key]
            return None
        return verdict


def store_verdict(scan_type: str, url: str, verdict: dict) -> None:
    key = _normalize(scan_type, url)
    with _lock:
        _store[key] = (time.time() + _TTL_SECONDS, verdict)
        if len(_store) > 5000:
            now = time.time()
            expired = [k for k, (exp, _) in _store.items() if exp < now]
            for k in expired:
                del _store[k]
