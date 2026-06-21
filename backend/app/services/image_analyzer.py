import io
import os
import shutil
import cv2
import numpy as np
from PIL import Image
import pytesseract

# On Linux (production), `apt-get install tesseract-ocr` puts the binary on
# PATH already. On Windows dev machines it isn't, so point at the default
# installer location if we can't find it on PATH.
if shutil.which("tesseract") is None:
    _default_win_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(_default_win_path):
        pytesseract.pytesseract.tesseract_cmd = _default_win_path

# OpenCV's imdecode has no built-in decompression-bomb protection, unlike
# PIL — a small, highly-compressed file can still declare huge pixel
# dimensions and force a massive memory allocation on decode. Checking the
# declared size via PIL first (cheap — header only, no full decode) bounds
# the worst case before OpenCV ever touches the bytes.
MAX_IMAGE_PIXELS = 25_000_000  # ~5000x5000, generous for screenshots


def validate_image_bytes(image_bytes: bytes) -> None:
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            width, height = img.size
    except Exception:
        raise ValueError("Invalid or unreadable image file")
    if width * height > MAX_IMAGE_PIXELS:
        raise ValueError(f"Image dimensions too large ({width}x{height})")


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
    """Extract text from image using Tesseract OCR.

    Tesseract instead of EasyOCR deliberately: EasyOCR pulls in torch, which
    pushes memory past Render's free-tier 512MB and crashes the process.
    Tesseract has no deep-learning runtime, so it fits comfortably.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        text = pytesseract.image_to_string(img)
        return [line.strip() for line in text.splitlines() if line.strip()]
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
