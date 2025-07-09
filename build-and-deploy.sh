#!/bin/bash

echo "🚀 === SCRIPT DE BUILD FORCÉ POUR RENDER ==="
echo "📍 Répertoire de travail: $(pwd)"
echo "📂 Contenu du répertoire:"
ls -la

# Étape 1: Build du backend
echo "🔧 === BUILD BACKEND ==="
cd beauty-flow-backend
npm install
npm run build
echo "✅ Backend buildé avec succès"
cd ..

# Étape 2: Build du frontend
echo "🎨 === BUILD FRONTEND ==="
cd beauty-flow
# Forcer l'installation de toutes les dépendances (y compris devDependencies)
NODE_ENV=development npm install

# Vérification du script build
echo "📋 === VÉRIFICATION PACKAGE.JSON ==="
cat package.json | grep '"build"'

# Build avec gestion d'erreurs
echo "🎯 === EXÉCUTION DU BUILD FRONTEND ==="
# Utiliser npx pour s'assurer que Vite est trouvé
npx vite build

# Vérification critique que le build a réussi
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERREUR CRITIQUE: index.html non généré !"
    echo "📁 Contenu du dossier dist:"
    ls -la dist/ 2>/dev/null || echo "Le dossier dist n'existe pas"
    exit 1
fi

echo "✅ Frontend buildé avec succès !"
echo "📄 Fichiers générés dans dist/:"
ls -la dist/

# Vérification du contenu d'index.html
echo "📝 === VÉRIFICATION CONTENU INDEX.HTML ==="
echo "Taille du fichier:"
wc -c dist/index.html
echo "Début du fichier:"
head -10 dist/index.html

cd ..

# Étape 3: Copier le dossier dist pour le backend
echo "📁 === COPIE DU BUILD POUR LE BACKEND ==="
if [ -d "beauty-flow/dist" ]; then
    echo "📦 Copie de beauty-flow/dist vers beauty-flow-backend/dist/public"
    mkdir -p beauty-flow-backend/dist/public
    cp -r beauty-flow/dist/* beauty-flow-backend/dist/public/
    echo "✅ Frontend copié dans le backend"
    echo "📄 Contenu de beauty-flow-backend/dist/public:"
    ls -la beauty-flow-backend/dist/public/
    
    # Aussi copier à la racine pour compatibilité
    echo "📦 Copie aussi vers ./dist pour compatibilité"
    cp -r beauty-flow/dist ./
    echo "✅ Build copié à la racine"
else
    echo "❌ ERREUR: Le dossier beauty-flow/dist n'existe pas !"
    exit 1
fi

echo "🎉 === BUILD TERMINÉ AVEC SUCCÈS ==="
echo "✅ Backend: Compilé"
echo "✅ Frontend: Généré avec index.html"
echo "✅ Dist: Copié à la racine"
echo "🚀 Prêt pour le déploiement !"
