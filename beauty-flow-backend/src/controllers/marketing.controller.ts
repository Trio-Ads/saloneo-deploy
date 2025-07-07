import { Request, Response } from 'express';
import { StabilityAIServiceExtended } from '../services/stabilityAI.service';
import path from 'path';
import fs from 'fs/promises';

const stabilityService = new StabilityAIServiceExtended();

// Cache pour les images générées
const imageCache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export const generateMarketingImages = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'marketing-images-v2';
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        images: cached.images,
        fromCache: true
      });
    }

    console.log('🎨 Génération des images marketing...');

    // Créer le dossier si nécessaire
    const uploadDir = path.join(__dirname, '../../uploads/marketing');
    await fs.mkdir(uploadDir, { recursive: true });

    // Générer les images marketing
    const images = {
      hero: await stabilityService.generateImageWithBase64(
        "Ultra-modern beauty salon interior in Algeria, luxurious and elegant, professional photography, bright natural lighting, marble floors, gold accents, comfortable styling chairs, large mirrors with LED lighting, plants, minimalist design, high-end equipment, warm welcoming atmosphere, 8k quality, architectural photography style",
        { width: 1920, height: 1080 }
      ),
      
      dashboard: await stabilityService.generateImageWithBase64(
        "Modern SaaS dashboard interface for beauty salon management, clean UI design, calendar view with appointments, client profiles, analytics charts, revenue graphs, team schedule, dark mode, purple and cyan color scheme, professional web design, Figma style, high resolution",
        { width: 1200, height: 800 }
      ),
      
      team: await stabilityService.generateImageWithBase64(
        "Professional beauty salon team in Algeria, diverse group of hairstylists and beauticians, wearing elegant uniforms, friendly smiles, modern salon background, professional photography, natural lighting, high quality portrait",
        { width: 1200, height: 800 }
      ),
      
      client: await stabilityService.generateImageWithBase64(
        "Happy female client getting hair styled in luxury beauty salon, relaxed atmosphere, professional hairstylist at work, modern salon interior, soft lighting, lifestyle photography, candid moment",
        { width: 800, height: 600 }
      ),
      
      barbershop: await stabilityService.generateImageWithBase64(
        "Modern barbershop interior in Algeria, masculine design, leather chairs, vintage and modern mix, barber tools display, wood and metal accents, professional lighting, urban style, high-end atmosphere",
        { width: 800, height: 600 }
      ),
      
      spa: await stabilityService.generateImageWithBase64(
        "Luxury spa treatment room, zen atmosphere, soft lighting, massage table, essential oils, candles, plants, minimalist design, relaxation space, professional spa photography",
        { width: 800, height: 600 }
      )
    };

    // Sauvegarder les images
    const savedImages: any = {};
    
    for (const [key, imageData] of Object.entries(images)) {
      if (imageData) {
        const filename = `${key}-${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);
        
        // Convertir base64 en buffer et sauvegarder
        const buffer = Buffer.from(imageData.base64, 'base64');
        await fs.writeFile(filepath, buffer);
        
        savedImages[key] = {
          url: `/uploads/marketing/${filename}`,
          width: imageData.width,
          height: imageData.height
        };
      }
    }

    // Mettre en cache
    imageCache.set(cacheKey, {
      images: savedImages,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      images: savedImages,
      fromCache: false
    });

  } catch (error) {
    console.error('Erreur génération images:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des images'
    });
  }
};

export const generateLogo = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'saloneo-logo-v2';
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        logo: cached.logo,
        fromCache: true
      });
    }

    console.log('🎨 Génération du logo Saloneo...');

    const uploadDir = path.join(__dirname, '../../uploads/logos');
    await fs.mkdir(uploadDir, { recursive: true });

    // Générer les deux versions du logo
    const logoHorizontal = await stabilityService.generateImageWithBase64(
      "Professional logo design for 'Saloneo', modern minimalist style, elegant S lettermark with flowing curves representing beauty and transformation, blue (#4F46E5) to cyan (#06B6D4) gradient, incorporates subtle scissors and beauty elements, luxury brand aesthetic, white background, vector style perfect for web and print, award-winning logo design, suitable for beauty salons, barber shops, and spas",
      { width: 400, height: 100 }
    );

    const logoSquare = await stabilityService.generateImageWithBase64(
      "Professional square logo icon for 'Saloneo', minimalist S symbol, blue to cyan gradient, beauty industry iconography, app icon style, clean geometric design, white background, scalable vector aesthetic",
      { width: 200, height: 200 }
    );

    const logos: any = {};

    // Sauvegarder version horizontale
    if (logoHorizontal) {
      const filename = `saloneo-logo-horizontal-${Date.now()}.png`;
      const filepath = path.join(uploadDir, filename);
      
      const buffer = Buffer.from(logoHorizontal.base64, 'base64');
      await fs.writeFile(filepath, buffer);
      
      logos.horizontal = {
        url: `/uploads/logos/${filename}`,
        width: logoHorizontal.width,
        height: logoHorizontal.height
      };
    }

    // Sauvegarder version carrée
    if (logoSquare) {
      const filename = `saloneo-logo-square-${Date.now()}.png`;
      const filepath = path.join(uploadDir, filename);
      
      const buffer = Buffer.from(logoSquare.base64, 'base64');
      await fs.writeFile(filepath, buffer);
      
      logos.square = {
        url: `/uploads/logos/${filename}`,
        width: logoSquare.width,
        height: logoSquare.height
      };
    }

    // Mettre en cache
    imageCache.set(cacheKey, {
      logo: logos,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      logo: logos,
      fromCache: false
    });

  } catch (error) {
    console.error('Erreur génération logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du logo'
    });
  }
};

// Endpoint pour tracker les visites
export const trackVisit = async (req: Request, res: Response) => {
  try {
    // Ici vous pouvez implémenter le tracking des visites
    // Par exemple, sauvegarder dans la base de données
    console.log('📊 Nouvelle visite sur la landing page');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur tracking visite:', error);
    res.status(500).json({ success: false });
  }
};

// Endpoint pour capturer les leads
export const captureLead = async (req: Request, res: Response) => {
  try {
    const { email, name, source } = req.body;
    
    // Ici vous pouvez sauvegarder le lead dans la base de données
    console.log('🎯 Nouveau lead capturé:', { email, name, source });
    
    // Pour l'instant, on retourne juste un succès
    res.json({ 
      success: true,
      message: 'Lead capturé avec succès'
    });
  } catch (error) {
    console.error('Erreur capture lead:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la capture du lead'
    });
  }
};

// Endpoint pour obtenir les avatars des témoignages
export const generateTestimonialAvatars = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'testimonial-avatars';
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        avatars: cached.avatars,
        fromCache: true
      });
    }

    console.log('🎨 Génération des avatars de témoignages...');

    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    await fs.mkdir(uploadDir, { recursive: true });

    // Générer 3 avatars
    const avatarPrompts = [
      "Professional portrait of Algerian woman, beauty salon owner, elegant, confident smile, professional photography, soft lighting, blurred salon background",
      "Professional portrait of Algerian man, barbershop owner, well-groomed beard, friendly expression, professional photography, barbershop background",
      "Professional portrait of Algerian woman, spa manager, serene expression, professional attire, soft lighting, spa interior background"
    ];

    const avatars = [];
    
    for (let i = 0; i < avatarPrompts.length; i++) {
      const avatarData = await stabilityService.generateImageWithBase64(
        avatarPrompts[i],
        { width: 200, height: 200 }
      );
      
      if (avatarData) {
        const filename = `avatar-${i + 1}-${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);
        
        const buffer = Buffer.from(avatarData.base64, 'base64');
        await fs.writeFile(filepath, buffer);
        
        avatars.push({
          url: `/uploads/avatars/${filename}`,
          index: i + 1
        });
      }
    }

    // Mettre en cache
    imageCache.set(cacheKey, {
      avatars,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      avatars,
      fromCache: false
    });

  } catch (error) {
    console.error('Erreur génération avatars:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des avatars'
    });
  }
};
