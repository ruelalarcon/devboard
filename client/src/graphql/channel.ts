import { gql } from '@apollo/client';

export const GET_CHANNELS = gql`
  query GetChannels {
    channels {
      id
      name
      description
      createdAt
      creator {
        id
        displayName
      }
    }
  }
`;

export const GET_CHANNEL = gql`
  query GetChannel($id: ID!) {
    channel(id: $id) {
      id
      name
      description
      createdAt
      creator {
        id
        displayName
      }
    }
  }
`;

export const CREATE_CHANNEL = gql`
  mutation CreateChannel($name: String!, $description: String) {
    createChannel(name: $name, description: $description) {
      id
      name
      description
      createdAt
      creator {
        id
        displayName
      }
    }
  }
`;

export const UPDATE_CHANNEL = gql`
  mutation UpdateChannel($id: ID!, $name: String, $description: String) {
    updateChannel(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

export const DELETE_CHANNEL = gql`
  mutation DeleteChannel($id: ID!) {
    deleteChannel(id: $id)
  }
`;
