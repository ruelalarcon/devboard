const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

// Handle file upload
router.post(
  "/upload",
  uploadController.uploadMiddleware,
  uploadController.uploadFile
);

module.exports = router;
