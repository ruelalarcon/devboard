import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';
import './resources/fonts.css';

import { ApolloProvider } from '@apollo/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';
import { client } from './lib/apolloClient';
import { AppRouter } from './Router';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <ApolloProvider client={client}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ApolloProvider>
    </MantineProvider>
  );
}
