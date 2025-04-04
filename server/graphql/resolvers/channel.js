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
    channel: async (_, { id }, { db }) => {
      return await db.Channel.findByPk(id);
    },
    channels: async (_, __, { db }) => {
      return await db.Channel.findAll({
        order: [["createdAt", "DESC"]],
      });
    },
  },

  Mutation: {
    createChannel: async (_, { name, description }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Check if channel name already exists
      const existingChannel = await db.Channel.findOne({ where: { name } });
      if (existingChannel) {
        throw createError("Channel name already exists", "BAD_USER_INPUT");
      }

      // Sanitize description if provided
      const sanitizedDescription = description ? sanitizeContent(description) : null;

      // Create channel
      const channel = await db.Channel.create({
        name,
        description: sanitizedDescription,
        createdBy: req.session.userId,
      });

      return channel;
    },

    updateChannel: async (_, { id, name, description }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Get channel
      const channel = await db.Channel.findByPk(id);
      if (!channel) {
        throw createError("Channel not found", "NOT_FOUND");
      }

      // Authorization check (admin or creator)
      const user = await db.User.findByPk(req.session.userId);
      if (!user.isAdmin && channel.createdBy !== user.id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // If updating name, check if it already exists
      if (name && name !== channel.name) {
        const existingChannel = await db.Channel.findOne({ where: { name } });
        if (existingChannel) {
          throw createError("Channel name already exists", "BAD_USER_INPUT");
        }
        channel.name = name;
      }

      // Update description if provided
      if (description !== undefined) {
        channel.description = description ? sanitizeContent(description) : null;
      }

      await channel.save();
      return channel;
    },

    deleteChannel: async (_, { id }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Get channel
      const channel = await db.Channel.findByPk(id);
      if (!channel) {
        throw createError("Channel not found", "NOT_FOUND");
      }

      // Authorization check (admin or creator)
      const user = await db.User.findByPk(req.session.userId);
      if (!user.isAdmin && channel.createdBy !== user.id) {
        throw createError("Not authorized", "FORBIDDEN");
      }

      // Use a transaction to ensure data consistency
      const transaction = await db.sequelize.transaction();

      try {
        // Step 1: Find all messages in this channel
        const messages = await db.Message.findAll({
          where: { channelId: id },
          attributes: ["id"],
          transaction,
        });

        const messageIds = messages.map((m) => m.id);

        if (messageIds.length > 0) {
          // Step 2: Find all replies to these messages
          const replies = await db.Reply.findAll({
            where: { messageId: messageIds },
            attributes: ["id"],
            transaction,
          });

          const replyIds = replies.map((r) => r.id);

          // Step 3: Delete ratings for replies
          if (replyIds.length > 0) {
            await db.Rating.destroy({
              where: {
                contentId: replyIds,
                contentType: "reply",
              },
              transaction,
            });
          }

          // Step 4: Delete all replies to messages in this channel
          await db.Reply.destroy({
            where: { messageId: messageIds },
            transaction,
          });

          // Step 5: Delete ratings for messages
          await db.Rating.destroy({
            where: {
              contentId: messageIds,
              contentType: "message",
            },
            transaction,
          });
        }

        // Step 6: Delete all messages in this channel
        await db.Message.destroy({
          where: { channelId: id },
          transaction,
        });

        // Step 7: Finally delete the channel
        await channel.destroy({ transaction });

        // Commit the transaction
        await transaction.commit();

        return true;
      } catch (error) {
        // Rollback the transaction in case of error
        await transaction.rollback();
        console.error("Error during channel deletion:", error);
        throw createError(`Failed to delete channel: ${error.message}`, "INTERNAL_SERVER_ERROR");
      }
    },
  },

  Channel: {
    creator: async (channel, _, { db }) => {
      return await db.User.findByPk(channel.createdBy);
    },
    messages: async (channel, _, { db }) => {
      return await db.Message.findAll({
        where: { channelId: channel.id },
        order: [["createdAt", "DESC"]],
      });
    },
  },
};
