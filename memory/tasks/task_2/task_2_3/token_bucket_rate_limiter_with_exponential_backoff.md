Of course. This is the most robust way to manage high-throughput API usage. We will build a client-side **Token Bucket Rate Limiter** from scratch and then show how to seamlessly integrate it with your existing exponential backoff decorator.

The core principle is:
1.  **Proactive Throttling (Token Bucket):** This is your first line of defense. Before you even try to make an API call, your code will check if it has enough tokens in its "bucket." If not, it will proactively wait just long enough for the bucket to refill. This prevents the vast majority of `RateLimitError`s from ever happening.
2.  **Reactive Safety Net (Exponential Backoff):** Your exponential backoff will remain as a crucial safety net. It will handle any `RateLimitError`s that might slip through (e.g., due to a sudden burst from another process sharing the same API key) and other transient API errors.

---

### Step 1: The `TokenBucketRateLimiter` Implementation

Here is a thread-safe implementation of a token bucket in Python. A class is the best way to manage its state (the number of tokens, capacity, etc.). The use of `threading.Lock` is essential to prevent race conditions in a multi-threaded application.

```python
import time
import threading

class TokenBucketRateLimiter:
    """
    A thread-safe token bucket rate limiter for proactive throttling.
    """
    def __init__(self, capacity, refill_time_seconds):
        """
        Initializes the token bucket.
        
        :param capacity: The total number of tokens the bucket can hold (e.g., your TPM limit).
        :param refill_time_seconds: The time in seconds for the bucket to refill completely (e.g., 60).
        """
        self.capacity = float(capacity)
        self._tokens = float(capacity)
        self.refill_rate = capacity / refill_time_seconds
        self.last_refill_time = time.monotonic()
        self.lock = threading.Lock()

    def _refill(self):
        """Refills the bucket with tokens based on elapsed time. This is an internal method."""
        now = time.monotonic()
        time_passed = now - self.last_refill_time
        
        # Calculate tokens to add
        new_tokens = time_passed * self.refill_rate
        
        # Add new tokens, but don't exceed the capacity
        self._tokens = min(self.capacity, self._tokens + new_tokens)
        self.last_refill_time = now

    def acquire(self, tokens_needed):
        """
        Acquires a specified number of tokens, waiting if necessary.
        This is the main method to call before an API request.
        """
        if tokens_needed > self.capacity:
            raise ValueError("Requested tokens exceed the bucket's total capacity.")

        with self.lock:
            # First, refill the bucket based on time passed since last call
            self._refill()

            # If not enough tokens, calculate wait time and sleep
            if tokens_needed > self._tokens:
                required_additional_tokens = tokens_needed - self._tokens
                wait_time = required_additional_tokens / self.refill_rate
                
                print(f"[THROTTLER]: Not enough tokens. Need {tokens_needed:.0f}, have {self._tokens:.0f}. "
                      f"Proactively waiting for {wait_time:.2f} seconds.")
                time.sleep(wait_time)
                
                # After waiting, refill the bucket again
                self._refill()

            # Now that we have enough tokens, consume them
            self._tokens -= tokens_needed
            print(f"[THROTTLER]: Acquired {tokens_needed:.0f} tokens. Remaining: {self._tokens:.0f}")

```

### Step 2: Combining with Your Exponential Backoff

Now, let's integrate this into a full workflow. Your exponential backoff decorator remains unchanged. We will simply call our new `rate_limiter.acquire()` method *before* we call the function that is decorated with your backoff logic.

### Full, Runnable Example

This example simulates a real-world scenario where multiple threads are trying to process documents, each requiring a large number of tokens.

