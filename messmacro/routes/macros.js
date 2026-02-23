const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Comprehensive Indian mess food macros database (per 100g or per standard serving)
const MACROS_DB = {
  // Breakfast items
  "idli": { calories: 58, protein: 2, carbs: 12, fat: 0.4, fiber: 0.5, serving: "2 pieces (100g)", category: "Breakfast" },
  "dosa": { calories: 133, protein: 3.5, carbs: 25, fat: 2.5, fiber: 1.2, serving: "1 piece (80g)", category: "Breakfast" },
  "masala dosa": { calories: 210, protein: 5, carbs: 35, fat: 6, fiber: 2, serving: "1 piece (150g)", category: "Breakfast" },
  "poha": { calories: 130, protein: 2.5, carbs: 28, fat: 2, fiber: 1, serving: "1 bowl (100g)", category: "Breakfast" },
  "upma": { calories: 150, protein: 4, carbs: 28, fat: 3.5, fiber: 2, serving: "1 bowl (120g)", category: "Breakfast" },
  "paratha": { calories: 260, protein: 5, carbs: 36, fat: 10, fiber: 2.5, serving: "1 piece (80g)", category: "Breakfast" },
  "aloo paratha": { calories: 310, protein: 6, carbs: 45, fat: 11, fiber: 3, serving: "1 piece (120g)", category: "Breakfast" },
  "puri": { calories: 180, protein: 3, carbs: 22, fat: 9, fiber: 1, serving: "2 pieces (60g)", category: "Breakfast" },
  "chapati": { calories: 120, protein: 3.5, carbs: 22, fat: 2.5, fiber: 2, serving: "1 piece (50g)", category: "Breakfast" },
  "roti": { calories: 120, protein: 3.5, carbs: 22, fat: 2.5, fiber: 2, serving: "1 piece (50g)", category: "Breakfast" },
  "bread": { calories: 79, protein: 2.7, carbs: 15, fat: 1, fiber: 0.6, serving: "2 slices (60g)", category: "Breakfast" },
  "oats": { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, serving: "1 bowl (40g dry)", category: "Breakfast" },
  "cornflakes": { calories: 110, protein: 2, carbs: 25, fat: 0.5, fiber: 1, serving: "1 bowl (40g)", category: "Breakfast" },
  "sambar": { calories: 55, protein: 3, carbs: 9, fat: 1.5, fiber: 3, serving: "1 bowl (150ml)", category: "Sides" },
  "coconut chutney": { calories: 80, protein: 1.5, carbs: 4, fat: 7, fiber: 2, serving: "2 tbsp (40g)", category: "Sides" },
  
  // Lunch/Dinner mains
  "dal": { calories: 130, protein: 9, carbs: 22, fat: 1.5, fiber: 5, serving: "1 bowl (150ml)", category: "Dal" },
  "dal tadka": { calories: 160, protein: 9, carbs: 22, fat: 5, fiber: 5, serving: "1 bowl (150ml)", category: "Dal" },
  "dal fry": { calories: 170, protein: 9, carbs: 23, fat: 6, fiber: 5, serving: "1 bowl (150ml)", category: "Dal" },
  "rajma": { calories: 180, protein: 11, carbs: 30, fat: 2, fiber: 8, serving: "1 bowl (150g)", category: "Dal" },
  "chana masala": { calories: 200, protein: 12, carbs: 30, fat: 5, fiber: 9, serving: "1 bowl (150g)", category: "Dal" },
  "chole": { calories: 200, protein: 12, carbs: 30, fat: 5, fiber: 9, serving: "1 bowl (150g)", category: "Dal" },
  "sambar rice": { calories: 220, protein: 7, carbs: 42, fat: 2.5, fiber: 4, serving: "1 plate (250g)", category: "Rice" },
  "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, serving: "1 cup cooked (150g)", category: "Rice" },
  "fried rice": { calories: 200, protein: 5, carbs: 38, fat: 4, fiber: 1, serving: "1 cup (180g)", category: "Rice" },
  "biryani": { calories: 290, protein: 10, carbs: 45, fat: 9, fiber: 2, serving: "1 plate (250g)", category: "Rice" },
  "veg biryani": { calories: 250, protein: 7, carbs: 45, fat: 6, fiber: 3, serving: "1 plate (250g)", category: "Rice" },
  "pulao": { calories: 180, protein: 4, carbs: 35, fat: 3, fiber: 2, serving: "1 cup (180g)", category: "Rice" },
  "khichdi": { calories: 175, protein: 7, carbs: 32, fat: 2.5, fiber: 4, serving: "1 bowl (200g)", category: "Rice" },
  
  // Vegetables
  "aloo sabzi": { calories: 120, protein: 2, carbs: 20, fat: 4, fiber: 2.5, serving: "1 bowl (150g)", category: "Vegetable" },
  "aloo gobi": { calories: 130, protein: 3, carbs: 18, fat: 5, fiber: 3, serving: "1 bowl (150g)", category: "Vegetable" },
  "paneer butter masala": { calories: 280, protein: 14, carbs: 12, fat: 20, fiber: 2, serving: "1 bowl (150g)", category: "Paneer" },
  "palak paneer": { calories: 220, protein: 13, carbs: 8, fat: 15, fiber: 3, serving: "1 bowl (150g)", category: "Paneer" },
  "paneer bhurji": { calories: 260, protein: 15, carbs: 7, fat: 19, fiber: 1, serving: "1 bowl (150g)", category: "Paneer" },
  "paneer": { calories: 265, protein: 18, carbs: 3.6, fat: 20, fiber: 0, serving: "100g", category: "Paneer" },
  "mix veg": { calories: 100, protein: 3, carbs: 14, fat: 4, fiber: 3, serving: "1 bowl (150g)", category: "Vegetable" },
  "baingan bharta": { calories: 90, protein: 2.5, carbs: 10, fat: 5, fiber: 4, serving: "1 bowl (150g)", category: "Vegetable" },
  "bhindi masala": { calories: 95, protein: 2, carbs: 12, fat: 5, fiber: 4, serving: "1 bowl (150g)", category: "Vegetable" },
  "lauki sabzi": { calories: 60, protein: 1.5, carbs: 9, fat: 2, fiber: 2.5, serving: "1 bowl (150g)", category: "Vegetable" },
  "mattar paneer": { calories: 240, protein: 12, carbs: 16, fat: 14, fiber: 4, serving: "1 bowl (150g)", category: "Paneer" },
  
  // Snacks
  "samosa": { calories: 260, protein: 4, carbs: 30, fat: 14, fiber: 2, serving: "2 pieces (100g)", category: "Snacks" },
  "pakora": { calories: 280, protein: 5, carbs: 28, fat: 17, fiber: 2, serving: "6 pieces (100g)", category: "Snacks" },
  "vada pav": { calories: 300, protein: 6, carbs: 45, fat: 10, fiber: 3, serving: "1 piece (150g)", category: "Snacks" },
  "bread pakora": { calories: 320, protein: 7, carbs: 40, fat: 15, fiber: 2, serving: "2 pieces (120g)", category: "Snacks" },
  "dhokla": { calories: 160, protein: 5, carbs: 28, fat: 4, fiber: 1.5, serving: "4 pieces (100g)", category: "Snacks" },
  "kachori": { calories: 250, protein: 5, carbs: 30, fat: 12, fiber: 2, serving: "2 pieces (80g)", category: "Snacks" },
  
  // Dairy
  "milk": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, serving: "1 glass (200ml)", category: "Dairy" },
  "curd": { calories: 60, protein: 3.5, carbs: 4.5, fat: 3, fiber: 0, serving: "1 bowl (100g)", category: "Dairy" },
  "raita": { calories: 70, protein: 3, carbs: 7, fat: 3, fiber: 0.5, serving: "1 bowl (100g)", category: "Dairy" },
  "lassi": { calories: 100, protein: 4, carbs: 12, fat: 4, fiber: 0, serving: "1 glass (200ml)", category: "Dairy" },
  "buttermilk": { calories: 40, protein: 3, carbs: 5, fat: 1, fiber: 0, serving: "1 glass (200ml)", category: "Dairy" },
  "chaas": { calories: 40, protein: 3, carbs: 5, fat: 1, fiber: 0, serving: "1 glass (200ml)", category: "Dairy" },
  
  // Desserts
  "halwa": { calories: 300, protein: 4, carbs: 50, fat: 10, fiber: 1, serving: "1 bowl (100g)", category: "Dessert" },
  "kheer": { calories: 180, protein: 5, carbs: 32, fat: 4, fiber: 0.5, serving: "1 bowl (150g)", category: "Dessert" },
  "gulab jamun": { calories: 175, protein: 2.5, carbs: 30, fat: 5, fiber: 0.3, serving: "2 pieces (80g)", category: "Dessert" },
  "jalebi": { calories: 380, protein: 2, carbs: 68, fat: 12, fiber: 0.5, serving: "3 pieces (80g)", category: "Dessert" },
  "payasam": { calories: 170, protein: 4, carbs: 30, fat: 4, fiber: 0.5, serving: "1 bowl (150g)", category: "Dessert" },
  
  // Eggs / Non-veg
  "egg curry": { calories: 200, protein: 13, carbs: 5, fat: 15, fiber: 1, serving: "2 eggs + gravy (200g)", category: "Non-Veg" },
  "boiled egg": { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, serving: "1 egg (50g)", category: "Non-Veg" },
  "egg bhurji": { calories: 190, protein: 12, carbs: 4, fat: 14, fiber: 1, serving: "2 eggs (120g)", category: "Non-Veg" },
  "chicken curry": { calories: 230, protein: 22, carbs: 6, fat: 13, fiber: 1, serving: "1 bowl (200g)", category: "Non-Veg" },
  "fish curry": { calories: 200, protein: 20, carbs: 5, fat: 11, fiber: 1, serving: "1 bowl (200g)", category: "Non-Veg" },
  
  // Fruits
  "banana": { calories: 90, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving: "1 medium (100g)", category: "Fruit" },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, serving: "1 medium (150g)", category: "Fruit" },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, serving: "1 medium (130g)", category: "Fruit" },
};

// Lookup macros for a list of food items
router.post('/lookup', authMiddleware, (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
  
  const results = items.map(item => {
    const key = item.toLowerCase().trim();
    // Exact match
    if (MACROS_DB[key]) return { item, ...MACROS_DB[key], found: true };
    // Partial match
    const partial = Object.keys(MACROS_DB).find(k => k.includes(key) || key.includes(k));
    if (partial) return { item, ...MACROS_DB[partial], found: true, note: `Matched as "${partial}"` };
    return { item, found: false, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  });
  
  res.json({ results });
});

// Get full database
router.get('/database', authMiddleware, (req, res) => {
  res.json(MACROS_DB);
});

module.exports = router;
