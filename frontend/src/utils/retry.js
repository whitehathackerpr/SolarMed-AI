export const retry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const currentDelay = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  throw lastError;
};

export const createRetryableRequest = (requestFn, options = {}) => {
  return async (...args) => {
    return retry(() => requestFn(...args), options);
  };
};

export const isNetworkError = (error) => {
  return (
    error.message === 'Network Error' ||
    error.message === 'Failed to fetch' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  );
};

export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};

export const isRateLimitError = (error) => {
  return error.response && error.response.status === 429;
};

export const defaultShouldRetry = (error) => {
  return isNetworkError(error) || isServerError(error) || isRateLimitError(error);
};

export const withRetry = (axiosInstance, options = {}) => {
  const retryOptions = {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
    shouldRetry: defaultShouldRetry,
    ...options
  };

  // Add retry interceptor
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      if (retryOptions.shouldRetry(error)) {
        const config = error.config;
        
        // Initialize retry count
        config.retryCount = config.retryCount || 0;
        
        // Check if we should retry
        if (config.retryCount < retryOptions.maxAttempts) {
          config.retryCount += 1;
          
          // Calculate delay with exponential backoff
          const delay = retryOptions.delay * Math.pow(retryOptions.backoff, config.retryCount - 1);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the request
          return axiosInstance(config);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}; 