const { gql } = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    displayName: String!
    avatar: String
    isAdmin: Boolean!
    channels: [Channel!]
    messages: [Message!]
    replies: [Reply!]
    ratings: [Rating!]
    createdAt: String!
    updatedAt: String!
  }

  type Channel {
    id: ID!
    name: String!
    description: String
    creator: User!
    messages: [Message!]
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: ID!
    content: String!
    screenshot: String
    author: User!
    channel: Channel!
    replies: [Reply!]
    ratings: [Rating!]
    positiveRatings: Int!
    negativeRatings: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Reply {
    id: ID!
    content: String!
    screenshot: String
    author: User!
    message: Message!
    parentReply: Reply
    replies: [Reply!]
    ratings: [Rating!]
    positiveRatings: Int!
    negativeRatings: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Rating {
    id: ID!
    user: User!
    contentId: ID!
    contentType: String!
    isPositive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    userByName(username: String!): User
    users: [User!]!
    topUsers(sortBy: String): [User!]!

    # Channel queries
    channel(id: ID!): Channel
    channels: [Channel!]!

    # Message queries
    message(id: ID!): Message
    messagesByChannel(channelId: ID!): [Message!]!

    # Reply queries
    reply(id: ID!): Reply
    repliesByMessage(messageId: ID!): [Reply!]!
    repliesByParentReply(parentReplyId: ID!): [Reply!]!

    # Search queries
    searchContent(query: String!): [SearchResult!]!
    contentByUser(userId: ID!): [SearchResult!]!
    searchChannels(searchTerm: String!, sortBy: String): [Channel!]!
    searchMessages(searchTerm: String!, sortBy: String): [Message!]!
    searchUsers(searchTerm: String!, sortBy: String): [User!]!
  }

  union SearchResult = Message | Reply

  type Mutation {
    # User mutations
    register(
      username: String!
      password: String!
      displayName: String!
      avatar: String
    ): AuthPayload
    login(username: String!, password: String!): AuthPayload
    logout: Boolean!
    updateUser(displayName: String, avatar: String): User
    deleteUser(id: ID!): Boolean!

    # Channel mutations
    createChannel(name: String!, description: String): Channel
    updateChannel(id: ID!, name: String, description: String): Channel
    deleteChannel(id: ID!): Boolean!

    # Message mutations
    createMessage(channelId: ID!, content: String!, screenshot: String): Message
    updateMessage(id: ID!, content: String, screenshot: String): Message
    deleteMessage(id: ID!): Boolean!

    # Reply mutations
    createReply(messageId: ID!, content: String!, screenshot: String, parentReplyId: ID): Reply
    updateReply(id: ID!, content: String, screenshot: String): Reply
    deleteReply(id: ID!): Boolean!

    # Rating mutations
    rateContent(contentId: ID!, contentType: String!, isPositive: Boolean!): Rating
    deleteRating(contentId: ID!, contentType: String!): Boolean!
  }
`;

module.exports = typeDefs;
