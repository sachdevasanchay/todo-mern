const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'todo:token';

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const saveToken = (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } };
export const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

// App.jsx registers a function here that logs the user out when the server says "401"
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));

  // Expired/invalid token on a normal request -> send the user back to login
  const isAuthForm = path.startsWith('/auth/login') || path.startsWith('/auth/signup');
  if (res.status === 401 && token && !isAuthForm) onUnauthorized();

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // auth
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  // AI: turns a sentence into task fields
  parseTask: (text, now) => request('/ai/parse-task', { method: 'POST', body: JSON.stringify({ text, now }) }),
  // tasks
  list: (q = '') => request(`/tasks${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  create: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  setStatus: (id, status) =>
    request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
