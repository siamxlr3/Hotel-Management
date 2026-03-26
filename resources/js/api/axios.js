import axios from 'axios';

const axiosClient = axios.create({
  /*
   * Use empty baseURL so requests go to the SAME origin
   * the browser is currently on (127.0.0.1:8000 or localhost:8000).
   * This eliminates ALL cross-origin issues because the request
   * origin always matches the server origin automatically.
   */
  baseURL: '',
  withCredentials: true,
  headers: {
    'Accept':       'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/*
 * Automatically attach CSRF token from the meta tag
 * (Laravel sets this via @csrf or the session cookie)
 */
axiosClient.interceptors.request.use((config) => {
  const token = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('XSRF-TOKEN='));

  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token.split('=')[1]);
  }
  return config;
});

/*
 * Global error handler — logs 4xx/5xx in dev
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
