/*
 * Design: Midnight Glass
 * Section fonctionnalités avec cartes glassmorphism et icônes Lucide
 * Layout en grille 3x2 avec animations staggerées au scroll
 */
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Tv,
  MonitorSmartphone,
  Zap,
  CalendarClock,
  Globe,
  Shield,
} from "lucide-react";

const FEATURES_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/features-bg-oCdWGRmEKVCaBbDs2RD4H4.webp";

const features = [
  {
    icon: Tv,
    title: "Chaînes illimitées",
    description:
      "Accédez à plus de 10 000 chaînes TV du monde entier, incluant les chaînes nationales, sportives et internationales.",
  },
  {
    icon: Zap,
    title: "Qualité HD & 4K",
    description:
      "Profitez d'une qualité d'image exceptionnelle en HD, Full HD et 4K Ultra HD sur toutes vos chaînes préférées.",
  },
  {
    icon: MonitorSmartphone,
    title: "Multi-appareils",
    description:
      "Compatible Samsung Smart TV, Android TV, smartphones, tablettes et navigateurs web. Un seul compte, tous vos écrans.",
  },
  {
    icon: CalendarClock,
    title: "Guide EPG intégré",
    description:
      "Programme TV électronique complet avec les horaires de diffusion, descriptions et rappels pour ne rien manquer.",
  },
  {
    icon: Globe,
    title: "Contenu international",
    description:
      "Films, séries et documentaires de tous les pays. Catalogue enrichi régulièrement avec les dernières nouveautés.",
  },
  {
    icon: Shield,
    title: "Connexion sécurisée",
    description:
      "Streaming chiffré et sécurisé. Votre vie privée est protégée grâce à notre infrastructure de pointe.",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`group relative p-6 sm:p-8 rounded-2xl glass-panel transition-all duration-700 hover:bg-white/[0.06] hover:border-white/[0.12] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/15 group-hover:border-blue-500/30 transition-all duration-300">
        <Icon size={22} className="text-blue-400" />
      </div>

      <h3
        className="text-lg font-semibold text-white mb-3"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {feature.title}
      </h3>

      <p className="text-sm text-white/45 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function FeaturesSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);

  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={FEATURES_BG}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#060912]/80" />
      </div>

      <div className="container relative z-10">
        {/* Section header */}
        <div
          ref={titleRef}
          className={`text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-800 ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-blue-400/80 font-semibold mb-4">
            Fonctionnalités
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Tout ce dont vous avez{" "}
            <span className="text-gradient-blue">besoin</span>
          </h2>
          <p className="text-base text-white/45 leading-relaxed">
            ZAP IPTV Player réunit le meilleur du streaming dans une seule application,
            conçue pour offrir une expérience fluide et premium.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
