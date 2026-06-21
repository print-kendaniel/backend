import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.scan import router as scan_router
from app.routes.reports import router as reports_router
from app.routes.history import router as history_router

# Interactive API docs map out every endpoint/param for free recon — this
# isn't a public developer API, so they're only useful in development.
_is_production = os.getenv("APP_ENV", "development") == "production"

app = FastAPI(
    title="TrustMeBro AI API",
    description="AI-powered cybersecurity platform for phishing and threat detection",
    version="1.0.0",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
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
    # Auth is a Bearer token in the Authorization header, never cookies, so
    # there's no reason to allow credentialed cross-origin requests — leaving
    # this off limits what a malicious extension matching the regex above
    # could do even in the worst case.
    allow_credentials=False,
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
        "service": "TrustMeBro AI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": None if _is_production else "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
