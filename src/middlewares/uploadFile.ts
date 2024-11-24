import { Request, Response, NextFunction } from "express";
import multer, { StorageEngine, FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";

const audioDirectory = "uploads/podcast/audio";
const coverDirectory = "uploads/podcast/cover";

const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

ensureDirectoryExists(audioDirectory);
ensureDirectoryExists(coverDirectory);

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    if (file.fieldname === "audio") {
      cb(null, audioDirectory);
    } else if (file.fieldname === "cover") {
      cb(null, coverDirectory);
    } else {
      cb(new Error("Invalid file field"), "");
    }
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes: Record<string, RegExp> = {
    audio: /mp3|wav|m4a|mpeg/,
    cover: /jpeg|jpg|png|gif/,
  };

  const allowedType = allowedTypes[file.fieldname];
  if (allowedType) {
    const extname = allowedType.test(
      path.extname(file.originalname).toLowerCase()
    );
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
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadMiddleware = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

export const handleFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
