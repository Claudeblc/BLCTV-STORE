import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Tv,
  Smartphone,
  Monitor,
  Play,
  Star,
  Check,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Download,
  CreditCard,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/DtBpsAu9YFo4aWi6rVwhpa/hero-banner-eMacoZu8Cxf3hKbrKESE2A.webp";

const apps = [
  {
    id: "blctv-mobile",
    name: "BLC TV Player",
    platform: "Mobile Android",
    icon: Smartphone,
    color: "from-blue-600 to-indigo-700",
    accentColor: "text-blue-400",
    bgAccent: "bg-blue-500/10 border-blue-500/20",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/DtBpsAu9YFo4aWi6rVwhpa/blctv-mobile-preview-b5K5HeAtuxeZd9aRhiERtM.webp",
    downloadUrl: "http://51.159.23.253/downloads/BLCTV-Player-Mobile.apk",
    features: ["TV en direct HD/4K", "Films & Séries VOD", "Replay 7 jours", "EPG complet"],
    description: "L'application IPTV ultime pour votre smartphone Android. Profitez de milliers de chaînes TV en direct, films et séries en haute qualité.",
  },
  {
    id: "blctv-tv",
    name: "BLC TV Player",
    platform: "Android TV / Box",
    icon: Tv,
    color: "from-blue-600 to-indigo-700",
    accentColor: "text-blue-400",
    bgAccent: "bg-blue-500/10 border-blue-500/20",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/DtBpsAu9YFo4aWi6rVwhpa/blctv-tv-preview-csCaU8sTFYX5HPS22xRKQD.webp",
    downloadUrl: "http://51.159.23.253/downloads/BLCTV-Player-AndroidTV.apk",
    features: ["Interface TV optimisée", "Navigation télécommande", "Qualité 4K UHD", "Watch Party"],
    description: "Transformez votre Android TV ou Box en centre multimédia complet avec BLC TV Player. Interface optimisée pour grand écran.",
  },
  {
    id: "zapiptv-mobile",
    name: "ZAP IPTV",
    platform: "Mobile Android",
    icon: Smartphone,
    color: "from-red-600 to-orange-600",
    accentColor: "text-red-400",
    bgAccent: "bg-red-500/10 border-red-500/20",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/DtBpsAu9YFo4aWi6rVwhpa/zapiptv-mobile-preview-ajRr8nLqTE8vLQgknjJion.webp",
    downloadUrl: "#",
    features: ["Chaînes françaises", "VOD illimité", "Catch-up TV", "Multi-écrans"],
    description: "ZAP IPTV pour mobile — accédez à toutes vos chaînes préférées, films et séries directement depuis votre smartphone.",
  },
  {
    id: "zapiptv-tv",
    name: "ZAP IPTV",
    platform: "Android TV / Box",
    icon: Tv,
    color: "from-red-600 to-orange-600",
    accentColor: "text-red-400",
    bgAccent: "bg-red-500/10 border-red-500/20",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/DtBpsAu9YFo4aWi6rVwhpa/zapiptv-tv-preview-bywHgSehSjboiNRsZcjKzM.webp",
    downloadUrl: "#",
    features: ["Interface grand écran", "Télécommande intuitive", "Sport en direct", "Guide TV"],
    description: "ZAP IPTV pour votre téléviseur — une expérience cinéma chez vous avec une interface pensée pour la navigation à la télécommande.",
  },
  {
    id: "zapiptv-tizen",
    name: "ZAP IPTV",
    platform: "Samsung Tizen OS",
    icon: Monitor,
    color: "from-red-600 to-orange-600",
    accentColor: "text-red-400",
    bgAccent: "bg-red-500/10 border-red-500/20",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/DtBpsAu9YFo4aWi6rVwhpa/zapiptv-tizen-preview-T9mnfwdHCunKpdhvWASCaZ.webp",
    downloadUrl: "http://51.159.23.253/downloads/ZAPiptvTizen.wgt",
    features: ["Samsung Smart TV natif", "Tizen OS optimisé", "EPG intégré", "Qualité premium"],
    description: "Application native pour Samsung Smart TV (Tizen OS). Installation directe, performance optimale et qualité d'image exceptionnelle.",
  },
];

const plans = [
  {
    id: "1year",
    name: "Abonnement 1 An",
    price: "49.99",
    period: "/an",
    popular: false,
    features: [
      "Accès à toutes les chaînes",
      "Films & Séries VOD",
      "Qualité HD / 4K",
      "Support technique",
      "1 appareil",
      "Mises à jour incluses",
    ],
  },
  {
    id: "lifetime",
    name: "Abonnement À Vie",
    price: "89.99",
    period: "",
    popular: true,
    features: [
      "Accès à toutes les chaînes",
      "Films & Séries VOD",
      "Qualité HD / 4K",
      "Support technique prioritaire",
      "2 appareils simultanés",
      "Mises à jour à vie",
      "Accès anticipé nouveautés",
    ],
  },
];

