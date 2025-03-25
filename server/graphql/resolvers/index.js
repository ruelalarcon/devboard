const userResolvers = require("./user");
const channelResolvers = require("./channel");
const messageResolvers = require("./message");
const replyResolvers = require("./reply");
const ratingResolvers = require("./rating");
const searchResolvers = require("./search");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...channelResolvers.Query,
    ...messageResolvers.Query,
    ...replyResolvers.Query,
    ...searchResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...channelResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...replyResolvers.Mutation,
    ...ratingResolvers.Mutation,
  },
  User: userResolvers.User,
  Channel: channelResolvers.Channel,
  Message: messageResolvers.Message,
  Reply: replyResolvers.Reply,
  Rating: ratingResolvers.Rating,
  SearchResult: searchResolvers.SearchResult,
};
