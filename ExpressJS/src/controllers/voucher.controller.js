import voucherService from '../services/voucher/voucher.service.js';

const getMyVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    const vouchers = await voucherService.getMyVouchers(userId);
    res.status(200).json({
      message: 'Lấy danh sách voucher của bạn thành công.',
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

const getCheckoutVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderTotal } = req.query; // Lấy orderTotal từ query params

    if (!orderTotal) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tổng giá trị đơn hàng.' });
    }

    const vouchers = await voucherService.getCheckoutVouchers(userId, parseFloat(orderTotal));
    res.status(200).json({
      message: 'Lấy danh sách voucher cho checkout thành công.',
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

const getAvailableVouchers = async (req, res) => {
  try {
    const vouchers = await voucherService.getAvailableVouchers();
    res.status(200).json({
      message: 'Lấy danh sách voucher có sẵn thành công.',
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

const receiveVoucher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherId } = req.params;
    const userVoucher = await voucherService.receiveVoucher(userId, voucherId);
    res.status(201).json({
      message: 'Nhận voucher thành công!',
      data: userVoucher
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const applyVoucher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardCode, orderTotal } = req.body;

    if (!rewardCode || !orderTotal) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã voucher và tổng giá trị đơn hàng.' });
    }

    const result = await voucherService.applyVoucher(userId, rewardCode, orderTotal);
    res.status(200).json({
      message: 'Áp dụng voucher thành công.',
      data: result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRewardBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await voucherService.getRewardBalance(userId);
    res.status(200).json({
      message: 'Lấy số dư điểm thưởng thành công.',
      data: { points: balance }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

const getRewardHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await voucherService.getRewardHistory(userId);
    res.status(200).json({
      message: 'Lấy lịch sử điểm thưởng thành công.',
      data: history
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

export default {
  getMyVouchers,
  getCheckoutVouchers,
  getAvailableVouchers,
  receiveVoucher,
  applyVoucher,
  getRewardBalance,
  getRewardHistory
};