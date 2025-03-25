import { gql } from '@apollo/client';

export const GET_MESSAGES_BY_CHANNEL = gql`
  query GetMessagesByChannel($channelId: ID!) {
    messagesByChannel(channelId: $channelId) {
      id
      content
      screenshot
      createdAt
      author {
        id
        displayName
        avatar
      }
      positiveRatings
      negativeRatings
    }
  }
`;

export const GET_MESSAGE = gql`
  query GetMessage($id: ID!) {
    message(id: $id) {
      id
      content
      screenshot
      createdAt
      author {
        id
        displayName
        avatar
      }
      channel {
        id
        name
      }
      positiveRatings
      negativeRatings
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($channelId: ID!, $content: String!, $screenshot: String) {
    createMessage(channelId: $channelId, content: $content, screenshot: $screenshot) {
      id
      content
      screenshot
      createdAt
      author {
        id
        displayName
        avatar
      }
      positiveRatings
      negativeRatings
    }
  }
`;

export const GET_REPLIES_BY_MESSAGE = gql`
  query GetRepliesByMessage($messageId: ID!) {
    repliesByMessage(messageId: $messageId) {
      id
      content
      screenshot
      createdAt
      author {
        id
        displayName
        avatar
      }
      positiveRatings
      negativeRatings
      replies {
        id
      }
    }
  }
`;

export const CREATE_REPLY = gql`
  mutation CreateReply(
    $messageId: ID!
    $content: String!
    $screenshot: String
    $parentReplyId: ID
  ) {
    createReply(
      messageId: $messageId
      content: $content
      screenshot: $screenshot
      parentReplyId: $parentReplyId
    ) {
      id
      content
      screenshot
      createdAt
      author {
        id
        displayName
        avatar
      }
      positiveRatings
      negativeRatings
    }
  }
`;

export const GET_NESTED_REPLIES = gql`
  query GetNestedReplies($parentReplyId: ID!) {
    repliesByParentReply(parentReplyId: $parentReplyId) {
      id
      content
      screenshot
      createdAt
      author {
        id
        displayName
        avatar
      }
      positiveRatings
      negativeRatings
      replies {
        id
      }
    }
  }
`;

export const RATE_CONTENT = gql`
  mutation RateContent($contentId: ID!, $contentType: String!, $isPositive: Boolean!) {
    rateContent(contentId: $contentId, contentType: $contentType, isPositive: $isPositive) {
      id
      isPositive
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`;

export const DELETE_REPLY = gql`
  mutation DeleteReply($id: ID!) {
    deleteReply(id: $id)
  }
`;
