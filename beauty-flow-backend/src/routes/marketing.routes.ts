import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Charger les URLs des images générées
const imagesUrlsPath = path.join(__dirname, '../../marketing-images-urls.json');
let generatedImages: any = {};

if (fs.existsSync(imagesUrlsPath)) {
  generatedImages = JSON.parse(fs.readFileSync(imagesUrlsPath, 'utf8'));
}

// Routes pour récupérer les images générées
router.get('/images/generate', (_req: Request, res: Response) => {
  res.json({
    success: true,
    images: generatedImages.marketing || {}
  });
});

router.get('/logo/generate', (_req: Request, res: Response) => {
  res.json({
    success: true,
    logo: generatedImages.logos || {}
  });
});

router.get('/avatars/generate', (_req: Request, res: Response) => {
  res.json({
    success: true,
    avatars: generatedImages.avatars || []
  });
});

router.post('/stats/visit', (_req: Request, res: Response) => {
  res.json({ success: true });
});

router.post('/lead/capture', (req: Request, res: Response) => {
  const { email, name, source } = req.body;
  console.log('🎯 Nouveau lead:', { email, name, source });
  res.json({ 
    success: true,
    message: 'Lead capturé avec succès'
  });
});

export default router;
