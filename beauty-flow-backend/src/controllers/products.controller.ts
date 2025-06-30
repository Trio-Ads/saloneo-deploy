import { Response } from 'express';
import { Product, IProduct } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Obtenir tous les produits de l'utilisateur
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const { page = 1, limit = 50, search, unit, stockFilter } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire le filtre de recherche
    let filter: any = { userId, isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (unit && unit !== 'all') {
      filter.unit = unit;
    }

    // Filtre par stock
    if (stockFilter) {
      switch (stockFilter) {
        case 'low':
          filter.$expr = { $lte: ['$quantity', '$minQuantity'] };
          break;
        case 'out':
          filter.quantity = 0;
          break;
        case 'available':
          filter.$expr = { $gt: ['$quantity', '$minQuantity'] };
          break;
      }
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    logger.info(`📦 Produits récupérés pour l'utilisateur ${userId}: ${products.length}/${total}`);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits' });
  }
};

// Obtenir un produit par ID
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const product = await Product.findOne({ _id: id, userId, isActive: true });

    if (!product) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    logger.info(`📦 Produit récupéré: ${product.name} (${id})`);
    res.json({ product });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du produit' });
  }
};

// Créer un nouveau produit
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const { name, description, quantity, minQuantity, unit } = req.body;

    // Validation des données
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Le nom du produit est requis' });
      return;
    }

    if (quantity < 0 || minQuantity < 0) {
      res.status(400).json({ error: 'Les quantités ne peuvent pas être négatives' });
      return;
    }

    if (!unit || !['ml', 'g', 'unité', 'l', 'kg'].includes(unit)) {
      res.status(400).json({ error: 'Unité de mesure invalide' });
      return;
    }

    // Vérifier si un produit avec le même nom existe déjà
    const existingProduct = await Product.findOne({ 
      userId, 
      name: name.trim(), 
      isActive: true 
    });

    if (existingProduct) {
      res.status(400).json({ error: 'Un produit avec ce nom existe déjà' });
      return;
    }

    // Créer le produit
    const product = new Product({
      userId,
      name: name.trim(),
      description: description?.trim() || '',
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      unit,
      isActive: true
    });

    await product.save();

    logger.info(`✅ Nouveau produit créé: ${product.name} (${product._id}) par l'utilisateur ${userId}`);
    res.status(201).json({ 
      message: 'Produit créé avec succès',
      product 
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la création du produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du produit' });
  }
};

// Mettre à jour un produit
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const { name, description, quantity, minQuantity, unit } = req.body;

    // Validation des données
    if (name && !name.trim()) {
      res.status(400).json({ error: 'Le nom du produit ne peut pas être vide' });
      return;
    }

    if ((quantity !== undefined && quantity < 0) || (minQuantity !== undefined && minQuantity < 0)) {
      res.status(400).json({ error: 'Les quantités ne peuvent pas être négatives' });
      return;
    }

    if (unit && !['ml', 'g', 'unité', 'l', 'kg'].includes(unit)) {
      res.status(400).json({ error: 'Unité de mesure invalide' });
      return;
    }

    // Vérifier que le produit existe et appartient à l'utilisateur
    const product = await Product.findOne({ _id: id, userId, isActive: true });

    if (!product) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    // Vérifier l'unicité du nom si il est modifié
    if (name && name.trim() !== product.name) {
      const existingProduct = await Product.findOne({ 
        userId, 
        name: name.trim(), 
        isActive: true,
        _id: { $ne: id }
      });

      if (existingProduct) {
        res.status(400).json({ error: 'Un produit avec ce nom existe déjà' });
        return;
      }
    }

    // Mettre à jour les champs
    const updateData: Partial<IProduct> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (minQuantity !== undefined) updateData.minQuantity = Number(minQuantity);
    if (unit !== undefined) updateData.unit = unit;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`📝 Produit mis à jour: ${updatedProduct?.name} (${id}) par l'utilisateur ${userId}`);
    res.json({ 
      message: 'Produit mis à jour avec succès',
      product: updatedProduct 
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du produit' });
  }
};

// Supprimer un produit (soft delete)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const product = await Product.findOne({ _id: id, userId, isActive: true });

    if (!product) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    // Soft delete
    await Product.findByIdAndUpdate(id, { isActive: false });

    logger.info(`🗑️ Produit supprimé: ${product.name} (${id}) par l'utilisateur ${userId}`);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    logger.error('❌ Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du produit' });
  }
};

// Mettre à jour la quantité d'un produit
export const updateProductQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { quantityChange } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    if (typeof quantityChange !== 'number') {
      res.status(400).json({ error: 'Le changement de quantité doit être un nombre' });
      return;
    }

    const product = await Product.findOne({ _id: id, userId, isActive: true });

    if (!product) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    const newQuantity = Math.max(0, product.quantity + quantityChange);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity: newQuantity },
      { new: true, runValidators: true }
    );

    logger.info(`📊 Quantité mise à jour pour ${product.name}: ${product.quantity} → ${newQuantity} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);
    
    res.json({ 
      message: 'Quantité mise à jour avec succès',
      product: updatedProduct 
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour de la quantité:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la quantité' });
  }
};

// Obtenir les statistiques des produits
export const getProductStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      unitStats
    ] = await Promise.all([
      Product.countDocuments({ userId, isActive: true }),
      Product.countDocuments({ 
        userId, 
        isActive: true, 
        $expr: { $lte: ['$quantity', '$minQuantity'] }
      }),
      Product.countDocuments({ userId, isActive: true, quantity: 0 }),
      Product.aggregate([
        { $match: { userId: userId, isActive: true } },
        { $group: { _id: '$unit', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      total: totalProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      units: unitStats.length,
      unitBreakdown: unitStats
    };

    logger.info(`📊 Statistiques produits pour l'utilisateur ${userId}: ${JSON.stringify(stats)}`);
    res.json({ stats });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
};
