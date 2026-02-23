import React, { useState, useEffect, useCallback } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ─── API Helper ─────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('mm_token');
const api = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const CATEGORIES = ['all', 'breakfast', 'staple', 'dal', 'sabzi', 'non-veg', 'dairy', 'snack', 'fruit', 'beverage', 'condiment', 'salad', 'other'];
const MACRO_COLORS = { calories: '#f97316', protein: '#22c55e', carbs: '#3b82f6', fat: '#f59e0b', fiber: '#8b5cf6' };

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0d0f14;
    --surface: #161921;
    --surface2: #1e2330;
    --border: #2a3040;
    --text: #e8ecf0;
    --muted: #6b7a94;
    --accent: #f97316;
    --accent2: #22c55e;
    --accent3: #3b82f6;
    --radius: 16px;
  }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
  input, select, textarea {
    font-family: 'DM Sans', sans-serif;
    background: var(--surface2);
    border: 1.5px solid var(--border);
    color: var(--text);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  input:focus, select:focus { border-color: var(--accent); }
  button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; }
  .btn-primary {
    background: var(--accent);
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    transition: opacity 0.2s, transform 0.1s;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-ghost {
    background: transparent;
    color: var(--muted);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    border: 1.5px solid var(--border);
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 8px;
    font-weight: 500;
  }
  .card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .animate-in { animation: fadeIn 0.3s ease forwards; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  .pulse { animation: pulse 1.5s infinite; }
`;

// ─── Auth Pages ───────────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', hostel: '', room: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('mm_token', data.token);
      onAuth(data.user);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'radial-gradient(ellipse at 60% 0%, #1a1200 0%, var(--bg) 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍱</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>MessMacro</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Know what you eat. Own your nutrition.</p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? 'white' : 'var(--muted)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', fontFamily: 'Syne, sans-serif' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <>
                <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
                  <input placeholder="Your full name" value={form.name} onChange={set('name')} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Hostel</label>
                    <input placeholder="e.g. H4" value={form.hostel} onChange={set('hostel')} /></div>
                  <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Room No.</label>
                    <input placeholder="e.g. 204" value={form.room} onChange={set('room')} /></div>
                </div>
              </>
            )}
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required /></div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, background: '#ef444415', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? '...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 20 }}>
          Built for hostel life 🏠 · Track macros · Eat smart
        </p>
      </div>
    </div>
  );
}

// ─── Macro Badge ─────────────────────────────────────────────────────────────
function MacroBadge({ label, value, unit = 'g', color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'Syne, sans-serif' }}>{typeof value === 'number' ? value.toFixed(1) : value}{unit}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────
function FoodCard({ food, onAdd, mode = 'browse' }) {
  const catColors = { breakfast: '#f59e0b', staple: '#6366f1', dal: '#ec4899', sabzi: '#22c55e', 'non-veg': '#ef4444', dairy: '#3b82f6', snack: '#f97316', fruit: '#84cc16', beverage: '#06b6d4', condiment: '#8b5cf6', salad: '#10b981' };
  const [selectedMeal, setSelectedMeal] = useState('Lunch');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [qty, setQty] = useState(1);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card animate-in" style={{ padding: 16, cursor: 'pointer', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600 }}>{food.name}</h4>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{food.serving_size}</span>
          </div>
          <span className="tag" style={{ background: (catColors[food.category] || '#6b7a94') + '22', color: catColors[food.category] || '#6b7a94' }}>{food.category}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, background: 'var(--surface2)', borderRadius: 10, padding: '10px 8px' }}>
          <MacroBadge label="kcal" value={food.calories} unit="" color={MACRO_COLORS.calories} />
          <MacroBadge label="prot" value={food.protein} color={MACRO_COLORS.protein} />
          <MacroBadge label="carbs" value={food.carbs} color={MACRO_COLORS.carbs} />
          <MacroBadge label="fat" value={food.fat} color={MACRO_COLORS.fat} />
          <MacroBadge label="fiber" value={food.fiber} color={MACRO_COLORS.fiber} />
        </div>
      </div>

      {expanded && onAdd && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }} onClick={e => e.stopPropagation()}>
          {mode === 'menu' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={selectedMeal} onChange={e => setSelectedMeal(e.target.value)}>
                {MEALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          ) : (
            <select value={selectedMeal} onChange={e => setSelectedMeal(e.target.value)}>
              {MEALS.map(m => <option key={m}>{m}</option>)}
            </select>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', borderRadius: 8, padding: '4px 8px' }}>
              <button onClick={() => setQty(q => Math.max(0.5, q - 0.5))} style={{ background: 'none', color: 'var(--muted)', fontSize: 18, width: 24, height: 24 }}>−</button>
              <span style={{ fontSize: 14, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{qty}x</span>
              <button onClick={() => setQty(q => q + 0.5)} style={{ background: 'none', color: 'var(--accent)', fontSize: 18, width: 24, height: 24 }}>+</button>
            </div>
            <button className="btn-primary btn-sm" style={{ flex: 1 }}
              onClick={() => { onAdd(food, selectedMeal, selectedDay, qty); setExpanded(false); }}>
              {mode === 'menu' ? '+ Add to Menu' : '+ Log this'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Today Tab ────────────────────────────────────────────────────────────────
function TodayTab({ foods, toast }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try { setLogs(await api('/log')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = async (food, meal) => {
    try {
      await api('/log', { method: 'POST', body: JSON.stringify({ food_item_id: food.id, meal_type: meal, quantity: 1 }) });
      toast('✅ Logged!');
      fetchLogs();
    } catch (e) { toast('❌ ' + e.message); }
  };

  const removeLog = async (id) => {
    await api(`/log/${id}`, { method: 'DELETE' });
    setLogs(l => l.filter(x => x.id !== id));
  };

  const totals = logs.reduce((acc, l) => ({
    calories: acc.calories + l.calories * l.quantity,
    protein: acc.protein + l.protein * l.quantity,
    carbs: acc.carbs + l.carbs * l.quantity,
    fat: acc.fat + l.fat * l.quantity,
    fiber: acc.fiber + l.fiber * l.quantity,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const filtered = foods.filter(f =>
    (!search || f.name.toLowerCase().includes(search.toLowerCase())) &&
    (category === 'all' || f.category === category)
  );

  const calorieGoal = 2200;
  const proteinGoal = 60;

  const radialData = [
    { name: 'Calories', value: Math.min(100, (totals.calories / calorieGoal) * 100), fill: MACRO_COLORS.calories },
    { name: 'Protein', value: Math.min(100, (totals.protein / proteinGoal) * 100), fill: MACRO_COLORS.protein },
  ];

  const mealGroups = MEALS.reduce((acc, m) => {
    acc[m] = logs.filter(l => l.meal_type === m);
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
      {/* Left: Food Browser */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔍 Find & Log Food</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }} className="scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ flexShrink: 0, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: category === c ? 'var(--accent)' : 'var(--surface2)', color: category === c ? 'white' : 'var(--muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '60vh', overflowY: 'auto' }} className="scrollbar-hide">
          {filtered.slice(0, 20).map(f => <FoodCard key={f.id} food={f} onAdd={addLog} mode="today" />)}
        </div>
      </div>

      {/* Right: Today's log */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Today's Nutrition</h2>
        
        {/* Summary Card */}
        <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #1e1a00 0%, var(--surface) 100%)', borderColor: '#f9731633' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{totals.calories.toFixed(0)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>of {calorieGoal} kcal goal</div>
            </div>
            <div style={{ width: 80, height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ value: Math.min(100, (totals.calories / calorieGoal) * 100), fill: '#f97316' }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={8} fill="#f97316" background={{ fill: '#2a3040' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[['Protein', totals.protein, MACRO_COLORS.protein], ['Carbs', totals.carbs, MACRO_COLORS.carbs], ['Fat', totals.fat, MACRO_COLORS.fat], ['Fiber', totals.fiber, MACRO_COLORS.fiber]].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'var(--surface2)', borderRadius: 10, padding: '8px 4px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: 'Syne, sans-serif' }}>{v.toFixed(1)}<span style={{ fontSize: 10, fontWeight: 400 }}>g</span></div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '45vh', overflowY: 'auto' }} className="scrollbar-hide">
          {MEALS.map(meal => (
            <div key={meal}>
              {mealGroups[meal]?.length > 0 && (
                <div className="card" style={{ padding: 14 }}>
                  <h4 style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal}</h4>
                  {mealGroups[meal].map(log => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{log.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{(log.calories * log.quantity).toFixed(0)} kcal · P:{(log.protein * log.quantity).toFixed(1)}g · C:{(log.carbs * log.quantity).toFixed(1)}g · F:{(log.fat * log.quantity).toFixed(1)}g</div>
                      </div>
                      <button onClick={() => removeLog(log.id)} style={{ background: 'none', color: 'var(--muted)', fontSize: 18, padding: '0 4px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
              <p>No meals logged yet today.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Search & add food from the left panel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Menu Builder Tab ─────────────────────────────────────────────────────────
function MenuTab({ foods, toast }) {
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(async () => {
    try { setMenu(await api('/menu')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const addToMenu = async (food, meal, day) => {
    try {
      await api('/menu', { method: 'POST', body: JSON.stringify({ food_item_id: food.id, meal_type: meal, day_of_week: day, quantity: 1 }) });
      toast('✅ Added to menu!');
      fetchMenu();
    } catch (e) { toast('❌ ' + e.message); }
  };

  const removeFromMenu = async (id) => {
    await api(`/menu/${id}`, { method: 'DELETE' });
    setMenu(m => m.filter(x => x.id !== id));
  };

  const dayMenu = menu.filter(m => m.day_of_week === selectedDay);
  const mealGroups = MEALS.reduce((acc, m) => {
    acc[m] = dayMenu.filter(d => d.meal_type === m);
    return acc;
  }, {});

  const dayTotals = dayMenu.reduce((acc, l) => ({
    calories: acc.calories + l.calories * l.quantity,
    protein: acc.protein + l.protein * l.quantity,
  }), { calories: 0, protein: 0 });

  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
      {/* Left: Food Browser */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🍱 Add to Weekly Menu</h2>
        <input placeholder="Search food to add..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '65vh', overflowY: 'auto' }} className="scrollbar-hide">
          {filtered.slice(0, 15).map(f => <FoodCard key={f.id} food={f} onAdd={addToMenu} mode="menu" />)}
        </div>
      </div>

      {/* Right: Weekly Menu View */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📅 {selectedDay}'s Menu</h2>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{dayTotals.calories.toFixed(0)} kcal · {dayTotals.protein.toFixed(0)}g protein</div>
        </div>

        {/* Day selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16 }} className="scrollbar-hide">
          {DAYS.map(d => {
            const count = menu.filter(m => m.day_of_week === d).length;
            return (
              <button key={d} onClick={() => setSelectedDay(d)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: selectedDay === d ? 'var(--accent)' : 'var(--surface2)', color: selectedDay === d ? 'white' : 'var(--muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Syne, sans-serif', position: 'relative' }}>
                {d.slice(0, 3)}{count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--accent2)', color: 'white', fontSize: 9, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '58vh', overflowY: 'auto' }} className="scrollbar-hide">
          {MEALS.map(meal => (
            <div key={meal} className="card" style={{ padding: 14 }}>
              <h4 style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Syne, sans-serif' }}>{meal}</h4>
              {mealGroups[meal]?.length > 0 ? mealGroups[meal].map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.calories.toFixed(0)} kcal · P:{item.protein.toFixed(1)}g · C:{item.carbs.toFixed(1)}g · F:{item.fat.toFixed(1)}g</div>
                  </div>
                  <button onClick={() => removeFromMenu(item.id)} style={{ background: 'none', color: 'var(--muted)', fontSize: 18, padding: '0 4px' }}>×</button>
                </div>
              )) : <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>No items yet for {meal}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Food Tab ─────────────────────────────────────────────────────────────
function AddFoodTab({ onAdd, toast }) {
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving_size: '100g', category: 'other' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const item = await api('/foods', { method: 'POST', body: JSON.stringify({ ...form, calories: +form.calories, protein: +form.protein, carbs: +form.carbs, fat: +form.fat, fiber: +form.fiber }) });
      onAdd(item);
      toast('✅ Food added to database!');
      setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving_size: '100g', category: 'other' });
    } catch (e) { toast('❌ ' + e.message); }
    setLoading(false);
  };

  const Field = ({ label, k, type = 'number', placeholder }) => (
    <div>
      <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={form[k]} onChange={set(k)} />
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>➕ Add Custom Food Item</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Missing a food from your mess? Add it here with its nutritional info (check the packet or use a nutrition database).</p>
      
      <div className="card">
        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Food Name *" k="name" type="text" placeholder="e.g. Vegetable Biryani" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Serving Size" k="serving_size" type="text" placeholder="e.g. 100g or 1 piece" />
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Category</label>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Field label="Calories (kcal)" k="calories" placeholder="0" />
            <Field label="Protein (g)" k="protein" placeholder="0" />
            <Field label="Carbs (g)" k="carbs" placeholder="0" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fat (g)" k="fat" placeholder="0" />
            <Field label="Fiber (g)" k="fiber" placeholder="0" />
          </div>

          {/* Live Preview */}
          {form.name && (
            <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Preview:</p>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>{form.name}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {[['Kcal', form.calories || 0, MACRO_COLORS.calories, ''], ['Prot', form.protein || 0, MACRO_COLORS.protein, 'g'], ['Carbs', form.carbs || 0, MACRO_COLORS.carbs, 'g'], ['Fat', form.fat || 0, MACRO_COLORS.fat, 'g'], ['Fiber', form.fiber || 0, MACRO_COLORS.fiber, 'g']].map(([l, v, c, u]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{Number(v).toFixed(1)}{u}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading || !form.name}>
            {loading ? 'Saving...' : '+ Add Food to Database'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState([]);
  useEffect(() => { api('/analytics/week').then(setData).catch(() => {}); }, []);

  const chartData = data.map(d => ({
    date: d.log_date.slice(5),
    Calories: Math.round(d.total_calories),
    Protein: Math.round(d.total_protein),
    Carbs: Math.round(d.total_carbs),
    Fat: Math.round(d.total_fat),
  }));

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📈 Weekly Analytics</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Your nutrition trends over the last 7 days.</p>
      
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p>Start logging meals to see your weekly trends here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--muted)' }}>DAILY CALORIES (last 7 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'DM Sans' }} />
                <Bar dataKey="Calories" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--muted)' }}>MACRO BREAKDOWN</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'DM Sans' }} />
                <Bar dataKey="Protein" fill={MACRO_COLORS.protein} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Carbs" fill={MACRO_COLORS.carbs} radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="Fat" fill={MACRO_COLORS.fat} radius={[0, 0, 4, 4]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('today');
  const [foods, setFoods] = useState([]);
  const [toast, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      api('/auth/me').then(u => { setUser(u); setAuthChecked(true); }).catch(() => { localStorage.removeItem('mm_token'); setAuthChecked(true); });
    } else setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (user) api('/foods').then(setFoods).catch(() => {});
  }, [user]);

  const addFood = (item) => setFoods(f => [item, ...f]);

  const logout = () => {
    localStorage.removeItem('mm_token');
    setUser(null);
  };

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 14, color: 'var(--muted)' }} className="pulse">Loading MessMacro...</div>
    </div>
  );

  if (!user) return <><style>{styles}</style><AuthPage onAuth={setUser} /></>;

  const TABS = [
    { id: 'today', label: "Today's Log", icon: '🍽️' },
    { id: 'menu', label: 'Weekly Menu', icon: '📅' },
    { id: 'add', label: 'Add Food', icon: '➕' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <>
      <style>{styles}</style>
      
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 500, zIndex: 1000, boxShadow: '0 8px 32px #00000060' }} className="animate-in">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', height: 58, gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
            <span style={{ fontSize: 22 }}>🍱</span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>MessMacro</span>
          </div>
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: tab === t.id ? 'var(--accent)' + '22' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              {user.hostel && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Hostel {user.hostel} · Room {user.room}</div>}
            </div>
            <button className="btn-ghost btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>
        {tab === 'today' && <TodayTab foods={foods} toast={showToast} />}
        {tab === 'menu' && <MenuTab foods={foods} toast={showToast} />}
        {tab === 'add' && <AddFoodTab onAdd={addFood} toast={showToast} />}
        {tab === 'analytics' && <AnalyticsTab />}
      </main>
    </>
  );
}
