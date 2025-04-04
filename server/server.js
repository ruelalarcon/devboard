require("dotenv").config();
const express = require("express");
const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("@apollo/server/plugin/landingPage/default");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

// Import GraphQL schema and resolvers
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

// Import routes
const uploadRoutes = require("./routes/uploadRoutes");

// Import database models
const db = require("./models");

// Create Express app
const app = express();
const httpServer = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
};

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Apply JSON middleware for REST endpoints
app.use(express.json());

// Apply CORS
app.use(cors(corsOptions));

// Register REST API routes
app.use("/api", uploadRoutes);

// Serve static files (for screenshots/images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the React build (client)
app.use(express.static(path.join(__dirname, "public")));

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({
      embed: true,
      includeCookies: true,
    }),
  ],
  introspection: true,
});

// Function to initialize the server
async function startServer() {
  // Start Apollo Server
  await server.start();

  // Apply Apollo middleware to Express app
  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Pass database models and request to resolvers
        return {
          db,
          req,
          sequelize: db.sequelize,
        };
      },
    })
  );

  // Create database tables if they don't exist
  await db.sequelize.sync();

  // Create admin account if it doesn't exist
  const adminExists = await db.User.findOne({ where: { username: "admin" } });
  if (!adminExists) {
    await db.User.create({
      username: "admin",
      password: process.env.ADMIN_PASSWORD,
      displayName: "Administrator",
      isAdmin: true,
    });
    console.log("Admin account created");
  }

  // Add route to serve the React app
  app.get("*", (req, res, next) => {
    // Skip API and GraphQL requests
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/graphql") ||
      req.path.startsWith("/uploads")
    ) {
      return next();
    }
    // Serve the React app
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`REST API endpoints available at http://localhost:${PORT}/api`);
}

// Handle errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

// Start the server
startServer().catch((error) => {
  console.error("Error starting server:", error);
});
