import profileService from "../services/profile/profile.service.js";

/* =========================
   GET USER PROFILE
========================= */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await profileService.getUserProfile(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ user });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* =========================
   GET ADMIN PROFILE
========================= */
const getAdminProfile = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        const admin = await profileService.getUserProfile(req.user.id);

        if (!admin) {
            return res.status(404).json({ message: "Admin user not found" });
        }

        return res.json({ message: "Admin only", user: admin });
    } catch (error) {
        console.error('Get admin profile error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* =========================
   EDIT USER PROFILE
========================= */
const editUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("=== EDIT USER PROFILE ===");
        console.log("Request Body Gender:", req.body.gender);
        
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = `/uploads/user/${req.file.filename}`;
        }

        const updateData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            gender: req.body.gender, // Không convert, giữ nguyên chuỗi
            image: imageUrl, // Cập nhật imageUrl mới nếu có upload
        };

        // Remove undefined fields so they aren't updated
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        console.log("Data to Service:", updateData);

        const updatedUser = await profileService.updateUserProfile(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error('Edit User Profile Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};

/* =========================
   EDIT ADMIN PROFILE
========================= */
const editAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { userId } = req.params;
        const targetUserId = userId ? parseInt(userId) : adminId;

        console.log("=== EDIT ADMIN PROFILE ===");
        console.log("Request Body Gender:", req.body.gender);

        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = `/uploads/user/${req.file.filename}`;
        }

        const updateData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            gender: req.body.gender, // Không convert, giữ nguyên chuỗi
            image: imageUrl,
            role: req.body.role,
        };

        // Remove undefined fields so they aren't updated
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        console.log("Data to Service:", updateData);

        const updatedUser = await profileService.updateAdminProfile(adminId, targetUserId, updateData);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error('Edit Admin Profile Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};

export default {
    getProfile,
    getAdminProfile,
    editUserProfile,
    editAdminProfile,
};