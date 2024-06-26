import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { imageSchema } from "@/utils/imageSchema";
import UploadsSave from "@/models/uploadsImg";

// In-memory storage for uploaded files
const hashCache = new Set();

// Validate image dimensions and file type
const imageFilter = function (_req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
    return cb(new Error("Only JPG files are allowed!"), false);
  }
  cb(null, true);
};

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: function (_req, file, cb) {
    const timestamp = Date.now().toString();
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  },
});

// Set up Multer for file upload
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 1024 * 1024 * 2, // Limits file size to 2MB
  },
}).single("file");
// Handle file upload and save to database

const uploadsImg = async (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({
        success: false,
        message: "Multer error occurred",
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else {
      try {
        // Validate image dimensions and file type
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "File not found",
          });
        }

        // Calculate hash of the uploaded file
        const fileBuffer = fs.readFileSync(req.file.path);
        const hash = crypto
          .createHash("sha256")
          .update(fileBuffer)
          .digest("hex");

        // Check if the hash already exists
        if (hashCache.has(hash)) {
          // Delete the file as it already exists
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: "File already exists",
          });
        }

        // Validate the uploaded file using Zod schema
        const parsedFile = imageSchema.parse(req.file);

        // Save the uploaded image data to the database
        await UploadsSave.create({
          filename: parsedFile.filename,
          path: parsedFile.path,
        });

        // Add hash to cache
        hashCache.add(hash);

        return res.status(200).json({
          success: true,
          message: "File uploaded successfully",
          path: req.file.path,
        });
      } catch (error) {
        next(error);
      }
    }
  });
};

export default uploadsImg;
