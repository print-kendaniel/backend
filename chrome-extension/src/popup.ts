import {
  ThreatReport,
  addToAllowlist,
  removeFromAllowlist,
  isAllowlisted,
  addToHistory,
  buildScanHeaders,
  getHistory,
  getSettings,
  saveSettings,
  extractDomain,
  isFacebookUrl,
  timeAgo,
} from "./shared";

// Replaced at build time by webpack.DefinePlugin (see webpack.config.js / API_BASE_URL env var)
const API_BASE = process.env.API_BASE_URL as string;

// DOM Elements
const currentUrlEl = document.getElementById("currentUrl") as HTMLSpanElement;
const resultArea = document.getElementById("resultArea") as HTMLDivElement;
const resultCard = document.getElementById("resultCard") as HTMLDivElement;
const riskBadge = document.getElementById("riskBadge") as HTMLDivElement;
const riskEmoji = document.getElementById("riskEmoji") as HTMLSpanElement;
const riskLabel = document.getElementById("riskLabel") as HTMLSpanElement;
const resultSummary = document.getElementById("resultSummary") as HTMLDivElement;
const resultReasons = document.getElementById("resultReasons") as HTMLDivElement;
const resultConfidence = document.getElementById("resultConfidence") as HTMLDivElement;
const resultRecommendation = document.getElementById("resultRecommendation") as HTMLDivElement;
const riskCircleFill = document.getElementById("riskCircleFill") as unknown as SVGCircleElement;
const scoreValue = document.getElementById("scoreValue") as HTMLSpanElement;
const loadingArea = document.getElementById("loadingArea") as HTMLDivElement;
const loadingText = document.getElementById("loadingText") as HTMLDivElement;
const scanUrlBtn = document.getElementById("scanUrlBtn") as HTMLButtonElement;
const screenshotBtn = document.getElementById("screenshotBtn") as HTMLButtonElement;
const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;

const trustBtn = document.getElementById("trustBtn") as HTMLButtonElement;
const pasteUrlInput = document.getElementById("pasteUrlInput") as HTMLInputElement;
const pasteScanBtn = document.getElementById("pasteScanBtn") as HTMLButtonElement;
const historyList = document.getElementById("historyList") as HTMLDivElement;
const settingsToggleBtn = document.getElementById("settingsToggleBtn") as HTMLButtonElement;
const settingsPanel = document.getElementById("settingsPanel") as HTMLDivElement;
const autoScanToggle = document.getElementById("autoScanToggle") as HTMLInputElement;
const notificationsToggle = document.getElementById("notificationsToggle") as HTMLInputElement;
const languageSelect = document.getElementById("languageSelect") as HTMLSelectElement;
const geminiKeyInput = document.getElementById("geminiKeyInput") as HTMLInputElement;

const RISK_CONFIG = {
  safe: { emoji: "🟢", label: "SAFE", color: "#00C853" },
  suspicious: { emoji: "🟡", label: "SUSPICIOUS", color: "#FFB020" },
  dangerous: { emoji: "🔴", label: "DANGEROUS", color: "#FF4D4F" },
};

let currentTabUrl = "";

function setLoading(visible: boolean, text = "Analyzing...") {
  loadingArea.style.display = visible ? "flex" : "none";
  loadingText.textContent = text;
  resultArea.style.display = visible ? "none" : resultArea.style.display;
  scanUrlBtn.disabled = visible;
  screenshotBtn.disabled = visible;
  pasteScanBtn.disabled = visible;
}

function displayReport(report: ThreatReport) {
  const config = RISK_CONFIG[report.risk_level];
  const circumference = 125.66;
  const offset = circumference - (report.risk_score / 100) * circumference;

  resultCard.className = `result-card ${report.risk_level}`;
  riskLabel.className = `risk-label ${report.risk_level}`;
  resultRecommendation.className = `result-recommendation ${report.risk_level}`;

  riskEmoji.textContent = config.emoji;
  riskLabel.textContent = config.label;
  scoreValue.textContent = String(report.risk_score);
  scoreValue.style.color = config.color;

  riskCircleFill.style.stroke = config.color;
  riskCircleFill.style.strokeDashoffset = String(offset);
  riskCircleFill.style.transition = "stroke-dashoffset 1s ease";

  resultConfidence.textContent = `Confidence: ${report.confidence}%`;
  resultSummary.textContent = report.summary;
  resultRecommendation.textContent = report.recommendation;

  resultReasons.innerHTML = report.reasons
    .map(
      (r) => `
      <div class="reason-item">
        <div class="reason-dot" style="background:${config.color}"></div>
        <span>${r}</span>
      </div>`
    )
    .join("");

  resultArea.style.display = "block";
  setLoading(false);
}

async function recordAndRefreshHistory(report: ThreatReport, domain: string) {
  await addToHistory(report, domain);
  await renderHistoryList();
}

async function renderHistoryList() {
  const history = await getHistory();
  if (history.length === 0) {
    historyList.innerHTML = `<div class="history-empty">No scans yet</div>`;
    return;
  }

  historyList.innerHTML = history
    .slice(0, 8)
    .map((entry) => {
      const config = RISK_CONFIG[entry.risk_level];
      return `
        <div class="history-item" data-id="${entry.id}">
          <span class="history-dot" style="background:${config.color}"></span>
          <span class="history-domain">${entry.domain}</span>
          <span class="history-score" style="color:${config.color}">${entry.risk_score}</span>
          <span class="history-time">${timeAgo(entry.timestamp)}</span>
        </div>`;
    })
    .join("");

  history.slice(0, 8).forEach((entry) => {
    historyList.querySelector(`[data-id="${entry.id}"]`)?.addEventListener("click", () => {
      displayReport(entry);
    });
  });
}

