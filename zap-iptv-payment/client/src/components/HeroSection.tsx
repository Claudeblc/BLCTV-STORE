/*
 * Design: Midnight Glass
 * Hero section immersive avec fond généré, titre accrocheur, mockup multi-appareils
 * Layout asymétrique : texte à gauche, image à droite
 */
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Play, ChevronDown } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/hero-bg-c27FQGC8o7BJkYjqvTM9ZZ.webp";
const DEVICES_MOCKUP = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/zap-devices-mockup_23e02567.png";

export default function HeroSection() {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060912]/40 via-[#060912]/60 to-[#060912]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060912]/80 via-transparent to-[#060912]/40" />
      </div>

      <div ref={ref} className="container relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/70 font-medium tracking-wide">
                Application disponible sur tous les appareils
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <span className="text-white">Votre univers</span>
              <br />
              <span className="text-gradient-blue">TV en illimité</span>
            </h1>

            <p className="text-lg text-white/50 max-w-lg mb-10 leading-relaxed">
              Accédez à des milliers de chaînes TV, films et séries en qualité HD et 4K.
              ZAP IPTV Player transforme chacun de vos appareils en centre de divertissement.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                <Play size={18} className="fill-current" />
                Commencer maintenant
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-panel text-white/80 hover:text-white font-medium text-base transition-all duration-300 hover:bg-white/[0.08]"
              >
                En savoir plus
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/[0.06]">
              <div className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>10K+</div>
                <div className="text-xs text-white/40 mt-0.5">Chaînes TV</div>
              </div>
              <div className="w-px h-10 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>4K</div>
                <div className="text-xs text-white/40 mt-0.5">Ultra HD</div>
              </div>
              <div className="w-px h-10 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>24/7</div>
                <div className="text-xs text-white/40 mt-0.5">Disponible</div>
              </div>
            </div>
          </div>

          {/* Right: Mockup */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full scale-75" />
              <img
                src={DEVICES_MOCKUP}
                alt="ZAP IPTV Player sur tous vos appareils"
                className="relative z-10 w-full max-w-[600px] mx-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDown size={20} className="text-white/30" />
        </div>
      </div>
    </section>
  );
}
