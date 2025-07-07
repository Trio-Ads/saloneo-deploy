import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';

interface StabilityAIConfig {
  apiKey: string;
  apiUrl: string;
  api3DUrl: string;
}

interface GenerateImageOptions {
  prompt: string;
  outputFormat?: 'webp' | 'png' | 'jpeg';
  aspectRatio?: string;
  seed?: number;
  style?: string;
}

interface Generate3DOptions {
  imagePath: string;
  outputFormat?: 'glb' | 'usdz';
}

export class StabilityAIService {
  private config: StabilityAIConfig;
  protected cacheDir: string;

  constructor() {
    this.config = {
      apiKey: process.env.STABILITY_API_KEY || 'sk-0rPxRciQYj6okYo30O66DZ6FJg57Qn47rxzX1LbpJhAJrTRm',
      apiUrl: 'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      api3DUrl: 'https://api.stability.ai/v2beta/3d/stable-fast-3d'
    };
    
    // Créer le dossier de cache pour les images et modèles 3D
    this.cacheDir = path.join(__dirname, '../../uploads/ai-images');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    // Créer le dossier pour les modèles 3D
    const cache3DDir = path.join(__dirname, '../../uploads/3d-models');
    if (!fs.existsSync(cache3DDir)) {
      fs.mkdirSync(cache3DDir, { recursive: true });
    }
  }

