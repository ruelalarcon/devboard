const { GraphQLError } = require("graphql");
const { Op } = require("sequelize");

// Helper function to create errors with specific codes
const createError = (message, code) => {
  return new GraphQLError(message, {
    extensions: { code },
  });
};

module.exports = {
  Query: {
    me: async (_, __, { req, db }) => {
      if (!req.session.userId) {
        return null;
      }
      return await db.User.findByPk(req.session.userId);
    },
    user: async (_, { id }, { db }) => {
      return await db.User.findByPk(id);
    },
    userByName: async (_, { username }, { db }) => {
      return await db.User.findOne({ where: { username } });
    },
    users: async (_, __, { db }) => {
      return await db.User.findAll();
    },
    topUsers: async (_, { sortBy = "posts" }, { db, sequelize }) => {
      let users = [];

      if (sortBy === "posts") {
        // Get users with most posts (messages + replies)
        const results = await db.User.findAll({
          attributes: [
            "id",
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM Messages WHERE Messages.userId = User.id)"
              ),
              "messageCount",
            ],
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM Replies WHERE Replies.userId = User.id)"
              ),
              "replyCount",
            ],
          ],
          order: [[sequelize.literal("messageCount + replyCount"), "DESC"]],
        });

        // Get full user objects
        const userIds = results.map((user) => user.id);
        users = await db.User.findAll({
          where: { id: { [Op.in]: userIds } },
          order: sequelize.literal(`FIELD(id, ${userIds.join(",")})`),
        });
      } else if (sortBy === "ratings") {
        // Users with highest rating
        const results = await db.User.findAll({
          attributes: [
            "id",
            [
              sequelize.literal(`
              (SELECT COUNT(*) FROM Ratings
               WHERE Ratings.contentId IN (
                 SELECT id FROM Messages WHERE Messages.userId = User.id
               )
               OR Ratings.contentId IN (
                 SELECT id FROM Replies WHERE Replies.userId = User.id
               )
               AND Ratings.isPositive = true)
            `),
              "positiveRatings",
            ],
            [
              sequelize.literal(`
              (SELECT COUNT(*) FROM Ratings
               WHERE Ratings.contentId IN (
                 SELECT id FROM Messages WHERE Messages.userId = User.id
               )
               OR Ratings.contentId IN (
                 SELECT id FROM Replies WHERE Replies.userId = User.id
               )
               AND Ratings.isPositive = false)
            `),
              "negativeRatings",
            ],
          ],
          order: [
            [sequelize.literal("positiveRatings - negativeRatings"), "DESC"],
          ],
        });

        // Get full user objects
        const userIds = results.map((user) => user.id);
        users = await db.User.findAll({
          where: { id: { [Op.in]: userIds } },
          order: sequelize.literal(`FIELD(id, ${userIds.join(",")})`),
        });
      }

      return users;
    },
  },

  Mutation: {
    register: async (
      _,
      { username, password, displayName, avatar },
      { db, req }
    ) => {
      // Check if username already exists
      const existingUser = await db.User.findOne({ where: { username } });
      if (existingUser) {
        throw createError("Username already exists", "FORBIDDEN");
      }

      // Create new user
      const user = await db.User.create({
        username,
        password,
        displayName,
        avatar,
      });

      // Set session
      req.session.userId = user.id;

      return { user };
    },

    login: async (_, { username, password }, { db, req }) => {
      // Find user
      const user = await db.User.findOne({ where: { username } });
      if (!user) {
        throw createError("Invalid username or password", "UNAUTHENTICATED");
      }

      // Validate password
      const validPassword = await user.validPassword(password);
      if (!validPassword) {
        throw createError("Invalid username or password", "UNAUTHENTICATED");
      }

      // Set session
      req.session.userId = user.id;

      return { user };
    },

    logout: async (_, __, { req }) => {
      return new Promise((resolve) => {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    },

    updateUser: async (_, args, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Update user
      const user = await db.User.findByPk(req.session.userId);
      if (!user) {
        throw createError("User not found", "NOT_FOUND");
      }

      // Update fields if provided
      if (args.displayName) user.displayName = args.displayName;
      if (args.avatar) user.avatar = args.avatar;

      await user.save();
      return user;
    },

    deleteUser: async (_, { id }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Authorization check (admin or self)
      const currentUser = await db.User.findByPk(req.session.userId);
      if (!currentUser.isAdmin && currentUser.id !== id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // Delete user
      const user = await db.User.findByPk(id);
      if (!user) {
        throw createError("User not found", "NOT_FOUND");
      }

      await user.destroy();

      // If deleted self, clear session
      if (currentUser.id === id) {
        req.session.destroy();
      }

      return true;
    },
  },

  User: {
    channels: async (user, _, { db }) => {
      return await db.Channel.findAll({
        where: { createdBy: user.id },
        order: [["createdAt", "DESC"]],
      });
    },
    messages: async (user, _, { db }) => {
      return await db.Message.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
      });
    },
    replies: async (user, _, { db }) => {
      return await db.Reply.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
      });
    },
    ratings: async (user, _, { db }) => {
      return await db.Rating.findAll({
        where: { userId: user.id },
      });
    },
  },
};
