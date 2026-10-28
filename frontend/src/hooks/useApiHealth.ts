import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../services/api';
import type { ApiHealthResponse } from '../types/story';

export function useApiHealth() {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkBackendHealth();
      setHealth(res);
      setError(null);
    } catch (err: unknown) {
      setHealth(null);
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String(err.message));
      } else {
        setError('Backend is currently unreachable');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return {
    health,
    loading,
    error,
    recheck: check,
    isConnected: !!health && !error,
  };
}
