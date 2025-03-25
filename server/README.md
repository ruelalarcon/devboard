# Programming Channel Server

Backend server for a channel-based programming Q&A platform.

## Features

- User accounts and authentication using express-session
- Channel management for organizing programming topics
- Message and nested replies system for Q&A
- Rating system (upvotes/downvotes) for content
- Admin account with special privileges
- Search functionality for content
- GraphQL API with built-in GraphQL Explorer

## Tech Stack

- Node.js
- Express.js
- GraphQL (Apollo Server v4)
- MySQL (with Sequelize ORM)
- Express-session for authentication

## Setup

1. Clone the repository
2. Install dependencies

```bash
cd server
npm install
```

3. Create a `.env` file in the server directory with the following variables:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=programming_channel_db
PORT=4000
SESSION_SECRET=your_session_secret
ADMIN_PASSWORD=your_admin_password
```

4. Create the MySQL database:

```sql
CREATE DATABASE programming_channel_db;
```

5. Start the server:

```bash
npm run dev
```

6. Access the GraphQL Explorer:

Open your browser and navigate to `http://localhost:4000/graphql`

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