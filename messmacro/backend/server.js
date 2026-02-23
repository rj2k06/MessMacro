const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'messmacro_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(path.join(__dirname, 'messmacro.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    hostel TEXT,
    room TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS food_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories REAL DEFAULT 0,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    fiber REAL DEFAULT 0,
    serving_size TEXT DEFAULT '100g',
    category TEXT DEFAULT 'other',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    food_item_id INTEGER,
    meal_type TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    quantity REAL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    food_item_id INTEGER,
    meal_type TEXT,
    quantity REAL DEFAULT 1,
    log_date DATE DEFAULT (date('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
  );
`);

// Seed common Indian hostel food items
const existingItems = db.prepare('SELECT COUNT(*) as count FROM food_items').get();
if (existingItems.count === 0) {
  const insertFood = db.prepare(`
    INSERT INTO food_items (name, calories, protein, carbs, fat, fiber, serving_size, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const foodData = [
    // Breakfast
    ['Idli (1 piece)', 39, 1.6, 7.9, 0.2, 0.5, '1 piece (40g)', 'breakfast'],
    ['Dosa (plain)', 120, 2.5, 18, 4, 0.5, '1 piece', 'breakfast'],
    ['Poha', 158, 2.6, 34, 1.9, 0.5, '100g', 'breakfast'],
    ['Upma', 152, 4, 27, 3, 2, '100g', 'breakfast'],
    ['Bread (white, 1 slice)', 70, 2.5, 13, 1, 0.6, '1 slice (30g)', 'breakfast'],
    ['Egg (boiled)', 78, 6.3, 0.6, 5.3, 0, '1 egg (50g)', 'breakfast'],
    ['Omelette (2 eggs)', 180, 13, 1, 14, 0, '2 eggs', 'breakfast'],
    ['Paratha (plain)', 200, 4, 30, 7, 2, '1 piece', 'breakfast'],
    ['Cornflakes', 357, 8, 79, 1.2, 3.8, '100g', 'breakfast'],
    ['Milk (full fat)', 61, 3.2, 4.8, 3.3, 0, '100ml', 'beverage'],
    ['Tea with milk', 30, 0.8, 3.5, 1.2, 0, '1 cup', 'beverage'],
    ['Banana', 89, 1.1, 23, 0.3, 2.6, '1 medium (100g)', 'fruit'],
    ['Apple', 52, 0.3, 14, 0.2, 2.4, '1 medium (100g)', 'fruit'],
    
    // Lunch & Dinner
    ['Rice (cooked)', 130, 2.7, 28, 0.3, 0.4, '100g', 'staple'],
    ['Dal (toor/arhar)', 116, 7.5, 18, 0.5, 5, '100g cooked', 'dal'],
    ['Dal (moong)', 105, 7, 16, 0.4, 4, '100g cooked', 'dal'],
    ['Dal (chana)', 164, 8.9, 27, 2.6, 7.6, '100g cooked', 'dal'],
    ['Rajma (cooked)', 127, 8.7, 22, 0.5, 6.4, '100g', 'dal'],
    ['Chole (cooked)', 164, 8.9, 27, 2.6, 7.6, '100g', 'dal'],
    ['Sambar', 47, 2.5, 7, 0.8, 2, '100ml', 'dal'],
    ['Chapati / Roti', 104, 3.1, 18, 2.3, 2.7, '1 piece (40g)', 'staple'],
    ['Aloo sabzi', 97, 2, 16, 3, 2, '100g', 'sabzi'],
    ['Paneer bhurji', 265, 14, 5, 21, 0.5, '100g', 'sabzi'],
    ['Palak paneer', 243, 12, 8, 19, 2.5, '100g', 'sabzi'],
    ['Bhindi fry', 68, 2, 8, 3, 3, '100g', 'sabzi'],
    ['Cabbage sabzi', 55, 2, 7, 2, 2.5, '100g', 'sabzi'],
    ['Mixed veg curry', 85, 3, 10, 4, 3, '100g', 'sabzi'],
    ['Chicken curry', 243, 21, 8, 14, 1, '100g', 'non-veg'],
    ['Egg curry', 185, 13, 6, 12, 0.5, '100g', 'non-veg'],
    ['Fish curry', 175, 19, 4, 9, 0.5, '100g', 'non-veg'],
    ['Curd / Dahi', 60, 3.5, 4.7, 3.3, 0, '100g', 'dairy'],
    ['Raita', 45, 2.5, 4, 2, 0.3, '100g', 'dairy'],
    ['Pickle (1 tsp)', 15, 0.3, 2, 0.7, 0.5, '1 tsp', 'condiment'],
    ['Papad (1 piece)', 48, 2.3, 7, 0.8, 0.5, '1 piece', 'condiment'],
    ['Salad (mixed)', 35, 1.5, 6, 0.3, 2.5, '100g', 'salad'],
    
    // Snacks
    ['Samosa (1 piece)', 262, 4, 24, 17, 2, '1 piece (60g)', 'snack'],
    ['Vada (1 piece)', 97, 4.5, 10, 4.5, 1.5, '1 piece (40g)', 'snack'],
    ['Biscuit (Parle-G, 3pcs)', 75, 1.3, 12, 2.4, 0.2, '3 biscuits', 'snack'],
    ['Peanuts (handful)', 166, 7.5, 5, 14, 2.5, '30g', 'snack'],
    ['Maggi noodles', 312, 8, 53, 8, 3, '75g (1 pack)', 'snack'],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) insertFood.run(...item);
  });
  insertMany(foodData);
}

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== AUTH ROUTES =====
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, hostel, room } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, hostel, room) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, email, hashed, hostel || '', room || '');
    const token = jwt.sign({ id: result.lastInsertRowid, name, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastInsertRowid, name, email, hostel, room } });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, hostel: user.hostel, room: user.room } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, email, hostel, room FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ===== FOOD ITEMS ROUTES =====
