import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Helper Function ---
const createStorage = (subfolder) => {
    const uploadDir = path.join(__dirname, "..", "uploads", subfolder);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, `${subfolder}-` + uniqueSuffix + path.extname(file.originalname));
        },
    });
};

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
};

const createUploader = (storage) => multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// --- Exports ---
export const uploadProfileImage = createUploader(createStorage("user"));
export const uploadProductImage = createUploader(createStorage("products"));
export const uploadReviewImage = createUploader(createStorage("reviews"));