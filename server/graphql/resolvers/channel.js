const { GraphQLError } = require("graphql");

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
        order: [["createdAt", "DESC"]]
      });
    },
  },

  Mutation: {
    createChannel: async (_, { name, description }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError("You must be logged in", "UNAUTHENTICATED");
      }

      // Create channel
      const channel = await db.Channel.create({
        name,
        description,
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

      // Update fields if provided
      if (name) channel.name = name;
      if (description !== undefined) channel.description = description;

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

      // Delete channel
      await channel.destroy();
      return true;
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
