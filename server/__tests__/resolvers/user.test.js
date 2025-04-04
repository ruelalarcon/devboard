const userResolvers = require("../../graphql/resolvers/user");
const { mockContext, mockModels } = require("../mocks");

describe("User Resolvers", () => {
  describe("Query", () => {
    // Test for me query
    test("me - returns null if no user is logged in", async () => {
      const context = mockContext();
      const result = await userResolvers.Query.me(null, {}, context);
      expect(result).toBeNull();
    });

    test("me - returns user if logged in", async () => {
      const userId = 1;
      const mockUser = { id: userId, username: "testuser" };

      // Set up the mock
      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext(userId);
      const result = await userResolvers.Query.me(null, {}, context);

      expect(mockModels.User.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    // Test for user query
    test("user - returns user by id", async () => {
      const userId = 1;
      const mockUser = { id: userId, username: "testuser" };

      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await userResolvers.Query.user(null, { id: userId }, context);

      expect(mockModels.User.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    // Test for userByName query
    test("userByName - returns user by username", async () => {
      const username = "testuser";
      const mockUser = { id: 1, username };

      mockModels.User.findOne.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await userResolvers.Query.userByName(null, { username }, context);

      expect(mockModels.User.findOne).toHaveBeenCalledWith({ where: { username } });
      expect(result).toEqual(mockUser);
    });

    // Test for users query
    test("users - returns all users", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];

      mockModels.User.findAll.mockResolvedValue(mockUsers);

      const context = mockContext();
      const result = await userResolvers.Query.users(null, {}, context);

      expect(mockModels.User.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe("Mutation", () => {
    // Test for register mutation
    test("register - creates a new user and returns it", async () => {
      const userInput = {
        username: "newuser",
        password: "password123",
        displayName: "New User",
      };

      const mockUser = { id: 1, ...userInput };

      mockModels.User.findOne.mockResolvedValue(null); // No existing user
      mockModels.User.create.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await userResolvers.Mutation.register(null, userInput, context);

      expect(mockModels.User.findOne).toHaveBeenCalledWith({
        where: { username: userInput.username },
      });
      expect(mockModels.User.create).toHaveBeenCalledWith(userInput);
      expect(context.req.session.userId).toBe(mockUser.id);
      expect(result).toEqual({ user: mockUser });
    });

    // Test for login mutation
    test("login - authenticates user and returns user data", async () => {
      const username = "testuser";
      const password = "password123";
      const mockUser = {
        id: 1,
        username,
        validPassword: jest.fn().mockResolvedValue(true),
      };

      mockModels.User.findOne.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await userResolvers.Mutation.login(null, { username, password }, context);

      expect(mockModels.User.findOne).toHaveBeenCalledWith({ where: { username } });
      expect(mockUser.validPassword).toHaveBeenCalledWith(password);
      expect(context.req.session.userId).toBe(mockUser.id);
      expect(result).toEqual({ user: mockUser });
    });

    // Test for logout mutation
    test("logout - clears session and returns true", async () => {
      const context = mockContext(1);
      const result = await userResolvers.Mutation.logout(null, {}, context);

      expect(context.req.session.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("User field resolvers", () => {
    const mockUser = { id: 1, username: "testuser" };

    // Test for channels field resolver
    test("channels - returns user's channels", async () => {
      const mockChannels = [
        { id: 1, name: "Channel 1" },
        { id: 2, name: "Channel 2" },
      ];

      mockModels.Channel.findAll.mockResolvedValue(mockChannels);

      const context = mockContext();
      const result = await userResolvers.User.channels(mockUser, {}, context);

      expect(mockModels.Channel.findAll).toHaveBeenCalledWith({
        where: { createdBy: mockUser.id },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockChannels);
    });

    // Test for messages field resolver
    test("messages - returns user's messages", async () => {
      const mockMessages = [
        { id: 1, content: "Message 1" },
        { id: 2, content: "Message 2" },
      ];

      mockModels.Message.findAll.mockResolvedValue(mockMessages);

      const context = mockContext();
      const result = await userResolvers.User.messages(mockUser, {}, context);

      expect(mockModels.Message.findAll).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual(mockMessages);
    });
  });
});
