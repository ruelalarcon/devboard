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

    searchChannels: async (_, { searchTerm, sortBy = "recent" }, { db }) => {
      const whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
        ],
      };

      const order =
        sortBy === "rating"
          ? [["updatedAt", "DESC"]] // No direct rating for channels, use updated time
          : [["createdAt", "DESC"]];

      const channels = await db.Channel.findAll({
        where: whereClause,
        order,
        include: [
          {
            model: db.User,
            as: "creator",
            attributes: ["id", "displayName"],
          },
        ],
      });

      return channels;
    },

    searchMessages: async (_, { searchTerm, sortBy = "recent" }, { db }) => {
      const whereClause = {
        content: { [Op.like]: `%${searchTerm}%` },
      };

      // Default sort by recent
      let order = [["createdAt", "DESC"]];

      // We'll fetch messages first and then sort by ratings in memory if needed
      // rather than trying to use columns that don't exist directly in the DB
      const messages = await db.Message.findAll({
        where: whereClause,
        order,
        include: [
          {
            model: db.Channel,
            as: "channel",
            attributes: ["id", "name"],
          },
          {
            model: db.User,
            as: "author",
            attributes: ["id", "username", "displayName", "avatar"],
          },
          {
            model: db.Rating,
            as: "ratings",
            attributes: ["isPositive"],
            required: false,
          },
        ],
      });

      // Calculate positive and negative ratings
      const messagesWithRatings = messages.map((message) => {
        const messageObj = message.toJSON();
        const ratings = messageObj.ratings || [];

        const positiveRatingsCount = ratings.filter((r) => r.isPositive).length;
        const negativeRatingsCount = ratings.filter((r) => !r.isPositive).length;

        messageObj.positiveRatings = positiveRatingsCount;
        messageObj.negativeRatings = negativeRatingsCount;

        // Clean up the ratings array since we've extracted what we need
        delete messageObj.ratings;

        return messageObj;
      });

      // Sort by rating if requested
      if (sortBy === "rating") {
        messagesWithRatings.sort((a, b) => {
          const ratingA = a.positiveRatings - a.negativeRatings;
          const ratingB = b.positiveRatings - b.negativeRatings;
          return ratingB - ratingA; // Descending order
        });
      }

      return messagesWithRatings;
    },

    searchUsers: async (_, { searchTerm, sortBy = "recent" }, { db }) => {
      // Build where clause for username and displayName
      const whereClause = {
        [Op.or]: [
          { username: { [Op.like]: `%${searchTerm}%` } },
          { displayName: { [Op.like]: `%${searchTerm}%` } },
        ],
      };

      // Try to search by ID if the search term is a valid ID number
      const numericId = parseInt(searchTerm);
      if (!isNaN(numericId) && numericId.toString() === searchTerm) {
        whereClause[Op.or].push({ id: numericId });
      }

      // Get users with basic data only
      const users = await db.User.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "username", "displayName", "avatar", "createdAt", "updatedAt"],
      });

      return users;
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
