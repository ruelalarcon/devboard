const messageResolvers = require("../../graphql/resolvers/message");
const { mockContext, mockModels } = require("../mocks");
const { GraphQLError } = require("graphql");

// Mock the sanitizer utility
jest.mock("../../utils/sanitizer", () => ({
  sanitizeContent: jest.fn((content) => content),
}));

describe("Message Resolvers", () => {
  describe("Query", () => {
    // Test for message query
    test("message - returns message by id", async () => {
      const messageId = 1;
      const mockMessage = { id: messageId, content: "Test message" };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);

      const context = mockContext();
      const result = await messageResolvers.Query.message(null, { id: messageId }, context);

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(mockMessage);
    });

    // Test for messagesByChannel query
    test("messagesByChannel - returns messages by channel id", async () => {
      const channelId = 1;
      const mockMessages = [
        { id: 1, content: "Message 1" },
        { id: 2, content: "Message 2" },
      ];

      mockModels.Message.findAll.mockResolvedValue(mockMessages);

      const context = mockContext();
      const result = await messageResolvers.Query.messagesByChannel(null, { channelId }, context);

      expect(mockModels.Message.findAll).toHaveBeenCalledWith({
        where: { channelId },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe("Mutation", () => {
    // Test for createMessage mutation
    test("createMessage - creates a new message", async () => {
      const userId = 1;
      const channelId = 1;
      const messageInput = {
        channelId,
        content: "New message content",
        screenshot: "screenshot.jpg",
      };

      const mockChannel = { id: channelId, name: "Test Channel" };
      const mockMessage = {
        id: 1,
        ...messageInput,
        userId,
      };

      mockModels.Channel.findByPk.mockResolvedValue(mockChannel);
      mockModels.Message.create.mockResolvedValue(mockMessage);

      const context = mockContext(userId);
      const result = await messageResolvers.Mutation.createMessage(null, messageInput, context);

      expect(mockModels.Channel.findByPk).toHaveBeenCalledWith(channelId);
      expect(mockModels.Message.create).toHaveBeenCalledWith({
        content: messageInput.content,
        screenshot: messageInput.screenshot,
        userId,
        channelId,
      });
      expect(result).toEqual(mockMessage);
    });

    // Test for createMessage with authentication error
    test("createMessage - throws error if not authenticated", async () => {
      const messageInput = {
        channelId: 1,
        content: "New message content",
      };

      const context = mockContext(); // No userId

      await expect(
        messageResolvers.Mutation.createMessage(null, messageInput, context)
      ).rejects.toThrow(GraphQLError);

      expect(mockModels.Message.create).not.toHaveBeenCalled();
    });

    // Test for updateMessage mutation
    test("updateMessage - updates an existing message", async () => {
      const userId = 1;
      const messageId = 1;
      const updates = {
        id: messageId,
        content: "Updated content",
        screenshot: "updated.jpg",
      };

      const mockMessage = {
        id: messageId,
        content: "Original content",
        screenshot: "original.jpg",
        userId,
        save: jest.fn(),
      };

      const mockUser = { id: userId, isAdmin: false };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);
      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext(userId);
      const result = await messageResolvers.Mutation.updateMessage(null, updates, context);

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(messageId);
      expect(mockModels.User.findByPk).toHaveBeenCalledWith(userId);
      expect(mockMessage.content).toBe(updates.content);
      expect(mockMessage.screenshot).toBe(updates.screenshot);
      expect(mockMessage.save).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });
  });

  describe("Message field resolvers", () => {
    const mockMessage = { id: 1, content: "Test message", userId: 1, channelId: 1 };

    // Test for author field resolver
    test("author - returns message author", async () => {
      const mockUser = { id: 1, username: "author" };

      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await messageResolvers.Message.author(mockMessage, {}, context);

      expect(mockModels.User.findByPk).toHaveBeenCalledWith(mockMessage.userId);
      expect(result).toEqual(mockUser);
    });

    // Test for channel field resolver
    test("channel - returns message channel", async () => {
      const mockChannel = { id: 1, name: "Test Channel" };

      mockModels.Channel.findByPk.mockResolvedValue(mockChannel);

      const context = mockContext();
      const result = await messageResolvers.Message.channel(mockMessage, {}, context);

      expect(mockModels.Channel.findByPk).toHaveBeenCalledWith(mockMessage.channelId);
      expect(result).toEqual(mockChannel);
    });

    // Test for replies field resolver
    test("replies - returns message replies", async () => {
      const mockReplies = [
        { id: 1, content: "Reply 1" },
        { id: 2, content: "Reply 2" },
      ];

      mockModels.Reply.findAll.mockResolvedValue(mockReplies);

      const context = mockContext();
      const result = await messageResolvers.Message.replies(mockMessage, {}, context);

      expect(mockModels.Reply.findAll).toHaveBeenCalledWith({
        where: {
          messageId: mockMessage.id,
          parentReplyId: null,
        },
        order: [["createdAt", "ASC"]],
      });
      expect(result).toEqual(mockReplies);
    });

    // Test for positiveRatings field resolver
    test("positiveRatings - returns count of positive ratings", async () => {
      const count = 5;

      mockModels.Rating.count.mockResolvedValue(count);

      const context = mockContext();
      const result = await messageResolvers.Message.positiveRatings(mockMessage, {}, context);

      expect(mockModels.Rating.count).toHaveBeenCalledWith({
        where: {
          contentId: mockMessage.id,
          contentType: "message",
          isPositive: true,
        },
      });
      expect(result).toBe(count);
    });

    // Test for negativeRatings field resolver
    test("negativeRatings - returns count of negative ratings", async () => {
      const count = 2;

      mockModels.Rating.count.mockResolvedValue(count);

      const context = mockContext();
      const result = await messageResolvers.Message.negativeRatings(mockMessage, {}, context);

      expect(mockModels.Rating.count).toHaveBeenCalledWith({
        where: {
          contentId: mockMessage.id,
          contentType: "message",
          isPositive: false,
        },
      });
      expect(result).toBe(count);
    });
  });
});