const STRIPE_LINK = "https://buy.stripe.com/test_placeholder_link";

export default function StorePage() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#060612] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060612]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">ZAP IPTV</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#apps" className="hover:text-white transition-colors">Applications</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#download" className="hover:text-white transition-colors">Télécharger</a>
          </div>
          <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 border-0 text-white font-semibold">
              <CreditCard className="w-4 h-4 mr-2" />
              S'abonner
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060612]/30 via-[#060612]/60 to-[#060612]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 mb-6 px-3 py-1.5 text-xs font-medium">
              <Zap className="w-3 h-3 mr-1.5" />
              Streaming Premium
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Toute la TV en direct,{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                partout.
              </span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-xl">
              Accédez à des milliers de chaînes TV, films et séries en qualité HD et 4K. 
              Compatible avec tous vos appareils : Mobile, Android TV, Samsung Smart TV.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#pricing">
                <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 border-0 text-white font-semibold h-12 px-8">
                  Voir les offres
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href="#apps">
                <Button size="lg" variant="outline" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-12 px-8">
                  Découvrir les apps
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Chaînes TV", value: "10 000+" },
              { label: "Films & Séries", value: "50 000+" },
              { label: "Qualité max", value: "4K UHD" },
              { label: "Appareils", value: "5 types" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section id="apps" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-white/5 text-white/60 border-white/10 mb-4 px-3 py-1.5">
              <Globe className="w-3 h-3 mr-1.5" />
              Multi-plateforme
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Nos Applications
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Disponible sur toutes les plateformes. Choisissez l'application adaptée à votre appareil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden cursor-pointer group ${
                    selectedApp === app.id ? "ring-1 ring-white/20" : ""
                  }`}
                  onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={app.image}
                      alt={`${app.name} - ${app.platform}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="text-white font-bold text-lg">{app.name}</h3>
                        <p className="text-white/60 text-sm">{app.platform}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                        <app.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-white/40 text-sm mb-4 leading-relaxed">{app.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.features.map((f) => (
                        <span key={f} className={`text-xs px-2.5 py-1 rounded-full border ${app.bgAccent} ${app.accentColor}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                    {app.downloadUrl !== "#" ? (
                      <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" className={`w-full bg-gradient-to-r ${app.color} border-0 text-white`}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full border-white/10 text-white/50" disabled>
                        Bientôt disponible
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-white/5 text-white/60 border-white/10 mb-4 px-3 py-1.5">
              <CreditCard className="w-3 h-3 mr-1.5" />
              Tarifs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Choisissez votre offre
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Des prix transparents, sans engagement caché. Paiement sécurisé via Stripe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`relative bg-white/[0.02] overflow-hidden transition-all duration-300 ${
                    plan.popular
                      ? "border-red-500/30 ring-1 ring-red-500/10"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                        POPULAIRE
                      </div>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      {plan.period && <span className="text-white/40">{plan.period}</span>}
                    </div>
                    <Separator className="bg-white/5 mb-6" />
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm text-white/60">
                          <Check className="w-4 h-4 text-green-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="lg"
                        className={`w-full h-12 font-semibold ${
                          plan.popular
                            ? "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 border-0 text-white"
                            : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payer avec Stripe
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-white/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Paiement sécurisé SSL
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Satisfaction garantie
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-white/5 text-white/60 border-white/10 mb-4 px-3 py-1.5">
              <Download className="w-3 h-3 mr-1.5" />
              Téléchargements
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Télécharger les applications
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Téléchargez directement les fichiers d'installation pour vos appareils.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: "BLC TV Player — Mobile", file: "BLCTV-Player-Mobile.apk", icon: Smartphone, color: "blue" },
              { name: "BLC TV Player — Android TV", file: "BLCTV-Player-AndroidTV.apk", icon: Tv, color: "blue" },
              { name: "ZAP IPTV — Tizen (Samsung)", file: "ZAPiptvTizen.wgt", icon: Monitor, color: "red" },
            ].map((dl) => (
              <a
                key={dl.file}
                href={`http://51.159.23.253/downloads/${dl.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-${dl.color}-500/20 hover:bg-${dl.color}-500/5 transition-all group`}
              >
                <div className={`w-12 h-12 rounded-lg bg-${dl.color}-500/10 flex items-center justify-center`}>
                  <dl.icon className={`w-6 h-6 text-${dl.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{dl.name}</div>
                  <div className="text-xs text-white/30">{dl.file}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold">ZAP IPTV</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <a href="https://zap-iptv.com" className="hover:text-white/60 transition-colors">zap-iptv.com</a>
              <a href="https://zapiptvpro.com" className="hover:text-white/60 transition-colors">zapiptvpro.com</a>
              <a href="http://cms.zapiptvpro.com" className="hover:text-white/60 transition-colors">Panel Admin</a>
            </div>
            <div className="text-xs text-white/20">
              © 2025 ZAP IPTV. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
