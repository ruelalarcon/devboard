import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      username
      displayName
      avatar
      isAdmin
      createdAt
      channels {
        id
        name
        description
        createdAt
      }
      messages {
        id
        content
        screenshot
        createdAt
        channel {
          id
          name
        }
        positiveRatings
        negativeRatings
      }
      replies {
        id
        content
        screenshot
        createdAt
        message {
          id
          content
          channel {
            id
            name
          }
        }
        positiveRatings
        negativeRatings
      }
    }
  }
`;

export const GET_CONTENT_BY_USER = gql`
  query GetContentByUser($userId: ID!) {
    contentByUser(userId: $userId) {
      ... on Message {
        id
        content
        screenshot
        createdAt
        channel {
          id
          name
        }
        positiveRatings
        negativeRatings
      }
      ... on Reply {
        id
        content
        screenshot
        createdAt
        message {
          id
          content
          channel {
            id
            name
          }
        }
        positiveRatings
        negativeRatings
      }
    }
  }
`;