  /**
   * Génère une image avec Stability AI et retourne l'URL et le fichier
   */
  async generateImage(options: GenerateImageOptions): Promise<{ url: string; filename: string }> {
    try {
      const formData = new FormData();
      formData.append('prompt', options.prompt);
      formData.append('output_format', options.outputFormat || 'webp');
      
      if (options.aspectRatio) {
        formData.append('aspect_ratio', options.aspectRatio);
      }
      
      if (options.seed) {
        formData.append('seed', options.seed.toString());
      }

      const response = await axios.post(this.config.apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'image/*',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'
      });

      // Sauvegarder l'image
      const filename = `${uuidv4()}.${options.outputFormat || 'webp'}`;
      const filepath = path.join(this.cacheDir, filename);
      
      fs.writeFileSync(filepath, Buffer.from(response.data as ArrayBuffer));

      return {
        url: `/uploads/ai-images/${filename}`,
        filename
      };
    } catch (error) {
      console.error('Erreur lors de la génération d\'image:', error);
      throw new Error('Impossible de générer l\'image');
    }
  }

  /**
   * Génère un logo professionnel pour Saloneo
   */
  async generateSaloneoLogo() {
    try {
      const logo = await this.generateImage({
        prompt: "Professional logo design for 'Saloneo', modern minimalist style, elegant S lettermark with flowing curves representing beauty and transformation, blue (#4F46E5) to cyan (#06B6D4) gradient, incorporates subtle scissors and beauty elements, luxury brand aesthetic, white background, vector style perfect for web and print, award-winning logo design, suitable for beauty salons, barber shops, and spas",
        outputFormat: 'png',
        aspectRatio: '16:9'
      });

      // Générer aussi une version carrée pour les icônes
      const logoSquare = await this.generateImage({
        prompt: "Professional square logo icon for 'Saloneo', minimalist S symbol, blue to cyan gradient, beauty industry iconography, app icon style, clean geometric design, white background, scalable vector aesthetic",
        outputFormat: 'png',
        aspectRatio: '1:1'
      });

      return {
        horizontal: logo,
        square: logoSquare
      };
    } catch (error) {
      console.error('Erreur lors de la génération du logo:', error);
      throw error;
    }
  }

  /**
   * Génère les images marketing pour Saloneo
   */
  async generateMarketingImages() {
    const images = {
      logo: null as any,
      hero: null as any,
      dashboard: null as any,
      transformation: null as any,
      roi: null as any,
      security: null as any,
      testimonials: [] as any[]
    };

    try {
      // Hero Image
      images.hero = await this.generateImage({
        prompt: "Ultra-cinematic beauty salon scene, elegant Algerian businesswoman confidently using sleek tablet with modern interface, luxury salon interior with blue and teal ambient lighting, professional photography style, dramatic rim lighting, shot with Canon R5 85mm f/1.2, award-winning commercial photography, Vogue magazine quality, 8K ultra-detailed, photorealistic",
        outputFormat: 'webp',
        aspectRatio: '16:9'
      });

      // Dashboard Mockup
      images.dashboard = await this.generateImage({
        prompt: "Premium MacBook Pro displaying modern SaaS dashboard interface, floating holographic UI elements in blue-teal gradient, appointment calendar with elegant typography, modern software design, studio lighting, product photography perfection, tech commercial style, ultra-sharp details, minimalist aesthetic",
        outputFormat: 'webp',
        aspectRatio: '16:10'
      });

      // Transformation
      images.transformation = await this.generateImage({
        prompt: "Before/after split composition: left side shows chaotic paper appointment book and stressed salon owner, right side shows same person smiling confidently with tablet showing modern interface, dramatic lighting contrast, cinematic storytelling, commercial advertising photography, emotional impact, professional business photography",
        outputFormat: 'webp',
        aspectRatio: '16:9'
      });

      // ROI Visualization
      images.roi = await this.generateImage({
        prompt: "3D isometric illustration of money growth, blue-teal gradient coins floating upward from small investment to large returns, financial success visualization, premium fintech design, clean minimalist style, award-winning infographic design, ultra-modern aesthetic, glass morphism effects",
        outputFormat: 'webp',
        aspectRatio: '1:1'
      });

      // Security
      images.security = await this.generateImage({
        prompt: "Digital payment security visualization, shield with Algerian flag elements integrated with digital security badges, blue-teal gradient, trust badges floating in space, premium fintech design, 3D rendered perfection, modern cryptographic elements, professional trust symbols",
        outputFormat: 'webp',
        aspectRatio: '4:3'
      });

      // Testimonials (3 différents)
      const testimonialPrompts = [
        "Professional portrait of successful Algerian salon owner, confident smile, modern salon background, natural lighting, authentic business portrait, wearing elegant professional attire, age 35-40, warm expression",
        "Elegant Algerian businesswoman in her beauty salon, looking at tablet with satisfaction, modern interior, professional headshot style, natural makeup, confident posture, age 30-35",
        "Successful male barber shop owner, Algerian features, modern barbershop background, professional portrait, confident expression, stylish professional attire, age 40-45"
      ];

      for (const prompt of testimonialPrompts) {
        const testimonial = await this.generateImage({
          prompt,
          outputFormat: 'webp',
          aspectRatio: '1:1'
        });
        images.testimonials.push(testimonial);
      }

      return images;
    } catch (error) {
      console.error('Erreur lors de la génération des images marketing:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une image existe déjà dans le cache
   */
  checkCache(filename: string): boolean {
    const filepath = path.join(this.cacheDir, filename);
    return fs.existsSync(filepath);
  }

  /**
   * Génère un modèle 3D à partir d'une image
   */
  async generate3DModel(options: Generate3DOptions): Promise<{ url: string; filename: string }> {
    try {
      const formData = new FormData();
      const imageBuffer = fs.readFileSync(options.imagePath);
      formData.append('image', imageBuffer, path.basename(options.imagePath));

      const response = await axios.post(this.config.api3DUrl, formData, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'
      });

      // Sauvegarder le modèle 3D
      const filename = `${uuidv4()}.${options.outputFormat || 'glb'}`;
      const filepath = path.join(__dirname, '../../uploads/3d-models', filename);
      
      fs.writeFileSync(filepath, Buffer.from(response.data as ArrayBuffer));

      return {
        url: `/uploads/3d-models/${filename}`,
        filename
      };
    } catch (error) {
      console.error('Erreur lors de la génération du modèle 3D:', error);
      throw new Error('Impossible de générer le modèle 3D');
    }
  }

  /**
   * Génère les modèles 3D marketing pour Saloneo
   */
  async generateMarketing3DModels() {
    const models3D = {
      logo: null as any,
      calendar: null as any,
      analytics: null as any,
      creditCard: null as any,
      shield: null as any,
      chair: null as any,
      products: [] as any[]
    };

    try {
      // D'abord générer les images de base pour la conversion 3D
      
      // Logo 3D
      const logoImage = await this.generateImage({
        prompt: "Saloneo logo, minimalist S letter design, blue and teal gradient, clean geometric shape, white background, flat design perfect for 3D extrusion, vector style",
        outputFormat: 'png',
        aspectRatio: '1:1'
      });
      models3D.logo = await this.generate3DModel({
        imagePath: path.join(this.cacheDir, logoImage.filename)
      });

      // Calendrier 3D
      const calendarImage = await this.generateImage({
        prompt: "Modern calendar icon, blue gradient, minimalist design, isometric view, clean lines, white background, perfect for 3D conversion",
        outputFormat: 'png',
        aspectRatio: '1:1'
      });
      models3D.calendar = await this.generate3DModel({
        imagePath: path.join(this.cacheDir, calendarImage.filename)
      });

      // Analytics 3D
      const analyticsImage = await this.generateImage({
        prompt: "Analytics chart icon, bar graph with upward trend, blue teal gradient, isometric design, white background, clean geometric shapes",
        outputFormat: 'png',
        aspectRatio: '1:1'
      });
      models3D.analytics = await this.generate3DModel({
        imagePath: path.join(this.cacheDir, analyticsImage.filename)
      });

      // Carte de crédit 3D
      const creditCardImage = await this.generateImage({
        prompt: "Credit card icon, modern payment card design, blue gradient, chip visible, minimalist style, white background, isometric angle",
        outputFormat: 'png',
        aspectRatio: '16:10'
      });
      models3D.creditCard = await this.generate3DModel({
        imagePath: path.join(this.cacheDir, creditCardImage.filename)
      });

      // Bouclier de sécurité 3D
      const shieldImage = await this.generateImage({
        prompt: "Security shield icon, modern cyber security badge, blue teal gradient, checkmark in center, geometric design, white background",
        outputFormat: 'png',
        aspectRatio: '1:1'
      });
      models3D.shield = await this.generate3DModel({
        imagePath: path.join(this.cacheDir, shieldImage.filename)
      });

      // Fauteuil de salon 3D
      const chairImage = await this.generateImage({
        prompt: "Modern salon chair, luxury barber chair, black leather with chrome details, side view, white background, professional equipment",
        outputFormat: 'png',
        aspectRatio: '1:1'
      });
      models3D.chair = await this.generate3DModel({
        imagePath: path.join(this.cacheDir, chairImage.filename)
      });

      // Produits de beauté 3D
      const productPrompts = [
        "Luxury shampoo bottle, minimalist design, blue gradient label, pump dispenser, white background",
        "Hair spray can, professional salon product, metallic finish, blue accents, white background",
        "Beauty cream jar, premium packaging, glass container, blue lid, minimalist design, white background"
      ];

      for (const prompt of productPrompts) {
        const productImage = await this.generateImage({
          prompt,
          outputFormat: 'png',
          aspectRatio: '1:1'
        });
        const product3D = await this.generate3DModel({
          imagePath: path.join(this.cacheDir, productImage.filename)
        });
        models3D.products.push(product3D);
      }

      return models3D;
    } catch (error) {
      console.error('Erreur lors de la génération des modèles 3D marketing:', error);
      throw error;
    }
  }

  /**
   * Nettoie le cache des images anciennes (plus de 30 jours)
   */
  cleanCache() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    fs.readdirSync(this.cacheDir).forEach(file => {
      const filepath = path.join(this.cacheDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filepath);
      }
    });
  }
}

