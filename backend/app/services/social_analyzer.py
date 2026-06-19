import re
import urllib.parse
from typing import Optional
import httpx

FACEBOOK_DOMAINS = {
    "facebook.com", "m.facebook.com", "web.facebook.com",
    "mbasic.facebook.com", "fb.com",
}

# A plausible-looking browser UA; Facebook serves a stripped/login-walled
# page to obvious bots, so this is needed just to get the public OG tags.
_FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

# Patterns common in auto-generated/cloned scam pages: brand name immediately
# followed by a long digit run, or a vanity name that's almost entirely numeric.
_BRANDISH_PLUS_DIGITS = re.compile(r"[a-zA-Z]{3,}\.?\d{4,}$")
_MOSTLY_NUMERIC = re.compile(r"^\d{8,}$")


def is_facebook_url(url: str) -> bool:
    try:
        hostname = urllib.parse.urlparse(url if "://" in url else f"https://{url}").hostname or ""
        hostname = hostname.lower()
        return hostname in FACEBOOK_DOMAINS or hostname.endswith(".facebook.com")
    except Exception:
        return False


def _extract_profile_slug(url: str) -> str:
    parsed = urllib.parse.urlparse(url if "://" in url else f"https://{url}")
    if parsed.path.startswith("/profile.php"):
        qs = urllib.parse.parse_qs(parsed.query)
        return qs.get("id", [""])[0]
    return parsed.path.strip("/").split("/")[0]


def _check_slug_patterns(slug: str) -> list[str]:
    flags = []
    if _MOSTLY_NUMERIC.match(slug):
        flags.append("Profile uses a raw numeric ID with no custom vanity name")
    if _BRANDISH_PLUS_DIGITS.search(slug):
        flags.append("Name is followed by a long digit string, a pattern common in auto-generated clone pages")
    if slug.count(".") >= 3 or slug.count("_") >= 3:
        flags.append("Vanity name has unusually many separators ('.' or '_'), often seen in bulk-created fake accounts")
    return flags


def _fetch_public_metadata(url: str) -> dict:
    """Best-effort fetch of Open Graph tags from the public page HTML.

    Facebook walls most profile/page content behind a login prompt for
    unauthenticated requests, so this frequently returns nothing — that's
    expected, not a bug. When it fails, the caller falls back to URL-pattern
    analysis alone and should tell the user a screenshot would be more accurate.
    """
    og_tags: dict[str, str] = {}
    try:
        with httpx.Client(follow_redirects=True, timeout=5, headers=_FETCH_HEADERS) as client:
            response = client.get(url)
            html = response.text[:50_000]  # OG tags are always in <head>, no need to scan the whole page
            for prop in ("og:title", "og:description", "og:image"):
                match = re.search(
                    rf'<meta[^>]+property=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']*)["\']',
                    html,
                    re.IGNORECASE,
                )
                if match:
                    og_tags[prop] = match.group(1)
    except Exception:
        pass
    return og_tags


async def analyze_facebook_url(url: str) -> dict:
    """Best-effort Facebook profile/page analysis from the URL alone.

    This is the degraded path: no login, no Graph API access, so it can only
    use the URL's own shape plus whatever public OG metadata isn't blocked.
    """
    slug = _extract_profile_slug(url)
    slug_flags = _check_slug_patterns(slug)
    og_tags = _fetch_public_metadata(url)

    metadata_available = bool(og_tags)

    context = f"""
Facebook Profile/Page URL Analysis (limited — no login access):
- URL: {url}
- Vanity name / ID: {slug or "(unknown)"}
- URL pattern flags: {", ".join(slug_flags) if slug_flags else "None"}
- Public metadata retrieved: {"Yes" if metadata_available else "No (page likely requires login to view, which is normal for Facebook)"}
- Page title (if available): {og_tags.get("og:title", "Not available")}
- Page description (if available): {og_tags.get("og:description", "Not available")}

IMPORTANT CONTEXT FOR YOUR ANALYSIS: This assessment is based only on the URL
structure and possibly-blocked public metadata — NOT the actual profile content
(photo, bio, follower count, posts, verification badge). Facebook blocks most
automated access to that data. Calibrate your confidence accordingly: do not
claim high confidence about whether the account is fake based on URL shape
alone, and explicitly recommend the user upload a screenshot of the profile
for a reliable verdict.
"""
    return {"slug": slug, "slug_flags": slug_flags, "og_tags": og_tags, "context": context}
