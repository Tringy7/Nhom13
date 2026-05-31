import productService from '../services/product/product.service.js';
  
const getProductDetail = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await productService.getProductDetail(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Product detail loaded successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Product controller error:', error);
    return res.status(500).json({ message: 'Server error while loading product detail' });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const products = await productService.getProductsByCategory(category, 20);

    return res.json({
      message: 'Products by category loaded successfully',
      data: {
        category,
        products
      }
    });
  } catch (error) {
    console.error('Product controller error:', error);
    return res.status(500).json({ message: 'Server error while loading products by category' });
  }
};

export default {
  getProductDetail,
  getProductsByCategory
};