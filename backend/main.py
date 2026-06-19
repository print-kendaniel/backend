import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.routes.scan import router as scan_router
from app.routes.reports import router as reports_router
from app.routes.history import router as history_router

app = FastAPI(
    title="TrustLink AI API",
    description="AI-powered cybersecurity platform for phishing and threat detection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # The Chrome extension calls this API directly from a chrome-extension://<id>
    # origin, which isn't (and can't be, since the id varies per install) listed
    # in ALLOWED_ORIGINS above.
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Routers
app.include_router(scan_router, tags=["Scanning"])
app.include_router(reports_router, tags=["Reports"])
app.include_router(history_router, tags=["History"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "TrustLink AI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
