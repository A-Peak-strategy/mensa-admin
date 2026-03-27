function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return 'http://localhost:8000/api';
  }
  return 'https://mensa-api.onrender.com/api';
}

/** Override with NEXT_PUBLIC_API_URL. In dev, defaults to http://localhost:8000/api. */
export const BASE_URL = getBaseUrl();
