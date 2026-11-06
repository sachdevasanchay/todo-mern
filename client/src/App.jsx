import { useCallback, useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import Home from './components/Home.jsx';
import Onboarding from './components/Onboarding.jsx';
import SearchScreen from './components/SearchScreen.jsx';
import TaskModal from './components/TaskModal.jsx';
import { api, clearToken, getToken, saveToken, setUnauthorizedHandler } from './api.js';

export default function App() {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken())); // restoring a saved login
  const [intro, setIntro] = useState(true); // onboarding screen, shown before login
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { task? }
  const [searching, setSearching] = useState(false);
  const [version, setVersion] = useState(0); // tells search to re-query after changes

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setTasks([]); // never leave one user's tasks in memory for the next user
    setModal(null);
    setSearching(false);
    setError('');
    setMode('login');
    setIntro(false);
  }, []);

  // If the server ever answers 401 (expired token), log out automatically
  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  // On page load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    if (!token || user) { setChecking(false); return; }
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const onAuth = ({ token: t, user: u }) => {
    saveToken(t);
    setToken(t);
    setUser(u);
    setLoading(true);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await api.list()); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  const sort = (list) => [...list].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  const save = async (data) => {
    if (modal.task) {
      const updated = await api.update(modal.task._id, data);
      setTasks((ts) => sort(ts.map((t) => (t._id === updated._id ? updated : t))));
    } else {
      const created = await api.create(data);
      setTasks((ts) => sort([...ts, created]));
    }
    setVersion((v) => v + 1);
    setModal(null);
  };

  const toggle = async (task) => {
    const status = task.status === 'completed' ? 'in-progress' : 'completed';
    const patch = (s) => (ts) => ts.map((t) => (t._id === task._id ? { ...t, status: s } : t));
    setTasks(patch(status)); // optimistic so weekly cards update instantly
    try { await api.setStatus(task._id, status); setVersion((v) => v + 1); }
    catch (e) { setTasks(patch(task.status)); setError(e.message); }
  };

  const remove = async (task) => {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    try {
      await api.remove(task._id);
      setTasks((ts) => ts.filter((t) => t._id !== task._id));
      setVersion((v) => v + 1);
    } catch (e) { setError(e.message); }
  };

  const handlers = { onToggle: toggle, onEdit: (task) => setModal({ task }), onDelete: remove };

  if (checking) return <p className="py-20 text-center text-sm text-slate-500">Loading…</p>;

  // Not logged in: onboarding -> sign up / log in
  if (!user) {
    if (intro) return <Onboarding onStart={() => setIntro(false)} />;
    return (
      <AuthScreen
        key={mode}
        mode={mode}
        onSwitch={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        onAuth={onAuth}
      />
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-white shadow-xl md:max-w-3xl lg:my-6 lg:min-h-[calc(100vh-3rem)] lg:max-w-6xl lg:overflow-hidden lg:rounded-2xl">
      <Home
        user={user}
        onLogout={logout}
        tasks={tasks}
        loading={loading}
        error={error}
        onRetry={load}
        onAdd={() => setModal({})}
        onQuickAdd={(prefill) => setModal({ prefill })}
        onOpenSearch={() => setSearching(true)}
        {...handlers}
      />
      {searching && <SearchScreen onClose={() => setSearching(false)} refreshKey={version} {...handlers} />}
      {modal && <TaskModal task={modal.task} prefill={modal.prefill} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}
