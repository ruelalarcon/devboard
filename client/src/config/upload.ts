export const uploadConfig = {
  // Maximum file size in bytes (50MB)
  maxFileSize: 50 * 1024 * 1024,

  // Allowed file types
  allowedFileTypes: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
    extensions: ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
  },

  // Server configuration
  serverUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',

  // Get upload endpoint
  get uploadEndpoint() {
    return `${this.serverUrl}/api/upload`;
  },

  // Get complete URL for a resource path
  getFullUrl(path: string): string {
    // If path already starts with http(s), it's already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Make sure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.serverUrl}${normalizedPath}`;
  },

  // File size display format
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },
};
