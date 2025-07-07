const { generateImage } = require('./generate-marketing-images');
const fs = require('fs');
const path = require('path');

// Créer les dossiers nécessaires
const uploadsDir = path.join(__dirname, 'uploads/marketing');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Images manquantes à générer
const missingImages = {
  dashboard: {
    prompt: "Modern SaaS dashboard interface for beauty salon management on MacBook Pro screen, clean UI design with purple and cyan gradients, calendar view with appointments, client profiles with photos, analytics charts showing growth, revenue graphs trending upward, team schedule grid, dark mode interface, professional web design, Figma style, ultra-sharp details, floating UI elements",
    aspectRatio: '16:9'
  },
  team: {
    prompt: "Professional beauty salon team photo in Algeria, diverse group of 5 hairstylists and beauticians, wearing elegant black uniforms with gold name tags, friendly genuine smiles, standing in modern salon with blue accent lighting, professional group photography, natural lighting, high quality portrait, warm and welcoming expressions",
    aspectRatio: '16:9'
  },
  client: {
    prompt: "Happy Algerian woman getting luxury hair treatment in high-end beauty salon, relaxed in comfortable chair, professional hairstylist working with premium tools, modern salon interior with blue and gold accents, soft natural lighting, lifestyle photography, candid moment of satisfaction, premium service experience",
    aspectRatio: '1:1'
  },
  barbershop: {
    prompt: "Modern barbershop interior in Algeria, masculine industrial design with exposed brick, vintage leather barber chairs, chrome and wood details, traditional shaving tools display, blue neon accent lighting, urban contemporary style, professional barbershop photography, high-end atmosphere",
    aspectRatio: '1:1'
  },
  spa: {
    prompt: "Luxury spa treatment room in Algeria, zen minimalist atmosphere, soft ambient lighting with candles, professional massage table with white linens, essential oils display, orchid flowers, bamboo elements, relaxation space, professional spa photography, serene and peaceful environment",
    aspectRatio: '1:1'
  }
};

async function generateMissingImages() {
  console.log('🚀 Génération des images manquantes...\n');

  // Charger les résultats existants
  const resultsPath = path.join(__dirname, 'marketing-images-urls.json');
  let results = {};
  
  if (fs.existsSync(resultsPath)) {
    results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  }

  if (!results.marketing) {
    results.marketing = {};
  }

  // Générer les images manquantes
  for (const [key, config] of Object.entries(missingImages)) {
    console.log(`🎨 Génération de ${key}...`);
    const image = await generateImage(config.prompt, 'webp', config.aspectRatio);
    
    if (image) {
      const filename = `${key}-${Date.now()}.webp`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, image);
      results.marketing[key] = `/uploads/marketing/${filename}`;
      console.log(`✅ ${key} généré: ${filename}`);
    } else {
      console.log(`❌ Échec de génération pour ${key}`);
    }
    
    // Pause pour respecter les limites de l'API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Sauvegarder les résultats mis à jour
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Génération terminée !');
  console.log(`📁 Les URLs mises à jour sont dans: ${resultsPath}`);
}

// Exécuter
generateMissingImages()
  .then(() => {
    console.log('\n✨ Images manquantes générées avec succès !');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });
