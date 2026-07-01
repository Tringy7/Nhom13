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

const getBestSellingProducts = async () => {
  return Product.findAll({
    limit: 8,
    order: [['sold', 'DESC']],
    where: { isActive: true },
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'isActive', 'brandId', 'createdAt'],
    include: productInclude,
  });
};

const getAllProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 12,
    search = '',
    sort = 'default',
    category,
    brandId,
    minPrice,
    maxPrice,
    ram
  } = options;

  const offset = (page - 1) * limit;
  const { Op } = db.Sequelize;

  // ── Sort ──────────────────────────────────────────────
  let order = [['createdAt', 'DESC']];
  if (sort === 'price-asc')    order = [['price', 'ASC']];
  if (sort === 'price-desc')   order = [['price', 'DESC']];
  if (sort === 'best-selling') order = [['sold', 'DESC']];

  // ── Where clause ──────────────────────────────────────
  const whereClause = { isActive: true };

  // Search theo tên
  if (search) {
    whereClause.name = { [Op.like]: `%${search}%` };  }

  // Filter category (hỗ trợ 1 giá trị hoặc mảng)
  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    whereClause.category = { [Op.in]: categories };
  }

  // Filter brandId (hỗ trợ 1 giá trị hoặc mảng)
  if (brandId) {
    const brandIds = Array.isArray(brandId)
        ? brandId.map(Number)
        : [Number(brandId)];
    whereClause.brandId = { [Op.in]: brandIds };
  }

  // Filter price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price[Op.gte] = minPrice;
    if (maxPrice !== undefined) whereClause.price[Op.lte] = maxPrice;
  }

  // Filter RAM (hỗ trợ 1 giá trị hoặc mảng)
  if (ram) {
    const rams = Array.isArray(ram) ? ram.map(Number) : [Number(ram)];
    whereClause.ram = { [Op.in]: rams };
  }

  return Product.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order,
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'isActive', 'brandId', 'ram', 'category', 'createdAt'],
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