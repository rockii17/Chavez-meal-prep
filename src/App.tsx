import React, { useState, useEffect } from 'react';

interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strMealThumb?: string;
  strInstructions?: string;
  ingredients?: string;
  isCustom?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'search' | 'saved' | 'shopping'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  // Load saved recipes from localStorage
  const [savedRecipes, setSavedRecipes] = useState<Meal[]>(() => {
    const localData = localStorage.getItem('chavez_saved_recipes');
    return localData ? JSON.parse(localData) : [];
  });

  // Custom Recipe Form State
  const [showForm, setShowForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Custom / Favorite');
  const [customIngredients, setCustomIngredients] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Weekly Planner State
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, { breakfast: string; lunch: string; dinner: string }>>({
    Sunday: { breakfast: '', lunch: '', dinner: '' },
    Monday: { breakfast: '', lunch: '', dinner: '' },
    Tuesday: { breakfast: '', lunch: '', dinner: '' },
    Wednesday: { breakfast: '', lunch: '', dinner: '' },
    Thursday: { breakfast: '', lunch: '', dinner: '' },
    Friday: { breakfast: '', lunch: '', dinner: '' },
    Saturday: { breakfast: '', lunch: '', dinner: '' },
  });

  // Save to localStorage whenever savedRecipes changes
  useEffect(() => {
    localStorage.setItem('chavez_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // Online Search API Fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.meals || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSaveRecipe = (meal: Meal) => {
    if (savedRecipes.some((r) => r.idMeal === meal.idMeal)) {
      setSavedRecipes(savedRecipes.filter((r) => r.idMeal !== meal.idMeal));
    } else {
      setSavedRecipes([...savedRecipes, meal]);
    }
  };

  const handleAddCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newRecipe: Meal = {
      idMeal: `custom-${Date.now()}`,
      strMeal: customName.trim(),
      strCategory: customCategory.trim() || 'Custom',
      ingredients: customIngredients.trim(),
      strInstructions: customInstructions.trim(),
      isCustom: true,
    };

    setSavedRecipes([...savedRecipes, newRecipe]);
    setCustomName('');
    setCustomCategory('Custom / Favorite');
    setCustomIngredients('');
    setCustomInstructions('');
    setShowForm(false);
  };

  const handleMealChange = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: value,
      },
    }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <h1 style={{ textAlign: 'center', color: '#1e3a8a', fontSize: '28px', marginBottom: '20px' }}>Chavez Meal Prep</h1>

      {/* Navigation Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '10px 4px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'calendar' ? '#1e3a8a' : '#e2e8f0',
            color: activeTab === 'calendar' ? '#fff' : '#334155',
          }}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '10px 4px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'search' ? '#1e3a8a' : '#e2e8f0',
            color: activeTab === 'search' ? '#fff' : '#334155',
          }}
        >
          Search Online
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '10px 4px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'saved' ? '#1e3a8a' : '#e2e8f0',
            color: activeTab === 'saved' ? '#fff' : '#334155',
          }}
        >
          Saved ({savedRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          style={{
            padding: '10px 4px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'shopping' ? '#1e3a8a' : '#e2e8f0',
            color: activeTab === 'shopping' ? '#fff' : '#334155',
          }}
        >
          Shopping List
        </button>
      </div>

      {/* Tab 1: Calendar */}
      {activeTab === 'calendar' && (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#1e3a8a' }}>Weekly Planner</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {days.map((day) => (
              <div key={day} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a', textAlign: 'center' }}>{day}</h3>
                {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
                  <div key={mealType} style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '12px', textTransform: 'capitalize', fontWeight: 'bold', marginBottom: '2px' }}>
                      {mealType}
                    </label>
                    <select
                      value={weeklyPlan[day][mealType]}
                      onChange={(e) => handleMealChange(day, mealType, e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #94a3b8' }}
                    >
                      <option value="">-- Select Saved Recipe --</option>
                      {savedRecipes.map((meal) => (
                        <option key={meal.idMeal} value={meal.strMeal}>
                          {meal.strMeal}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Online Recipe Search */}
      {activeTab === 'search' && (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: '#1e3a8a' }}>Search Internet Recipes</h2>
          <input
            type="text"
            placeholder="Type a meal or ingredient (e.g., Chicken, Pasta, Taco)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #94a3b8', marginBottom: '16px', boxSizing: 'border-box' }}
          />

          {loading && <p style={{ color: '#64748b' }}>Searching web database...</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {searchResults.map((meal) => {
              const isSaved = savedRecipes.some((r) => r.idMeal === meal.idMeal);
              return (
                <div key={meal.idMeal} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {meal.strMealThumb && (
                    <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                  )}
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{meal.strMeal}</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>{meal.strCategory}</p>
                  <button
                    onClick={() => toggleSaveRecipe(meal)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      backgroundColor: isSaved ? '#ef4444' : '#16a34a',
                      color: '#fff',
                    }}
                  >
                    {isSaved ? 'Remove Favorite' : 'Save to Favorites'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Saved Favorites & Custom / Pasted Recipes */}
      {activeTab === 'saved' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: '#1e3a8a' }}>Saved Recipes</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {showForm ? 'Cancel' : '+ Add / Paste Recipe'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddCustomRecipe} style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', backgroundColor: '#f1f5f9', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e3a8a' }}>Add Custom or Pasted Recipe</h3>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Recipe Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Smoker Brisket or Green Chile Stew"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #94a3b8', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Category</label>
                <input
                  type="text"
                  placeholder="e.g., Dinner, Breakfast, Smoker"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #94a3b8', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Paste Ingredients</label>
                <textarea
                  rows={3}
                  placeholder="Paste ingredients list here..."
                  value={customIngredients}
                  onChange={(e) => setCustomIngredients(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #94a3b8', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Paste Instructions / Steps</label>
                <textarea
                  rows={4}
                  placeholder="Paste directions, prep steps, or cook details here..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #94a3b8', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Save Recipe
              </button>
            </form>
          )}

          {savedRecipes.length === 0 ? (
            <p style={{ color: '#64748b' }}>No saved recipes yet. Add/paste a custom recipe above or search online!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {savedRecipes.map((meal) => (
                <div key={meal.idMeal} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {meal.strMealThumb ? (
                      <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '80px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: '#64748b', fontWeight: 'bold' }}>
                        {meal.isCustom ? 'Custom Recipe' : 'Saved Recipe'}
                      </div>
                    )}
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{meal.strMeal}</h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>{meal.strCategory}</p>

                    {meal.ingredients && (
                      <div style={{ marginBottom: '8px', fontSize: '13px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                        <strong>Ingredients:</strong>
                        <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap', color: '#334155' }}>{meal.ingredients}</p>
                      </div>
                    )}

                    {meal.strInstructions && (
                      <div style={{ marginBottom: '8px', fontSize: '13px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                        <strong>Instructions:</strong>
                        <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap', color: '#334155' }}>{meal.strInstructions}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleSaveRecipe(meal)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      marginTop: '8px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Shopping List */}
      {activeTab === 'shopping' && (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#1e3a8a' }}>Shopping List</h2>
          <p style={{ color: '#64748b' }}>Meals currently on your calendar schedule:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {Object.entries(weeklyPlan).flatMap(([day, meals]) =>
              Object.entries(meals)
                .filter(([_, mealName]) => mealName !== '')
                .map(([type, mealName], idx) => (
                  <li key={`${day}-${type}-${idx}`}>
                    <strong>{day} ({type}):</strong> {mealName}
                  </li>
                ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}