app.get('/api/foods', authenticate, (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM food_items WHERE 1=1';
  const params = [];
  if (search) { query += ' AND name LIKE ?'; params.push(`%${search}%`); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY category, name';
  res.json(db.prepare(query).all(...params));
});

app.post('/api/foods', authenticate, (req, res) => {
  const { name, calories, protein, carbs, fat, fiber, serving_size, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const stmt = db.prepare('INSERT INTO food_items (name, calories, protein, carbs, fat, fiber, serving_size, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(name, calories||0, protein||0, carbs||0, fat||0, fiber||0, serving_size||'100g', category||'other');
  res.json(db.prepare('SELECT * FROM food_items WHERE id = ?').get(result.lastInsertRowid));
});

// ===== MENU ROUTES =====
app.get('/api/menu', authenticate, (req, res) => {
  const menu = db.prepare(`
    SELECT me.*, fi.name, fi.calories, fi.protein, fi.carbs, fi.fat, fi.fiber, fi.serving_size, fi.category
    FROM menu_entries me
    JOIN food_items fi ON me.food_item_id = fi.id
    WHERE me.user_id = ?
    ORDER BY me.day_of_week, me.meal_type
  `).all(req.user.id);
  res.json(menu);
});

app.post('/api/menu', authenticate, (req, res) => {
  const { food_item_id, meal_type, day_of_week, quantity } = req.body;
  const existing = db.prepare('SELECT id FROM menu_entries WHERE user_id=? AND food_item_id=? AND meal_type=? AND day_of_week=?')
    .get(req.user.id, food_item_id, meal_type, day_of_week);
  if (existing) {
    db.prepare('UPDATE menu_entries SET quantity=? WHERE id=?').run(quantity||1, existing.id);
    return res.json({ message: 'Updated' });
  }
  const stmt = db.prepare('INSERT INTO menu_entries (user_id, food_item_id, meal_type, day_of_week, quantity) VALUES (?,?,?,?,?)');
  stmt.run(req.user.id, food_item_id, meal_type, day_of_week, quantity||1);
  res.json({ message: 'Added to menu' });
});

app.delete('/api/menu/:id', authenticate, (req, res) => {
  db.prepare('DELETE FROM menu_entries WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Removed' });
});

// ===== DAILY LOG ROUTES =====
app.get('/api/log', authenticate, (req, res) => {
  const { date } = req.query;
  const logDate = date || new Date().toISOString().split('T')[0];
  const logs = db.prepare(`
    SELECT dl.*, fi.name, fi.calories, fi.protein, fi.carbs, fi.fat, fi.fiber, fi.serving_size
    FROM daily_logs dl
    JOIN food_items fi ON dl.food_item_id = fi.id
    WHERE dl.user_id = ? AND dl.log_date = ?
  `).all(req.user.id, logDate);
  res.json(logs);
});

app.post('/api/log', authenticate, (req, res) => {
  const { food_item_id, meal_type, quantity, log_date } = req.body;
  const stmt = db.prepare('INSERT INTO daily_logs (user_id, food_item_id, meal_type, quantity, log_date) VALUES (?,?,?,?,?)');
  const result = stmt.run(req.user.id, food_item_id, meal_type||'lunch', quantity||1, log_date || new Date().toISOString().split('T')[0]);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/log/:id', authenticate, (req, res) => {
  db.prepare('DELETE FROM daily_logs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Removed' });
});

// ===== ANALYTICS =====
app.get('/api/analytics/week', authenticate, (req, res) => {
  const data = db.prepare(`
    SELECT log_date,
      SUM(fi.calories * dl.quantity) as total_calories,
      SUM(fi.protein * dl.quantity) as total_protein,
      SUM(fi.carbs * dl.quantity) as total_carbs,
      SUM(fi.fat * dl.quantity) as total_fat
    FROM daily_logs dl
    JOIN food_items fi ON dl.food_item_id = fi.id
    WHERE dl.user_id = ? AND dl.log_date >= date('now', '-7 days')
    GROUP BY log_date
    ORDER BY log_date
  `).all(req.user.id);
  res.json(data);
});

app.listen(PORT, () => console.log(`🍽️  MessMacro backend running on port ${PORT}`));
