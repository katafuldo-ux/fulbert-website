#!/bin/bash

echo "🚀 Déploiement du site FULBERT..."

# Construction du site
echo "📦 Construction du site..."
npm run build

# Vérification si le build a réussi
if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    echo "📁 Les fichiers sont dans le dossier 'dist'"
    echo ""
    echo "🌐 Pour déployer sur Netlify :"
    echo "1. Allez sur https://netlify.com"
    echo "2. Créez un compte ou connectez-vous"
    echo "3. Cliquez sur 'New site from Git' ou 'Add new site'"
    echo "4. Uploadez le dossier 'dist'"
    echo ""
    echo "🌐 Pour déployer sur GitHub Pages :"
    echo "1. Créez un dépôt sur GitHub"
    echo "2. Poussez votre code :"
    echo "   git remote add origin <votre-repo-github>"
    echo "   git push -u origin master"
    echo "3. Activez GitHub Pages dans les settings du dépôt"
    echo ""
    echo "🌐 Pour déployer sur Vercel :"
    echo "1. Allez sur https://vercel.com"
    echo "2. Importez votre projet depuis GitHub"
    echo ""
    echo "📱 Le site sera accessible partout dans le monde entier !"
else
    echo "❌ Erreur lors du build"
    exit 1
fi
