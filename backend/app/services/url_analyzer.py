import re
import ssl
import socket
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from datetime import datetime
from typing import Optional, Tuple
import httpx

# Known safe brands + suspicious keyword patterns
PHISHING_KEYWORDS = [
    "secure", "verify", "login", "signin", "account", "update",
    "confirm", "bank", "wallet", "payment", "suspended", "blocked",
    "urgent", "immediate", "validate", "authenticate", "unlock",
]

BRAND_KEYWORDS = {
    "gcash": "GCash",
    "maya": "Maya",
    "paymaya": "PayMaya",
    "bdo": "BDO",
    "bpi": "BPI",
    "metrobank": "Metrobank",
    "unionbank": "UnionBank",
    "landbank": "LandBank",
    "paypal": "PayPal",
    "google": "Google",
    "facebook": "Facebook",
    "apple": "Apple",
    "microsoft": "Microsoft",
    "netflix": "Netflix",
    "amazon": "Amazon",
    "grab": "Grab",
    "shopee": "Shopee",
    "lazada": "Lazada",
}

LEGITIMATE_DOMAINS = {
    "gcash.com", "maya.ph", "bdo.com.ph", "bpi.com.ph", "metrobank.com.ph",
    "unionbankph.com", "landbank.com", "paypal.com", "google.com", "facebook.com",
    "apple.com", "microsoft.com", "netflix.com", "amazon.com", "grab.com",
}

SUSPICIOUS_TLDS = {
    ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".club",
    ".icu", ".buzz", ".click", ".pw", ".info", ".biz",
}


def extract_domain(url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url if "://" in url else f"https://{url}")
        return parsed.netloc.lower().lstrip("www.")
    except Exception:
        return url.lower()


def check_ssl(hostname: str) -> Tuple[bool, Optional[str]]:
    """Check if SSL is valid. Returns (is_valid, error_message)."""
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.create_connection((hostname, 443), timeout=5), server_hostname=hostname) as s:
            cert = s.getpeercert()
            return True, None
    except ssl.SSLCertVerificationError as e:
        return False, str(e)
    except Exception:
        return False, "Could not establish SSL connection"


def _lookup_creation_date(domain: str):
    import whois as whois_lib
    w = whois_lib.whois(domain)
    creation = w.creation_date
    if isinstance(creation, list):
        creation = creation[0]
    return creation


# Reused across calls so a hung WHOIS socket (which the timeout below can't
# actually kill) doesn't block request handling via executor shutdown joins.
_whois_executor = ThreadPoolExecutor(max_workers=2)


def check_domain_age(domain: str) -> Optional[int]:
    """Return domain age in days, or None if unavailable.

    WHOIS lookups can hang indefinitely against servers that never respond
    (e.g. for nonexistent/throwaway domains), so this runs with a hard timeout.
    """
    try:
        future = _whois_executor.submit(_lookup_creation_date, domain)
        creation = future.result(timeout=5)
        if creation and isinstance(creation, datetime):
            return (datetime.now() - creation).days
        return None
    except (Exception, FutureTimeoutError):
        return None


def detect_suspicious_keywords(url: str, domain: str) -> list[str]:
    found = []
    url_lower = url.lower()
    for kw in PHISHING_KEYWORDS:
        if kw in url_lower:
            found.append(kw)
    return found


def detect_brand_impersonation(domain: str) -> Optional[str]:
    """Return brand name if impersonation is detected, None otherwise."""
    domain_lower = domain.lower()
    # Skip if it IS the legitimate domain
    if domain_lower in LEGITIMATE_DOMAINS:
        return None
    for keyword, brand in BRAND_KEYWORDS.items():
        if keyword in domain_lower:
            return brand
    return None


def check_suspicious_tld(domain: str) -> Optional[str]:
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            return tld
    return None


def check_subdomain_abuse(domain: str) -> bool:
    """Check for excessive subdomain usage (e.g. secure.gcash.paymentverify.xyz)."""
    parts = domain.split(".")
    return len(parts) > 4


def check_url_length(url: str) -> bool:
    return len(url) > 100


def check_redirect_chains(url: str) -> int:
    """Count HTTP redirects (max 5 hops)."""
    try:
        with httpx.Client(follow_redirects=True, timeout=5, max_redirects=5) as client:
            response = client.get(url)
            return len(response.history)
    except Exception:
        return 0


async def analyze_url(url: str) -> dict:
    """Perform full URL analysis and return structured data for Gemini."""
    domain = extract_domain(url)
    hostname = domain.split(":")[0]

    ssl_valid, ssl_error = check_ssl(hostname)
    domain_age = check_domain_age(domain)
    suspicious_kw = detect_suspicious_keywords(url, domain)
    impersonated_brand = detect_brand_impersonation(domain)
    suspicious_tld = check_suspicious_tld(domain)
    subdomain_abuse = check_subdomain_abuse(domain)
    long_url = check_url_length(url)

    analysis = {
        "url": url,
        "domain": domain,
        "ssl_valid": ssl_valid,
        "ssl_error": ssl_error,
        "domain_age_days": domain_age,
        "suspicious_keywords": suspicious_kw,
        "impersonated_brand": impersonated_brand,
        "suspicious_tld": suspicious_tld,
        "subdomain_abuse": subdomain_abuse,
        "url_too_long": long_url,
        "is_known_legitimate": domain in LEGITIMATE_DOMAINS,
    }

    context = f"""
URL Analysis Data:
- Full URL: {url}
- Domain: {domain}
- SSL Certificate: {"Valid" if ssl_valid else f"Invalid/Missing — {ssl_error}"}
- Domain Age: {f"{domain_age} days" if domain_age is not None else "Unknown (possibly new domain)"}
- Suspicious Keywords in URL: {", ".join(suspicious_kw) if suspicious_kw else "None detected"}
- Brand Impersonation Detected: {impersonated_brand if impersonated_brand else "None"}
- Suspicious TLD: {suspicious_tld if suspicious_tld else "None"}
- Subdomain Abuse: {"Yes" if subdomain_abuse else "No"}
- URL Length: {len(url)} characters ({"too long" if long_url else "normal"})
- Known Legitimate Domain: {"Yes" if analysis["is_known_legitimate"] else "No"}
"""

    return {"analysis_data": analysis, "context": context}
