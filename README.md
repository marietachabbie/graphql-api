# GraphQL Regression Model API
This project is a GraphQL-based API that allows clients to perform linear regression analysis and receive results asynchronously. The API is built with Node.js (Typescript), Apollo Server, GraphQL and WebSockets to enable real-time subscriptions and interactions.

## Features
* **Run Regression Models:** Clients can initiate a regression task by providing data and model type. The server returns a unique model ID and an initial status of `RUNNING`.

* **Asynchronous Processing:** The regression process simulates a 1 minute long task.

* **Real-Time Updates via Subscriptions:** Once the regression model is completed, clients can subscribe to receive updates about the model's status and the results in real-time using WebSockets.

* **Prediction:** Clients can request predictions based on the trained model by passing a model ID and an input value (mocking: currently returns received number + 1).

## Installment:
```sh
npm install
```

## Run the app:
```sh
# ts-node
npm run start
# nodemon
npm run dev
```

## API Overview
### Mutation
Initiate a regression task with the provided dataset and model type:
```graphql
mutation {
  runRegression(input: {
    data: [[1, 2], [2, 3], [3, 4]],
    modelType: LINEAR
  }) {
    id
    status
  }
}
```

### Subscription
Subscribe to receive real-time updates when a regression model is completed. Filters results by model ID:
```graphql
subscription($id: ID!) {
  modelCompleted(id: $id) {
    id
    status
    result
  }
}

# variables:
{
  "id": <MODEL_ID>
}
```

### Query
Request a prediction using the completed model for a given input x.
```graphql
query {
  predict(modelId: <MODEL_ID>, x: FLOAT_NUMBER)
}
```

___
### Project Structure
* `schema.ts`: Defines the GraphQL schema, including queries, mutations, and subscriptions.
* `index.ts`: The main server file that sets up Apollo Server with WebSockets for subscriptions.
* `mockedModel.ts`: Simulates the running of a regression model and provides mock data for model status and predictions.
* `.env`: Sample file provided with basic values for idea

___
This project is ideal for simulating regression analysis tasks in an asynchronous environment with real-time updates via WebSockets.