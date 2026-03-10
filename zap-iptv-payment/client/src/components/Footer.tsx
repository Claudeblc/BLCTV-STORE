/*
 * Design: Midnight Glass
 * Footer minimaliste avec copyright, liens fictifs et logo
 */

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/nktTvRyYMGhMrtnkuM7Dcw/zap-iptv-logo_77792014.jpg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="container py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={LOGO_URL}
                alt="ZAP IPTV"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <div>
                <span
                  className="text-base font-bold text-white"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  ZAP IPTV
                </span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-blue-400/60 font-medium -mt-0.5">
                  Player
                </span>
              </div>
            </div>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs">
              L'application IPTV premium pour profiter de vos chaînes préférées
              sur tous vos appareils.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white/70 mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Application
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#features" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold text-white/70 mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Légal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Conditions générales
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold text-white/70 mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                  Centre d'aide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            &copy; {currentYear} ZAP IPTV Player. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/20">
              Paiements sécurisés par Stripe
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
