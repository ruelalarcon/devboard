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
let db = require("./models");

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
    secret: process.env.SESSION_SECRET || "test-session-secret",
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
const apolloServer = new ApolloServer({
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
  // In test mode, we might need to get a fresh database connection
  if (process.env.NODE_ENV === "test") {
    // Clear the model cache to get a fresh connection
    Object.keys(require.cache).forEach((key) => {
      if (key.includes("/models/")) {
        delete require.cache[key];
      }
    });
    // Reload the models
    db = require("./models");
  }

  // Start Apollo Server
  await apolloServer.start();

  // Apply Apollo middleware to Express app
  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apolloServer, {
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

  // Create database tables if they don't exist - skip in test mode
  if (process.env.NODE_ENV !== "test") {
    await db.sequelize.sync();

    // Create admin account if it doesn't exist
    const adminExists = await db.User.findOne({ where: { username: "admin" } });
    if (!adminExists) {
      await db.User.create({
        username: "admin",
        password: process.env.ADMIN_PASSWORD || "test_admin_password", // Use default for testing
        displayName: "Administrator",
        isAdmin: true,
      });
      console.log("Admin account created");
    }
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
  const serverInstance = httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`REST API endpoints available at http://localhost:${PORT}/api`);
  });

  return serverInstance;
}

// Handle errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

// Start the server only if not being imported for testing
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Error starting server:", error);
  });
}

// Export for testing
module.exports = { app, httpServer, startServer };
