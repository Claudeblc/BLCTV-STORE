#!/bin/bash
# Script d'installation - ZapIPTV Blocking Page Update v42
# Exécuter depuis le dossier contenant les fichiers

DEST="/var/www/blc-tv-player/dist/public"

echo "=== Déploiement ZapIPTV v42 ==="

# Copier les fichiers
cp tv-fixes.js "$DEST/tv-fixes.js" && echo "✓ tv-fixes.js copié"
cp zap-trial-expired-new.png "$DEST/zap-trial-expired-new.png" && echo "✓ zap-trial-expired-new.png copié"
cp zap-activation-mac-new.png "$DEST/zap-activation-mac-new.png" && echo "✓ zap-activation-mac-new.png copié"

# Redémarrer le serveur
pm2 restart all && echo "✓ Serveur redémarré"

echo "=== Déploiement terminé ==="
