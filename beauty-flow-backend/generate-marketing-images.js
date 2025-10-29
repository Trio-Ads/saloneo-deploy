const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration Stability AI
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || 'sk-0rPxRciQYj6okYo30O66DZ6FJg57Qn47rxzX1LbpJhAJrTRm';
const API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

// Créer les dossiers nécessaires
const uploadsDir = path.join(__dirname, 'uploads/marketing');
const logosDir = path.join(__dirname, 'uploads/logos');
const avatarsDir = path.join(__dirname, 'uploads/avatars');

[uploadsDir, logosDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Fonction pour générer une image
async function generateImage(prompt, outputFormat = 'webp', aspectRatio = '16:9') {
  try {
    console.log(`🎨 Génération de l'image: ${prompt.substring(0, 50)}...`);
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', outputFormat);
    formData.append('aspect_ratio', aspectRatio);

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*',
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Erreur génération:', error.response?.data || error.message);
    return null;
  }
}

// Prompts pour les images marketing
const marketingPrompts = {
  hero: {
    prompt: "Ultra-modern beauty salon interior in Algeria, luxurious marble floors with gold accents, comfortable styling chairs in royal blue, large mirrors with LED lighting, plants, minimalist design, high-end equipment, warm welcoming atmosphere, professional photography, bright natural lighting, 8k quality, architectural photography style, award-winning interior design",
    aspectRatio: '16:9'
  },
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

// Prompts pour le logo
const logoPrompts = {
  horizontal: {
    prompt: "Professional logo design for 'Saloneo', modern minimalist style, elegant flowing S lettermark with scissors integrated, gradient from deep blue (#4F46E5) to bright cyan (#06B6D4), clean vector design on white background, luxury brand aesthetic, suitable for beauty industry, horizontal layout with company name, award-winning logo design",
    aspectRatio: '16:9',
    outputFormat: 'png'
  },
  square: {
    prompt: "Professional square logo icon for 'Saloneo', minimalist S symbol with beauty elements, blue to cyan gradient (#4F46E5 to #06B6D4), app icon style, clean geometric design on white background, scalable vector aesthetic, premium brand identity",
    aspectRatio: '1:1',
    outputFormat: 'png'
  }
};

// Prompts pour les avatars
const avatarPrompts = [
  {
    prompt: "Professional portrait of successful Algerian woman salon owner, age 35, elegant business attire, confident warm smile, modern beauty salon background softly blurred, natural professional lighting, high-quality headshot photography",
    aspectRatio: '1:1'
  },
  {
    prompt: "Professional portrait of Algerian male barbershop owner, age 40, well-groomed beard, stylish professional attire, friendly confident expression, modern barbershop interior in background, professional portrait photography",
    aspectRatio: '1:1'
  },
  {
    prompt: "Professional portrait of Algerian woman spa manager, age 30, serene professional expression, elegant spa uniform, peaceful spa environment in soft focus background, natural lighting, professional headshot",
    aspectRatio: '1:1'
  }
];

// Fonction principale
async function generateAllImages() {
  console.log('🚀 Démarrage de la génération des images marketing avec Stability AI Ultra...\n');

  const results = {
    marketing: {},
    logos: {},
    avatars: []
  };

  // Générer les images marketing
  console.log('📸 Génération des images marketing...');
  for (const [key, config] of Object.entries(marketingPrompts)) {
    const image = await generateImage(config.prompt, 'webp', config.aspectRatio);
    if (image) {
      const filename = `${key}-${Date.now()}.webp`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, image);
      results.marketing[key] = `/uploads/marketing/${filename}`;
      console.log(`✅ ${key} généré: ${filename}`);
    }
    // Pause pour respecter les limites de l'API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Générer les logos
  console.log('\n🎨 Génération des logos...');
  for (const [key, config] of Object.entries(logoPrompts)) {
    const image = await generateImage(config.prompt, config.outputFormat, config.aspectRatio);
    if (image) {
      const filename = `saloneo-logo-${key}-${Date.now()}.png`;
      const filepath = path.join(logosDir, filename);
      fs.writeFileSync(filepath, image);
      results.logos[key] = `/uploads/logos/${filename}`;
      console.log(`✅ Logo ${key} généré: ${filename}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Générer les avatars
  console.log('\n👥 Génération des avatars...');
  for (let i = 0; i < avatarPrompts.length; i++) {
    const config = avatarPrompts[i];
    const image = await generateImage(config.prompt, 'webp', config.aspectRatio);
    if (image) {
      const filename = `avatar-${i + 1}-${Date.now()}.webp`;
      const filepath = path.join(avatarsDir, filename);
      fs.writeFileSync(filepath, image);
      results.avatars.push({
        url: `/uploads/avatars/${filename}`,
        index: i + 1
      });
      console.log(`✅ Avatar ${i + 1} généré: ${filename}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Sauvegarder les résultats
  const resultsPath = path.join(__dirname, 'marketing-images-urls.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n🎉 Génération terminée !');
  console.log(`📁 Les URLs des images sont sauvegardées dans: ${resultsPath}`);
  
  return results;
}

// Exécuter si appelé directement
if (require.main === module) {
  generateAllImages()
    .then(() => {
      console.log('\n✨ Toutes les images ont été générées avec succès !');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { generateAllImages, generateImage };
