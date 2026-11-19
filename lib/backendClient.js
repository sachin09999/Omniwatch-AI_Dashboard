export const DEFAULT_BACKEND_URL = 'http://10.10.12.52:8009';
export const DEFAULT_AUTH_TOKEN = 'oat_NTg.aERidEtHYk54ZnVWN0U5Zk5GSmRXY0JtVzUzYkhSUnNRMmZvZ1phMDE2MTczNzM3ODE';

export function getBackendBase() {
  return (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, '');
}

export function getBackendHeaders(extraHeaders = {}) {
  const token = (process.env.BACKEND_AUTH_TOKEN || DEFAULT_AUTH_TOKEN).trim();
  const headers = {
    'Accept': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['Cookie'] = `omni_auth_token=${token}`;
  }
  return headers;
}
