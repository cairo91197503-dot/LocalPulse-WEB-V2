export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operationName: string = "Operation"): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout: ${operationName} took longer than ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};
