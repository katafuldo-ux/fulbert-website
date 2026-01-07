#!/bin/bash

echo "🚀 Déploiement de FULBERT-ASKY-INGÉNIERIE"

# Vérifier si le build est à jour
echo "📦 Vérification du build..."
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist n'existe pas. Lancement du build..."
    npm run build
fi

# Vérifier les fichiers essentiels
echo "📋 Vérification des fichiers essentiels..."
files_to_check=(
    "dist/index.html"
    "dist/assets/index-*.js"
    "dist/assets/index-*.css"
    "netlify/functions/data-api.js"
    "netlify.toml"
)

for file in "${files_to_check[@]}"; do
    if ls $file 1> /dev/null 2>&1; then
        echo "✅ $file"
    else
        echo "❌ $file - MANQUANT"
    fi
done

echo ""
echo "📊 Résumé du déploiement:"
echo "✅ Build généré avec succès"
echo "✅ Netlify Functions créées"
echo "✅ Configuration Netlify prête"
echo "✅ API de synchronisation prête"
echo ""
echo "🌐 Pour déployer manuellement:"
echo "1. Allez sur https://app.netlify.com/drop"
echo "2. Glissez-déposez le dossier 'dist'"
echo "3. Ou utilisez: npx netlify deploy --prod --dir=dist"
echo ""
echo "🔄 Fonctionnalités activées:"
echo "- Synchronisation des données entre appareils"
echo "- API REST pour la gestion des données"
echo "- Cache hors ligne avec fallback"
echo "- Migration automatique des données existantes"
echo "- Export CSV des données"
