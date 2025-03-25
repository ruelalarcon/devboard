import { gql } from '@apollo/client';

export const RATE_CONTENT = gql`
  mutation RateContent($contentId: ID!, $contentType: String!, $isPositive: Boolean!) {
    rateContent(contentId: $contentId, contentType: $contentType, isPositive: $isPositive) {
      id
      isPositive
      contentId
      contentType
      createdAt
    }
  }
`;

export const DELETE_RATING = gql`
  mutation DeleteRating($contentId: ID!, $contentType: String!) {
    deleteRating(contentId: $contentId, contentType: $contentType)
  }
`;

export const GET_USER_RATINGS = gql`
  query GetUserRatings {
    me {
      id
      ratings {
        id
        contentId
        contentType
        isPositive
        createdAt
      }
    }
  }
`;
