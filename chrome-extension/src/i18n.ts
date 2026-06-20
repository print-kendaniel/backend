import { Lang } from "./shared";

export const STRINGS = {
  en: {
    bannerDangerTitle: (score: number) => `TrustMeBro AI: Dangerous Site Detected (${score}/100)`,
    bannerSuspiciousTitle: (score: number) => `TrustMeBro AI: Suspicious Site (${score}/100)`,
    dismiss: "Dismiss",
    trustSite: "Don't warn me again for this site",
    interstitialTitle: "Dangerous Site Blocked",
    interstitialBody:
      "TrustMeBro AI detected strong signs that this site is a phishing or scam page.",
    goBack: "Go Back",
    proceedAnyway: "Proceed Anyway (Not Recommended)",
  },
  tl: {
    bannerDangerTitle: (score: number) => `TrustMeBro AI: Mapanganib na Site (${score}/100)`,
    bannerSuspiciousTitle: (score: number) => `TrustMeBro AI: Kahina-hinalang Site (${score}/100)`,
    dismiss: "Isara",
    trustSite: "Huwag na akong balaan sa site na ito",
    interstitialTitle: "Na-block ang Mapanganib na Site",
    interstitialBody:
      "Natukoy ng TrustMeBro AI na ang site na ito ay malamang phishing o scam page.",
    goBack: "Bumalik",
    proceedAnyway: "Tuloy Pa Rin (Hindi Inirerekomenda)",
  },
};

export function t(lang: Lang) {
  return STRINGS[lang] || STRINGS.en;
}
