export const LLM_CONFIG = {
    API_URL: 'https://dev.ird.mu-sigma.com/genaimodel/litellm/v1/chat/completions',
    DEFAULT_MODEL: 'meta-llama/Meta-Llama-3-8B-Instruct',
    REQUEST_TIMEOUT: 60000, // 60 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
}; 