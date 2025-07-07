const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function removeLogoBackground() {
  try {
    console.log('🎨 Suppression du background des logos...');
    
    const logosDir = path.join(__dirname, 'uploads/logos');
    const files = await fs.readdir(logosDir);
    
    for (const file of files) {
      if (file.includes('saloneo-logo') && file.endsWith('.png')) {
        const inputPath = path.join(logosDir, file);
        const outputPath = path.join(logosDir, file.replace('.png', '-transparent.png'));
        
        console.log(`📸 Traitement de ${file}...`);
        
        // Lire l'image et supprimer le background blanc/gris
        await sharp(inputPath)
          .removeAlpha() // Supprimer l'alpha existant
          .ensureAlpha() // Ajouter un canal alpha
          .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } }) // Fond transparent
          .toColourspace('srgb')
          .png({ 
            quality: 100,
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: true
          })
          .toBuffer()
          .then(async (buffer) => {
            // Traiter pixel par pixel pour supprimer le fond blanc/gris
            const { data, info } = await sharp(buffer)
              .raw()
              .toBuffer({ resolveWithObject: true });
            
            const pixelArray = new Uint8ClampedArray(data);
            const channels = info.channels;
            
            // Parcourir chaque pixel
            for (let i = 0; i < pixelArray.length; i += channels) {
              const r = pixelArray[i];
              const g = pixelArray[i + 1];
              const b = pixelArray[i + 2];
              
              // Détecter les pixels blancs/gris clairs (fond)
              const isBackground = (r > 240 && g > 240 && b > 240) || // Blanc
                                 (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r > 200); // Gris clair
              
              if (isBackground) {
                // Rendre transparent
                pixelArray[i + 3] = 0; // Alpha = 0 (transparent)
              }
            }
            
            // Sauvegarder l'image avec fond transparent
            await sharp(pixelArray, {
              raw: {
                width: info.width,
                height: info.height,
                channels: channels
              }
            })
            .png()
            .toFile(outputPath);
            
            console.log(`✅ ${file} -> ${path.basename(outputPath)}`);
          });
      }
    }
    
    // Mettre à jour le fichier JSON avec les nouvelles URLs
    const urlsPath = path.join(__dirname, 'marketing-images-urls.json');
    const urls = JSON.parse(await fs.readFile(urlsPath, 'utf8'));
    
    if (urls.logos) {
      if (urls.logos.horizontal) {
        urls.logos.horizontal = urls.logos.horizontal.replace('.png', '-transparent.png');
      }
      if (urls.logos.square) {
        urls.logos.square = urls.logos.square.replace('.png', '-transparent.png');
      }
    }
    
    await fs.writeFile(urlsPath, JSON.stringify(urls, null, 2));
    
    console.log('✨ Logos avec fond transparent créés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Vérifier si sharp est installé
try {
  require.resolve('sharp');
  removeLogoBackground();
} catch (e) {
  console.log('📦 Installation de sharp...');
  const { execSync } = require('child_process');
  execSync('npm install sharp', { stdio: 'inherit' });
  removeLogoBackground();
}
