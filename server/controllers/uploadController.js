const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const uploadConfig = require("../config/upload");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", uploadConfig.uploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate hash from file content and current timestamp
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueId = uuidv4();
    const hashName = crypto
      .createHash(uploadConfig.fileNaming.hashAlgorithm)
      .update(uniqueId)
      .digest("hex");

    cb(null, `${hashName}${fileExtension}`);
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const mimetype = uploadConfig.allowedFileTypes.mimeTypes.includes(
    file.mimetype
  );
  const extname = uploadConfig.allowedFileTypes.extensions.includes(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed!"));
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

// Upload controller
exports.uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `/${uploadConfig.uploadDir}/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Middleware for single file upload
exports.uploadMiddleware = upload.single("image");
