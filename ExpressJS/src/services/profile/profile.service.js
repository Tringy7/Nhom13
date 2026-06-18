import db from "../../entities/index.js";
const { User } = db;

/* =========================
   GET USER PROFILE SERVICE
========================= */
const getUserProfile = async (userId) => {
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
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return null; // Or throw an error
        }

        // Check for email uniqueness if it's being changed
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

        // Update user with new data
        await user.update(updateData);

        console.log("After Save, User Gender is:", user.gender);

        // Return the updated user without the password
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;
    } catch (error) {
        console.error('Update User Profile Service Error:', error);
        // Re-throw the error to be caught by the controller
        throw error;
    }
};

/* =========================
   UPDATE ADMIN PROFILE SERVICE
========================= */
const updateAdminProfile = async (adminId, targetUserId, updateData) => {
    try {
        const userToUpdate = await User.findByPk(targetUserId);
        if (!userToUpdate) {
            return null;
        }

        // Prevent admins from editing other admins
        if (targetUserId !== adminId && userToUpdate.role === 'admin') {
            const error = new Error("Cannot edit other admin profiles");
            error.statusCode = 403;
            throw error;
        }

        // Check for email uniqueness if it's being changed
        if (updateData.email && updateData.email !== userToUpdate.email) {
            const existingUser = await User.findOne({ where: { email: updateData.email } });
            if (existingUser) {
                const error = new Error("Email already exists");
                error.statusCode = 409;
                throw error;
            }
        }
        
        // Admins can change roles of other users
        if (updateData.role && targetUserId !== adminId) {
            userToUpdate.role = updateData.role;
        }

        console.log("=== SERVICE UPDATE ADMIN PROFILE ===");
        console.log("Service Received Data Gender:", updateData.gender);
        console.log("Before Save, User Gender was:", userToUpdate.gender);

        // Update the user
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