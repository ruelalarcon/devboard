# DevBoard Application

This project runs both the frontend and backend on the same port (3000).

## Features

- User accounts and authentication using express-session
- Channel management for organizing programming topics
- Message and nested replies system for Q&A
- Rating system (upvotes/downvotes) for content
- Admin account with special privileges
- Search functionality for content
- GraphQL API with built-in GraphQL Explorer

## Tech Stack

- Backend: Node.js, Express.js, GraphQL (Apollo Server v4), MySQL (with Sequelize ORM)
- Frontend: React, Mantine UI, Apollo Client
- Authentication: Express-session

## Setup

1. Install dependencies for both client and server:

```bash
npm install
```

2. Create a `.env` file in the `server/` directory with the following variables:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=programming_channel_db
PORT=3000
SESSION_SECRET=your_session_secret
ADMIN_PASSWORD=your_admin_password
```

3. Build the client application:

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

To access the GraphQL Explorer, navigate to http://localhost:3000/graphql

## Running Tests

To run Jest unit tests for API testing:

```bash
npm run test:units
```

To run Cypress (E2E) integration tests via browser emulation:

```bash
npm run test:e2e
```

To run both:

```bash
npm run test
```

To watch and manually run each of the Cypress tests:

```bash
npm run cypress
```
This will open Cypress via Electron and allow you to watch each of the test specs in action

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

## API

The GraphQL API provides endpoints for:

- User authentication (register, login, logout)
- Channels (create, update, delete, query)
- Messages (create, update, delete, query)
- Replies (create, update, delete, query)
- Ratings (rate content, delete rating)
- Search (search content, user statistics)

## Authentication

All mutations except for login and register require authentication.
Authentication is handled via express-session.

## Admin Account

An admin account is automatically created on first server start with:

- Username: `admin`
- Password: (from .env file)

Admins have the power to delete any messages, channels, and users.

## Formatting Code

To format all code in the project:

```bash
npm run format
```

To format only client code:

```bash
npm run format:client
```

To format only server code:

```bash
npm run format:server
```