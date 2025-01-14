"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_status_codes_1 = require("http-status-codes");
const coverDirectory = "uploads/events/cover";
const galleryDirectory = "uploads/events/gallery";
const avatarDirectory = "uploads/profile/avatar";
const licensePhotoDirectory = "uploads/auth/licensePhoto";
const categoryImageDirectory = "uploads/category/categoryImage";
const subCategoryImageDirectory = "uploads/category/subCategoryImage";
const ensureDirectoryExists = (directory) => {
    if (!fs_1.default.existsSync(directory)) {
        fs_1.default.mkdirSync(directory, { recursive: true });
    }
};
ensureDirectoryExists(coverDirectory);
ensureDirectoryExists(galleryDirectory);
ensureDirectoryExists(avatarDirectory);
ensureDirectoryExists(licensePhotoDirectory);
ensureDirectoryExists(categoryImageDirectory);
ensureDirectoryExists(subCategoryImageDirectory);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "cover") {
            cb(null, coverDirectory);
        }
        else if (file.fieldname === "gallery") {
            cb(null, galleryDirectory);
        }
        else if (file.fieldname === "avatar") {
            cb(null, avatarDirectory);
        }
        else if (file.fieldname === "licensePhoto") {
            cb(null, licensePhotoDirectory);
        }
        else if (file.fieldname === "categoryImage") {
            cb(null, categoryImageDirectory);
        }
        else if (file.fieldname === "subCategoryImage") {
            cb(null, subCategoryImageDirectory);
        }
        else {
            cb(new Error("Invalid file field"), "");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        licensePhoto: /jpeg|jpg|png|gif/,
        categoryImage: /jpeg|jpg|png|gif/,
        subCategoryImage: /jpeg|jpg|png|gif/,
        cover: /jpeg|jpg|png|gif/,
        avatar: /jpeg|jpg|png|gif/,
        gallery: /jpeg|jpg|png|gif/,
    };
    const allowedType = allowedTypes[file.fieldname];
    if (allowedType) {
        const extname = allowedType.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedType.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error(`Only ${file.fieldname} files are allowed!`));
        }
    }
    else {
        cb(new Error("Invalid file field"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 1000 * 1024 * 1024,
    },
});
const uploadMiddleware = upload.fields([
    { name: "licensePhoto", maxCount: 1 },
    { name: "categoryImage", maxCount: 1 },
    { name: "subCategoryImage", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
]);
const handleFileUpload = (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: err.message });
        }
        else if (err) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: err.message });
        }
        next();
    });
};
exports.handleFileUpload = handleFileUpload;
