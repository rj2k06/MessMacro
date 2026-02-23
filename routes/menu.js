const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Days and meals
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEALS = ['Breakfast','Lunch','Snacks','Dinner'];

// Save menu (admin or any user for their hostel)
router.post('/save', authMiddleware, (req, res) => {
  const { hostel, menu } = req.body;
  if (!hostel || !menu) return res.status(400).json({ error: 'hostel and menu required' });
  global.menus[hostel] = { menu, updatedBy: req.user.name, updatedAt: new Date() };
  res.json({ success: true, message: 'Menu saved!' });
});

// Get menu for a hostel
router.get('/:hostel', authMiddleware, (req, res) => {
  const data = global.menus[req.params.hostel];
  if (!data) return res.json({ menu: null, message: 'No menu set yet' });
  res.json(data);
});

// List all hostels with menus
router.get('/', authMiddleware, (req, res) => {
  res.json(Object.keys(global.menus));
});

module.exports = router;
