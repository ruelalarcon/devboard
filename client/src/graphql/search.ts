import { gql } from '@apollo/client';

export const SEARCH_CHANNELS = gql`
  query SearchChannels($searchTerm: String!, $sortBy: String) {
    searchChannels(searchTerm: $searchTerm, sortBy: $sortBy) {
      id
      name
      description
      createdAt
      creator {
        id
        displayName
        username
      }
    }
  }
`;

export const SEARCH_MESSAGES = gql`
  query SearchMessages($searchTerm: String!, $sortBy: String) {
    searchMessages(searchTerm: $searchTerm, sortBy: $sortBy) {
      id
      content
      screenshot
      createdAt
      channel {
        id
        name
      }
      author {
        id
        displayName
        username
        avatar
      }
      positiveRatings
      negativeRatings
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!, $sortBy: String) {
    searchUsers(searchTerm: $searchTerm, sortBy: $sortBy) {
      id
      displayName
      username
      avatar
      createdAt
    }
  }
`;
