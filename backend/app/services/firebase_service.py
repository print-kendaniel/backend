import os
import json
import uuid
from datetime import datetime, timezone
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore

_db = None


def get_db():
    global _db
    if _db is None:
        if not firebase_admin._apps:
            sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

            if sa_json:
                cred_dict = json.loads(sa_json)
                cred = credentials.Certificate(cred_dict)
            elif sa_path and os.path.exists(sa_path):
                cred = credentials.Certificate(sa_path)
            else:
                raise RuntimeError(
                    "Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH "
                    "or FIREBASE_SERVICE_ACCOUNT_JSON environment variable."
                )
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db


async def save_scan_result(
    report: dict,
    user_id: Optional[str],
    scan_type: str,
    url: Optional[str] = None,
) -> str:
    """Save scan result to Firestore. Returns document ID."""
    if not user_id:
        return str(uuid.uuid4())

    try:
        db = get_db()
        doc_id = str(uuid.uuid4())
        doc_data = {
            "id": doc_id,
            "user_id": user_id,
            "scan_type": scan_type,
            "url": url,
            "risk_level": report["risk_level"],
            "risk_score": report["risk_score"],
            "confidence": report["confidence"],
            "summary": report["summary"],
            "reasons": report["reasons"],
            "recommendation": report["recommendation"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        db.collection("scans").document(doc_id).set(doc_data)
        return doc_id
    except Exception:
        return str(uuid.uuid4())


async def get_scan_history(user_id: str, limit: int = 50) -> list:
    """Retrieve user scan history from Firestore."""
    try:
        db = get_db()
        docs = (
            db.collection("scans")
            .where("user_id", "==", user_id)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        return [doc.to_dict() for doc in docs]
    except Exception:
        return []


async def get_dashboard_stats(user_id: str) -> dict:
    """Compute dashboard stats from user's scan history."""
    try:
        history = await get_scan_history(user_id, limit=1000)
        total = len(history)
        safe = sum(1 for h in history if h.get("risk_level") == "safe")
        suspicious = sum(1 for h in history if h.get("risk_level") == "suspicious")
        dangerous = sum(1 for h in history if h.get("risk_level") == "dangerous")
        return {
            "total_scans": total,
            "safe_count": safe,
            "suspicious_count": suspicious,
            "dangerous_count": dangerous,
            "threats_blocked": suspicious + dangerous,
            "recent_scans": history[:10],
        }
    except Exception:
        return {
            "total_scans": 0,
            "safe_count": 0,
            "suspicious_count": 0,
            "dangerous_count": 0,
            "threats_blocked": 0,
            "recent_scans": [],
        }


async def save_website_report(report_data: dict) -> str:
    """Save a user-submitted website report to Firestore."""
    try:
        db = get_db()
        doc_id = str(uuid.uuid4())
        report_data["id"] = doc_id
        report_data["timestamp"] = datetime.now(timezone.utc).isoformat()
        report_data["status"] = "pending"
        db.collection("reports").document(doc_id).set(report_data)
        return doc_id
    except Exception:
        return str(uuid.uuid4())
