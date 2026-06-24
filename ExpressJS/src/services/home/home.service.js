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

const getPromotions = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  return db.Promotion.findAll({
    where: {
      isActive: true
    },
    offset,
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

const getBestSellingProducts = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  return db.Product.findAndCountAll({
    offset,
    limit,
    order: [['sold', 'DESC']],
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId'],
    include: getProductInclude(),
    distinct: true
  });
};

const getAllProducts = async (options = {}) => {
  const { page = 1, limit = 12, search = '', sort = 'default' } = options;
  const offset = (page - 1) * limit;

  let order = [['createdAt', 'DESC']];
  if (sort === 'price-asc') order = [['price', 'ASC']];
  if (sort === 'price-desc') order = [['price', 'DESC']];

  let whereClause = {};
  if (search) {
    whereClause.name = {
      [db.Sequelize.Op.like]: `%${search}%`
    };
  }

  return db.Product.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order,
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId', 'createdAt'],
    include: getProductInclude(),
    distinct: true
  });
};

const getHomePageData = async () => {
  const [promotions, bestSellingProducts] = await Promise.all([
    getPromotions({ limit: 5 }),
    getBestSellingProducts({ page: 1, limit: 10 })
  ]);

  return {
    promotions,
    bestSellingProducts
  };
};

export default {
  getHomePageData,
  getPromotions,
  getBestSellingProducts,
  getAllProducts
};