let models = new Map<string, any>();

export const runRegression = (data: number[][], modelType: string, alpha?: number): string => {
  const id = Math.random().toString(36).slice(2, 9);
  const model = { id, status: 'RUNNING', result: 'N/A', modelType, alpha };

  models.set(id, model);

  /* Simulating a minute  */
  setTimeout(() => {
    model.status = 'COMPLETED';
    model.result = 'Mocked Result';
    models.set(id, model);
  }, 60000);

  return id;
};

export const getModelStatus = (id: string) => {
  return models.get(id);
};

export const predict = (modelId: string, x: number): number => {
  /* Mocked prediction: y = x + 1 */
  return x + 1.0;
};
