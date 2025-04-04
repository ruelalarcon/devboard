const fs = require('fs');
const path = require('path');

// Define paths
const sourceDir = path.join(__dirname, '../client/dist');
const targetDir = path.join(__dirname, '../server/public');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy directory recursively
function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Read source directory
  const files = fs.readdirSync(source);

  // Copy each file/directory
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      // Recursively copy directory
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Start copying
console.log(`Copying build from ${sourceDir} to ${targetDir}`);
try {
  copyDirectory(sourceDir, targetDir);
  console.log('Successfully copied build files');
} catch (error) {
  console.error('Error copying build files:', error);
  process.exit(1);
}