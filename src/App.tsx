import React, { useState, useEffect } from 'react';

interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strMealThumb: string;
  strInstructions?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'search' | 'saved' | 'shopping'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Meal[]>([]);

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

  // Debounced search fetching from online API
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
                  <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
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

      {/* Tab 3: Saved Favorites */}
      {activeTab === 'saved' && (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#1e3a8a' }}>Saved Recipes</h2>
          {savedRecipes.length === 0 ? (
            <p style={{ color: '#64748b' }}>No saved recipes yet. Switch to "Search Online" to find and save recipes!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {savedRecipes.map((meal) => (
                <div key={meal.idMeal} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#fff' }}>
                  <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
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
                      backgroundColor: '#ef4444',
                      color: '#fff',
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