import express from 'express';
import { authenticate, checkLimits } from '../middleware/auth';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductQuantity,
  getProductStats
} from '../controllers/products.controller';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes CRUD pour les produits
router.get('/', getProducts);                    // GET /api/products
router.get('/stats', getProductStats);           // GET /api/products/stats
router.get('/:id', getProductById);              // GET /api/products/:id
router.post('/', checkLimits('products'), createProduct);  // POST /api/products (avec limite)
router.put('/:id', updateProduct);               // PUT /api/products/:id
router.delete('/:id', deleteProduct);            // DELETE /api/products/:id

// Route spéciale pour mettre à jour la quantité
router.patch('/:id/quantity', updateProductQuantity); // PATCH /api/products/:id/quantity

export default router;
