import db from "../../entities/index.js";

// Helper to secure models from db
const getModels = () => {
    const {
        Product, Brand, ProductImage, Order, OrderDetail, User,
        Voucher, Promotion, PromotionProduct, OrderCancellationRequest,
        OrderStatusHistory, Payment, Category, Sequelize
    } = db;
    return {
        Product, Brand, ProductImage, Order, OrderDetail, User,
        Voucher, Promotion, PromotionProduct, OrderCancellationRequest,
        OrderStatusHistory, Payment, Category, Sequelize,
        sequelize: db.sequelize
    };
};

/* =========================================================================
   PRODUCTS
   ========================================================================= */

const getProducts = async (query = {}) => {
    const { Product, Brand, ProductImage, Sequelize } = getModels();
    const { Op } = Sequelize;
    const { search, category, brandId, isActive, page = 1, limit = 10 } = query;

    const where = {};
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }
    if (category) {
        where.category = category;
    }
    if (brandId) {
        where.brandId = brandId;
    }
    if (isActive !== undefined) {
        where.isActive = isActive === 'true' || isActive === true;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
            { model: Brand, as: 'brand', attributes: ['id', 'name'] },
            { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl'] }
        ],
        distinct: true,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    return {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        products: rows
    };
};

const getProductDetail = async (id) => {
    const { Product, Brand, ProductImage } = getModels();
    return await Product.findByPk(id, {
        include: [
            { model: Brand, as: 'brand' },
            { model: ProductImage, as: 'images' }
        ]
    });
};

const createProduct = async (data, files = []) => {
    const { Product, ProductImage, sequelize } = getModels();
    const t = await sequelize.transaction();

    try {
        const { name, price, description, stock, category, brandId, ram, isActive } = data;
        
        let thumbnail = null;
        if (files && files.length > 0) {
            thumbnail = `/uploads/products/${files[0].filename}`;
        }

        const product = await Product.create({
            name,
            price: parseFloat(price || 0),
            description,
            stock: parseInt(stock || 0),
            sold: 0,
            thumbnail,
            ram: ram ? parseInt(ram) : null,
            category,
            brandId: parseInt(brandId),
            isActive: isActive === 'true' || isActive === true || isActive === undefined
        }, { transaction: t });

        // Save additional images if provided
        if (files && files.length > 0) {
            const imageRecords = files.map(file => ({
                productId: product.id,
                imageUrl: `/uploads/products/${file.filename}`
            }));
            await ProductImage.bulkCreate(imageRecords, { transaction: t });
        }

        await t.commit();
        return await getProductDetail(product.id);
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const updateProduct = async (id, data, files = []) => {
    const { Product, ProductImage, sequelize } = getModels();
    const t = await sequelize.transaction();

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }

        const { name, price, description, stock, category, brandId, ram, isActive, deleteExistingImages } = data;

        const updateFields = {
            name: name !== undefined ? name : product.name,
            price: price !== undefined ? parseFloat(price) : product.price,
            description: description !== undefined ? description : product.description,
            stock: stock !== undefined ? parseInt(stock) : product.stock,
            ram: ram !== undefined ? (ram ? parseInt(ram) : null) : product.ram,
            category: category !== undefined ? category : product.category,
            brandId: brandId !== undefined ? parseInt(brandId) : product.brandId,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive
        };

        if (files && files.length > 0) {
            updateFields.thumbnail = `/uploads/products/${files[0].filename}`;
        }

        await product.update(updateFields, { transaction: t });

        if (deleteExistingImages === 'true' || deleteExistingImages === true) {
            await ProductImage.destroy({ where: { productId: id } }, { transaction: t });
        }

        if (files && files.length > 0) {
            const imageRecords = files.map(file => ({
                productId: product.id,
                imageUrl: `/uploads/products/${file.filename}`
            }));
            await ProductImage.bulkCreate(imageRecords, { transaction: t });
        }

        await t.commit();
        return await getProductDetail(id);
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const deleteProduct = async (id) => {
    const { Product, OrderDetail } = getModels();
    const product = await Product.findByPk(id);
    if (!product) {
        throw new Error("Sản phẩm không tồn tại");
    }

    // Check if product is in any orders
    const hasOrders = await OrderDetail.findOne({ where: { productId: id } });
    if (hasOrders) {
        throw new Error("Không thể xóa sản phẩm này vì đã có đơn hàng mua sản phẩm này. Hãy dùng chức năng ẩn sản phẩm thay thế.");
    }

    await Product.destroy({ where: { id } });
    return { success: true, message: "Xóa sản phẩm thành công" };
};

const toggleProductActive = async (id) => {
    const { Product } = getModels();
    const product = await Product.findByPk(id);
    if (!product) {
        throw new Error("Sản phẩm không tồn tại");
    }
    await product.update({ isActive: !product.isActive });
    return product;
};

/* =========================================================================
   BRANDS & CATEGORIES
   ========================================================================= */

const getBrands = async () => {
    const { Brand } = getModels();
    return await Brand.findAll({ order: [['name', 'ASC']] });
};

const createBrand = async (data) => {
    const { Brand } = getModels();
    const { name, logo } = data;
    return await Brand.create({ name, logo });
};

const updateBrand = async (id, data) => {
    const { Brand } = getModels();
    const brand = await Brand.findByPk(id);
    if (!brand) throw new Error("Thương hiệu không tồn tại");
    return await brand.update(data);
};

const deleteBrand = async (id) => {
    const { Brand, Product } = getModels();
    const associatedProducts = await Product.findOne({ where: { brandId: id } });
    if (associatedProducts) {
        throw new Error("Không thể xóa thương hiệu này vì đang có sản phẩm liên kết.");
    }
    await Brand.destroy({ where: { id } });
    return { success: true };
};

const ensureCategoriesTable = async () => {
    const { Category, Product, Sequelize } = getModels();
    await Category.sync();
    // Seed from Product unique categories if Category table is empty
    const count = await Category.count();
    if (count === 0) {
        const categories = await Product.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']
            ],
            where: {
                category: {
                    [Sequelize.Op.ne]: null
                }
            },
            raw: true
        });
        const names = categories.map(c => c.category).filter(Boolean);
        for (const name of names) {
            await Category.findOrCreate({ where: { name: name.trim().toUpperCase() } });
        }
    }
};

