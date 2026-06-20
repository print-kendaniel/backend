import os
import io
import json
import re
import base64
from typing import Optional

import httpx
from PIL import Image

# Talking to the REST endpoint directly (rather than the google-generativeai SDK)
# means each call can carry its own API key with no shared global client state —
# required so concurrent requests from different users' own keys can't race or
# leak into each other.
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
_DEFAULT_API_KEY = os.getenv("GEMINI_API_KEY", "")

ANALYSIS_PROMPT_TEMPLATE = """
You are TrustMeBro AI, an expert cybersecurity analyst specializing in phishing detection,
scam identification, and online threat analysis, with deep expertise in Philippine banking
and payment scams (GCash, Maya, BDO, BPI, Metrobank, etc).

Analyze the following data and return a structured JSON threat assessment.

{context}

Return ONLY valid JSON with this exact structure:
{{
  "risk_level": "safe" | "suspicious" | "dangerous",
  "risk_score": <integer 0-100>,
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence human-readable summary>",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "recommendation": "<clear actionable recommendation for the user>"
}}

Risk scoring guide:
- 0-30: Safe (legitimate, well-known, no red flags)
- 31-69: Suspicious (some red flags, proceed with extreme caution)
- 70-100: Dangerous (clear phishing/scam/malware indicators, do not proceed)

Focus on:
1. Brand impersonation (especially GCash, Maya, BDO, BPI, PayPal, Google, etc.)
2. Credential harvesting indicators
3. Urgency language and social engineering
4. Suspicious domain patterns (typosquatting, misleading subdomains)
5. Technical indicators (SSL issues, new domains, suspicious TLDs)
6. Philippine-specific scam patterns
"""

SOCIAL_PROFILE_PROMPT_TEMPLATE = """
You are TrustMeBro AI, an expert in detecting fake, cloned, and scam social media
profiles and pages, with deep expertise in Filipino social-media scam patterns
(fake sellers, romance scams, fake investment/crypto pages, impersonated
celebrities/brands, fake raffles and giveaways).

Analyze the following data about a Facebook profile or page and return a
structured JSON assessment of how likely it is to be fake, cloned, or a scam
account rather than a genuine one.

{context}

Return ONLY valid JSON with this exact structure:
{{
  "risk_level": "safe" | "suspicious" | "dangerous",
  "risk_score": <integer 0-100, where higher means more likely fake/scam>,
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence human-readable summary>",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "recommendation": "<clear actionable recommendation for the user>"
}}

Risk scoring guide:
- 0-30: Safe (consistent with a genuine, established profile/page)
- 31-69: Suspicious (some red flags, verify independently before trusting/engaging)
- 70-100: Dangerous (strong signs of a fake, cloned, or scam account)

Focus on, when the data is available:
1. Profile/cover photo authenticity (stolen stock photos, mismatched quality, AI-generated artifacts)
2. Verification badge presence vs claimed identity (e.g. claims to be a celebrity/brand but unverified)
3. Follower/friend/like counts that don't match the claimed identity
4. Bio/about text red flags: urgency, "DM to invest", romance-scam language, fake giveaways
5. Account age / creation cues, posting pattern (single post, recently created, inconsistent activity)
6. URL/vanity-name pattern oddities

If the provided data explicitly says visual/profile content could not be
retrieved (login-walled), be transparent about that limitation in your summary
and reasons, keep confidence modest, and recommend the user provide a
screenshot for a reliable verdict instead of asserting certainty you don't have.
"""


def _parse_gemini_text(text: str) -> dict:
    text = text.strip()
    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if json_match:
        text = json_match.group(1)

    data = json.loads(text)
    return {
        "risk_level": data.get("risk_level", "suspicious"),
        "risk_score": max(0, min(100, int(data.get("risk_score", 50)))),
        "confidence": max(0, min(100, int(data.get("confidence", 70)))),
        "summary": data.get("summary", "Analysis completed."),
        "reasons": data.get("reasons", ["Analysis inconclusive"]),
        "recommendation": data.get("recommendation", "Proceed with caution."),
    }


def _build_part(item) -> dict:
    if isinstance(item, str):
        return {"text": item}
    if isinstance(item, Image.Image):
        buf = io.BytesIO()
        item.save(buf, format="PNG")
        return {
            "inline_data": {
                "mime_type": "image/png",
                "data": base64.b64encode(buf.getvalue()).decode("ascii"),
            }
        }
    raise TypeError(f"Unsupported Gemini part type: {type(item)}")


async def _generate(parts: list, api_key: Optional[str] = None) -> dict:
    key = (api_key or "").strip() or _DEFAULT_API_KEY
    if not key:
        raise RuntimeError("Gemini API error: no API key configured")

    body = {
        "contents": [{"parts": [_build_part(p) for p in parts]}],
        "generationConfig": {
            "temperature": 0.1,
            # gemini-2.5-flash spends part of this budget on internal "thinking"
            # tokens before writing the visible JSON answer, so a small budget
            # here gets exhausted before any output appears.
            "maxOutputTokens": 4096,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GEMINI_API_URL,
                params={"key": key},
                json=body,
            )
    except httpx.RequestError as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")

    if response.status_code == 429:
        raise RuntimeError("Gemini API error: 429 quota exceeded")
    if response.status_code != 200:
        detail = response.text[:300]
        raise RuntimeError(f"Gemini API error: {response.status_code} {detail}")

    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        block_reason = data.get("promptFeedback", {}).get("blockReason")
        return {
            "risk_level": "suspicious",
            "risk_score": 50,
            "confidence": 30,
            "summary": "AI analysis could not be completed (no response generated). Treat with caution.",
            "reasons": [f"Gemini returned no candidates{f' (blocked: {block_reason})' if block_reason else ''}"],
            "recommendation": "Could not fully analyze. Avoid sharing personal information.",
        }

    text_parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in text_parts)

    try:
        return _parse_gemini_text(text)
    except (json.JSONDecodeError, ValueError):
        return {
            "risk_level": "suspicious",
            "risk_score": 50,
            "confidence": 40,
            "summary": "Could not complete full analysis. Treat with caution.",
            "reasons": ["AI analysis returned unexpected format"],
            "recommendation": "Could not fully analyze. Avoid sharing personal information.",
        }


async def analyze_with_gemini(context: str, api_key: Optional[str] = None) -> dict:
    """Call Gemini API and parse the structured phishing/threat report."""
    prompt = ANALYSIS_PROMPT_TEMPLATE.format(context=context)
    return await _generate([prompt], api_key=api_key)


async def analyze_social_profile_with_gemini(context: str, api_key: Optional[str] = None) -> dict:
    """Text-only Facebook profile/page assessment (URL pattern + best-effort metadata)."""
    prompt = SOCIAL_PROFILE_PROMPT_TEMPLATE.format(context=context)
    return await _generate([prompt], api_key=api_key)


async def analyze_social_profile_screenshot_with_gemini(
    image_bytes: bytes, context: str, api_key: Optional[str] = None
) -> dict:
    """Vision-based Facebook profile/page assessment from an actual screenshot.

    Unlike the phishing-screenshot flow (OCR text only), this sends the image
    itself to Gemini so it can judge things OCR can't see: photo authenticity,
    verification badge, layout, etc.
    """
    prompt = SOCIAL_PROFILE_PROMPT_TEMPLATE.format(context=context)
    image = Image.open(io.BytesIO(image_bytes))
    return await _generate([prompt, image], api_key=api_key)