async function refreshTrustButton(domain: string) {
  const trusted = await isAllowlisted(domain);
  trustBtn.textContent = trusted ? "✓ Trusted site" : "Trust this site";
  trustBtn.classList.toggle("trusted", trusted);
}

async function scanUrl(url: string) {
  setLoading(true, "Scanning URL...");
  try {
    const response: ThreatReport & { error?: string } = await chrome.runtime.sendMessage({
      type: "SCAN_URL",
      url,
    });
    if (response.error) throw new Error(response.error);
    displayReport(response);
    await renderHistoryList();
  } catch (err) {
    setLoading(false);
    resultArea.style.display = "block";
    resultCard.className = "result-card suspicious";
    const message = err instanceof Error ? err.message : String(err);
    const looksLikeQuota = /429|quota/i.test(message);
    resultSummary.textContent = looksLikeQuota
      ? "The shared daily AI quota is used up for now."
      : `Scan failed: ${message}`;
    resultReasons.innerHTML = "";
    resultRecommendation.className = "result-recommendation suspicious";
    resultRecommendation.textContent = looksLikeQuota
      ? "Add your own free Gemini API key in Settings to get your own daily quota instead of sharing this one."
      : `If this persists, make sure the backend is running at ${API_BASE}.`;
  }
}

async function captureAndScanScreenshot() {
  setLoading(true, "Capturing screenshot...");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error("No active tab");

    chrome.tabs.captureVisibleTab(
      tab.windowId,
      { format: "png", quality: 80 },
      async (dataUrl) => {
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }

        loadingText.textContent = "Analyzing screenshot...";

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "screenshot.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("file", file);

        // On a Facebook page, a screenshot is most likely a profile/page,
        // so check it as a social profile instead of a generic phishing page.
        const endpoint = isFacebookUrl(currentTabUrl) ? "scan-social-screenshot" : "scan-image";
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: "POST",
          headers: await buildScanHeaders(),
          body: formData,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const report: ThreatReport = await response.json();
        displayReport(report);
        await recordAndRefreshHistory(report, extractDomain(currentTabUrl));
      }
    );
  } catch (err) {
    setLoading(false);
    console.error("Screenshot capture failed:", err);
  }
}

async function scanUploadedFile(file: File) {
  const isQR = file.name.toLowerCase().includes("qr");
  const isSocial = !isQR && isFacebookUrl(currentTabUrl);
  const endpoint = isQR ? "scan-qr" : isSocial ? "scan-social-screenshot" : "scan-image";
  setLoading(true, isQR ? "Decoding QR code..." : isSocial ? "Checking profile..." : "Analyzing image...");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: await buildScanHeaders(),
      body: formData,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const report: ThreatReport = await response.json();
    displayReport(report);
    await recordAndRefreshHistory(report, extractDomain(report.url || currentTabUrl));
  } catch (err) {
    setLoading(false);
    console.error("Upload scan failed:", err);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabUrl = tab.url || "";
  currentUrlEl.textContent =
    currentTabUrl.replace(/^https?:\/\//, "").slice(0, 45) + (currentTabUrl.length > 45 ? "..." : "");

  const currentDomain = extractDomain(currentTabUrl);
  await refreshTrustButton(currentDomain);
  await renderHistoryList();

  const settings = await getSettings();
  autoScanToggle.checked = settings.autoScan;
  notificationsToggle.checked = settings.notifications;
  languageSelect.value = settings.language;
  geminiKeyInput.value = settings.geminiApiKey;

  // Load cached result for the current tab
  chrome.storage.local.get([`scan_${currentTabUrl}`], (result) => {
    if (result[`scan_${currentTabUrl}`]) {
      displayReport(result[`scan_${currentTabUrl}`]);
    }
  });

  scanUrlBtn.addEventListener("click", () => {
    if (currentTabUrl) scanUrl(currentTabUrl);
  });

  screenshotBtn.addEventListener("click", captureAndScanScreenshot);

  fileUpload.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) scanUploadedFile(file);
  });

  pasteScanBtn.addEventListener("click", () => {
    const value = pasteUrlInput.value.trim();
    if (value) scanUrl(value);
  });
  pasteUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") pasteScanBtn.click();
  });

  trustBtn.addEventListener("click", async () => {
    const trusted = trustBtn.classList.contains("trusted");
    if (trusted) {
      await removeFromAllowlist(currentDomain);
    } else {
      await addToAllowlist(currentDomain);
    }
    await refreshTrustButton(currentDomain);
  });

  settingsToggleBtn.addEventListener("click", () => {
    settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
  });

  autoScanToggle.addEventListener("change", () => {
    saveSettings({ autoScan: autoScanToggle.checked });
  });
  notificationsToggle.addEventListener("change", () => {
    saveSettings({ notifications: notificationsToggle.checked });
  });
  languageSelect.addEventListener("change", () => {
    saveSettings({ language: languageSelect.value as "en" | "tl" });
  });
  geminiKeyInput.addEventListener("change", () => {
    saveSettings({ geminiApiKey: geminiKeyInput.value.trim() });
  });
});
