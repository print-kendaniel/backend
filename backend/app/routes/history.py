from fastapi import APIRouter, HTTPException, Query
from app.services.firebase_service import get_scan_history, get_dashboard_stats

router = APIRouter()


@router.get("/history")
async def get_history(user_id: str = Query(..., description="Firebase user UID")):
    """Get scan history for a user."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    try:
        history = await get_scan_history(user_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard-stats")
async def dashboard_stats(user_id: str = Query(..., description="Firebase user UID")):
    """Get dashboard statistics for a user."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    try:
        stats = await get_dashboard_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
