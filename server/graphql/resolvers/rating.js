const { GraphQLError } = require('graphql');

// Helper function to create errors with specific codes
const createError = (message, code) => {
  return new GraphQLError(message, {
    extensions: { code }
  });
};

module.exports = {
  Mutation: {
    rateContent: async (_, { contentId, contentType, isPositive }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError('You must be logged in', 'UNAUTHENTICATED');
      }
      
      // Validate contentType
      if (!['message', 'reply'].includes(contentType)) {
        throw createError('Invalid content type. Must be "message" or "reply"', 'BAD_USER_INPUT');
      }
      
      // Check if content exists
      let content;
      if (contentType === 'message') {
        content = await db.Message.findByPk(contentId);
      } else {
        content = await db.Reply.findByPk(contentId);
      }
      
      if (!content) {
        throw createError(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} not found`, 'NOT_FOUND');
      }
      
      // Check if user is trying to rate their own content
      if (content.userId === req.session.userId) {
        throw createError('You cannot rate your own content', 'FORBIDDEN');
      }
      
      // Check if rating already exists
      let rating = await db.Rating.findOne({
        where: {
          userId: req.session.userId,
          contentId,
          contentType,
        },
      });
      
      if (rating) {
        // Update existing rating
        rating.isPositive = isPositive;
        await rating.save();
      } else {
        // Create new rating
        rating = await db.Rating.create({
          userId: req.session.userId,
          contentId,
          contentType,
          isPositive,
        });
      }
      
      return rating;
    },
    
    deleteRating: async (_, { contentId, contentType }, { db, req }) => {
      // Authentication check
      if (!req.session.userId) {
        throw createError('You must be logged in', 'UNAUTHENTICATED');
      }
      
      // Validate contentType
      if (!['message', 'reply'].includes(contentType)) {
        throw createError('Invalid content type. Must be "message" or "reply"', 'BAD_USER_INPUT');
      }
      
      // Find rating
      const rating = await db.Rating.findOne({
        where: {
          userId: req.session.userId,
          contentId,
          contentType,
        },
      });
      
      if (!rating) {
        throw createError('Rating not found', 'NOT_FOUND');
      }
      
      // Delete rating
      await rating.destroy();
      return true;
    },
  },
  
  Rating: {
    user: async (rating, _, { db }) => {
      return await db.User.findByPk(rating.userId);
    },
  },
}; 