export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizedImage {
  blob: Blob;
  url: string;
  dimensions: ImageDimensions;
  quality: number;
}

export class ImageOptimizer {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  private static getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', { 
        alpha: true,
        willReadFrequently: false 
      });
      
      if (!this.ctx) {
        throw new Error('Impossible de créer le contexte canvas');
      }
    }
    
    return { canvas: this.canvas, ctx: this.ctx! };
  }

  /**
   * Redimensionne une image aux dimensions exactes recommandées
   * tout en conservant la qualité maximale
   */
  static async resizeToExactDimensions(
    file: File, 
    targetDimensions: ImageDimensions,
    quality: number = 0.95
  ): Promise<OptimizedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const { canvas, ctx } = this.getCanvas();
          
          // Définir les dimensions exactes du canvas
          canvas.width = targetDimensions.width;
          canvas.height = targetDimensions.height;
          
          // Nettoyer le canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculer le ratio pour maintenir les proportions
          const sourceRatio = img.width / img.height;
          const targetRatio = targetDimensions.width / targetDimensions.height;
          
          let drawWidth, drawHeight, offsetX, offsetY;
          
          if (sourceRatio > targetRatio) {
            // Image plus large que le ratio cible
            drawHeight = targetDimensions.height;
            drawWidth = drawHeight * sourceRatio;
            offsetX = (targetDimensions.width - drawWidth) / 2;
            offsetY = 0;
          } else {
            // Image plus haute que le ratio cible
            drawWidth = targetDimensions.width;
            drawHeight = drawWidth / sourceRatio;
            offsetX = 0;
            offsetY = (targetDimensions.height - drawHeight) / 2;
          }
          
          // Appliquer un filtre de lissage pour une meilleure qualité
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Dessiner l'image redimensionnée
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          // Convertir en blob avec qualité maximale
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Impossible de créer le blob'));
                return;
              }
              
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                dimensions: targetDimensions,
                quality
              });
            },
            'image/png', // PNG pour éviter la compression JPEG
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Optimise une image en conservant ses proportions originales
   * mais en limitant la taille maximale
   */
  static async optimizeImage(
    file: File,
    maxDimensions: ImageDimensions,
    quality: number = 0.95
  ): Promise<OptimizedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const { canvas, ctx } = this.getCanvas();
          
          // Calculer les nouvelles dimensions en conservant le ratio
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (newWidth > maxDimensions.width) {
            newHeight = (newHeight * maxDimensions.width) / newWidth;
            newWidth = maxDimensions.width;
          }
          
          if (newHeight > maxDimensions.height) {
            newWidth = (newWidth * maxDimensions.height) / newHeight;
            newHeight = maxDimensions.height;
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Impossible de créer le blob'));
                return;
              }
              
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                dimensions: { width: newWidth, height: newHeight },
                quality
              });
            },
            'image/png',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Valide les dimensions d'une image
   */
  static async validateImageDimensions(
    file: File,
    expectedDimensions: ImageDimensions,
    tolerance: number = 0.1
  ): Promise<{ isValid: boolean; actualDimensions: ImageDimensions; message?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const actualDimensions = { width: img.width, height: img.height };
        
        const widthDiff = Math.abs(img.width - expectedDimensions.width) / expectedDimensions.width;
        const heightDiff = Math.abs(img.height - expectedDimensions.height) / expectedDimensions.height;
        
        const isValid = widthDiff <= tolerance && heightDiff <= tolerance;
        
        let message;
        if (!isValid) {
          message = `Dimensions actuelles: ${img.width}x${img.height}px. Recommandées: ${expectedDimensions.width}x${expectedDimensions.height}px`;
        }
        
        resolve({
          isValid,
          actualDimensions,
          message
        });
      };
      
      img.onerror = () => {
        resolve({
          isValid: false,
          actualDimensions: { width: 0, height: 0 },
          message: 'Impossible de lire les dimensions de l\'image'
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Génère une image placeholder de haute qualité
   */
  static generatePlaceholder(
    dimensions: ImageDimensions,
    text: string = 'Image',
    backgroundColor: string = '#f3f4f6',
    textColor: string = '#6b7280'
  ): string {
    const { canvas, ctx } = this.getCanvas();
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Fond
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texte
    ctx.fillStyle = textColor;
    ctx.font = `${Math.min(dimensions.width, dimensions.height) / 8}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Dimensions
    ctx.font = `${Math.min(dimensions.width, dimensions.height) / 12}px Arial, sans-serif`;
    ctx.fillText(
      `${dimensions.width}x${dimensions.height}px`,
      canvas.width / 2,
      canvas.height / 2 + Math.min(dimensions.width, dimensions.height) / 6
    );
    
    return canvas.toDataURL('image/png', 1.0);
  }

  /**
   * Nettoie les URLs d'objets créées
   */
  static cleanup(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