const ensureOrderStatusHistoryTable = async () => {
    const { OrderStatusHistory } = getModels();
    await OrderStatusHistory.sync();
};

const getCategories = async () => {
    const { Category } = getModels();
    await ensureCategoriesTable();
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return categories.map(c => c.name);
};

const createCategory = async (name) => {
    const { Category } = getModels();
    await ensureCategoriesTable();
    if (!name || !name.trim()) throw new Error('Tên danh mục không hợp lệ');
    const normalized = name.trim().toUpperCase();
    const [category, created] = await Category.findOrCreate({
        where: { name: normalized }
    });
    if (!created) throw new Error('Danh mục đã tồn tại');
    return category;
};

const updateCategory = async (oldName, newName) => {
    const { Category, Product } = getModels();
    await ensureCategoriesTable();
    if (!newName || !newName.trim()) throw new Error('Tên danh mục mới không hợp lệ');
    const normalized = newName.trim().toUpperCase();

    // Check if new category already exists
    const exists = await Category.findOne({ where: { name: normalized } });
    if (exists && normalized !== oldName) {
        throw new Error('Tên danh mục mới đã tồn tại');
    }

    // Update Category record
    await Category.update({ name: normalized }, { where: { name: oldName } });

    // Update associated products
    await Product.update(
        { category: normalized },
        { where: { category: oldName } }
    );
    return { oldName, newName: normalized };
};

const deleteCategory = async (name) => {
    const { Category, Product } = getModels();
    await ensureCategoriesTable();

    // Delete from category master list
    await Category.destroy({ where: { name } });

    // Set category to null for associated products
    await Product.update(
        { category: null },
        { where: { category: name } }
    );
    return { success: true };
};



/* =========================================================================
   ORDERS
   ========================================================================= */

