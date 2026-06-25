import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy — TrustMeBro AI",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-32">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Overview</h2>
            <p>
              TrustMeBro AI ("we", "our", "the service") provides phishing and scam detection through
              a web app, a Chrome extension, and a backend API. This page explains what data we
              process when you use any of these, and why.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What we process, and why</h2>

            <h3 className="text-white font-semibold mt-5 mb-2">URLs you scan</h3>
            <p>
              When you submit a URL — by typing it into the web app, clicking "Scan This URL" in the
              extension, pasting a link, or right-clicking a link/image — that URL is sent to our
              backend, which performs technical checks (SSL validity, domain age, suspicious-pattern
              matching) and sends a summary of those findings to Google's Gemini API to generate a
              risk assessment. We do not control how Google retains or processes data sent to Gemini;
              see Google's own terms at{" "}
              <a
                href="https://ai.google.dev/gemini-api/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ai.google.dev/gemini-api/terms
              </a>
              .
            </p>

            <h3 className="text-white font-semibold mt-5 mb-2">Screenshots and uploaded images</h3>
            <p>
              For phishing-screenshot scans, we run on-device OCR (text extraction) on the image
              server-side and send only the extracted text to Gemini — the image itself is not
              transmitted to Google. For Facebook profile/page checks specifically, the screenshot
              image itself is sent to Gemini, since visual review (profile photo, verification badge,
              layout) is the point of that feature. Uploaded images are not stored on our servers
              beyond the time needed to process the request.
            </p>

            <h3 className="text-white font-semibold mt-5 mb-2">Chrome extension activity</h3>
            <p>
              The extension only reads the URL of your active tab when you open the popup, and only
              sends a URL, screenshot, or image for analysis when you explicitly trigger a scan —
              clicking "Scan This URL" or "Scan Screenshot" in the popup, uploading a file, or using
              the right-click context menu on a link or image. There is no background or automatic
              scanning of pages you visit; the extension has no standing access to any page until you
              ask it to check one. The on-page warning banner is only injected into the specific tab
              you just scanned, immediately after that scan, and nowhere else.
            </p>

            <h3 className="text-white font-semibold mt-5 mb-2">Account data</h3>
            <p>
              If you create an account (via Firebase Authentication), your scan history and dashboard
              statistics are associated with your account so you can view them later. We do not sell
              or share this data with advertisers or other third parties.
            </p>

            <h3 className="text-white font-semibold mt-5 mb-2">Local storage (extension)</h3>
            <p>
              Your scan history, trusted-site list, and settings (language, notifications) are stored
              locally in your browser via the extension's storage and are not transmitted anywhere
              except as part of a scan request you explicitly initiate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What we don't do</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>We don't sell your data or browsing activity to advertisers.</li>
              <li>We don't track you across other websites for advertising purposes.</li>
              <li>We don't read page content beyond what's needed to show a warning banner on pages you've already scanned.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Data retention</h2>
            <p>
              Scan results tied to an account are retained until you delete your account or request
              removal. Scan results without an account are not linked to any identifiable user.
              Locally-stored extension data (history, trusted sites, settings) stays on your device
              until you clear it or uninstall the extension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>
              Questions about this policy or your data can be sent to{" "}
              <a href="mailto:kd.llamanzares@gmail.com" className="text-primary hover:underline">
                kd.llamanzares@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
