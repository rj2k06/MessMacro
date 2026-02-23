require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database (replace with MongoDB/PostgreSQL in production)
global.users = [];
global.menus = {};

// ── PRELOADED MESS MENUS ────────────────────────────────
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const VEG_MENU = {
  Sunday:    { Breakfast: 'poha, banana, chai',                         Lunch: 'dal makhani, jeera rice, roti, salad, curd',              Snacks: 'samosa, chai',                Dinner: 'paneer tikka masala, dal, roti, rice, kheer' },
  Monday:    { Breakfast: 'idli, sambar, coconut chutney',              Lunch: 'rajma, steamed rice, roti, salad',                         Snacks: 'bread pakoda, chai',          Dinner: 'dal fry, roti, rice, salad, curd' },
  Tuesday:   { Breakfast: 'upma, boiled egg whites, chai',              Lunch: 'chana masala, roti, rice, raita',                          Snacks: 'banana, biscuits',            Dinner: 'chole bhature, salad' },
  Wednesday: { Breakfast: 'paratha, curd, pickle',                      Lunch: 'mixed veg curry, roti, rice, dal, salad',                  Snacks: 'vada pav, chai',              Dinner: 'palak paneer, roti, rice, dal' },
  Thursday:  { Breakfast: 'dosa, sambar, chutney',                      Lunch: 'paneer butter masala, roti, rice, dal',                    Snacks: 'fruit bowl',                  Dinner: 'mix dal, roti, rice, raita' },
  Friday:    { Breakfast: 'vermicelli upma, chai',                      Lunch: 'aloo gobi, dal tadka, roti, rice',                         Snacks: 'maggi, chai',                 Dinner: 'rajma, roti, rice, salad' },
  Saturday:  { Breakfast: 'puri bhaji, chai',                           Lunch: 'kadhi pakoda, rice, roti, salad',                          Snacks: 'dhokla, green chutney',       Dinner: 'shahi paneer, roti, rice, gulab jamun' }
};

const NONVEG_MENU = {
  Sunday:    { Breakfast: 'egg bhurji, bread, chai',                    Lunch: 'chicken biryani, raita, salad',                            Snacks: 'chicken nuggets, chai',       Dinner: 'butter chicken, naan, rice, salad, gulab jamun' },
  Monday:    { Breakfast: 'boiled eggs, paratha, chai',                 Lunch: 'chicken curry, roti, rice, dal, salad',                    Snacks: 'egg roll, chai',              Dinner: 'chicken dal, roti, rice, salad' },
  Tuesday:   { Breakfast: 'omelette, toast, chai',                      Lunch: 'egg curry, roti, rice, salad',                             Snacks: 'bread omelette, chai',        Dinner: 'egg biryani, raita, salad' },
  Wednesday: { Breakfast: 'egg curry, rice, chai',                      Lunch: 'mutton curry, roti, rice, salad',                          Snacks: 'chicken sandwich, chai',      Dinner: 'mutton biryani, raita, salad' },
  Thursday:  { Breakfast: 'scrambled eggs, bread, chai',                Lunch: 'chicken masala, roti, rice, raita',                        Snacks: 'boiled eggs, biscuits',       Dinner: 'chicken karahi, roti, rice' },
  Friday:    { Breakfast: 'poha, boiled egg, chai',                     Lunch: 'fish curry, rice, roti, salad',                            Snacks: 'egg maggi, chai',             Dinner: 'fish fry, dal, roti, rice' },
  Saturday:  { Breakfast: 'egg dosa, sambar',                           Lunch: 'chicken fried rice, manchurian, salad',                    Snacks: 'chicken tikka, mint chutney', Dinner: 'chicken kebab, naan, dal makhani, kheer' }
};

const SPECIAL_MENU = {
  Sunday:    { Breakfast: 'masala dosa, sambar, filter coffee',         Lunch: 'veg biryani, paneer tikka, raita, salad, mango lassi',    Snacks: 'chef special pastry, cold coffee', Dinner: 'dal bukhara, garlic naan, jeera rice, salad, phirni' },
  Monday:    { Breakfast: 'akki roti, chutney, fruit bowl, coffee',    Lunch: 'special thali: dal makhani, paneer makhani, roti, rice, raita, salad, sweet', Snacks: 'spring rolls, schezwan sauce, chai', Dinner: 'mushroom matar masala, tandoori roti, rice, salad' },
  Tuesday:   { Breakfast: 'uttapam, tomato chutney, banana smoothie',  Lunch: 'chole palak, stuffed paratha, raita, salad, lassi',        Snacks: 'pani puri, chai',             Dinner: 'palak corn, dal fry, roti, rice, raita, gulab jamun' },
  Wednesday: { Breakfast: 'pesarattu, ginger chutney, green tea',      Lunch: 'kofta curry, jeera rice, dal, roti, salad',                Snacks: 'aloo tikki, chole, chai',     Dinner: 'paneer lababdar, naan, dal makhani, rice' },
  Thursday:  { Breakfast: 'set dosa, veg kurma, coffee',               Lunch: 'kadai paneer, tawa roti, dal fry, rice, raita',            Snacks: 'fruit chaat, lemonade',       Dinner: 'aloo methi, kadhi, rice, roti, papad' },
  Friday:    { Breakfast: 'medu vada, sambar, coconut chutney, chai',  Lunch: 'shahi pulao, dal, raita, salad, papad',                    Snacks: 'masala corn, chai',           Dinner: 'veg dum biryani, paneer tikka, raita, salad' },
  Saturday:  { Breakfast: 'rava idli, sambar, filter coffee',          Lunch: 'special biryani, mirchi ka salan, raita, salad',           Snacks: 'cold sandwich, cold coffee',  Dinner: 'special paneer butter masala, garlic naan, kheer' }
};

global.menus['Veg']     = { menu: VEG_MENU,     updatedBy: 'System', updatedAt: new Date() };
global.menus['Nonveg']  = { menu: NONVEG_MENU,  updatedBy: 'System', updatedAt: new Date() };
global.menus['Special'] = { menu: SPECIAL_MENU, updatedBy: 'System', updatedAt: new Date() };
// ────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/macros', require('./routes/macros'));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍛 MessMacro running at http://localhost:${PORT}`);
});
