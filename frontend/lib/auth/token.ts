let accessToken: string | null = null;

type TokenListener = (token: string | null) => void;

const listeners = new Set<TokenListener>();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
}

export function clearAccessToken() {
  setAccessToken(null);
}

export function subscribeAccessToken(listener: TokenListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
