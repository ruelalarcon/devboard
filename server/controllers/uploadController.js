const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const uploadConfig = require("../config/upload");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", uploadConfig.uploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Store temporary uploads before we hash them
const tempDir = path.join(__dirname, "..", "temp_uploads");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Use a temporary name
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const tempName = `temp_${Date.now()}${fileExtension}`;
    cb(null, tempName);
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const mimetype = uploadConfig.allowedFileTypes.mimeTypes.includes(file.mimetype);
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

// Function to generate hash from file content
const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash(uploadConfig.fileNaming.hashAlgorithm).update(fileBuffer).digest("hex");
};

// Function to check if file with hash already exists
const getExistingFileByHash = (hash, extension) => {
  const fileName = `${hash}${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  if (fs.existsSync(filePath)) {
    return fileName;
  }

  return null;
};

// Upload controller
exports.uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file type not allowed",
      });
    }

    const tempFilePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Generate hash from file content
    const contentHash = generateFileHash(tempFilePath);

    // Check if we already have this file
    const existingFile = getExistingFileByHash(contentHash, fileExtension);

    let fileName;
    let reused = false;

    if (existingFile) {
      // File already exists, use existing file
      fileName = existingFile;
      reused = true;

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    } else {
      // New file, move to uploads directory with hash name
      fileName = `${contentHash}${fileExtension}`;
      const finalPath = path.join(uploadsDir, fileName);

      // Move file from temp to uploads
      fs.copyFileSync(tempFilePath, finalPath);
      fs.unlinkSync(tempFilePath);
    }

    const fileUrl = `/${uploadConfig.uploadDir}/${fileName}`;

    return res.status(200).json({
      success: true,
      file: {
        filename: fileName,
        url: fileUrl,
        reused: reused,
      },
    });
  } catch (error) {
    // Clean up temp file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred during file upload",
    });
  }
};

// Middleware for single file upload
exports.uploadMiddleware = upload.single("image");
