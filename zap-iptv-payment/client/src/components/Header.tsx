/*
 * Design: Midnight Glass
 * Header flottant avec glassmorphism, logo ZAP IPTV, navigation sticky
 */
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/zap-iptv-logo_77792014.jpg";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-[#060912]/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <img
            src={LOGO_URL}
            alt="ZAP IPTV"
            className="h-10 w-10 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span
              className="text-lg font-bold tracking-tight text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              ZAP IPTV
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400/70 font-medium -mt-0.5">
              Player
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="ml-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Activer maintenant
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white/70 hover:text-white transition-colors p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#060912]/95 backdrop-blur-xl border-b border-white/[0.06] py-6 px-6 animate-in slide-in-from-top-2 duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base text-white/70 hover:text-white transition-colors py-2 font-medium"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-center text-sm font-semibold transition-all duration-300"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Activer maintenant
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
