'use strict';
import db from '../../entities/index.js';

const { Product, Brand, ProductImage, Promotion } = db;

const getProductDetail = async (productId) => {
  const product = await Product.findByPk(productId, {
    attributes: [
      'id',
      'name',
      'price',
      'description',
      'stock',
      'sold',
      'thumbnail',
      'ram',
      'category',
      'isActive',
      'brandId'
    ],
    include: [
      {
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name']
      },
      {
        model: ProductImage,
        as: 'images',
        attributes: ['imageUrl']
      },
      {
        model: Promotion,
        as: 'promotions',
        attributes: ['id', 'name', 'description', 'discountRate', 'startDate', 'endDate', 'isActive'],
        through: { attributes: [] }
      }
    ]
  });

  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }

  return product;
};

export default {
  getProductDetail
};