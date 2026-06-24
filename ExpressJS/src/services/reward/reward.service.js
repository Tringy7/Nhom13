import db from '../../entities/index.js';

const { RewardHistory } = db;

export const createRewardHistory = async (userId, points, type, description, options = {}) => {
  try {
    const history = await RewardHistory.create({
      userId,
      points,
      type,
      description,
    }, { transaction: options.transaction });
    return history;
  } catch (error) {
    console.error(`Error creating reward history: ${error.message}`);
    throw error;
  }
};
