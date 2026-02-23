const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'messmacro_secret_key_change_in_prod';

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, hostel, rollNo } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (global.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), name, email, password: hashed, hostel: hostel || '', rollNo: rollNo || '', createdAt: new Date() };
    global.users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, hostel: user.hostel, rollNo: user.rollNo } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = global.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, hostel: user.hostel, rollNo: user.rollNo } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = global.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, hostel: user.hostel, rollNo: user.rollNo });
});

module.exports = router;
