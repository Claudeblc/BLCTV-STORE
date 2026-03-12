#!/bin/bash
# =============================================
# Script d'installation - ZAP IPTV v42
# Renommage BLC TV Player → ZAP IPTV
# + Nouveau logo + Images de blocage
# =============================================

DEST="/var/www/blc-tv-player/dist/public"

echo "=== Déploiement ZAP IPTV v42 ==="

# 1. Backup
echo "[1/5] Backup des fichiers originaux..."
cp "$DEST/index.html" "$DEST/index.html.bak-blctv" 2>/dev/null
cp "$DEST/assets/index-BGUO44o7.js" "$DEST/assets/index-BGUO44o7.js.bak-blctv" 2>/dev/null
echo "✓ Backups créés"

# 2. Copier le nouveau index.html (titre ZAP IPTV + tv-fixes v42)
echo "[2/5] Mise à jour index.html..."
cp index.html "$DEST/index.html" && echo "✓ index.html mis à jour (titre: ZAP IPTV)"

# 3. Copier le JS compilé modifié (logos + noms remplacés)
echo "[3/5] Mise à jour du JS compilé..."
cp index-BGUO44o7.js "$DEST/assets/index-BGUO44o7.js" && echo "✓ JS compilé mis à jour (BLC→ZAP)"

# 4. Copier les images
echo "[4/5] Copie des images..."
cp zapiptv-logo.png "$DEST/zapiptv-logo.png" && echo "✓ Logo ZAP IPTV copié"
cp zap-trial-expired-new.png "$DEST/zap-trial-expired-new.png" && echo "✓ Image trial expired copiée"
cp zap-activation-mac-new.png "$DEST/zap-activation-mac-new.png" && echo "✓ Image activation MAC copiée"
cp tv-fixes.js "$DEST/tv-fixes.js" && echo "✓ tv-fixes.js v42 copié"

# 5. Redémarrer
echo "[5/5] Redémarrage du serveur..."
pm2 restart all && echo "✓ Serveur redémarré"

echo ""
echo "=== Déploiement ZAP IPTV v42 terminé ! ==="
echo "Modifications appliquées:"
echo "  - Titre: BLC TV Player → ZAP IPTV"
echo "  - Logo: Nouveau logo ZAP IPTV"
echo "  - Textes: BLCTV Player → ZAP IPTV"
echo "  - Images de blocage: Nouvelles images"
echo "  - tv-fixes.js: v42 avec interception images"
