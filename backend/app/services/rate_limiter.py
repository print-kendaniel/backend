import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

# Per-IP sliding window. In-memory is fine for a single Render instance (free
# tier doesn't horizontally scale); the goal is just to stop a scripted loop
# from burning the shared Gemini quota or hammering OCR/CPU for every caller.
_WINDOW_SECONDS = 600
_MAX_REQUESTS = 30
_hits: dict[str, deque] = defaultdict(deque)
_lock = threading.Lock()


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def rate_limit_scan(request: Request) -> None:
    ip = _client_ip(request)
    now = time.time()
    with _lock:
        bucket = _hits[ip]
        while bucket and bucket[0] < now - _WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= _MAX_REQUESTS:
            raise HTTPException(
                status_code=429,
                detail="Too many scan requests from this IP. Please slow down and try again in a few minutes.",
            )
        bucket.append(now)
