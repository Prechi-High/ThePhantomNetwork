/**
 * Retries a function with exponential backoff
 * Used for network requests and polling operations
 *
 * Backoff schedule:
 * - Attempt 1: immediate
 * - Attempt 2: 1 second
 * - Attempt 3: 2 seconds
 * - Attempt 4: 4 seconds
 * - Attempt 5+: 8 seconds (max)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  onRetry?: (attempt: number, delay: number, error: Error) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't delay on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate exponential backoff: 1s, 2s, 4s, 8s (max)
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, delayMs, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Retries a function with jittered exponential backoff
 * Adds randomness to prevent thundering herd problem
 * when multiple clients retry simultaneously
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  onRetry?: (attempt: number, delay: number, error: Error) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, attempt), 8000);
      const jitter = Math.random() * 0.1 * baseDelay; // 0-10% random jitter
      const delayMs = Math.floor(baseDelay + jitter);

      if (onRetry) {
        onRetry(attempt + 1, delayMs, lastError);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
