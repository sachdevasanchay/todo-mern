import { useEffect, useState } from 'react';
import { CloseIcon, ClockIcon } from './Icons.jsx';
import { toDateInput, toTimeInput } from '../utils/dates.js';

const PRIORITIES = ['low', 'medium', 'high'];

const labelCls = 'mb-1.5 block text-xs text-slate-500';
const fieldCls =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400';

export default function TaskModal({ task, defaultDate, onClose, onSave }) {
  const editing = Boolean(task);
  const [form, setForm] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    date: toDateInput(task ? new Date(task.dueAt) : defaultDate || new Date()),
    start: task ? toTimeInput(new Date(task.dueAt)) : '',
    end: task?.endAt ? toTimeInput(new Date(task.endAt)) : '',
    priority: task?.priority || '',
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = 'Enter a task title.';
    if (!form.date) err.date = 'Pick a date.';
    if (!form.start) err.start = 'Set a start time.';
    if (form.start && form.end && form.end <= form.start) err.end = 'End must be after start.';
    return err;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    setApiError('');
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        dueAt: new Date(`${form.date}T${form.start}`).toISOString(),
        endAt: form.end ? new Date(`${form.date}T${form.end}`).toISOString() : null,
        priority: form.priority || null,
      });
    } catch (e2) {
      setApiError(e2.message);
      setSaving(false);
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-xs text-danger" role="alert">{errors[k]}</p> : null);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 md:items-center md:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Edit task' : 'Add new task'}
        className="sheet-up max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 pb-6 md:rounded-2xl md:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{editing ? 'Edit Task' : 'Add New Task'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1"><CloseIcon /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className={labelCls}>Task title</label>
            <input id="title" autoFocus value={form.title} onChange={set('title')} maxLength={120} placeholder="Doing Homework" className={fieldCls} />
            <Err k="title" />
          </div>

          <div>
            <span className={labelCls}>Set Time</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="relative block">
                  <ClockIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <span className="sr-only">Start time</span>
                  <input type="time" value={form.start} onChange={set('start')} className={`${fieldCls} pl-9`} />
                </label>
                <Err k="start" />
              </div>
              <div>
                <label className="relative block">
                  <ClockIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <span className="sr-only">End time (optional)</span>
                  <input type="time" value={form.end} onChange={set('end')} className={`${fieldCls} pl-9`} />
                </label>
                <Err k="end" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="date" className={labelCls}>Set Date</label>
            <input id="date" type="date" value={form.date} onChange={set('date')} className={fieldCls} />
            <Err k="date" />
          </div>

          <div>
            <span className={labelCls}>Priority (optional)</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Priority">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={form.priority === p}
                  onClick={() => setForm((f) => ({ ...f, priority: f.priority === p ? '' : p }))}
                  className={`rounded-md border py-2 text-sm capitalize transition-colors ${
                    form.priority === p ? 'border-brand bg-brand-soft font-medium text-brand' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="desc" className={labelCls}>Description</label>
            <textarea id="desc" rows={3} value={form.description} onChange={set('description')} maxLength={1000} placeholder="Add Description" className={`${fieldCls} resize-none`} />
          </div>
        </div>

        {apiError && <p className="mt-4 rounded-md bg-danger-soft p-2.5 text-sm text-danger" role="alert">{apiError}</p>}

        <button type="submit" disabled={saving} className="mt-5 w-full rounded-md bg-brand py-3 text-sm font-medium text-white disabled:opacity-60">
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </div>
  );
}
