from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from enum import Enum


class RiskLevel(str, Enum):
    safe = "safe"
    suspicious = "suspicious"
    dangerous = "dangerous"


class ThreatReport(BaseModel):
    risk_level: RiskLevel
    risk_score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    reasons: List[str]
    recommendation: str
    url: Optional[str] = None
    scan_type: str = "url"


class URLScanRequest(BaseModel):
    url: str
    user_id: Optional[str] = None


class SocialScanRequest(BaseModel):
    url: str
    user_id: Optional[str] = None


class ReportWebsiteRequest(BaseModel):
    url: str
    reason: str
    description: Optional[str] = ""
    userId: Optional[str] = None


class ScanHistoryItem(BaseModel):
    id: str
    url: Optional[str] = None
    scan_type: str
    risk_level: str
    risk_score: int
    timestamp: str
    report: ThreatReport


class DashboardStats(BaseModel):
    total_scans: int
    safe_count: int
    suspicious_count: int
    dangerous_count: int
    threats_blocked: int
    recent_scans: List[dict] = []
