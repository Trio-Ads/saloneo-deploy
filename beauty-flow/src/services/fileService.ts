import api from './api';

const PUBLIC_URL = '/images';

export const fileService = {
  async uploadImage(file: File, type: string, id?: string): Promise<string> {
    try {
      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (id) {
        formData.append('id', id);
      }

      // Envoyer vers l'API backend avec la bonne route
      const response = await api.post(`/upload/single/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Retourner l'URL de l'image uploadée
      return response.data.file.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Fallback vers localStorage en cas d'erreur API
      return this.uploadImageToLocalStorage(file, type, id);
    }
  },

  // Méthode de fallback pour localStorage
  async uploadImageToLocalStorage(file: File, type: string, id?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          if (typeof reader.result === 'string') {
            // Générer une clé unique pour l'image
            const key = `image_${type}_${id || 'default'}_${Date.now()}`;
            
            // Stocker l'image en base64 dans le localStorage
            const imageData = {
              data: reader.result,
              type: file.type,
              lastModified: file.lastModified
            };
            
            localStorage.setItem(key, JSON.stringify(imageData));
            resolve(key);
          } else {
            throw new Error('Invalid image data');
          }
        } catch (error) {
          reject(new Error('Failed to process image'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  },

  getImageUrl(key: string): string {
    // Si c'est une URL complète, la retourner directement
    if (key.startsWith('http') || key.startsWith('/uploads/')) {
      return key;
    }

    try {
      // Essayer de récupérer depuis localStorage (fallback)
      const storedData = localStorage.getItem(key);
      if (!storedData) {
        console.warn(`Image not found for key: ${key}`);
        return `${PUBLIC_URL}/placeholder.jpg`;
      }

      const imageData = JSON.parse(storedData);
      return imageData.data;
    } catch (error) {
      console.error('Error retrieving image:', error);
      return `${PUBLIC_URL}/placeholder.jpg`;
    }
  },

  // Nouvelle méthode pour supprimer une image
  async deleteImage(url: string): Promise<void> {
    try {
      if (url.startsWith('/uploads/')) {
        await api.delete(`/upload${url}`);
      } else {
        // Supprimer du localStorage si c'est une clé locale
        localStorage.removeItem(url);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};
