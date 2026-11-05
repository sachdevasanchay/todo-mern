import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendAuth = (res, user, status = 200) =>
  res.status(status).json({
    token: makeToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });

// POST /api/auth/signup   body: { name, email, password }
export const signup = async (req, res, next) => {
  try {
    // String(...) stops people sending objects instead of text
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists. Log in instead.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    sendAuth(res, user, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login   body: { email, password }
export const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email }).select('+password');
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: 'Incorrect email or password' });

    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me   (needs token) - used by the app to restore a session
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Account not found. Please log in again.' });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};
