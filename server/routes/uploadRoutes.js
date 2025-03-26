const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

// Handle file upload
router.post(
  "/upload",
  (req, res, next) => {
    uploadController.uploadMiddleware(req, res, (err) => {
      if (err) {
        // Handle multer errors with proper JSON response
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      next();
    });
  },
  uploadController.uploadFile
);

module.exports = router;
