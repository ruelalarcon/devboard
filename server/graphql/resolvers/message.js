const { GraphQLError } = require("graphql");
const { Op } = require("sequelize");
const { sanitizeContent } = require("../../utils/sanitizer");

// Helper function to create errors with specific codes
const createError = (message, code) => {
  return new GraphQLError(message, {
    extensions: { code },
  });
};

module.exports = {
  Query: {
    message: async (_, { id }, { db }) => {
      return await db.Message.findByPk(id);
    },
    messagesByChannel: async (_, { channelId }, { db }) => {
      return await db.Message.findAll({
        where: { channelId },
        order: [["createdAt", "DESC"]],
      });
    },
  },

  Mutation: {
    createMessage: async (
      _,
      { channelId, content, screenshot },
      { db, req }
    ) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Check if channel exists
      const channel = await db.Channel.findByPk(channelId);
      if (!channel) {
        throw createError("Channel not found", "NOT_FOUND");
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(content);

      // Create message
      const message = await db.Message.create({
        content: sanitizedContent,
        screenshot,
        userId: req.session.userId,
        channelId,
      });

      return message;
    },

    updateMessage: async (_, { id, content, screenshot }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Get message
      const message = await db.Message.findByPk(id);
      if (!message) {
        throw createError("Message not found", "NOT_FOUND");
      }

      // Authorization check (admin or creator)
      const user = await db.User.findByPk(req.session.userId);
      if (!user.isAdmin && message.userId !== user.id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // Update fields if provided
      if (content !== undefined) message.content = sanitizeContent(content);
      if (screenshot !== undefined) message.screenshot = screenshot;

      await message.save();
      return message;
    },

    deleteMessage: async (_, { id }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Get message
      const message = await db.Message.findByPk(id);
      if (!message) {
        throw createError("Message not found", "NOT_FOUND");
      }

      // Authorization check (admin or creator)
      const user = await db.User.findByPk(req.session.userId);
      if (!user.isAdmin && message.userId !== user.id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // Delete message
      await message.destroy();
      return true;
    },
  },

  Message: {
    author: async (message, _, { db }) => {
      return await db.User.findByPk(message.userId);
    },
    channel: async (message, _, { db }) => {
      return await db.Channel.findByPk(message.channelId);
    },
    replies: async (message, _, { db }) => {
      return await db.Reply.findAll({
        where: {
          messageId: message.id,
          parentReplyId: null, // Only top-level replies
        },
        order: [["createdAt", "ASC"]],
      });
    },
    ratings: async (message, _, { db }) => {
      return await db.Rating.findAll({
        where: {
          contentId: message.id,
          contentType: "message",
        },
      });
    },
    positiveRatings: async (message, _, { db }) => {
      return await db.Rating.count({
        where: {
          contentId: message.id,
          contentType: "message",
          isPositive: true,
        },
      });
    },
    negativeRatings: async (message, _, { db }) => {
      return await db.Rating.count({
        where: {
          contentId: message.id,
          contentType: "message",
          isPositive: false,
        },
      });
    },
  },
};
