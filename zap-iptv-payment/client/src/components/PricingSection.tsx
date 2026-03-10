/*
 * Design: Midnight Glass
 * Section tarifs avec deux cartes glassmorphism côte à côte
 * La carte "À Vie" est mise en avant avec glow bleu et badge "Meilleure valeur"
 * Boutons Stripe fictifs avec badge paiement sécurisé
 */
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Check, Crown, Lock, CreditCard } from "lucide-react";

const PRICING_GLOW = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/pricing-glow-aJEsHaEXRb7BKnmvXfJDji.webp";

const plans = [
  {
    name: "Annuel",
    price: "5,99",
    period: "/ an",
    description: "Accès complet pendant 12 mois",
    features: [
      "Accès à toutes les chaînes",
      "Qualité HD & 4K",
      "Compatible tous appareils",
      "Guide EPG intégré",
      "Mises à jour incluses",
    ],
    cta: "Choisir l'Annuel",
    href: "https://buy.stripe.com/test_annual_XXXXX",
    popular: false,
  },
  {
    name: "Licence à Vie",
    price: "9,99",
    period: "unique",
    description: "Un seul paiement, accès permanent",
    features: [
      "Accès à toutes les chaînes",
      "Qualité HD & 4K",
      "Compatible tous appareils",
      "Guide EPG intégré",
      "Toutes les mises à jour futures",
      "Support prioritaire",
    ],
    cta: "Choisir la Licence à Vie",
    href: "https://buy.stripe.com/test_lifetime_XXXXX",
    popular: true,
  },
];

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof plans)[0];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <Crown size={14} />
            Meilleure valeur
          </div>
        </div>
      )}

      <div
        className={`relative h-full rounded-2xl p-8 sm:p-10 transition-all duration-500 ${
          plan.popular
            ? "glass-panel-strong glow-blue-strong border-blue-500/20 scale-[1.02] lg:scale-105"
            : "glass-panel hover:bg-white/[0.05]"
        }`}
      >
        {/* Glow effect for popular */}
        {plan.popular && (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-blue-500/20 via-transparent to-blue-500/10 -z-10 blur-sm" />
        )}

        {/* Plan name */}
        <div className="mb-8">
          <h3
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {plan.name}
          </h3>
          <p className="text-sm text-white/40">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-8">
          <span
            className={`text-5xl sm:text-6xl font-bold ${
              plan.popular ? "text-gradient-blue" : "text-white"
            }`}
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {plan.price}€
          </span>
          <span className="text-base text-white/40 ml-1">{plan.period}</span>
        </div>

        {/* Features list */}
        <ul className="space-y-3.5 mb-10">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  plan.popular
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-white/[0.06] text-white/50"
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-sm text-white/60">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <a
          href={plan.href}
          className={`block w-full py-4 rounded-xl text-center font-semibold text-base transition-all duration-300 ${
            plan.popular
              ? "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
              : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] hover:border-white/[0.15]"
          }`}
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {plan.cta}
        </a>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Lock size={12} className="text-white/30" />
          <span className="text-[11px] text-white/30">
            Paiement sécurisé par Stripe
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PricingSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <img src={PRICING_GLOW} alt="" className="w-full h-full object-contain" />
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
            Tarifs
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Choisissez votre{" "}
            <span className="text-gradient-blue">offre</span>
          </h2>
          <p className="text-base text-white/45 leading-relaxed">
            Deux formules simples et transparentes. Pas d'engagement caché,
            pas de frais supplémentaires.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        {/* Payment logos */}
        <div
          className={`flex flex-col items-center mt-14 transition-all duration-700 delay-500 ${
            titleVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-5 mb-3">
            {/* Visa */}
            <div className="glass-panel rounded-lg px-4 py-2.5 flex items-center justify-center">
              <svg width="48" height="16" viewBox="0 0 48 16" fill="none">
                <path d="M17.8 1.2L11.4 14.8H7.6L4.4 4.2C4.2 3.4 4 3.2 3.4 2.8C2.4 2.2 0.8 1.8 0 1.4L0.2 1.2H6.4C7.2 1.2 8 1.8 8.2 2.6L9.6 10L13.2 1.2H17.8ZM33.6 10.4C33.6 6.6 28.4 6.4 28.4 4.8C28.4 4.2 29 3.6 30 3.6C31.4 3.6 32.4 4.2 33 4.6L33.8 1.8C33 1.4 32 1 30.4 1C26.8 1 24.2 3 24.2 5.8C24.2 7.8 26 9 27.2 9.6C28.6 10.4 29 10.8 29 11.4C29 12.2 28 12.6 27.2 12.6C25.6 12.6 24.4 12.2 23.6 11.6L22.8 14.6C23.8 15 25.2 15.4 26.8 15.4C30.6 15.4 33.6 13.4 33.6 10.4ZM42.6 14.8H46L43 1.2H39.8C39.2 1.2 38.6 1.6 38.4 2.2L33 14.8H36.8L37.6 12.4H42.2L42.6 14.8ZM38.6 9.6L40.6 4L41.6 9.6H38.6ZM23.2 1.2L20.2 14.8H16.6L19.6 1.2H23.2Z" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="glass-panel rounded-lg px-4 py-2.5 flex items-center justify-center">
              <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
                <circle cx="13" cy="11" r="10" fill="rgba(255,255,255,0.2)" />
                <circle cx="23" cy="11" r="10" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            {/* Stripe */}
            <div className="glass-panel rounded-lg px-4 py-2.5 flex items-center justify-center">
              <CreditCard size={18} className="text-white/40 mr-1.5" />
              <span className="text-xs font-semibold text-white/40 tracking-wide">Stripe</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={13} className="text-green-400/60" />
            <span className="text-xs text-white/35">
              Transactions chiffrées SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
