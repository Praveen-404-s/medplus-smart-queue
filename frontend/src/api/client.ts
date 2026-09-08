import { Counter, Service, Token, TokenCreatePayload } from '../types/queue';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const WS_URL = import.meta.env.VITE_WS_URL || (API_BASE_URL.replace(/^http(s?):/, 'ws$1:') + '/ws');

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let message = `API Error ${res.status}`;
      try {
        const json = JSON.parse(errorText);
        if (json.detail) message = json.detail;
      } catch {
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`Fetch error for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  async getHealth(): Promise<{ status: string }> {
    return request<{ status: string }>('/health');
  },

  async getServices(): Promise<Service[]> {
    return request<Service[]>('/services');
  },

  async getTokens(): Promise<Token[]> {
    return request<Token[]>('/tokens');
  },

  async getQueue(): Promise<Token[]> {
    return request<Token[]>('/queue');
  },

  async getCounters(): Promise<Counter[]> {
    return request<Counter[]>('/counters');
  },

  async createToken(payload: TokenCreatePayload): Promise<Token> {
    return request<Token>('/tokens', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async callToken(tokenId: number): Promise<Token> {
    return request<Token>(`/tokens/${tokenId}/call`, {
      method: 'POST',
    });
  },

  async completeToken(tokenId: number, actualDuration?: number): Promise<Token> {
    return request<Token>(`/tokens/${tokenId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ actual_duration: actualDuration ?? null }),
    });
  },

  async seedDemoQueue(): Promise<{ message: string }> {
    return request<{ message: string }>('/seed-demo', {
      method: 'POST',
    });
  },
};

export function createWebSocketClient(
  onUpdate: () => void,
  onStatusChange?: (isConnected: boolean) => void
) {
  let ws: WebSocket | null = null;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let isClosedIntentionally = false;

  function connect() {
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        onStatusChange?.(true);
        ws?.send('client_connected');
      };

      ws.onmessage = (event) => {
        if (event.data === 'queue_updated' || event.data) {
          onUpdate();
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket encountered error:', err);
        onStatusChange?.(false);
      };

      ws.onclose = () => {
        onStatusChange?.(false);
        if (!isClosedIntentionally) {
          retryTimeout = setTimeout(connect, 3000);
        }
      };
    } catch (e) {
      console.error('Failed to establish WebSocket connection:', e);
      onStatusChange?.(false);
      if (!isClosedIntentionally) {
        retryTimeout = setTimeout(connect, 4000);
      }
    }
  }

  connect();

  return () => {
    isClosedIntentionally = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (ws) {
      ws.onclose = null;
      ws.close();
    }
  };
}
