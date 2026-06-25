'use strict';
import { Op } from 'sequelize';
import db from '../../entities/index.js';

const { User, Voucher, UserVoucher, RewardTransaction } = db;

const getMyVouchers = async (userId) => {
  const userVouchers = await UserVoucher.findAll({
    where: { userId }, 
    include: [{
      model: Voucher,
      as: 'voucher',
      required: true
    }],
    order: [
      ['createdAt', 'DESC']
    ]
  });
  return userVouchers;
};

const getCheckoutVouchers = async (userId, orderTotal) => {
  console.log("--- DEBUG VOUCHER START ---");
  console.log(`Input: userId=${userId}, orderTotal=${orderTotal}`);

  // Test 1: Lọc theo userId
  const test1 = await UserVoucher.findAll({ where: { userId } });
  console.log(`Test 1 (userId only): Found ${test1.length} records.`);
  if (test1.length === 0) {
      console.log(">>> User has no vouchers at all.");
      return [];
  }

  // Test 2: Thêm điều kiện chưa sử dụng
  const test2 = await UserVoucher.findAll({ where: { userId, isUsed: false } });
  console.log(`Test 2 (userId & isUsed=false): Found ${test2.length} records.`);
  if (test2.length === 0) {
      console.log(">>> LỖI: Không tìm thấy voucher nào chưa sử dụng.");
      return [];
  }

  // Test 3: Join với Voucher và lọc theo status ACTIVE
  const test3 = await UserVoucher.findAll({
    where: { userId, isUsed: false },
    include: [{
      model: Voucher,
      as: 'voucher',
      where: { status: 'ACTIVE' },
      required: true
    }]
  });
  console.log(`Test 3 (include & voucher status): Found ${test3.length} records.`);
  if (test3.length === 0) {
      console.log(">>> LỖI: Các voucher của user không ACTIVE.");
      return [];
  }

  // Test 4: Thêm điều kiện startDate
  const test4 = await UserVoucher.findAll({
    where: { userId, isUsed: false },
    include: [{
      model: Voucher,
      as: 'voucher',
      where: {
        status: 'ACTIVE',
        startDate: { [Op.lte]: new Date() }
      },
      required: true
    }]
  });
  console.log(`Test 4 (include & startDate): Found ${test4.length} records.`);
  if (test4.length === 0) {
      console.log(">>> LỖI: Các voucher chưa đến ngày bắt đầu hiệu lực.");
      return [];
  }

  // Test 5: Thêm điều kiện endDate
  const test5 = await UserVoucher.findAll({
    where: { userId, isUsed: false },
    include: [{
      model: Voucher,
      as: 'voucher',
      where: {
        status: 'ACTIVE',
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() }
      },
      required: true
    }]
  });
  console.log(`Test 5 (include & endDate): Found ${test5.length} records.`);
  if (test5.length === 0) {
      console.log(">>> LỖI: Dữ liệu bị lọc hết bởi điều kiện 'endDate'. Các voucher có thể đã hết hạn.");
      // We don't return here, to allow the next test to run
  }

  // Test 6: Thêm điều kiện minOrderValue
  const test6 = await UserVoucher.findAll({
    where: { userId, isUsed: false },
    include: [{
      model: Voucher,
      as: 'voucher',
      where: {
        status: 'ACTIVE',
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
        minOrderValue: { [Op.lte]: orderTotal }
      },
      required: true
    }]
  });
  console.log(`Test 6 (Final Query before order): Found ${test6.length} records.`);
  if (test5.length > 0 && test6.length === 0) {
      console.log(`>>> LỖI: Dữ liệu bị lọc hết bởi điều kiện 'minOrderValue'. Order total (${orderTotal}) không đủ lớn.`);
  }

  console.log("--- FINAL QUERY ---");
  const userVouchers = await UserVoucher.findAll({
    where: {
      userId,
      isUsed: false,
    },
    include: [{
      model: Voucher,
      as: 'voucher',
      where: {
        status: 'ACTIVE',
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
        minOrderValue: { [Op.lte]: orderTotal }
      },
      required: true
    }],
    order: [
      [{ model: Voucher, as: 'voucher' }, 'discountValue', 'DESC']
    ]
  });
  
  console.log(`Final Query Result: Found ${userVouchers.length} records.`);
  console.log("--- DEBUG VOUCHER END ---");
  return userVouchers;
};

const getAvailableVouchers = async () => {
  const available = await Voucher.findAll({
    where: {
      status: 'ACTIVE',
      endDate: {
        [Op.gte]: new Date()
      }
    },
    order: [
      ['createdAt', 'DESC']
    ]
  });
  return available;
};

const receiveVoucher = async (userId, voucherId) => {
  const voucher = await Voucher.findOne({
    where: { id: voucherId, status: 'ACTIVE' }
  });

  if (!voucher) {
    throw new Error('Voucher không tồn tại hoặc đã bị vô hiệu hóa.');
  }

  const alreadyReceived = await UserVoucher.findOne({
    where: { userId, voucherId }
  });

  if (alreadyReceived) {
    throw new Error('Bạn đã nhận voucher này rồi.');
  }

  const userVoucher = await UserVoucher.create({
    userId,
    voucherId,
    isUsed: false
  });

  return userVoucher;
};

const applyVoucher = async (userId, voucherCode, orderTotal) => {
  const userVoucher = await UserVoucher.findOne({
    where: {
      userId,
      isUsed: false
    },
    include: {
      model: Voucher,
      as: 'voucher',
      where: { code: voucherCode },
      required: true
    }
  });

  if (!userVoucher) {
    throw new Error('Mã giảm giá không hợp lệ hoặc đã được sử dụng.');
  }

  const { voucher } = userVoucher;

  if (voucher.status !== 'ACTIVE' || new Date(voucher.endDate) < new Date()) {
    throw new Error('Mã giảm giá đã hết hạn hoặc không hoạt động.');
  }
  if (new Date(voucher.startDate) > new Date()) {
    throw new Error('Mã giảm giá chưa đến ngày sử dụng.');
  }

  if (orderTotal < voucher.minOrderValue) {
    throw new Error(`Đơn hàng của bạn phải có giá trị tối thiểu là ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này.`);
  }

  let discountAmount = 0;
  if (voucher.discountType === 'PERCENT') {
    discountAmount = (orderTotal * voucher.discountValue) / 100;
  } else { // FIXED
    discountAmount = voucher.discountValue;
  }

  discountAmount = Math.min(discountAmount, orderTotal);

  return {
    discountAmount: Math.round(discountAmount),
    finalTotal: orderTotal - Math.round(discountAmount),
    userVoucherId: userVoucher.id
  };
};

const getRewardBalance = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['points']
  });
  return user ? user.points : 0;
};

const getRewardHistory = async (userId) => {
  const history = await RewardTransaction.findAll({
    where: { userId },
    order: [
      ['createdAt', 'DESC']
    ],
    limit: 50
  });
  return history;
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
