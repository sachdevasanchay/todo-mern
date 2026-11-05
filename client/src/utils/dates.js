// Weeks run Monday → Sunday, in the user's local timezone.
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const startOfWeek = (d) => addDays(startOfDay(d), -((new Date(d).getDay() + 6) % 7));

export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const pad = (n) => String(n).padStart(2, '0');
export const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const weekKey = (d) => toDateInput(startOfWeek(d));

export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const fmtRange = (weekStart) => {
  const o = { month: 'short', day: 'numeric' };
  return `${weekStart.toLocaleDateString([], o)} – ${addDays(weekStart, 6).toLocaleDateString([], o)}`;
};

export const fmtLongDate = (d) =>
  new Date(d).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

export function groupByWeek(tasks) {
  const map = new Map();
  tasks.forEach((t) => {
    const key = weekKey(t.dueAt);
    if (!map.has(key)) map.set(key, { key, start: startOfWeek(t.dueAt), tasks: [] });
    map.get(key).tasks.push(t);
  });
  return [...map.values()]
    .sort((a, b) => a.start - b.start)
    .map((w) => ({
      ...w,
      done: w.tasks.filter((t) => t.status === 'completed').length,
      open: w.tasks.filter((t) => t.status !== 'completed').length,
    }));
}
