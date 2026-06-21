from typing import Optional

from fastapi import Header, HTTPException
from firebase_admin import auth as fb_auth

from app.services.firebase_service import get_db


def _verify(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[len("Bearer "):].strip()
    if not token:
        return None
    try:
        get_db()  # ensures the firebase_admin app is initialized
        decoded = fb_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        return None


async def get_verified_uid(authorization: Optional[str] = Header(None)) -> str:
    """Require a valid Firebase ID token and return its uid. Used for endpoints
    that read a specific user's data — the uid must come from a verified token,
    never from a client-supplied parameter, or any user could read anyone else's
    scan history just by knowing/guessing their UID."""
    uid = _verify(authorization)
    if uid is None:
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    return uid


async def get_optional_uid(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Best-effort verified uid for endpoints that work both logged-out
    (anonymous) and logged-in. Never trusts a client-supplied user_id for
    attributing saved data — only a verified token can claim a uid."""
    return _verify(authorization)
