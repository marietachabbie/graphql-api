import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { schema } from './schema';

const app = express();
const httpServer = createServer(app);

/* Create the WebSocket server */
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

/* Set up WebSocket for subscriptions */
const serverCleanup = useServer({ schema }, wsServer);

/* Create the ApolloServer instance */
const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

/* Start the server */
server
  .start()
  .then(() => {
    server.applyMiddleware({ app });
    httpServer.listen(4000, () => {
      console.log(`Server ready at http://localhost:4000/graphql`);
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
