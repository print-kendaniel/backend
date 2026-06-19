// Service Worker — Manifest V3 background script
import {
  ThreatReport,
  extractDomain,
  extractErrorDetail,
  getSettings,
  isAllowlisted,
  isAutoScanDue,
  setLastAutoScanTime,
  addToHistory,
  isFacebookUrl,
} from "./shared";

// Replaced at build time by webpack.DefinePlugin (see webpack.config.js / API_BASE_URL env var)
const API_BASE = process.env.API_BASE_URL as string;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ trustlink_active: true });
  setupContextMenus();
});

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "trustlink-scan-link",
      title: "Scan this link with TrustLink AI",
      contexts: ["link"],
    });
    chrome.contextMenus.create({
      id: "trustlink-scan-image",
      title: "Scan this image for QR/threats",
      contexts: ["image"],
    });
  });
}

function setBadge(riskLevel: string) {
  const badgeConfig: Record<string, { text: string; color: string }> = {
    safe: { text: "✓", color: "#00C853" },
    suspicious: { text: "!", color: "#FFB020" },
    dangerous: { text: "✗", color: "#FF4D4F" },
  };
  const badge = badgeConfig[riskLevel] || badgeConfig.suspicious;
  chrome.action.setBadgeText({ text: badge.text });
  chrome.action.setBadgeBackgroundColor({ color: badge.color });
}

function notifyThreat(domain: string, data: ThreatReport) {
  const titleByLevel: Record<string, string> = {
    suspicious: "Suspicious site detected",
    dangerous: "Dangerous site detected",
  };
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: titleByLevel[data.risk_level] || "TrustLink AI Alert",
    message: `${domain} — risk score ${data.risk_score}/100. ${data.summary}`,
  });
}

async function performUrlScan(
  endpoint: "scan-url" | "scan-social-url",
  url: string,
  opts: { notify?: boolean; tabId?: number } = {}
): Promise<ThreatReport> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw new Error(await extractErrorDetail(response));
  const data: ThreatReport = await response.json();

  chrome.storage.local.set({ [`scan_${url}`]: data });

  const domain = extractDomain(url);
  await addToHistory(data, domain);
  await setLastAutoScanTime(domain);
  setBadge(data.risk_level);

  const settings = await getSettings();
  if (settings.notifications && opts.notify && data.risk_level !== "safe") {
    notifyThreat(domain, data);
  }

  if (opts.tabId !== undefined) {
    chrome.tabs.sendMessage(opts.tabId, { type: "SCAN_RESULT", data }).catch(() => {});
  }

  return data;
}

// Facebook profile/page URLs get routed to the social-profile checker instead
// of the phishing-URL checker — facebook.com itself is always a legitimate,
// ancient domain, so SSL/WHOIS checks on it are meaningless; what matters is
// the specific profile/page, which /scan-social-url is built to assess.
function handleScanUrl(url: string, opts: { notify?: boolean; tabId?: number } = {}): Promise<ThreatReport> {
  const endpoint = isFacebookUrl(url) ? "scan-social-url" : "scan-url";
  return performUrlScan(endpoint, url, opts);
}

async function handleScanImage(imageUrl: string, pageUrl?: string): Promise<void> {
  const imgResponse = await fetch(imageUrl);
  const blob = await imgResponse.blob();

  const tryEndpoint = async (endpoint: string): Promise<ThreatReport> => {
    const formData = new FormData();
    formData.append("file", blob, "image.png");
    const res = await fetch(`${API_BASE}/${endpoint}`, { method: "POST", body: formData });
    if (!res.ok) throw new Error(await extractErrorDetail(res));
    return res.json();
  };

  let data: ThreatReport;
  if (pageUrl && isFacebookUrl(pageUrl)) {
    // Right-clicked an image on a Facebook page — most likely a profile/cover
    // photo, so check it as a social profile rather than a generic screenshot.
    data = await tryEndpoint("scan-social-screenshot");
  } else {
    // QR codes are the more specific/useful case, so try that first and fall
    // back to general screenshot analysis if no QR code is found.
    try {
      data = await tryEndpoint("scan-qr");
    } catch {
      data = await tryEndpoint("scan-image");
    }
  }

  const domain = extractDomain(data.url || imageUrl);
  await addToHistory(data, domain);
  setBadge(data.risk_level);

  const settings = await getSettings();
  if (settings.notifications && data.risk_level !== "safe") {
    notifyThreat(domain, data);
  }
}

// Auto-scan a tab once it finishes loading, throttled per-domain so normal
// browsing doesn't burn through the Gemini API quota.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) return;

  (async () => {
    const settings = await getSettings();
    if (!settings.autoScan) return;

    const domain = extractDomain(tab.url!);
    if (await isAllowlisted(domain)) return;
    if (!(await isAutoScanDue(domain))) return;

    try {
      await handleScanUrl(tab.url!, { notify: true, tabId });
    } catch (e) {
      console.error("Auto-scan failed:", e);
    }
  })();
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "trustlink-scan-link" && info.linkUrl) {
    handleScanUrl(info.linkUrl, { notify: true }).catch((e) =>
      console.error("Context-menu link scan failed:", e)
    );
  }
  if (info.menuItemId === "trustlink-scan-image" && info.srcUrl) {
    handleScanImage(info.srcUrl, info.pageUrl).catch((e) =>
      console.error("Context-menu image scan failed:", e)
    );
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SCAN_URL") {
    handleScanUrl(message.url, { notify: false }).then(sendResponse).catch((e) => sendResponse({ error: e.message }));
    return true; // async response
  }

  if (message.type === "GET_CURRENT_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ url: tabs[0]?.url || "" });
    });
    return true;
  }

  if (message.type === "CAPTURE_TAB") {
    chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true;
  }

  return false;
});

export {};
