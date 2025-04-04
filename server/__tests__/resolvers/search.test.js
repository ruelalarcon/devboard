const searchResolvers = require("../../graphql/resolvers/search");
const { mockContext, mockModels } = require("../mocks");
const { Op } = require("sequelize");

describe("Search Resolvers", () => {
  describe("Query", () => {
    // Test for searchContent query
    test("searchContent - searches in messages and replies", async () => {
      const query = "test";
      const mockMessages = [{ id: 1, content: "test message" }];
      const mockReplies = [{ id: 1, content: "test reply" }];

      mockModels.Message.findAll.mockResolvedValue(mockMessages);
      mockModels.Reply.findAll.mockResolvedValue(mockReplies);

      const context = mockContext();
      const result = await searchResolvers.Query.searchContent(null, { query }, context);

      expect(mockModels.Message.findAll).toHaveBeenCalledWith({
        where: {
          content: {
            [Op.like]: `%${query}%`,
          },
        },
      });

      expect(mockModels.Reply.findAll).toHaveBeenCalledWith({
        where: {
          content: {
            [Op.like]: `%${query}%`,
          },
        },
      });

      expect(result).toEqual([...mockMessages, ...mockReplies]);
    });

    // Test for contentByUser query
    test("contentByUser - gets all content by a user", async () => {
      const userId = 1;
      const mockMessages = [{ id: 1, content: "message by user" }];
      const mockReplies = [{ id: 1, content: "reply by user" }];

      mockModels.Message.findAll.mockResolvedValue(mockMessages);
      mockModels.Reply.findAll.mockResolvedValue(mockReplies);

      const context = mockContext();
      const result = await searchResolvers.Query.contentByUser(null, { userId }, context);

      expect(mockModels.Message.findAll).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(mockModels.Reply.findAll).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(result).toEqual([...mockMessages, ...mockReplies]);
    });

    // Test for searchChannels query
    test("searchChannels - searches for channels", async () => {
      const searchTerm = "test";
      const sortBy = "recent";
      const mockChannels = [{ id: 1, name: "test channel" }];

      mockModels.Channel.findAll.mockResolvedValue(mockChannels);

      const context = mockContext();
      const result = await searchResolvers.Query.searchChannels(
        null,
        { searchTerm, sortBy },
        context
      );

      expect(mockModels.Channel.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: mockModels.User,
            as: "creator",
            attributes: ["id", "displayName"],
          },
        ],
      });

      expect(result).toEqual(mockChannels);
    });

    // Test for searchMessages query
    test("searchMessages - searches for messages", async () => {
      const searchTerm = "test";
      const sortBy = "recent";
      const mockMessages = [
        {
          id: 1,
          content: "test message",
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            content: "test message",
            ratings: [{ isPositive: true }, { isPositive: true }, { isPositive: false }],
          }),
        },
      ];

      mockModels.Message.findAll.mockResolvedValue(mockMessages);

      const context = mockContext();
      const result = await searchResolvers.Query.searchMessages(
        null,
        { searchTerm, sortBy },
        context
      );

      expect(mockModels.Message.findAll).toHaveBeenCalledWith({
        where: {
          content: { [Op.like]: `%${searchTerm}%` },
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: mockModels.Channel,
            as: "channel",
            attributes: ["id", "name"],
          },
          {
            model: mockModels.User,
            as: "author",
            attributes: ["id", "username", "displayName", "avatar"],
          },
          {
            model: mockModels.Rating,
            as: "ratings",
            attributes: ["isPositive"],
            required: false,
          },
        ],
      });

      expect(result[0].positiveRatings).toBe(2);
      expect(result[0].negativeRatings).toBe(1);
    });

    // Test for searchUsers query
    test("searchUsers - searches for users", async () => {
      const searchTerm = "test";
      const sortBy = "recent";
      const mockUsers = [{ id: 1, username: "testuser" }];

      mockModels.User.findAll.mockResolvedValue(mockUsers);

      const context = mockContext();
      const result = await searchResolvers.Query.searchUsers(null, { searchTerm, sortBy }, context);

      expect(mockModels.User.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${searchTerm}%` } },
            { displayName: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        order: [["createdAt", "DESC"]],
        attributes: ["id", "username", "displayName", "avatar", "createdAt", "updatedAt"],
      });

      expect(result).toEqual(mockUsers);
    });
  });

  describe("SearchResult", () => {
    test("__resolveType - resolves message type", () => {
      const mockMessage = { channelId: 1 };
      const result = searchResolvers.SearchResult.__resolveType(mockMessage);
      expect(result).toBe("Message");
    });

    test("__resolveType - resolves reply type", () => {
      const mockReply = { messageId: 1 };
      const result = searchResolvers.SearchResult.__resolveType(mockReply);
      expect(result).toBe("Reply");
    });

    test("__resolveType - returns null for unknown type", () => {
      const mockObject = { someField: "value" };
      const result = searchResolvers.SearchResult.__resolveType(mockObject);
      expect(result).toBeNull();
    });
  });
});
