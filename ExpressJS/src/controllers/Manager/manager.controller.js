import managerService from "../../services/Manager/manager.service.js";

const getProducts = async (req, res) => {
    try {
        const data = await managerService.getProducts(req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getProductDetail = async (req, res) => {
    try {
        const product = await managerService.getProductDetail(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = await managerService.createProduct(req.body, req.files);
        return res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: product });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await managerService.updateProduct(req.params.id, req.body, req.files);
        return res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const result = await managerService.deleteProduct(req.params.id);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const toggleProductActive = async (req, res) => {
    try {
        const product = await managerService.toggleProductActive(req.params.id);
        return res.status(200).json({ success: true, message: "Thay đổi trạng thái thành công", data: product });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBrands = async (req, res) => {
    try {
        const data = await managerService.getBrands();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createBrand = async (req, res) => {
    try {
        const brand = await managerService.createBrand(req.body);
        return res.status(201).json({ success: true, data: brand });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateBrand = async (req, res) => {
    try {
        const brand = await managerService.updateBrand(req.params.id, req.body);
        return res.status(200).json({ success: true, data: brand });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBrand = async (req, res) => {
    try {
        await managerService.deleteBrand(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa thương hiệu thành công" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const data = await managerService.getCategories();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const data = await managerService.createCategory(name);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { oldName } = req.params;
        const { newName } = req.body;
        const data = await managerService.updateCategory(decodeURIComponent(oldName), newName);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { name } = req.params;
        await managerService.deleteCategory(decodeURIComponent(name));
        return res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const data = await managerService.getOrders(req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await managerService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const { status, notes } = req.body;
        const order = await managerService.updateOrderStatus(req.params.id, status, notes, adminId);
        return res.status(200).json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công", data: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const assignShipper = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const { shipperId, shipperFee } = req.body;
        const order = await managerService.assignShipper(req.params.id, shipperId, shipperFee, adminId);
        return res.status(200).json({ success: true, message: "Gán shipper thành công", data: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getShippers = async (req, res) => {
    try {
        const shippers = await managerService.getShippers();
        return res.status(200).json({ success: true, data: shippers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getVouchers = async (req, res) => {
    try {
        const vouchers = await managerService.getVouchers();
        return res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createVoucher = async (req, res) => {
    try {
        const voucher = await managerService.createVoucher(req.body);
        return res.status(201).json({ success: true, message: "Tạo voucher thành công", data: voucher });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const voucher = await managerService.updateVoucher(req.params.id, req.body);
        return res.status(200).json({ success: true, message: "Cập nhật voucher thành công", data: voucher });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteVoucher = async (req, res) => {
    try {
        await managerService.deleteVoucher(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa voucher thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPromotions = async (req, res) => {
    try {
        const data = await managerService.getPromotions();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createPromotion = async (req, res) => {
    try {
        const data = await managerService.createPromotion(req.body);
        return res.status(201).json({ success: true, message: "Tạo chương trình khuyến mãi thành công", data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePromotion = async (req, res) => {
    try {
        const data = await managerService.updatePromotion(req.params.id, req.body);
        return res.status(200).json({ success: true, message: "Cập nhật chương trình khuyến mãi thành công", data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deletePromotion = async (req, res) => {
    try {
        await managerService.deletePromotion(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa chương trình khuyến mãi thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getCancellationRequests = async (req, res) => {
    try {
        const data = await managerService.getCancellationRequests();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const processCancellationRequest = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const { status, adminNotes } = req.body;
        const data = await managerService.processCancellationRequest(req.params.id, status, adminNotes, adminId);
        return res.status(200).json({ success: true, message: "Xử lý yêu cầu hủy đơn thành công", data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSalesReport = async (req, res) => {
    try {
        const data = await managerService.getSalesReport();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error in getSalesReport:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const managerId = req.user.id;
        const { page = 1, limit = 20, search = '' } = req.query;
        const result = await managerService.getChatHistory(managerId, { page, limit, search });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error in getChatHistory:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getChatDetail = async (req, res) => {
    try {
        const managerId = req.user.id;
        const { conversationId } = req.params;
        const result = await managerService.getChatDetail(conversationId, managerId);
        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện" });
        }
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error in getChatDetail:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
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
    getSalesReport,
    getChatHistory,
    getChatDetail
};
