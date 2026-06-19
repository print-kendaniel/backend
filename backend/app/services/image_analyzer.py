import io
import cv2
import numpy as np
from PIL import Image
from typing import Optional
import easyocr

# Initialize EasyOCR reader (English)
_reader: Optional[easyocr.Reader] = None


def get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["en"], gpu=False)
    return _reader


PHISHING_PATTERNS = [
    "enter your password",
    "verify your account",
    "your account has been",
    "suspended",
    "blocked",
    "click here to verify",
    "login to continue",
    "confirm your identity",
    "update your information",
    "your account will be",
    "security alert",
    "unauthorized access",
    "one-time pin",
    "otp",
    "send money",
    "account number",
    "card number",
    "cvv",
    "expiry date",
    "gcash",
    "maya",
    "bdo",
    "bpi",
    "paypal",
    "bitcoin",
    "crypto wallet",
    "you won",
    "claim your prize",
    "congratulations",
    "limited time offer",
]


def extract_text_from_image(image_bytes: bytes) -> list[str]:
    """Extract text from image using EasyOCR."""
    try:
        reader = get_reader()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        results = reader.readtext(img, detail=0)
        return [str(r).strip() for r in results if str(r).strip()]
    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")


def detect_login_form(text_lines: list[str]) -> bool:
    """Detect presence of login form indicators."""
    combined = " ".join(text_lines).lower()
    login_indicators = ["password", "username", "email", "sign in", "log in", "login", "submit"]
    return sum(1 for ind in login_indicators if ind in combined) >= 2


def detect_phishing_patterns(text_lines: list[str]) -> list[str]:
    """Detect phishing patterns in extracted text."""
    combined = " ".join(text_lines).lower()
    found = []
    for pattern in PHISHING_PATTERNS:
        if pattern in combined:
            found.append(pattern)
    return found


def detect_banking_brands(text_lines: list[str]) -> list[str]:
    """Detect impersonated banking/payment brands."""
    combined = " ".join(text_lines).lower()
    brands = []
    brand_map = {
        "gcash": "GCash",
        "maya": "Maya/PayMaya",
        "bdo": "BDO",
        "bpi": "BPI",
        "metrobank": "Metrobank",
        "unionbank": "UnionBank",
        "paypal": "PayPal",
        "google": "Google",
        "facebook": "Facebook",
        "microsoft": "Microsoft",
    }
    for keyword, brand_name in brand_map.items():
        if keyword in combined:
            brands.append(brand_name)
    return brands


async def analyze_image(image_bytes: bytes) -> dict:
    """Full image analysis pipeline: OCR → pattern detection → context for Gemini."""
    # Extract text
    text_lines = extract_text_from_image(image_bytes)
    extracted_text = "\n".join(text_lines)

    # Analyze
    has_login_form = detect_login_form(text_lines)
    phishing_patterns = detect_phishing_patterns(text_lines)
    detected_brands = detect_banking_brands(text_lines)

    # Get image dimensions
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        width, height = pil_img.size
    except Exception:
        width, height = 0, 0

    context = f"""
Screenshot Analysis Data:

Extracted Text (via OCR):
{extracted_text if extracted_text else "[No text detected]"}

Visual Analysis:
- Image dimensions: {width}x{height}px
- Login form detected: {"Yes" if has_login_form else "No"}
- Phishing indicator phrases found: {", ".join(phishing_patterns) if phishing_patterns else "None"}
- Banking/payment brands detected in text: {", ".join(detected_brands) if detected_brands else "None"}
- Number of text elements extracted: {len(text_lines)}

Analyze this screenshot for: phishing indicators, fake login pages, social engineering,
banking/payment scams, credential harvesting, urgency manipulation, and brand impersonation.
"""

    return {
        "extracted_text": extracted_text,
        "has_login_form": has_login_form,
        "phishing_patterns": phishing_patterns,
        "detected_brands": detected_brands,
        "context": context,
    }
