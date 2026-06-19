import os
import io
import json
import re
import google.generativeai as genai
from PIL import Image

# transport="rest" avoids gRPC hangs on networks that block/throttle the gRPC port
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""), transport="rest")

_model = genai.GenerativeModel("gemini-2.5-flash")

ANALYSIS_PROMPT_TEMPLATE = """
You are TrustLink AI, an expert cybersecurity analyst specializing in phishing detection,
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
You are TrustLink AI, an expert in detecting fake, cloned, and scam social media
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


def _generate(parts: list) -> dict:
    try:
        response = _model.generate_content(
            parts,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                # gemini-2.5-flash spends part of this budget on internal
                # "thinking" tokens before writing the visible JSON answer,
                # so a small budget here gets exhausted before any output appears.
                max_output_tokens=4096,
            ),
        )
        return _parse_gemini_text(response.text)
    except json.JSONDecodeError:
        return {
            "risk_level": "suspicious",
            "risk_score": 50,
            "confidence": 40,
            "summary": "Could not complete full analysis. Treat with caution.",
            "reasons": ["AI analysis returned unexpected format"],
            "recommendation": "Could not fully analyze. Avoid sharing personal information.",
        }
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")


async def analyze_with_gemini(context: str) -> dict:
    """Call Gemini API and parse the structured phishing/threat report."""
    prompt = ANALYSIS_PROMPT_TEMPLATE.format(context=context)
    return _generate([prompt])


async def analyze_social_profile_with_gemini(context: str) -> dict:
    """Text-only Facebook profile/page assessment (URL pattern + best-effort metadata)."""
    prompt = SOCIAL_PROFILE_PROMPT_TEMPLATE.format(context=context)
    return _generate([prompt])


async def analyze_social_profile_screenshot_with_gemini(image_bytes: bytes, context: str) -> dict:
    """Vision-based Facebook profile/page assessment from an actual screenshot.

    Unlike the phishing-screenshot flow (OCR text only), this sends the image
    itself to Gemini so it can judge things OCR can't see: photo authenticity,
    verification badge, layout, etc.
    """
    prompt = SOCIAL_PROFILE_PROMPT_TEMPLATE.format(context=context)
    image = Image.open(io.BytesIO(image_bytes))
    return _generate([prompt, image])
