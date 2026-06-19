from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Optional
import asyncio

from app.models.schemas import ThreatReport, URLScanRequest, SocialScanRequest
from app.services.url_analyzer import analyze_url
from app.services.image_analyzer import analyze_image, extract_text_from_image
from app.services.qr_processor import process_qr
from app.services.social_analyzer import analyze_facebook_url, is_facebook_url
from app.services.gemini_service import (
    analyze_with_gemini,
    analyze_social_profile_with_gemini,
    analyze_social_profile_screenshot_with_gemini,
)
from app.services.firebase_service import save_scan_result

router = APIRouter()


@router.post("/scan-url", response_model=ThreatReport)
async def scan_url(request: URLScanRequest, background_tasks: BackgroundTasks):
    """Analyze a URL for phishing and malicious content."""
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # Normalize URL
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    try:
        # 1. Technical URL analysis
        url_data = await analyze_url(url)

        # 2. Gemini AI threat assessment
        ai_result = await analyze_with_gemini(url_data["context"])

        report = ThreatReport(
            **ai_result,
            url=url,
            scan_type="url",
        )

        # 3. Save to Firestore (non-blocking)
        background_tasks.add_task(
            save_scan_result,
            report.model_dump(),
            request.user_id,
            "url",
            url,
        )

        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/scan-image", response_model=ThreatReport)
async def scan_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
):
    """Analyze an uploaded screenshot for phishing and scam indicators."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    try:
        image_bytes = await file.read()
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")

        # 1. OCR + visual analysis
        image_data = await analyze_image(image_bytes)

        # 2. Gemini AI analysis
        ai_result = await analyze_with_gemini(image_data["context"])

        report = ThreatReport(
            **ai_result,
            scan_type="image",
        )

        background_tasks.add_task(
            save_scan_result,
            report.model_dump(),
            user_id,
            "image",
        )

        return report

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


@router.post("/scan-qr", response_model=ThreatReport)
async def scan_qr(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
):
    """Decode a QR code and analyze the contained URL."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    try:
        image_bytes = await file.read()

        # 1. Decode QR code
        qr_data = await process_qr(image_bytes)
        decoded = qr_data["decoded_data"]

        # 2. If URL, do full URL analysis; otherwise do text analysis
        if qr_data["is_url"]:
            url_normalized = decoded if decoded.startswith("http") else f"https://{decoded}"
            url_analysis = await analyze_url(url_normalized)
            combined_context = f"{qr_data['context']}\n\nURL Analysis:\n{url_analysis['context']}"
        else:
            combined_context = f"{qr_data['context']}\n\nAnalyze this QR code content for malicious intent, scam links, or harmful instructions."

        # 3. Gemini AI analysis
        ai_result = await analyze_with_gemini(combined_context)

        report = ThreatReport(
            **ai_result,
            url=decoded if qr_data["is_url"] else None,
            scan_type="qr",
        )

        background_tasks.add_task(
            save_scan_result,
            report.model_dump(),
            user_id,
            "qr",
            decoded if qr_data["is_url"] else None,
        )

        return report

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR scan failed: {str(e)}")


@router.post("/scan-social-url", response_model=ThreatReport)
async def scan_social_url(request: SocialScanRequest, background_tasks: BackgroundTasks):
    """Best-effort check of a Facebook profile/page URL for signs of being fake/cloned.

    Facebook blocks most unauthenticated access to profile content, so this can
    only reason from the URL's shape and whatever public metadata isn't blocked.
    For a reliable verdict, use /scan-social-screenshot instead.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    if not is_facebook_url(url):
        raise HTTPException(status_code=400, detail="This endpoint only supports Facebook profile/page URLs")

    try:
        social_data = await analyze_facebook_url(url)
        ai_result = await analyze_social_profile_with_gemini(social_data["context"])

        report = ThreatReport(
            **ai_result,
            url=url,
            scan_type="social",
        )

        background_tasks.add_task(
            save_scan_result,
            report.model_dump(),
            request.user_id,
            "social",
            url,
        )

        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social profile scan failed: {str(e)}")


@router.post("/scan-social-screenshot", response_model=ThreatReport)
async def scan_social_screenshot(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
):
    """Check a screenshot of a Facebook profile/page for signs of being fake/cloned.

    Unlike the URL-only path, Gemini sees the actual image here, so it can
    judge things a URL alone can't reveal: photo authenticity, verification
    badge, follower count, bio content, etc.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    try:
        image_bytes = await file.read()
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")

        text_lines = extract_text_from_image(image_bytes)
        extracted_text = "\n".join(text_lines)
        context = f"""
Facebook Profile/Page Screenshot Analysis:

Text extracted from the screenshot (via OCR):
{extracted_text if extracted_text else "[No text detected]"}

The actual screenshot image is also provided to you directly — use it to
assess profile/cover photo authenticity, the presence (or absence) of a blue
verification badge, overall page layout, and anything else visible that text
alone wouldn't capture.
"""

        ai_result = await analyze_social_profile_screenshot_with_gemini(image_bytes, context)

        report = ThreatReport(
            **ai_result,
            scan_type="social",
        )

        background_tasks.add_task(
            save_scan_result,
            report.model_dump(),
            user_id,
            "social",
        )

        return report

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social profile screenshot scan failed: {str(e)}")
