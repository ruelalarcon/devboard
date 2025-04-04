module.exports = {
  // Maximum file size in bytes (50MB)
  maxFileSize: 50 * 1024 * 1024,

  // Allowed file types
  allowedFileTypes: {
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
    extensions: [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  },

  // Upload directory
  uploadDir: "uploads",

  // File naming configuration
  fileNaming: {
    useHash: true,
    hashAlgorithm: "md5",
  },
};