const getOrders = async (query = {}) => {
    const { Order, User, Sequelize } = getModels();
    const { status, page = 1, limit = 10 } = query;

    const where = {};
    if (status) {
        where.orderStatus = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
            { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
            { model: User, as: 'shipper', attributes: ['id', 'fullName', 'phone'] }
        ],
        distinct: true,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    return {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        orders: rows
    };
};

const getOrderById = async (id) => {
    const { Order, User, OrderDetail, Product, Payment } = getModels();
    return await Order.findByPk(id, {
        include: [
            { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
            { model: User, as: 'shipper', attributes: ['id', 'fullName', 'phone'] },
            { 
                model: OrderDetail, 
                as: 'details',
                include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail', 'price'] }]
            },
            { model: Payment, as: 'payment' }
        ]
    });
};

const updateOrderStatus = async (id, status, notes = "", adminId = null) => {
    const { Order, OrderStatusHistory, sequelize } = getModels();
    await ensureOrderStatusHistoryTable();
    const t = await sequelize.transaction();

    try {
        const order = await Order.findByPk(id);
        if (!order) {
            throw new Error("Đơn hàng không tồn tại");
        }

        const oldStatus = order.orderStatus;
        await order.update({ orderStatus: status }, { transaction: t });

        await OrderStatusHistory.create({
            orderId: id,
            status,
            note: notes || `Trạng thái đơn hàng thay đổi từ ${oldStatus} sang ${status}`,
            changedBy: adminId
        }, { transaction: t });

        await t.commit();
        return await getOrderById(id);
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const assignShipper = async (id, shipperId, shipperFee = 30000, adminId = null) => {
    const { Order, OrderStatusHistory, User, sequelize } = getModels();
    await ensureOrderStatusHistoryTable();
    const t = await sequelize.transaction();

    try {
        const order = await Order.findByPk(id);
        if (!order) {
            throw new Error("Đơn hàng không tồn tại");
        }

        const shipper = await User.findOne({ where: { id: shipperId, role: 'SHIPPER' } });
        if (!shipper) {
            throw new Error("Không tìm thấy shipper hợp lệ");
        }

        await order.update({
            shipperId: parseInt(shipperId),
            shipperFee: parseFloat(shipperFee),
            orderStatus: 'SHIPPING'
        }, { transaction: t });

        await OrderStatusHistory.create({
            orderId: id,
            status: 'SHIPPING',
            note: `Giao shipper ${shipper.fullName} vận chuyển đơn hàng.`,
            changedBy: adminId
        }, { transaction: t });

        await t.commit();
        return await getOrderById(id);
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getShippers = async () => {
    const { User } = getModels();
    return await User.findAll({
        where: { role: 'SHIPPER' },
        attributes: ['id', 'fullName', 'email', 'phone', 'status']
    });
};

/* =========================================================================
   VOUCHERS
   ========================================================================= */

const getVouchers = async () => {
    const { Voucher } = getModels();
    return await Voucher.findAll({ order: [['createdAt', 'DESC']] });
};

const createVoucher = async (data) => {
    const { Voucher } = getModels();
    return await Voucher.create(data);
};

const updateVoucher = async (id, data) => {
    const { Voucher } = getModels();
    const voucher = await Voucher.findByPk(id);
    if (!voucher) throw new Error("Voucher không tồn tại");
    return await voucher.update(data);
};

const deleteVoucher = async (id) => {
    const { Voucher } = getModels();
    await Voucher.destroy({ where: { id } });
    return { success: true };
};

/* =========================================================================
   PROMOTIONS
   ========================================================================= */

const getPromotions = async () => {
    const { Promotion, Product } = getModels();
    return await Promotion.findAll({
        include: [{ model: Product, as: 'products', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
    });
};

const createPromotion = async (data) => {
    const { Promotion, PromotionProduct, sequelize } = getModels();
    const t = await sequelize.transaction();

    try {
        const { name, description, discountRate, startDate, endDate, productIds } = data;

        const promotion = await Promotion.create({
            name,
            description,
            discountRate: parseInt(discountRate),
            startDate,
            endDate,
            isActive: true
        }, { transaction: t });

        if (productIds && productIds.length > 0) {
            const relations = productIds.map(productId => ({
                promotionId: promotion.id,
                productId: parseInt(productId)
            }));
            await PromotionProduct.bulkCreate(relations, { transaction: t });
        }

        await t.commit();
        return promotion;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const updatePromotion = async (id, data) => {
    const { Promotion, PromotionProduct, sequelize } = getModels();
    const t = await sequelize.transaction();

    try {
        const promotion = await Promotion.findByPk(id);
        if (!promotion) throw new Error("Khuyến mãi không tồn tại");

        const { name, description, discountRate, startDate, endDate, isActive, productIds } = data;

        await promotion.update({
            name: name !== undefined ? name : promotion.name,
            description: description !== undefined ? description : promotion.description,
            discountRate: discountRate !== undefined ? parseInt(discountRate) : promotion.discountRate,
            startDate: startDate !== undefined ? startDate : promotion.startDate,
            endDate: endDate !== undefined ? endDate : promotion.endDate,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : promotion.isActive
        }, { transaction: t });

        if (productIds !== undefined) {
            await PromotionProduct.destroy({ where: { promotionId: id } }, { transaction: t });
            if (productIds && productIds.length > 0) {
                const relations = productIds.map(productId => ({
                    promotionId: id,
                    productId: parseInt(productId)
                }));
                await PromotionProduct.bulkCreate(relations, { transaction: t });
            }
        }

        await t.commit();
        return promotion;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const deletePromotion = async (id) => {
    const { Promotion, PromotionProduct, sequelize } = getModels();
    const t = await sequelize.transaction();

    try {
        await PromotionProduct.destroy({ where: { promotionId: id } }, { transaction: t });
        await Promotion.destroy({ where: { id } }, { transaction: t });
        await t.commit();
        return { success: true };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

/* =========================================================================
   CANCELLATIONS
   ========================================================================= */

const getCancellationRequests = async () => {
    const { OrderCancellationRequest, Order, User } = getModels();
    return await OrderCancellationRequest.findAll({
        include: [
            { 
                model: Order, 
                as: 'order', 
                attributes: ['id', 'totalAmount', 'orderStatus', 'createdAt']
            },
            { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

const processCancellationRequest = async (id, status, adminNotes = "", adminId = null) => {
    const { OrderCancellationRequest, Order, OrderStatusHistory, sequelize } = getModels();
    await ensureOrderStatusHistoryTable();
    const t = await sequelize.transaction();

    try {
        const request = await OrderCancellationRequest.findByPk(id);
        if (!request) {
            throw new Error("Yêu cầu hủy đơn không tồn tại");
        }

        if (request.status !== 'PENDING') {
            throw new Error("Yêu cầu hủy đơn này đã được xử lý từ trước");
        }

        await request.update({
            status,
            approvedBy: adminId,
            adminNotes,
            processedAt: new Date()
        }, { transaction: t });

        if (status === 'APPROVED') {
            await Order.update(
                { orderStatus: 'CANCELLED' },
                { where: { id: request.orderId }, transaction: t }
            );

            await OrderStatusHistory.create({
                orderId: request.orderId,
                status: 'CANCELLED',
                note: `Chấp nhận yêu cầu hủy từ khách hàng. Ghi chú: ${adminNotes}`,
                changedBy: adminId
            }, { transaction: t });
        } else {
            // Restore back to CONFIRMED or keep as is, but request is rejected
            await Order.update(
                { orderStatus: 'CONFIRMED' },
                { where: { id: request.orderId }, transaction: t }
            );

            await OrderStatusHistory.create({
                orderId: request.orderId,
                status: 'CONFIRMED',
                note: `Từ chối yêu cầu hủy đơn từ khách hàng. Ghi chú: ${adminNotes}`,
                changedBy: adminId
            }, { transaction: t });
        }

        await t.commit();
        return request;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

/* =========================================================================
   REPORTS
   ========================================================================= */

const getSalesReport = async () => {
    const { Order, OrderDetail, Product, Payment, Sequelize, User } = getModels();
    const { Op } = Sequelize;

    // 1. Core summaries (Paid or Confirmed or delivered or shipping orders)
    const activeStatuses = ['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'];
    
    const summary = await Order.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalOrders']
        ],
        where: {
            orderStatus: { [Op.in]: activeStatuses }
        },
        raw: true
    });

    const pendingOrdersCount = await Order.count({
        where: { orderStatus: 'NEW' }
    });

    const totalProducts = await Product.count();
    const totalUsers = await User.count({ where: { role: 'USER' } });

    const totalRevenue = parseFloat(summary[0]?.totalRevenue || 0);
    const totalOrders = parseInt(summary[0]?.totalOrders || 0);

    // 2. Best-selling products
    const bestSellers = await OrderDetail.findAll({
        attributes: [
            'productId',
            [Sequelize.fn('SUM', Sequelize.col('OrderDetail.quantity')), 'totalSold'],
            [Sequelize.fn('SUM', Sequelize.literal('OrderDetail.quantity * OrderDetail.price')), 'totalSales']
        ],
        include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'thumbnail', 'price']
        }],
        group: ['productId', 'product.id'],
        order: [[Sequelize.literal('totalSold'), 'DESC']],
        limit: 5
    });

    // 3. Sales over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesHistory = await Order.findAll({
        attributes: [
            [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
            [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'dailyRevenue'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'dailyOrdersCount']
        ],
        where: {
            orderStatus: { [Op.in]: activeStatuses },
            createdAt: { [Op.gte]: sevenDaysAgo }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
        raw: true
    });

    return {
        summary: {
            revenue: totalRevenue,
            ordersCount: totalOrders,
            pendingOrders: pendingOrdersCount,
            productsCount: totalProducts,
            usersCount: totalUsers
        },
        bestSellers,
        salesHistory
    };
};

export default {
    getProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getOrders,
    getOrderById,
    updateOrderStatus,
    assignShipper,
    getShippers,
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getCancellationRequests,
    processCancellationRequest,
    getSalesReport
};
