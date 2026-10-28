import type {
  ApiError,
  ApiHealthResponse,
  SceneResponse,
  StoryAdvanceRequest,
  StorySetup,
} from '../types/story';

const DEFAULT_BASE_URL = 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 60000; // 60s timeout to allow Gemma/Gemini generative inference

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || typeof envUrl !== 'string' || envUrl.trim() === '') {
    return DEFAULT_BASE_URL;
  }
  return envUrl.trim().replace(/\/+$/, '');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Server error (${response.status} ${response.statusText})`;
      let errorDetails: unknown = null;

      try {
        const errorData = await response.json();
        errorDetails = errorData;
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData?.message === 'string') {
          errorMessage = errorData.message;
        } else if (typeof errorData?.error === 'string') {
          errorMessage = errorData.error;
        }
      } catch {
        // Fallback to text if response is not JSON
        try {
          const text = await response.text();
          if (text) errorMessage = text.slice(0, 200);
        } catch {
          // Keep generic status text
        }
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        details: errorDetails,
        isNetworkError: false,
      };
      throw error;
    }

    const data = await response.json();
    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // If it's already our structured ApiError, rethrow
    if (err && typeof err === 'object' && 'message' in err && 'isNetworkError' in err) {
      throw err;
    }

    const isAbort = (err as Error)?.name === 'AbortError';
    const isNetwork = isAbort || (err instanceof TypeError);

    let friendlyMessage = 'An unexpected error occurred while communicating with the backend.';
    if (isAbort) {
      friendlyMessage = `Story generation timed out after ${timeoutMs / 1000} seconds. The AI model took too long to answer.`;
    } else if (isNetwork) {
      friendlyMessage = `Cannot reach the Ghostwriter AI backend at ${baseUrl}. Please ensure the Python backend service is running.`;
    } else if (err instanceof Error && err.message) {
      friendlyMessage = err.message;
    }

    const apiError: ApiError = {
      message: friendlyMessage,
      isNetworkError: isNetwork,
      details: err,
    };
    throw apiError;
  }
}

/**
 * Health check endpoint: GET /api/health
 */
export async function checkBackendHealth(): Promise<ApiHealthResponse> {
  return request<ApiHealthResponse>('/api/health', {
    method: 'GET',
  }, 10000);
}

/**
 * Start a new story session: POST /api/story/start
 */
export async function startStory(setup: StorySetup): Promise<SceneResponse> {
  const payload = {
    setting: setup.setting,
    horror_level: setup.horror_level,
    story_length: setup.story_length,
    protagonist_name: setup.protagonist_name?.trim() || 'The Wanderer',
  };

  return request<SceneResponse>('/api/story/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Advance story with choice or custom action: POST /api/story/advance
 */
export async function advanceStory(req: StoryAdvanceRequest): Promise<SceneResponse> {
  const payload = {
    story_id: req.story_id,
    choice_id: req.choice_id ?? null,
    custom_action: req.custom_action?.trim() || null,
  };

  return request<SceneResponse>('/api/story/advance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
