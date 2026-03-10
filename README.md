# BLCTV-STORE — Projet Complet

Site de vente d'abonnement TV + Panel CMS d'administration

## Architecture du Projet

Ce dépôt contient l'ensemble du projet BLCTV Store / ZAP IPTV, déployé sur le serveur **51.159.23.253**.

### Structure des dossiers

```
BLCTV-STORE/
├── blctv-store.zip          # Sauvegarde complète du backend BLC TV Player
├── cms-panel/               # Panel CMS d'administration (React + Tailwind)
│   ├── client/              # Code source frontend
│   └── package.json         # Dépendances
├── zap-iptv-files/          # Fichiers ZAP IPTV pour Tizen OS
│   ├── zap_backend_main.js  # Backend JS pour Tizen (vérification licence)
│   ├── ZAP_IPTV_final.html  # Interface HTML du player Tizen
│   ├── index_compiled.js    # JS compilé du player
│   └── index.css            # Styles du player
├── nginx-blctv.conf         # Configuration Nginx
└── README.md                # Ce fichier
```

## Serveur Distant

| Paramètre | Valeur |
|-----------|--------|
| IP | 51.159.23.253 |
| Node.js | v22 |
| MySQL | 8.0 |
| PM2 | blc-tv-player |

## Services

- **Backend** : `/var/www/blc-tv-player/` (port 3000)
- **Panel CMS** : `/var/www/cms-panel/` → cms.zapiptvpro.com
- **ZAP IPTV** : `/var/www/zap-iptv/`
- **APK Downloads** : `/var/www/downloads/`

## Système de Points

| Plan | Points | Durée |
|------|--------|-------|
| 1 An | 1 point | 365 jours |
| À Vie | 2 points | Illimité |

## Login Panel CMS

- **URL** : http://cms.zapiptvpro.com
- **Username** : admin
- **Password** : admin
