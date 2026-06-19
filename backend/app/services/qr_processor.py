import cv2
import numpy as np
from PIL import Image
import io
from typing import Optional

try:
    from pyzbar.pyzbar import decode as pyzbar_decode
except (ImportError, OSError):
    # pyzbar's bundled libzbar DLL can fail to load on some Windows setups.
    # Fall back to OpenCV's built-in QR detector instead of crashing the app.
    pyzbar_decode = None


def decode_qr_code(image_bytes: bytes) -> Optional[str]:
    """Decode QR code from image bytes. Returns the decoded URL/string or None."""
    try:
        if pyzbar_decode is not None:
            # Method 1: pyzbar
            pil_img = Image.open(io.BytesIO(image_bytes))
            decoded_objects = pyzbar_decode(pil_img)
            if decoded_objects:
                return decoded_objects[0].data.decode("utf-8")

        # Method 2: OpenCV QRCodeDetector (fallback)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        detector = cv2.QRCodeDetector()
        data, _, _ = detector.detectAndDecode(gray)
        if data:
            return data

        # Method 3: Try with preprocessing
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        if pyzbar_decode is not None:
            pil_thresh = Image.fromarray(thresh)
            decoded = pyzbar_decode(pil_thresh)
            if decoded:
                return decoded[0].data.decode("utf-8")
        else:
            data, _, _ = detector.detectAndDecode(thresh)
            if data:
                return data

        return None
    except Exception as e:
        raise RuntimeError(f"QR decode failed: {str(e)}")


async def process_qr(image_bytes: bytes) -> dict:
    """Decode QR and prepare context for URL analysis."""
    decoded_data = decode_qr_code(image_bytes)

    if not decoded_data:
        raise ValueError("No QR code found in the image. Please upload a clear QR code image.")

    context = f"""
QR Code Analysis:
- Decoded QR Content: {decoded_data}
- Content Type: {"URL" if decoded_data.startswith(("http://", "https://", "www.")) else "Text/Other"}
"""

    return {
        "decoded_data": decoded_data,
        "is_url": decoded_data.startswith(("http://", "https://", "www.")),
        "context": context,
    }