export const stabilityAI = new StabilityAIService();

// Nouvelle méthode pour le marketing controller
export class StabilityAIServiceExtended extends StabilityAIService {
  /**
   * Génère une image et retourne avec base64 pour le marketing
   */
  async generateImageWithBase64(prompt: string, options?: { width?: number; height?: number }): Promise<{ base64: string; width: number; height: number } | null> {
    try {
      // Calculer l'aspect ratio basé sur width/height
      let aspectRatio = '16:9'; // par défaut
      if (options?.width && options?.height) {
        const ratio = options.width / options.height;
        if (Math.abs(ratio - 1) < 0.1) aspectRatio = '1:1';
        else if (Math.abs(ratio - 16/9) < 0.1) aspectRatio = '16:9';
        else if (Math.abs(ratio - 16/10) < 0.1) aspectRatio = '16:10';
        else if (Math.abs(ratio - 4/3) < 0.1) aspectRatio = '4:3';
      }

      const result = await this.generateImage({
        prompt,
        outputFormat: 'png',
        aspectRatio
      });

      // Lire le fichier et le convertir en base64
      const filepath = path.join(this.cacheDir, result.filename);
      const buffer = fs.readFileSync(filepath);
      const base64 = buffer.toString('base64');

      return {
        base64,
        width: options?.width || 1920,
        height: options?.height || 1080
      };
    } catch (error) {
      console.error('Erreur génération image avec base64:', error);
      return null;
    }
  }
}
