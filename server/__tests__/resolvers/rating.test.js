const ratingResolvers = require("../../graphql/resolvers/rating");
const { mockContext, mockModels } = require("../mocks");
const { GraphQLError } = require("graphql");

describe("Rating Resolvers", () => {
  describe("Mutation", () => {
    // Test for rateContent mutation with a message
    test("rateContent - rates a message", async () => {
      const userId = 1;
      const contentId = 1;
      const contentType = "message";
      const isPositive = true;

      const mockMessage = { id: contentId, content: "Test message" };
      const mockRating = {
        id: 1,
        userId,
        contentId,
        contentType,
        isPositive,
      };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);
      mockModels.Rating.findOne.mockResolvedValue(null); // No existing rating
      mockModels.Rating.create.mockResolvedValue(mockRating);

      const context = mockContext(userId);
      const result = await ratingResolvers.Mutation.rateContent(
        null,
        { contentId, contentType, isPositive },
        context
      );

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(contentId);
      expect(mockModels.Rating.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          contentId,
          contentType,
        },
      });
      expect(mockModels.Rating.create).toHaveBeenCalledWith({
        userId,
        contentId,
        contentType,
        isPositive,
      });
      expect(result).toEqual(mockRating);
    });

    // Test for rateContent with existing rating (updating)
    test("rateContent - updates existing rating", async () => {
      const userId = 1;
      const contentId = 1;
      const contentType = "message";
      const isPositive = true;

      const mockMessage = { id: contentId, content: "Test message" };
      const mockRating = {
        id: 1,
        userId,
        contentId,
        contentType,
        isPositive: false, // Opposite of the new rating
        save: jest.fn(),
      };

      mockModels.Message.findByPk.mockResolvedValue(mockMessage);
      mockModels.Rating.findOne.mockResolvedValue(mockRating);

      const context = mockContext(userId);
      const result = await ratingResolvers.Mutation.rateContent(
        null,
        { contentId, contentType, isPositive },
        context
      );

      expect(mockModels.Message.findByPk).toHaveBeenCalledWith(contentId);
      expect(mockRating.isPositive).toBe(isPositive);
      expect(mockRating.save).toHaveBeenCalled();
      expect(result).toEqual(mockRating);
    });

    // Test for rateContent with invalid content type
    test("rateContent - throws error for invalid content type", async () => {
      const userId = 1;
      const contentId = 1;
      const contentType = "invalid";
      const isPositive = true;

      const context = mockContext(userId);

      await expect(
        ratingResolvers.Mutation.rateContent(null, { contentId, contentType, isPositive }, context)
      ).rejects.toThrow(GraphQLError);

      expect(mockModels.Rating.create).not.toHaveBeenCalled();
    });

    // Test for rateContent with authentication error
    test("rateContent - throws error if not authenticated", async () => {
      const contentId = 1;
      const contentType = "message";
      const isPositive = true;

      const context = mockContext(); // No userId

      await expect(
        ratingResolvers.Mutation.rateContent(null, { contentId, contentType, isPositive }, context)
      ).rejects.toThrow(GraphQLError);

      expect(mockModels.Rating.create).not.toHaveBeenCalled();
    });

    // Test for deleteRating
    test("deleteRating - deletes a rating", async () => {
      const userId = 1;
      const contentId = 1;
      const contentType = "message";

      const mockRating = {
        id: 1,
        userId,
        contentId,
        contentType,
        destroy: jest.fn(),
      };

      mockModels.Rating.findOne.mockResolvedValue(mockRating);

      const context = mockContext(userId);
      const result = await ratingResolvers.Mutation.deleteRating(
        null,
        { contentId, contentType },
        context
      );

      expect(mockModels.Rating.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          contentId,
          contentType,
        },
      });
      expect(mockRating.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("Rating field resolvers", () => {
    const mockRating = { id: 1, userId: 1, contentId: 1, contentType: "message" };

    // Test for user field resolver
    test("user - returns rating user", async () => {
      const mockUser = { id: 1, username: "rater" };

      mockModels.User.findByPk.mockResolvedValue(mockUser);

      const context = mockContext();
      const result = await ratingResolvers.Rating.user(mockRating, {}, context);

      expect(mockModels.User.findByPk).toHaveBeenCalledWith(mockRating.userId);
      expect(result).toEqual(mockUser);
    });
  });
});
