/*
 * Design: Midnight Glass
 * Section CTA finale avec fond cinématique et appel à l'action fort
 */
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ArrowRight } from "lucide-react";

const CTA_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/cta-bg-ejVWjsufkzPBQoG3wnhMHc.webp";

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={CTA_BG}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060912] via-[#060912]/70 to-[#060912]" />
      </div>

      <div ref={ref} className="container relative z-10">
        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Prêt à transformer votre
            <br />
            <span className="text-gradient-blue">expérience TV ?</span>
          </h2>

          <p className="text-lg text-white/45 mb-10 leading-relaxed max-w-lg mx-auto">
            Rejoignez des milliers d'utilisateurs satisfaits et profitez du meilleur
            du streaming dès aujourd'hui.
          </p>

          <a
            href="#pricing"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.03]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Voir les offres
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
