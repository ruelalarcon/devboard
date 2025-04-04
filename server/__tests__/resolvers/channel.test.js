const channelResolvers = require("../../graphql/resolvers/channel");
const { mockContext, mockModels } = require("../mocks");
const { GraphQLError } = require("graphql");

// Mock the sanitizer utility
jest.mock("../../utils/sanitizer", () => ({
  sanitizeContent: jest.fn((content) => content),
}));

describe("Channel Resolvers", () => {
  describe("Query", () => {
    // Test for channel query
    test("channel - returns channel by id", async () => {
      const channelId = 1;
      const mockChannel = { id: channelId, name: "Test Channel" };

      mockModels.Channel.findByPk.mockResolvedValue(mockChannel);

      const context = mockContext();
      const result = await channelResolvers.Query.channel(null, { id: channelId }, context);

      expect(mockModels.Channel.findByPk).toHaveBeenCalledWith(channelId);
      expect(result).toEqual(mockChannel);
    });

    // Test for channels query
    test("channels - returns all channels", async () => {
      const mockChannels = [
        { id: 1, name: "Channel 1" },
        { id: 2, name: "Channel 2" },
      ];

      mockModels.Channel.findAll.mockResolvedValue(mockChannels);

      const context = mockContext();
      const result = await channelResolvers.Query.channels(null, {}, context);

      expect(mockModels.Channel.findAll).toHaveBeenCalledWith({
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockChannels);
    });
  });

  describe("Mutation", () => {
    // Test for createChannel mutation
    test("createChannel - creates a new channel", async () => {
      const userId = 1;
      const channelInput = {
        name: "New Channel",
        description: "A test channel",
      };
      const mockChannel = { id: 1, ...channelInput, createdBy: userId };

      mockModels.Channel.findOne.mockResolvedValue(null); // No existing channel
      mockModels.Channel.create.mockResolvedValue(mockChannel);

      const context = mockContext(userId);
      const result = await channelResolvers.Mutation.createChannel(null, channelInput, context);

      expect(mockModels.Channel.findOne).toHaveBeenCalledWith({
        where: { name: channelInput.name },
      });
      expect(mockModels.Channel.create).toHaveBeenCalledWith({
        name: channelInput.name,
        description: channelInput.description,
        createdBy: userId,
      });
      expect(result).toEqual(mockChannel);
    });

    // Test for createChannel with authentication error
    test("createChannel - throws error if not authenticated", async () => {
      const channelInput = {
        name: "New Channel",
        description: "A test channel",
      };

      const context = mockContext(); // No userId

      await expect(
        channelResolvers.Mutation.createChannel(null, channelInput, context)
      ).rejects.toThrow(GraphQLError);

      expect(mockModels.Channel.create).not.toHaveBeenCalled();
    });

    // Test for updateChannel mutation
    test("updateChannel - updates an existing channel", async () => {
      const userId = 1;
      const channelId = 1;
      const updates = {
        id: channelId,
        name: "Updated Channel",
        description: "Updated description",
      };

      const mockChannel = {
        id: channelId,
        name: "Original Channel",
        description: "Original description",
        createdBy: userId,
        save: jest.fn(),
      };

      const mockUser = { id: userId, isAdmin: false };

      mockModels.Channel.findByPk.mockResolvedValue(mockChannel);
      mockModels.User.findByPk.mockResolvedValue(mockUser);
      mockModels.Channel.findOne.mockResolvedValue(null); // No existing channel with new name

      const context = mockContext(userId);
      const result = await channelResolvers.Mutation.updateChannel(null, updates, context);

      expect(mockModels.Channel.findByPk).toHaveBeenCalledWith(channelId);
      expect(mockModels.User.findByPk).toHaveBeenCalledWith(userId);
      expect(mockChannel.name).toBe(updates.name);
      expect(mockChannel.description).toBe(updates.description);
      expect(mockChannel.save).toHaveBeenCalled();
      expect(result).toEqual(mockChannel);
    });
  });

  describe("Channel field resolvers", () => {
    const mockChannel = { id: 1, name: "Test Channel", createdBy: 1 };

    // Test for creator field resolver
    test("creator - returns channel creator", async () => {
      const mockUser = { id: 1, username: "creator" };

      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await channelResolvers.Channel.creator(mockChannel, {}, context);

      expect(mockModels.User.findByPk).toHaveBeenCalledWith(mockChannel.createdBy);
      expect(result).toEqual(mockUser);
    });

    // Test for messages field resolver
    test("messages - returns channel messages", async () => {
      const mockMessages = [
        { id: 1, content: "Message 1" },
        { id: 2, content: "Message 2" },
      ];

      mockModels.Message.findAll.mockResolvedValue(mockMessages);

      const context = mockContext();
      const result = await channelResolvers.Channel.messages(mockChannel, {}, context);

      expect(mockModels.Message.findAll).toHaveBeenCalledWith({
        where: { channelId: mockChannel.id },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockMessages);
    });
  });
});
