import db from "../../entities/index.js";

/* =========================
   GET USER PROFILE SERVICE
========================= */
const getUserProfile = async (userId) => {
    const { User } = db;
    try {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        return user;
    } catch (error) {
        console.error('Get User Profile Service Error:', error);
        throw new Error('Error fetching user profile from database.');
    }
};

/* =========================
   UPDATE USER PROFILE SERVICE
========================= */
const updateUserProfile = async (userId, updateData) => {
    const { User } = db;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return null;
        }

        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await User.findOne({ where: { email: updateData.email } });
            if (existingUser) {
                const error = new Error("Email already exists");
                error.statusCode = 409;
                throw error;
            }
        }

        console.log("=== SERVICE UPDATE USER PROFILE ===");
        console.log("Service Received Data:", updateData.gender);
        console.log("Before Save, User Gender was:", user.gender);

        await user.update(updateData);

        console.log("After Save, User Gender is:", user.gender);

        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;
    } catch (error) {
        console.error('Update User Profile Service Error:', error);
        throw error;
    }
};

/* =========================
   UPDATE ADMIN PROFILE SERVICE
========================= */
const updateAdminProfile = async (adminId, targetUserId, updateData) => {
    const { User } = db;
    try {
        const userToUpdate = await User.findByPk(targetUserId);
        if (!userToUpdate) {
            return null;
        }

        if (targetUserId !== adminId && userToUpdate.role === 'admin') {
            const error = new Error("Cannot edit other admin profiles");
            error.statusCode = 403;
            throw error;
        }

        if (updateData.email && updateData.email !== userToUpdate.email) {
            const existingUser = await User.findOne({ where: { email: updateData.email } });
            if (existingUser) {
                const error = new Error("Email already exists");
                error.statusCode = 409;
                throw error;
            }
        }
        
        if (updateData.role && targetUserId !== adminId) {
            userToUpdate.role = updateData.role;
        }

        console.log("=== SERVICE UPDATE ADMIN PROFILE ===");
        console.log("Service Received Data Gender:", updateData.gender);
        console.log("Before Save, User Gender was:", userToUpdate.gender);

        await userToUpdate.update(updateData);

        console.log("After Save, User Gender is:", userToUpdate.gender);

        const updatedUser = await User.findByPk(targetUserId, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;

    } catch (error) {
        console.error('Update Admin Profile Service Error:', error);
        throw error;
    }
};


export default {
    getUserProfile,
    updateUserProfile,
    updateAdminProfile,
};