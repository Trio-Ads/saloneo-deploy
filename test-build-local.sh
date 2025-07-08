#!/bin/bash

echo "🚀 === TEST BUILD LOCAL SALONEO ==="
echo "📍 Répertoire de travail: $(pwd)"

echo "🔧 === INSTALLATION BACKEND ==="
cd beauty-flow-backend
npm install
echo "🏗️ === BUILD BACKEND ==="
npm run build

echo "🎨 === INSTALLATION FRONTEND ==="
cd ../beauty-flow
npm install

echo "📋 === VÉRIFICATION PACKAGE.JSON ==="
cat package.json | grep '"build"'

echo "🎯 === BUILD FRONTEND ==="
npm run build

echo "✅ === VÉRIFICATION POST-BUILD ==="
ls -la

echo "📁 === VÉRIFICATION DOSSIER DIST ==="
if [ -d "dist" ]; then 
    echo "✅ Dossier dist existe:"
    ls -la dist/
else 
    echo "❌ Dossier dist n'existe pas"
fi

echo "📄 === VÉRIFICATION INDEX.HTML ==="
if [ -f "dist/index.html" ]; then 
    echo "✅ index.html trouvé:"
    ls -la dist/index.html
    echo "📝 Contenu du début du fichier:"
    head -10 dist/index.html
else 
    echo "❌ index.html non trouvé"
fi

echo "🎉 === TEST BUILD TERMINÉ ==="
