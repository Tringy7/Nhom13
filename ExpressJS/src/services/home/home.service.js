'use strict';
import db from '../../entities/index.js';

const { Product, Brand } = db;

// Simplified include for product queries
const productInclude = [
  {
    model: Brand,
    as: 'brand',
    attributes: ['id', 'name']
  }
];

// This function is no longer relevant as Promotion model is removed.
// It can be replaced with fetching banners or other featured content if needed.
const getFeaturedContent = async () => {
  // Placeholder for future implementation (e.g., fetching banners)
  return [];
};

const getBestSellingProducts = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  
  // The concept of "best-selling" (sold field) was removed for simplification.
  // We will order by creation date as a substitute.
  // A more advanced implementation could calculate sales from the OrderDetail table.
  return Product.findAndCountAll({
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'price', 'images', 'stock', 'status', 'brandId'],
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

  let whereClause = {};
  if (search) {
    whereClause.name = {
      [db.Sequelize.Op.iLike]: `%${search}%` // Use iLike for case-insensitive search
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
    attributes: ['id', 'name', 'price', 'images', 'stock', 'status', 'brandId'],
    include: productInclude,
    distinct: true
  });
};

const getHomePageData = async () => {
  // Fetch best-selling (or newest) products for the home page
  const [bestProducts] = await Promise.all([
    getBestSellingProducts({ page: 1, limit: 10 })
  ]);

  return {
    // promotions field is removed
    bestSellingProducts: bestProducts
  };
};

export default {
  getHomePageData,
  getBestSellingProducts,
  getAllProducts
};