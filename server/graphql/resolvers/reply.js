const { GraphQLError } = require("graphql");
const { sanitizeContent } = require("../../utils/sanitizer");

// Helper function to create errors with specific codes
const createError = (message, code) => {
  return new GraphQLError(message, {
    extensions: { code },
  });
};

module.exports = {
  Query: {
    reply: async (_, { id }, { db }) => {
      return await db.Reply.findByPk(id);
    },
    repliesByMessage: async (_, { messageId }, { db }) => {
      return await db.Reply.findAll({
        where: { messageId, parentReplyId: null },
        order: [["createdAt", "ASC"]],
      });
    },
    repliesByParentReply: async (_, { parentReplyId }, { db }) => {
      return await db.Reply.findAll({
        where: { parentReplyId },
        order: [["createdAt", "ASC"]],
      });
    },
  },

  Mutation: {
    createReply: async (
      _,
      { messageId, content, screenshot, parentReplyId },
      { db, req }
    ) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(content);

      // Check if message exists
      let message = null;
      if (messageId) {
        message = await db.Message.findByPk(messageId);
        if (!message) {
          throw createError("Message not found", "NOT_FOUND");
        }
      }

      // If replying to a reply, check if that reply exists
      let parentReply = null;
      if (parentReplyId) {
        parentReply = await db.Reply.findByPk(parentReplyId);
        if (!parentReply) {
          throw createError("Parent reply not found", "NOT_FOUND");
        }
        // If parent reply is provided, get its message ID
        if (!messageId) {
          messageId = parentReply.messageId;
        }
      }

      // Create reply
      const reply = await db.Reply.create({
        content: sanitizedContent,
        screenshot,
        userId: req.session.userId,
        messageId,
        parentReplyId,
      });

      return reply;
    },

    updateReply: async (_, { id, content, screenshot }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Get reply
      const reply = await db.Reply.findByPk(id);
      if (!reply) {
        throw createError("Reply not found", "NOT_FOUND");
      }

      // Authorization check (admin or creator)
      const user = await db.User.findByPk(req.session.userId);
      if (!user.isAdmin && reply.userId !== user.id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // Update fields if provided
      if (content !== undefined) reply.content = sanitizeContent(content);
      if (screenshot !== undefined) reply.screenshot = screenshot;

      await reply.save();
      return reply;
    },

    deleteReply: async (_, { id }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Get reply
      const reply = await db.Reply.findByPk(id);
      if (!reply) {
        throw createError("Reply not found", "NOT_FOUND");
      }

      // Authorization check (admin or creator)
      const user = await db.User.findByPk(req.session.userId);
      if (!user.isAdmin && reply.userId !== user.id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // Delete reply
      await reply.destroy();
      return true;
    },
  },

  Reply: {
    author: async (reply, _, { db }) => {
      return await db.User.findByPk(reply.userId);
    },
    message: async (reply, _, { db }) => {
      return await db.Message.findByPk(reply.messageId);
    },
    parentReply: async (reply, _, { db }) => {
      if (!reply.parentReplyId) return null;
      return await db.Reply.findByPk(reply.parentReplyId);
    },
    replies: async (reply, _, { db }) => {
      return await db.Reply.findAll({
        where: { parentReplyId: reply.id },
        order: [["createdAt", "ASC"]],
      });
    },
    ratings: async (reply, _, { db }) => {
      return await db.Rating.findAll({
        where: {
          contentId: reply.id,
          contentType: "reply",
        },
      });
    },
    positiveRatings: async (reply, _, { db }) => {
      return await db.Rating.count({
        where: {
          contentId: reply.id,
          contentType: "reply",
          isPositive: true,
        },
      });
    },
    negativeRatings: async (reply, _, { db }) => {
      return await db.Rating.count({
        where: {
          contentId: reply.id,
          contentType: "reply",
          isPositive: false,
        },
      });
    },
  },
};
