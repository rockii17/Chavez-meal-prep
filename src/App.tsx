import React, { useState } from 'react';

interface Ingredient {
  name: string;
  amount: string;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: Ingredient[];
}

interface DayPlan {
  dayName: string;
  breakfastId: string;
  lunchId: string;
  dinnerId: string;
}

const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Scrambled Eggs & Toast',
    category: 'Breakfast',
    ingredients: [
      { name: 'Eggs', amount: '3' },
      { name: 'Bread', amount: '2 slices' },
      { name: 'Butter', amount: '1 tbsp' },
    ],
  },
  {
    id: '2',
    name: 'Oatmeal & Fruit',
    category: 'Breakfast',
    ingredients: [
      { name: 'Oats', amount: '1 cup' },
      { name: 'Milk', amount: '1 cup' },
      { name: 'Berries', amount: '1/2 cup' },
    ],
  },
  {
    id: '3',
    name: 'Grilled Chicken Salad',
    category: 'Lunch',
    ingredients: [
      { name: 'Chicken Breast', amount: '1 lb' },
      { name: 'Mixed Greens', amount: '1 bag' },
      { name: 'Salad Dressing', amount: '2 tbsp' },
    ],
  },
  {
    id: '4',
    name: 'Turkey Wrap',
    category: 'Lunch',
    ingredients: [
      { name: 'Tortilla Wraps', amount: '1 pack' },
      { name: 'Deli Turkey', amount: '1/2 lb' },
      { name: 'Cheese Slices', amount: '4 slices' },
    ],
  },
  {
    id: '5',
    name: 'Beef Tacos',
    category: 'Dinner',
    ingredients: [
      { name: 'Ground Beef', amount: '1 lb' },
      { name: 'Taco Shells', amount: '1 box' },
      { name: 'Shredded Cheese', amount: '1 cup' },
      { name: 'Salsa', amount: '1 jar' },
    ],
  },
  {
    id: '6',
    name: 'Salmon with Asparagus',
    category: 'Dinner',
    ingredients: [
      { name: 'Salmon Fillets', amount: '2' },
      { name: 'Fresh Asparagus', amount: '1 bunch' },
      { name: 'Olive Oil', amount: '2 tbsp' },
    ],
  },
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'search' | 'shopping'>('calendar');
  const [recipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [searchTerm, setSearchTerm] = useState('');

  // Weekly plan initialized Sunday through Saturday
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(
    DAYS_OF_WEEK.map((day) => ({
      dayName: day,
      breakfastId: '',
      lunchId: '',
      dinnerId: '',
    }))
  );

  const handleSelectMeal = (
    dayName: string,
    mealType: 'breakfastId' | 'lunchId' | 'dinnerId',
    recipeId: string
  ) => {
    setWeeklyPlan((prev) =>
      prev.map((item) =>
        item.dayName === dayName ? { ...item, [mealType]: recipeId } : item
      )
    );
  };

  // Filter recipes based on user search input
  const filteredRecipes = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compile full shopping list from selected calendar meals
  const selectedRecipeIds = weeklyPlan
    .flatMap((d) => [d.breakfastId, d.lunchId, d.dinnerId])
    .filter(Boolean);

  const shoppingList: { [key: string]: string[] } = {};
  selectedRecipeIds.forEach((id) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      recipe.ingredients.forEach((ing) => {
        if (!shoppingList[ing.name]) {
          shoppingList[ing.name] = [];
        }
        shoppingList[ing.name].push(ing.amount);
      });
    }
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', color: '#222' }}>
      <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#1a365d' }}>Chavez Meal Prep</h1>
        
        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'calendar' ? '#1a365d' : '#e2e8f0',
              color: activeTab === 'calendar' ? '#fff' : '#333',
            }}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'search' ? '#1a365d' : '#e2e8f0',
              color: activeTab === 'search' ? '#fff' : '#333',
            }}
          >
            Search Recipes
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'shopping' ? '#1a365d' : '#e2e8f0',
              color: activeTab === 'shopping' ? '#fff' : '#333',
            }}
          >
            Shopping List ({Object.keys(shoppingList).length})
          </button>
        </nav>
      </header>

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <section>
          <h2>Weekly Planner (Sun – Sat)</h2>
          <p style={{ color: '#666' }}>Select meals for each day to automatically populate your shopping list.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '15px' }}>
            {weeklyPlan.map((day) => (
              <div key={day.dayName} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc' }}>
                <strong style={{ display: 'block', textAlign: 'center', marginBottom: '8px', color: '#0f172a' }}>{day.dayName}</strong>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.75em', fontWeight: 'bold' }}>Breakfast</label>
                  <select
                    value={day.breakfastId}
                    onChange={(e) => handleSelectMeal(day.dayName, 'breakfastId', e.target.value)}
                    style={{ width: '100%', padding: '4px', fontSize: '0.8em' }}
                  >
                    <option value="">-- None --</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.75em', fontWeight: 'bold' }}>Lunch</label>
                  <select
                    value={day.lunchId}
                    onChange={(e) => handleSelectMeal(day.dayName, 'lunchId', e.target.value)}
                    style={{ width: '100%', padding: '4px', fontSize: '0.8em' }}
                  >
                    <option value="">-- None --</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75em', fontWeight: 'bold' }}>Dinner</label>
                  <select
                    value={day.dinnerId}
                    onChange={(e) => handleSelectMeal(day.dayName, 'dinnerId', e.target.value)}
                    style={{ width: '100%', padding: '4px', fontSize: '0.8em' }}
                  >
                    <option value="">-- None --</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: SEARCH RECIPES VIEW */}
      {activeTab === 'search' && (
        <section>
          <h2>Search Recipes</h2>
          <input
            type="text"
            placeholder="Search by recipe name or category (e.g. Dinner, Breakfast)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{recipe.name}</h3>
                <span style={{ fontSize: '0.8em', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                  {recipe.category}
                </span>
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '0.9em' }}>Ingredients:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: '#475569' }}>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing.amount} {ing.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: SHOPPING LIST VIEW */}
      {activeTab === 'shopping' && (
        <section style={{ backgroundColor: '#fffbe0', padding: '20px', borderRadius: '8px', border: '1px solid #fef08a' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#713f12' }}>Shopping List</h2>
          {Object.keys(shoppingList).length === 0 ? (
            <p style={{ color: '#854d0e' }}>Your shopping list is currently empty. Go to the **Calendar** tab and select meals to generate your items.</p>
          ) : (
            <ul style={{ fontSize: '1.05em', lineHeight: '1.6' }}>
              {Object.entries(shoppingList).map(([ingredient, amounts]) => (
                <li key={ingredient}>
                  <strong>{ingredient}</strong> — ({amounts.join(' + ')})
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}