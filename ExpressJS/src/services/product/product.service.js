'use strict';
import db from '../../entities/index.js';

const { Product, Brand } = db;

const getProductDetail = async (productId) => {
  const product = await Product.findByPk(productId, {
    // Select the correct, simplified attributes
    attributes: [
      'id',
      'name',
      'price',
      'thumbnail',
      'stock',
      'sold',
      'description',
      'ram',
      'category',
      'brandId',
      'isActive',
      'createdAt',
      'updatedAt'
    ],
    include: [
      {
        model: Brand,
        as: 'brand',
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
