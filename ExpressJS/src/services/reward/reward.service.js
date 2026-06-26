import db from '../../entities/index.js';

// Correctly import the RewardTransaction model from the db object
const { RewardTransaction } = db;

export const createRewardHistory = async (userId, points, type, description, options = {}) => {
  try {
    // Check if RewardTransaction is defined before using it
    if (!RewardTransaction) {
      throw new Error("RewardTransaction model is not loaded in the database entities.");
    }

    const history = await RewardTransaction.create({
      userId,
      points,
      type,
      description,
    }, { transaction: options.transaction });
    
    return history;
  } catch (error) {
    console.error(`Error creating reward history: ${error.message}`);
    // Re-throw the error to be caught by the calling function's transaction rollback
    throw error;
  }
};
