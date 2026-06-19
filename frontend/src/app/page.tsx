import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ThreatShowcase from "@/components/landing/ThreatShowcase";
import ChromeExtPreview from "@/components/landing/ChromeExtPreview";
import Stats from "@/components/landing/Stats";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ThreatShowcase />
      <Stats />
      <ChromeExtPreview />
      <FAQ />
      <Footer />
    </main>
  );
}
