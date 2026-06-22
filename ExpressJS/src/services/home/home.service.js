'use strict';
import db from '../../entities/index.js';

const { Product, Brand, ProductImage, Promotion } = db;

// Update include for product queries
const productInclude = [
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
    through: { attributes: [] } // Exclude join table attributes
  }
];

const getBestSellingProducts = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  
  // Use the 'sold' field for "best-selling"
  return Product.findAndCountAll({
    offset,
    limit,
    order: [['sold', 'DESC']],
    where: { isActive: true },
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'isActive', 'brandId', 'createdAt'],
    include: productInclude,
    distinct: true
  });
};

const getAllProducts = async (options = {}) => {
  const { page = 1, limit = 12, search = '', sort = 'default', brandId } = options;
  const offset = (page - 1) * limit;

  let order = [['createdAt', 'DESC']];
  if (sort === 'price-asc') order = [['price', 'ASC']];
  if (sort === 'price-desc') order = [['price', 'DESC']];
  if (sort === 'best-selling') order = [['sold', 'DESC']];

  let whereClause = { isActive: true };
  if (search) {
    whereClause.name = {
      [db.Sequelize.Op.iLike]: `%${search}%`
    };
  }
  if (brandId) {
    whereClause.brandId = brandId;
  }

  return Product.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order,
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'isActive', 'brandId', 'createdAt'],
    include: productInclude,
    distinct: true
  });
};

const getHomePageData = async () => {
  const [bestSellingProducts, promotions] = await Promise.all([
    getBestSellingProducts({ page: 1, limit: 10 }),
    Promotion.findAll({ where: { isActive: true }, limit: 4 })
  ]);

  return {
    promotions,
    bestSellingProducts
  };
};

export default {
  getHomePageData,
  getBestSellingProducts,
  getAllProducts
};