```python
import time
import random
import openai
import concurrent.futures

# ==============================================================================
# PART 1: YOUR EXISTING EXPONENTIAL BACKOFF DECORATOR (UNCHANGED)
# This is our safety net for errors that get past the throttler.
# ==============================================================================

# --- Your Config ---
INITIAL_DELAY = 1
EXPONENTIAL_BASE = 2
JITTER = True  # Using a boolean for jitter is fine, we'll adapt it.
MAX_RETRIES = 5

def retry_with_exponential_backoff(func):
    """Retry a function with exponential backoff for OpenAI API calls."""
    def wrapper(*args, **kwargs):
        num_retries = 0
        delay = INITIAL_DELAY
        while True:
            try:
                return func(*args, **kwargs)
            # This will now be triggered far less often
            except openai.RateLimitError as e:
                num_retries += 1
                if num_retries > MAX_RETRIES:
                    raise Exception(f"[BACKOFF]: Maximum retries ({MAX_RETRIES}) exceeded.") from e
                
                jitter_value = random.random() if JITTER else 0
                delay *= EXPONENTIAL_BASE * (1 + jitter_value)
                
                print(f"[BACKOFF]: OpenAI rate limit error: {e}. "
                      f"Retrying {func.__name__} in {delay:.2f} seconds...")
                time.sleep(delay)
            except Exception as e:
                # Catching other potential exceptions
                print(f"[BACKOFF]: An unexpected error occurred: {e}. Not retrying.")
                raise e
    return wrapper

# ==============================================================================
# PART 2: THE TOKEN BUCKET RATE LIMITER CLASS (DEFINED ABOVE)
# This is our proactive throttling mechanism.
# ==============================================================================

class TokenBucketRateLimiter:
    # ... (Paste the class code from Step 1 here) ...
    def __init__(self, capacity, refill_time_seconds):
        self.capacity = float(capacity)
        self._tokens = float(capacity)
        self.refill_rate = capacity / refill_time_seconds
        self.last_refill_time = time.monotonic()
        self.lock = threading.Lock()
    def _refill(self):
        now = time.monotonic()
        time_passed = now - self.last_refill_time
        new_tokens = time_passed * self.refill_rate
        self._tokens = min(self.capacity, self._tokens + new_tokens)
        self.last_refill_time = now
    def acquire(self, tokens_needed):
        if tokens_needed > self.capacity:
            raise ValueError("Requested tokens exceed the bucket's total capacity.")
        with self.lock:
            self._refill()
            if tokens_needed > self._tokens:
                required_additional_tokens = tokens_needed - self._tokens
                wait_time = required_additional_tokens / self.refill_rate
                print(f"[THROTTLER]: Not enough tokens. Need {tokens_needed:.0f}, have {self._tokens:.0f}. "
                      f"Proactively waiting for {wait_time:.2f} seconds.")
                time.sleep(wait_time)
                self._refill()
            self._tokens -= tokens_needed
            print(f"[THROTTLER]: Acquired {tokens_needed:.0f} tokens. Remaining in bucket: {self._tokens:.0f}")


# ==============================================================================
# PART 3: INTEGRATION AND EXECUTION
# Here's how we combine them in a real application.
# ==============================================================================

# --- Global Rate Limiter Instance ---
# Your TPM Limit: 200,000 tokens per 60 seconds
TPM_LIMIT = 200000
rate_limiter = TokenBucketRateLimiter(TPM_LIMIT, 60)

# --- The function that makes the actual API call (decorated for safety) ---
@retry_with_exponential_backoff
def call_api(document_content):
    """Simulates making a single API call."""
    print(f"[API CALL]: Processing document starting with: '{document_content[:30]}...'")
    # In a real scenario, you'd have:
    # return openai.ChatCompletion.create(...)
    
    # Simulate work
    time.sleep(0.5) 
    return "API call successful"

# --- The main worker function for each thread ---
def process_document(document):
    """
    Processes a single document, handling throttling and API calls.
    """
    # 1. ESTIMATE TOKEN COST: This is a critical step.
    # You must estimate the total tokens (input + max_output) for the request.
    # Let's assume input is len(document) and we expect a max output of 1500 tokens.
    estimated_tokens_needed = len(document.split()) + 1500
    
    thread_id = threading.get_ident()
    print(f"[Thread-{thread_id}]: Starting to process document. Estimated tokens: {estimated_tokens_needed}")

    try:
        # 2. PROACTIVE THROTTLING: Acquire tokens from the bucket BEFORE the API call.
        # This will block and wait if necessary, smoothing out our requests.
        rate_limiter.acquire(estimated_tokens_needed)

        # 3. API CALL WITH BACKOFF: Now make the call, protected by the backoff decorator.
        result = call_api(document)
        print(f"[Thread-{thread_id}]: Successfully processed document. Result: {result}")

    except Exception as e:
        print(f"[Thread-{thread_id}]: FAILED to process document. Error: {e}")

# --- Main execution block ---
if __name__ == "__main__":
    # Simulate having many large documents to process concurrently
    # Each document is 6000 words, leading to a ~7500 token request
    documents_to_process = ["word " * 6000] * 30 
    
    # Use a ThreadPoolExecutor to run tasks in parallel
    # We can use a high number of workers because our throttler will manage the load.
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(process_document, documents_to_process)

    print("\nAll processing tasks have been submitted.")

```

### How It All Works Together:

1.  **High Concurrency:** The `ThreadPoolExecutor` immediately tries to start 10 `process_document` jobs at once.
2.  **Token Estimation:** Each job calculates its expected token cost (`~7500` tokens).
3.  **The "Race" to the Bucket:** All 10 threads will race to call `rate_limiter.acquire()`.
4.  **First Come, First Served:** Thanks to the `threading.Lock`, only one thread can be inside the `acquire` method at a time. The first few threads will find plenty of tokens, consume them instantly, and proceed to the API call.
5.  **Proactive Waiting:** As the 200,000 token bucket depletes, subsequent threads will call `acquire()` and find insufficient tokens. The code will calculate exactly how many seconds it needs to wait for the bucket to refill just enough tokens for its request. It then `time.sleep()` for that duration.
6.  **Smoothed Request Rate:** This forced waiting smooths out the burst of requests into a steady stream that respects the 200,000 tokens-per-minute limit.
7.  **Backoff as a Failsafe:** If for any reason (e.g., another server uses the same API key), you still get a `RateLimitError`, your `@retry_with_exponential_backoff` decorator will catch it and handle the retry, preventing a single failure from crashing the entire process.