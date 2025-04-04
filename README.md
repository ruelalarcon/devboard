# Unified Application (Port 3000)

This project now runs both the frontend and backend on the same port (3000).

## Setup

1. Install dependencies for both client and server:

```bash
npm install
```

2. Build the client application:

```bash
npm run build
```

This will build the React application and copy the files to the server's public directory.

## Running the Application

To start the application in production mode:

```bash
npm start
```

For development:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Cross-Platform Compatibility

This project uses cross-platform Node.js scripts for building and deployment, making it compatible with:
- Windows
- macOS
- Linux

## How It Works

- The backend serves the frontend's static files from the `server/public` directory
- All API requests are handled with the "/api" prefix
- GraphQL requests are handled at "/graphql"
- Static files (uploads) are served from "/uploads"