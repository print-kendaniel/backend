from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportWebsiteRequest
from app.services.firebase_service import save_website_report

router = APIRouter()


@router.post("/report-website")
async def report_website(request: ReportWebsiteRequest):
    """Accept user-submitted website reports."""
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        report_data = {
            "url": request.url.strip(),
            "reason": request.reason,
            "description": request.description or "",
            "user_id": request.userId,
        }
        doc_id = await save_website_report(report_data)
        return {"message": "Report submitted successfully. Thank you for helping keep users safe!", "id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit report: {str(e)}")
