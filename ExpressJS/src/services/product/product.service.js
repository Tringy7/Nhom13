'use strict';
import db from '../../entities/index.js';

const getProductInclude = () => [
  {
    model: db.Brand,
    as: 'brand',
    attributes: ['id', 'name', 'logo']
  },
  {
    model: db.ProductImage,
    as: 'images',
    attributes: ['id', 'imageUrl']
  }
];

const getProductById = async (productId) => {
  return db.Product.findByPk(productId);
};

const getPromotions = async (limit = 5) => {
  return db.Promotion.findAll({
    where: {
      isActive: true
    },
    limit,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'description', 'discountRate', 'startDate', 'endDate', 'isActive', 'createdAt'],
    include: [
      {
        model: db.Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId'],
        include: getProductInclude(),
        through: { attributes: [] }
      }
    ]
  });
};

const getNewestProducts = async (limit = 10) => {
  return db.Product.findAll({
    limit,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId', 'createdAt'],
    include: getProductInclude()
  });
};

const getBestSellingProducts = async (limit = 10) => {
  return db.Product.findAll({
    limit,
    order: [['sold', 'DESC']],
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId'],
    include: getProductInclude()
  });
};

const getProductDetail = async (productId) => {
  return db.Product.findByPk(productId, {
    attributes: [
      'id',
      'name',
      'price',
      'thumbnail',
      'stock',
      'sold',
      'category',
      'brandId',
      'description',
      'createdAt',
      'updatedAt'
    ],
    include: getProductInclude()
  });
};

const getProductsByCategory = async (category, limit = 20) => {
  return db.Product.findAll({
    where: {
      category
    },
    limit,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId'],
    include: getProductInclude()
  });
};

export default {
  getProductDetail,
  getProductsByCategory,
  getProductById
};