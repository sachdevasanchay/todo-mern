import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, empty, ...handlers }) {
  if (!tasks.length) return <p className="py-6 text-center text-sm text-slate-400">{empty}</p>;
  return <ul>{tasks.map((t) => <TaskItem key={t._id} task={t} {...handlers} />)}</ul>;
}
