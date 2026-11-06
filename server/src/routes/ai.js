import { Router } from 'express';
import { parseTask } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Simple limit: 10 AI requests per minute per user, so nobody can use up your free quota
const hits = new Map(); // userId -> list of request times
const limit = (req, res, next) => {
  const now = Date.now();
  const recent = (hits.get(req.userId) || []).filter((t) => now - t < 60000);
  if (recent.length >= 10) {
    return res.status(429).json({ message: 'Too many AI requests. Please wait a minute.' });
  }
  recent.push(now);
  hits.set(req.userId, recent);
  next();
};

router.post('/parse-task', protect, limit, parseTask);

export default router;
