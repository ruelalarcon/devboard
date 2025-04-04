const replyResolvers = require("../../graphql/resolvers/reply");
const { mockContext, mockModels } = require("../mocks");
const { GraphQLError } = require("graphql");

// Mock the sanitizer utility
jest.mock("../../utils/sanitizer", () => ({
  sanitizeContent: jest.fn((content) => content),
}));

describe("Reply Resolvers", () => {
  describe("Query", () => {
    // Test for reply query
    test("reply - returns reply by id", async () => {
      const replyId = 1;
      const mockReply = { id: replyId, content: "Test reply" };

      mockModels.Reply.findByPk.mockResolvedValue(mockReply);

      const context = mockContext();
      const result = await replyResolvers.Query.reply(null, { id: replyId }, context);

      expect(mockModels.Reply.findByPk).toHaveBeenCalledWith(replyId);
      expect(result).toEqual(mockReply);
    });

    // Test for repliesByMessage query
    test("repliesByMessage - returns replies by message id", async () => {
      const messageId = 1;
      const mockReplies = [
        { id: 1, content: "Reply 1" },
        { id: 2, content: "Reply 2" },
      ];

      mockModels.Reply.findAll.mockResolvedValue(mockReplies);

      const context = mockContext();
      const result = await replyResolvers.Query.repliesByMessage(null, { messageId }, context);

      expect(mockModels.Reply.findAll).toHaveBeenCalledWith({
        where: { messageId, parentReplyId: null },
        order: [["createdAt", "ASC"]],
      });
      expect(result).toEqual(mockReplies);
    });

    // Test for repliesByParentReply query
    test("repliesByParentReply - returns replies by parent reply id", async () => {
      const parentReplyId = 1;
      const mockReplies = [
        { id: 2, content: "Child Reply 1" },
        { id: 3, content: "Child Reply 2" },
      ];

      mockModels.Reply.findAll.mockResolvedValue(mockReplies);

      const context = mockContext();
      const result = await replyResolvers.Query.repliesByParentReply(
        null,
        { parentReplyId },
        context
      );

      expect(mockModels.Reply.findAll).toHaveBeenCalledWith({
        where: { parentReplyId },
        order: [["createdAt", "ASC"]],
      });
      expect(result).toEqual(mockReplies);
    });
  });

  describe("Mutation", () => {
    // Test for createReply mutation
    test("createReply - creates a new reply to a message", async () => {
      const userId = 1;
      const messageId = 1;
      const replyInput = {
        messageId,
        content: "New reply content",
        screenshot: "screenshot.jpg",
      };

      const mockMessage = { id: messageId, content: "Original message" };
      const mockReply = {
        id: 1,
        ...replyInput,
        userId,
        parentReplyId: undefined,
      };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);
      mockModels.Reply.create.mockResolvedValue(mockReply);

      const context = mockContext(userId);
      const result = await replyResolvers.Mutation.createReply(null, replyInput, context);

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(messageId);
      expect(mockModels.Reply.create).toHaveBeenCalledWith({
        content: replyInput.content,
        screenshot: replyInput.screenshot,
        userId,
        messageId,
        parentReplyId: undefined,
      });
      expect(result).toEqual(mockReply);
    });

    // Test for createReply to another reply
    test("createReply - creates a new reply to another reply", async () => {
      const userId = 1;
      const messageId = 1;
      const parentReplyId = 2;
      const replyInput = {
        messageId,
        parentReplyId,
        content: "Reply to a reply",
        screenshot: "screenshot.jpg",
      };

      const mockMessage = { id: messageId, content: "Original message" };
      const mockParentReply = { id: parentReplyId, content: "Parent reply", messageId };
      const mockReply = {
        id: 3,
        ...replyInput,
        userId,
      };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);
      mockModels.Reply.findByPk.mockResolvedValue(mockParentReply);
      mockModels.Reply.create.mockResolvedValue(mockReply);

      const context = mockContext(userId);
      const result = await replyResolvers.Mutation.createReply(null, replyInput, context);

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(messageId);
      expect(mockModels.Reply.findByPk).toHaveBeenCalledWith(parentReplyId);
      expect(mockModels.Reply.create).toHaveBeenCalledWith({
        content: replyInput.content,
        screenshot: replyInput.screenshot,
        userId,
        messageId,
        parentReplyId,
      });
      expect(result).toEqual(mockReply);
    });

    // Test for createReply with authentication error
    test("createReply - throws error if not authenticated", async () => {
      const replyInput = {
        messageId: 1,
        content: "New reply content",
      };

      const context = mockContext(); // No userId

      await expect(replyResolvers.Mutation.createReply(null, replyInput, context)).rejects.toThrow(
        GraphQLError
      );

      expect(mockModels.Reply.create).not.toHaveBeenCalled();
    });

    // Test for updateReply mutation
    test("updateReply - updates an existing reply", async () => {
      const userId = 1;
      const replyId = 1;
      const updates = {
        id: replyId,
        content: "Updated content",
        screenshot: "updated.jpg",
      };

      const mockReply = {
        id: replyId,
        content: "Original content",
        screenshot: "original.jpg",
        userId,
        save: jest.fn(),
      };

      const mockUser = { id: userId, isAdmin: false };

      mockModels.Reply.findByPk.mockResolvedValue(mockReply);
      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext(userId);
      const result = await replyResolvers.Mutation.updateReply(null, updates, context);

      expect(mockModels.Reply.findByPk).toHaveBeenCalledWith(replyId);
      expect(mockModels.User.findByPk).toHaveBeenCalledWith(userId);
      expect(mockReply.content).toBe(updates.content);
      expect(mockReply.screenshot).toBe(updates.screenshot);
      expect(mockReply.save).toHaveBeenCalled();
      expect(result).toEqual(mockReply);
    });
  });

  describe("Reply field resolvers", () => {
    const mockReply = {
      id: 1,
      content: "Test reply",
      userId: 1,
      messageId: 1,
      parentReplyId: null,
    };

    // Test for author field resolver
    test("author - returns reply author", async () => {
      const mockUser = { id: 1, username: "author" };

      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await replyResolvers.Reply.author(mockReply, {}, context);

      expect(mockModels.User.findByPk).toHaveBeenCalledWith(mockReply.userId);
      expect(result).toEqual(mockUser);
    });

    // Test for message field resolver
    test("message - returns reply message", async () => {
      const mockMessage = { id: 1, content: "Original message" };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);

      const context = mockContext();
      const result = await replyResolvers.Reply.message(mockReply, {}, context);

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(mockReply.messageId);
      expect(result).toEqual(mockMessage);
    });

    // Test for positiveRatings field resolver
    test("positiveRatings - returns count of positive ratings", async () => {
      const count = 5;

      mockModels.Rating.count.mockResolvedValue(count);

      const context = mockContext();
      const result = await replyResolvers.Reply.positiveRatings(mockReply, {}, context);

      expect(mockModels.Rating.count).toHaveBeenCalledWith({
        where: {
          contentId: mockReply.id,
          contentType: "reply",
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
      const result = await replyResolvers.Reply.negativeRatings(mockReply, {}, context);

      expect(mockModels.Rating.count).toHaveBeenCalledWith({
        where: {
          contentId: mockReply.id,
          contentType: "reply",
          isPositive: false,
        },
      });
      expect(result).toBe(count);
    });
  });
});
