from fastapi import APIRouter, Depends, HTTPException

from app.services.auth import get_verified_uid
from app.services.firebase_service import get_scan_history, get_dashboard_stats

router = APIRouter()


@router.get("/history")
async def get_history(uid: str = Depends(get_verified_uid)):
    """Get scan history for the authenticated user."""
    try:
        return await get_scan_history(uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard-stats")
async def dashboard_stats(uid: str = Depends(get_verified_uid)):
    """Get dashboard statistics for the authenticated user."""
    try:
        return await get_dashboard_stats(uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
