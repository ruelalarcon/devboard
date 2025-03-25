const { Op } = require("sequelize");

module.exports = {
  Query: {
    searchContent: async (_, { query }, { db }) => {
      // Search in messages and replies for the query string
      const messages = await db.Message.findAll({
        where: {
          content: {
            [Op.like]: `%${query}%`,
          },
        },
      });

      const replies = await db.Reply.findAll({
        where: {
          content: {
            [Op.like]: `%${query}%`,
          },
        },
      });

      // Combine results
      return [...messages, ...replies];
    },

    contentByUser: async (_, { userId }, { db }) => {
      // Get all content by a specific user
      const messages = await db.Message.findAll({
        where: { userId },
      });

      const replies = await db.Reply.findAll({
        where: { userId },
      });

      // Combine results
      return [...messages, ...replies];
    },
  },

  SearchResult: {
    __resolveType(obj) {
      if (obj.channelId) {
        return "Message";
      } else if (obj.messageId) {
        return "Reply";
      }
      return null;
    },
  },
};
