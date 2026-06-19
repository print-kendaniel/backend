FROM python:3.11-slim

WORKDIR /app

# System deps for OpenCV, pyzbar, and Tesseract OCR (used instead of EasyOCR
# specifically because it has no deep-learning runtime, so it fits Render's
# free-tier 512MB RAM where torch/easyocr did not).
RUN apt-get update && apt-get install -y \
    libzbar0 \
    libzbar-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
