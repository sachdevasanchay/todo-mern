import Task from '../models/Task.js';

// Pick only the fields we allow from the request body
const getFields = (body) => {
  const { title, description, dueAt, endAt, priority } = body;
  return { title, description, dueAt, endAt, priority };
};

// GET /api/tasks  (optional: ?q=keyword to search title/description)
// Only returns tasks that belong to the logged-in user.
export const getTasks = async (req, res, next) => {
  try {
    const filter = { user: req.userId };
    const q = req.query.q?.trim();

    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // so "(" or "*" don't break search
      const regex = new RegExp(safe, 'i'); // 'i' = ignore upper/lower case
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const tasks = await Task.find(filter).sort({ dueAt: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks  - the task is stamped with the logged-in user's id
export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...getFields(req.body), user: req.userId });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id  - matches on id AND owner, so you can't edit someone else's task
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      getFields(req.body),
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id/status   body: { "status": "completed" }
export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
