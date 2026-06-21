'use strict';
import db from '../../entities/index.js';

// Updated imports to use the new models
const { Product, Brand, Category } = db;

const getProductDetail = async (productId) => {
  const product = await Product.findByPk(productId, {
    // Select the correct, simplified attributes
    attributes: [
      'id',
      'name',
      'price',
      'images', // Use 'images' instead of 'thumbnail'
      'stock',
      'status',
      'description',
      'categoryId',
      'brandId',
      'createdAt',
      'updatedAt'
    ],
    include: [
      {
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }

  return product;
};

// The other functions (getPromotions, getNewestProducts, getBestSellingProducts, getProductsByCategory)
// were removed as they were either obsolete due to model changes (Promotion) or redundant
// with the more advanced filtering in `home.service.js`.

export default {
  getProductDetail
};