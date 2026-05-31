'use strict';
import { Op } from 'sequelize';
import db from '../../models/index.js';
import { v4 as uuidv4 } from 'uuid';

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
      ['receivedAt', 'DESC']
    ]
  });
  return userVouchers;
};

const getCheckoutVouchers = async (userId, orderTotal) => {
  const userVouchers = await UserVoucher.findAll({
    where: {
      userId,
      status: true, // Chỉ lấy voucher chưa sử dụng
    },
    include: [{
      model: Voucher,
      as: 'voucher',
      where: {
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
        minOrderValue: { [Op.lte]: orderTotal } // Lọc các voucher đủ điều kiện giá trị đơn hàng
      },
      required: true
    }],
    order: [
      [{ model: Voucher, as: 'voucher' }, 'discountValue', 'DESC']
    ]
  });
  return userVouchers;
};

const getAvailableVouchers = async () => {
  const available = await Voucher.findAll({
    where: {
      isActive: true,
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
    where: { id: voucherId, isActive: true }
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

  const rewardCode = `${voucher.code}-${uuidv4().split('-')[0].toUpperCase()}`;

  const userVoucher = await UserVoucher.create({
    userId,
    voucherId,
    rewardCode,
    status: true, // status: true means 'not used'
    receivedAt: new Date()
  });

  return userVoucher;
};

const applyVoucher = async (userId, rewardCode, orderTotal) => {
  const userVoucher = await UserVoucher.findOne({
    where: {
      userId,
      rewardCode,
      status: true
    },
    include: {
      model: Voucher,
      as: 'voucher',
      required: true
    }
  });

  if (!userVoucher) {
    throw new Error('Mã giảm giá không hợp lệ hoặc đã được sử dụng.');
  }

  const { voucher } = userVoucher;

  if (!voucher.isActive || new Date(voucher.endDate) < new Date()) {
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
    if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
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
    attributes: ['pointsBalance']
  });
  return user ? user.pointsBalance : 0;
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