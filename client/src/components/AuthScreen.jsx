import { useState } from 'react';
import { api } from '../api.js';
import { Zigzag } from './Onboarding.jsx';

const labelCls = 'mb-1.5 block text-xs text-slate-500';
const fieldCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400';

// mode: 'login' | 'signup'. App.jsx gives this component a key={mode}, so the form resets when you switch.
export default function AuthScreen({ mode, onSwitch, onAuth }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const err = {};
    if (isSignup && !form.name.trim()) err.name = 'Enter your name.';
    if (!form.email.trim()) err.email = 'Enter your email.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = 'Enter a valid email address.';
    if (!form.password) err.password = 'Enter your password.';
    else if (isSignup && form.password.length < 6) err.password = 'Use at least 6 characters.';
    return err;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    setApiError('');
    try {
      const body = isSignup
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const data = isSignup ? await api.signup(body) : await api.login(body);
      onAuth(data); // { token, user }
    } catch (e2) {
      setApiError(e2.message);
      setLoading(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-xs text-danger" role="alert">{errors[k]}</p> : null);

  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      {/* Blue panel: short band on phones, half the screen on laptops */}
      <div className="relative h-36 overflow-hidden bg-brand md:h-auto md:min-h-screen md:flex-1">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[14px] border-white/20 md:h-40 md:w-40" />
        <Zigzag className="absolute bottom-3 left-0 w-24 md:bottom-10 md:w-44" />
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-8 md:items-center md:px-16">
        <form onSubmit={submit} noValidate className="w-full max-w-sm">
          <h1 className="text-2xl font-bold md:text-3xl">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-xs text-slate-500 md:text-sm">
            {isSignup ? 'Sign up to start managing your tasks.' : 'Log in to see your tasks.'}
          </p>

          <div className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <label htmlFor="name" className={labelCls}>Name</label>
                <input id="name" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" className={fieldCls} />
                <Err k="name" />
              </div>
            )}
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={fieldCls} />
              <Err k="email" />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <input
                id="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={set('password')}
                placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                className={fieldCls}
              />
              <Err k="password" />
            </div>
          </div>

          {apiError && <p className="mt-4 rounded-md bg-danger-soft p-2.5 text-sm text-danger" role="alert">{apiError}</p>}

          <button type="submit" disabled={loading} className="mt-6 w-full rounded-md bg-brand py-3 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
            {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : 'New here?'}{' '}
            <button type="button" onClick={onSwitch} className="font-medium text-brand hover:underline">
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
