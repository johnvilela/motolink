export function actionResponseBuilder<T> () {
  return {
    success: (data: T) => ({
      status: 'success',
      data,
    }),
    error: (message: string) => ({
      status: 'error',
      message,
    }),
  };
}

export type ActionResponseType = ReturnType<ReturnType<typeof actionResponseBuilder>['success']> | ReturnType<ReturnType<typeof actionResponseBuilder>['error']>;