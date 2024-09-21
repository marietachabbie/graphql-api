import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { runRegression, getModelStatus, predict } from './mockedModel';

const pubsub = new PubSub();
const MODEL_COMPLETED = 'MODEL_COMPLETED';

/* Define the GraphQL schema */
const typeDefs = `
# Query to get the status of a regression model by its ID
  type Query {
    modelStatus(id: ID!): ModelStatus!

    # Query to predict the output y for a given x using a trained model
    predict(modelId: ID!, x: Float!): Float!
  }

  # Mutation to run a regression model with input data
  type Mutation {
    runRegression(input: RegressionInput!): Model!
  }

  # Input type for running a regression, includes data and model parameters
  input RegressionInput {
    data: [[Float!]!]!
    modelType: RegressionType!
    alpha: Float
  }

  # Enum for different types of regression models
  enum RegressionType {
    LINEAR
    LASSO
    RIDGE
  }

  # Object to represent a regression model
  type Model {
    id: ID!
    status: String!
    modelType: RegressionType!
    alpha: Float
    result: String
  }

  # Object to represent the status of a model
  type ModelStatus {
    id: ID!
    status: String!
    result: String
  }

  # Object to represent a subscription
  type Subscription {
    modelCompleted(id: ID!): Model!
  }
`;

/* Define the resolvers for queries and mutations */
const resolvers = {
  /* Resolver for the queries */
  Query: {
    /* Fetch the current status of a regression model by its ID */
    modelStatus: (_: any, { id }: { id: string }) => getModelStatus(id),

    /* Predict the output y for a given input x using the model with the provided ID */
    predict: (_: any, { modelId, x }: { modelId: string, x: number }) => predict(modelId, x),
  },

  /* Resolver for the mutations */
  Mutation: {
    /* Run a regression model with the given input parameters */
    runRegression: (_: any, { input }: any) => {
      const { data, modelType, alpha } = input;
      const id = runRegression(data, modelType, alpha);

      /* Simulate a long-running regression */
      setTimeout(() => {
        const model = getModelStatus(id);
        model.status = 'COMPLETED';
        model.result = 'Mocked Result';
        
        /* Publish the event to subscribers */
        pubsub.publish(MODEL_COMPLETED, { modelCompleted: { id, status: model.status, result: model.result } });
      }, 60000); // Simulates a 1-minute delay for long-running task

      return { id, status: 'RUNNING', modelType, alpha };
    },
  },

  /* Resolver for the subscription */
  Subscription: {
    /* Set up a subscription with filtering functionality */
    modelCompleted: {
      subscribe: withFilter(
        /* Listen for the 'MODEL_COMPLETED' event */
        () => pubsub.asyncIterator([MODEL_COMPLETED]),
        (payload, variables) => {
          /* Filter events to only include those where the model ID matches the subscribed `ID` */
          return payload.modelCompleted.id === variables.id;
        }
      ),
    },
  },
};

/* Create the executable GraphQL schema with type definitions and resolvers */
export const schema = makeExecutableSchema({ typeDefs, resolvers });
