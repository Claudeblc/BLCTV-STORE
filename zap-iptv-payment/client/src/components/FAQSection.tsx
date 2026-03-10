/*
 * Design: Midnight Glass
 * Section FAQ avec accordion glassmorphism
 * 5 questions fréquentes sur le paiement, l'accès et la compatibilité
 */
import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Sur quels appareils puis-je utiliser ZAP IPTV Player ?",
    answer:
      "ZAP IPTV Player est compatible avec Samsung Smart TV (Tizen OS), Android TV, smartphones et tablettes Android, ainsi que les navigateurs web. Un seul abonnement vous donne accès à tous vos appareils.",
  },
  {
    question: "Quelle est la différence entre l'abonnement annuel et la licence à vie ?",
    answer:
      "L'abonnement annuel à 5,99€ vous donne un accès complet pendant 12 mois, renouvelable chaque année. La licence à vie à 9,99€ est un paiement unique qui vous offre un accès permanent, sans aucun renouvellement nécessaire, incluant toutes les futures mises à jour.",
  },
  {
    question: "Le paiement est-il sécurisé ?",
    answer:
      "Absolument. Tous les paiements sont traités par Stripe, leader mondial du paiement en ligne. Vos données bancaires sont chiffrées en SSL 256-bit et ne sont jamais stockées sur nos serveurs. Nous acceptons Visa, Mastercard et les principales cartes bancaires.",
  },
  {
    question: "Comment activer mon accès après le paiement ?",
    answer:
      "Après votre paiement, vous recevrez un code d'activation par email. Il vous suffit de l'entrer dans l'application ZAP IPTV Player sur votre appareil pour débloquer immédiatement l'accès complet à toutes les fonctionnalités.",
  },
  {
    question: "Puis-je obtenir un remboursement si je ne suis pas satisfait ?",
    answer:
      "Oui, nous offrons une garantie de satisfaction de 7 jours. Si vous n'êtes pas entièrement satisfait de votre expérience, contactez notre support et nous procéderons au remboursement intégral, sans condition.",
  },
];

function FAQItem({
  faq,
  index,
  isOpen,
  toggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  toggle: () => void;
}) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <button
        onClick={toggle}
        className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
          isOpen
            ? "glass-panel-strong"
            : "glass-panel hover:bg-white/[0.05]"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <h3
            className="text-base font-semibold text-white pr-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {faq.question}
          </h3>
          <ChevronDown
            size={18}
            className={`text-white/40 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        <div
          className={`overflow-hidden transition-all duration-400 ${
            isOpen ? "max-h-60 mt-4 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="text-sm text-white/45 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </button>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="container relative z-10">
        {/* Section header */}
        <div
          ref={titleRef}
          className={`text-center max-w-2xl mx-auto mb-14 sm:mb-16 transition-all duration-800 ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-blue-400/80 font-semibold mb-4">
            FAQ
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Questions{" "}
            <span className="text-gradient-blue">fréquentes</span>
          </h2>
          <p className="text-base text-white/45 leading-relaxed">
            Retrouvez les réponses aux questions les plus courantes sur
            ZAP IPTV Player.
          </p>
        </div>

        {/* FAQ items */}
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
