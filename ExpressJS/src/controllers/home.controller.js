import homeService from '../services/home/home.service.js';
import db from '../entities/index.js';

const getHomePage = async (req, res) => {
  try {
    const data = await homeService.getHomePageData();
    return res.json({
      message: 'Home page data loaded successfully',
      data
    });
  } catch (error) {
    console.error('Home controller error:', error);
    return res.status(500).json({ message: 'Server error while loading home page data' });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await homeService.getBestSellingProducts({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
    return res.json({
      message: 'Best selling products loaded successfully',
      data
    });
  } catch (error) {
    console.error('Home controller error:', error);
    return res.status(500).json({ message: 'Server error while loading best selling products' });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      sort = 'default',
      category,      // string hoặc array: 'Gaming Laptops' | ['Gaming Laptops','Ultrabooks']
      brandId,       // number hoặc array: 1 | [1,2,3]
      minPrice,      // number
      maxPrice,      // number
      ram            // number hoặc array: 16 | [16,32]
    } = req.query;

    const data = await homeService.getAllProducts({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      sort,
      category,
      brandId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      ram
    });

    return res.json({
      message: 'All products loaded successfully',
      data
    });
  } catch (error) {
    console.error('Home controller error:', error);
    return res.status(500).json({ message: 'Server error while loading all products' });
  }
};

const getPublicBrands = async (req, res) => {
  try {
    const brands = await db.Brand.findAll({ order: [['name', 'ASC']] });
    return res.json({ success: true, data: brands });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách hãng' });
  }
};

const getPublicCategories = async (req, res) => {
  try {
    await db.Category.sync();
    const count = await db.Category.count();
    if (count === 0) {
      const { Op } = db.Sequelize;
      const rows = await db.Product.findAll({
        attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('category')), 'category']],
        where: { category: { [Op.ne]: null } },
        raw: true
      });
      const names = rows.map(r => r.category).filter(Boolean);
      for (const name of names) {
        await db.Category.findOrCreate({ where: { name: name.trim().toUpperCase() } });
      }
    }

    const categories = await db.Category.findAll({ order: [['name', 'ASC']] });
    const data = categories.map(c => c.name);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error in getPublicCategories:", error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh mục' });
  }
};

export default {
  getHomePage,
  getBestSellingProducts,
  getAllProducts,
  getPublicBrands,
  getPublicCategories
};
