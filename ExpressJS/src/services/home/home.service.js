'use strict';
import db from '../../entities/index.js';

const { Product, Brand } = db;
const { Op } = db.Sequelize;

const productAttributes = [
  'id',
  'name',
  'price',
  'thumbnail',
  'stock',
  'sold',
  'category',
  'brandId',
  'isActive',
  'createdAt',
  'updatedAt'
];

const productInclude = [
  {
    model: db.Brand,
    as: 'brand',
    attributes: ['id', 'name']
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
  console.log(db);
console.log('Promotion:', Promotion);
console.log('Product:', Product);
console.log('Brand:', Brand);
console.log('ProductImage:', ProductImage);

  return Promotion.findAll({
     where: {
      isActive: true
    },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'title', 'discountPercent', 'image', 'createdAt'],
    include: [
      {
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId'],
        include: productInclude,
        through: { attributes: [] }
      }
    ]
  });
};

const getBestSellingProducts = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  return Product.findAndCountAll({
    offset,
    limit,
    order: [['sold', 'DESC']],
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId'],
    include: productInclude,
    distinct: true
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
    whereClause.name = { [Op.iLike]: `%${search}%` };
  }

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

  return db.Product.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order,
    attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'sold', 'category', 'brandId', 'createdAt'],
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
