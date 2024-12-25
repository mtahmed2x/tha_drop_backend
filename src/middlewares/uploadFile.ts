import e, { Request, Response, NextFunction } from "express";
import multer, { StorageEngine, FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";

const coverDirectory = "uploads/events/cover";
const galleryDirectory = "uploads/events/gallery";
const avatarDirectory = "uploads/profile/avatar";
const licensePhotoDirectory = "uploads/auth/licensePhoto";
const categoryImageDirectory = "uploads/category/categoryImage";
const subCategoryImageDirectory = "uploads/category/subCategoryImage";

const ensureDirectoryExists = (directory: string) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

ensureDirectoryExists(coverDirectory);
ensureDirectoryExists(galleryDirectory);
ensureDirectoryExists(avatarDirectory);
ensureDirectoryExists(licensePhotoDirectory);
ensureDirectoryExists(categoryImageDirectory);
ensureDirectoryExists(subCategoryImageDirectory);


const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (file.fieldname === "cover") {
            cb(null, coverDirectory);
        } else if (file.fieldname === "gallery") {
            cb(null, galleryDirectory);
        } else if (file.fieldname === "avatar") {
            cb(null, avatarDirectory);
        } else if (file.fieldname === "licensePhoto") {
            cb(null, licensePhotoDirectory);
        } else if (file.fieldname === "categoryImage") {
            cb(null, categoryImageDirectory);
        } else if (file.fieldname === "subCategoryImage") {
            cb(null, subCategoryImageDirectory);
        } else {
            cb(new Error("Invalid file field"), "");
        }
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes: Record<string, RegExp> = {
        licensePhoto: /jpeg|jpg|png|gif/,
        categoryImage: /jpeg|jpg|png|gif/,
        subCategoryImage: /jpeg|jpg|png|gif/,
        cover: /jpeg|jpg|png|gif/,
        avatar: /jpeg|jpg|png|gif/,
        gallery: /jpeg|jpg|png|gif/,
    };

    const allowedType = allowedTypes[file.fieldname];
    if (allowedType) {
        const extname = allowedType.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedType.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error(`Only ${file.fieldname} files are allowed!`));
        }
    } else {
        cb(new Error("Invalid file field"));
    }
};

const upload = multer({
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

export const handleFileUpload = (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
        } else if (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
        }
        next();
    });
};
