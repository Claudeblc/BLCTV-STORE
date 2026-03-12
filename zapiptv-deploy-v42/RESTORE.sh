#!/bin/bash
# Restauration du JS original + logo optimisé
DEST="/var/www/zapiptv/dist/public"
echo "=== Restauration JS original + logo optimisé ==="
cp index-BGUO44o7.js "$DEST/assets/index-BGUO44o7.js" && echo "✓ JS original restauré"
cp zapiptv-logo.png "$DEST/zapiptv-logo.png" && echo "✓ Logo optimisé copié"
cp tv-fixes.js "$DEST/tv-fixes.js" && echo "✓ tv-fixes.js copié"
cp index.html "$DEST/index.html" && echo "✓ index.html copié"
cp zap-trial-expired-new.png "$DEST/zap-trial-expired-new.png" 2>/dev/null
cp zap-activation-mac-new.png "$DEST/zap-activation-mac-new.png" 2>/dev/null
pm2 restart all && echo "✓ Serveur redémarré"
echo "=== Restauration terminée ! ==="
