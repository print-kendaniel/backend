// Content script — runs on all pages.
// Shows a dismissible banner for suspicious/dangerous-but-lower-score sites,
// and a blocking full-page interstitial for high-confidence dangerous sites.
import { ThreatReport, addToAllowlist, escapeHtml, extractDomain, getSettings, isAllowlisted } from "./shared";
import { t } from "./i18n";

const DANGER_BLOCK_THRESHOLD = 80;
const STORAGE_KEY = `scan_${window.location.href}`;
const domain = extractDomain(window.location.href);

function removeExisting() {
  document.getElementById("trustlink-warning-banner")?.remove();
  document.getElementById("trustlink-interstitial")?.remove();
}

function createBanner(report: ThreatReport, lang: "en" | "tl"): HTMLElement {
  const strings = t(lang);
  const isDangerous = report.risk_level === "dangerous";
  const accent = isDangerous ? "#FF4D4F" : "#FFB020";
  const title = isDangerous
    ? strings.bannerDangerTitle(report.risk_score)
    : strings.bannerSuspiciousTitle(report.risk_score);

  const banner = document.createElement("div");
  banner.id = "trustlink-warning-banner";
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    background: linear-gradient(135deg, ${accent}15, ${accent}08);
    border-bottom: 1px solid ${accent}4D;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    backdrop-filter: blur(10px);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    font-size: 13px;
  `;

  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex:1;">
      <span style="font-size:16px;">⚠️</span>
      <div>
        <span style="color:${accent};font-weight:700;">${title}</span>
        <span style="color:${accent}CC;font-size:11px;display:block;margin-top:1px;">${escapeHtml(report.summary.slice(0, 100))}${report.summary.length > 100 ? "..." : ""}</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
      <button id="trustlink-trust" style="
        background:transparent;
        border:none;
        color:${accent}AA;
        font-size:10px;
        text-decoration:underline;
        cursor:pointer;
      ">${strings.trustSite}</button>
      <button id="trustlink-dismiss" style="
        background:${accent}26;
        border:1px solid ${accent}4D;
        color:${accent};
        padding:4px 10px;
        border-radius:6px;
        cursor:pointer;
        font-size:11px;
        font-weight:600;
        white-space:nowrap;
      ">${strings.dismiss}</button>
    </div>
  `;

  banner.querySelector("#trustlink-dismiss")?.addEventListener("click", () => banner.remove());
  banner.querySelector("#trustlink-trust")?.addEventListener("click", async () => {
    await addToAllowlist(domain);
    banner.remove();
  });

  return banner;
}

function createInterstitial(report: ThreatReport, lang: "en" | "tl"): HTMLElement {
  const strings = t(lang);

  const overlay = document.createElement("div");
  overlay.id = "trustlink-interstitial";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    background: #0A0A0A;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  `;

  overlay.innerHTML = `
    <div style="max-width:480px;padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🛑</div>
      <div style="color:#FF4D4F;font-size:22px;font-weight:800;margin-bottom:12px;">${strings.interstitialTitle}</div>
      <div style="color:#C0C0C0;font-size:14px;line-height:1.6;margin-bottom:8px;">${strings.interstitialBody}</div>
      <div style="color:#A0A0A0;font-size:13px;line-height:1.6;margin-bottom:8px;">${escapeHtml(report.summary)}</div>
      <div style="color:#FF8080;font-size:13px;font-weight:700;margin-bottom:24px;">Risk score: ${report.risk_score}/100</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button id="trustlink-goback" style="
          background:#00E5FF; color:#000; border:none; border-radius:10px;
          padding:12px; font-size:14px; font-weight:700; cursor:pointer;
        ">${strings.goBack}</button>
        <button id="trustlink-proceed" style="
          background:transparent; color:#808080; border:1px solid #2A2A2A; border-radius:10px;
          padding:10px; font-size:12px; cursor:pointer;
        ">${strings.proceedAnyway}</button>
        <button id="trustlink-trust-interstitial" style="
          background:transparent; color:#606060; border:none;
          font-size:11px; text-decoration:underline; cursor:pointer;
        ">${strings.trustSite}</button>
      </div>
    </div>
  `;

  overlay.querySelector("#trustlink-goback")?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "about:blank";
    }
  });
  overlay.querySelector("#trustlink-proceed")?.addEventListener("click", () => overlay.remove());
  overlay.querySelector("#trustlink-trust-interstitial")?.addEventListener("click", async () => {
    await addToAllowlist(domain);
    overlay.remove();
  });

  return overlay;
}

async function renderResult(report: ThreatReport) {
  if (await isAllowlisted(domain)) return;
  if (report.risk_level === "safe") return;

  removeExisting();
  const settings = await getSettings();

  const isHighConfidenceDanger = report.risk_level === "dangerous" && report.risk_score >= DANGER_BLOCK_THRESHOLD;
  const node = isHighConfidenceDanger
    ? createInterstitial(report, settings.language)
    : createBanner(report, settings.language);

  document.body.appendChild(node);
}

// Show a cached result immediately if one exists for this exact URL.
chrome.storage.local.get([STORAGE_KEY], (result) => {
  const scanData = result[STORAGE_KEY] as ThreatReport | undefined;
  if (scanData) renderResult(scanData);
});

// Auto-scan (and manual scans that pass a tabId) deliver results via message,
// since the fetch+AI call usually finishes well after this script has loaded.
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SCAN_RESULT" && message.data) {
    renderResult(message.data as ThreatReport);
  }
});

export {};
