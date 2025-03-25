import { ApolloProvider } from '@apollo/client';
import ReactDOM from 'react-dom/client';
import App from './App';
import { client } from './lib/apolloClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
