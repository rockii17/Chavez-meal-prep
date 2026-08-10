import React, { useState, useEffect } from 'react';

// --- TYPES ---
interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  instructions?: string;
}

interface CalendarEntry {
  day: string; // e.g., 'Monday'
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'search' | 'saved' | 'shopping'>('calendar');
  
  // App State with LocalStorage
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('chavez_saved_recipes');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Breakfast Potatoes', category: 'Breakfast', ingredients: ['4 Russet Potatoes', '1 Bell Pepper', '1/2 Onion', '2 tbsp Olive Oil', 'Paprika', 'Salt & Pepper'] },
      { id: '2', name: 'Grilled Chicken Salad', category: 'Lunch', ingredients: ['2 Chicken Breasts', '4 cups Mixed Greens', '1/2 cup Cherry Tomatoes', '1/4 cup Feta Cheese', 'Balsamic Vinaigrette'] }
    ];
  });

  const [calendar, setCalendar] = useState<CalendarEntry[]>(() => {
    const saved = localStorage.getItem('chavez_calendar');
    return saved ? JSON.parse(saved) : [];
  });

  // Online Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('chavez_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('chavez_calendar', JSON.stringify(calendar));
  }, [calendar]);

  // Dynamic Online Recipe Fetching via TheMealDB API
  const handleOnlineSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.meals) {
        const mapped: Recipe[] = data.meals.map((meal: any) => {
          const ingredients: string[] = [];
          for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ing && ing.trim()) {
              ingredients.push(`${measure ? measure.trim() : ''} ${ing.trim()}`.trim());
            }
          }
          return {
            id: `mealdb-${meal.idMeal}`,
            name: meal.strMeal,
            category: meal.strCategory || 'General',
            ingredients,
            instructions: meal.strInstructions,
          };
        });
        setSearchResults(mapped);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipe = (recipe: Recipe) => {
    if (!savedRecipes.some((r) => r.id === recipe.id)) {
      setSavedRecipes([...savedRecipes, recipe]);
      alert(`Saved "${recipe.name}" to your recipes!`);
    }
  };

  const updateCalendar = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', recipeId: string) => {
    const filtered = calendar.filter((c) => !(c.day === day && c.mealType === mealType));
    if (recipeId) {
      setCalendar([...filtered, { day, mealType, recipeId }]);
    } else {
      setCalendar(filtered);
    }
  };

  // --- AUTOMATED SHOPPING LIST GENERATION ---
  const generateGroceryList = () => {
    const list: { ingredient: string; recipeName: string; day: string }[] = [];

    calendar.forEach((entry) => {
      const recipe = savedRecipes.find((r) => r.id === entry.recipeId);
      if (recipe) {
        recipe.ingredients.forEach((ing) => {
          list.push({
            ingredient: ing,
            recipeName: recipe.name,
            day: entry.day,
          });
        });
      }
    });

    return list;
  };

  const groceryItems = generateGroceryList();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-blue-400">Chavez Meal Prep</h1>
          <nav className="flex justify-center gap-2 border-b border-slate-800 pb-4">
            {(['calendar', 'search', 'saved', 'shopping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl capitalize transition ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'shopping' ? `Shopping List (${groceryItems.length})` : tab}
              </button>
            ))}
          </nav>
        </header>

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <main className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-blue-400">Weekly Calendar Schedule</h2>
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-200">{day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MEAL_TYPES.map((type) => {
                      const entry = calendar.find((c) => c.day === day && c.mealType === type);
                      return (
                        <div key={type} className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400 capitalize">{type}</label>
                          <select
                            value={entry?.recipeId || ''}
                            onChange={(e) => updateCalendar(day, type, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                          >
                            <option value="">-- No Meal Selected --</option>
                            {savedRecipes.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ONLINE SEARCH TAB */}
        {activeTab === 'search' && (
          <main className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-blue-400">Search Live Recipes</h2>
            <form onSubmit={handleOnlineSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search recipes (e.g., Chicken, Pasta, Steak)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white rounded-xl transition">
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="space-y-4">
              {searchResults.map((recipe) => (
                <div key={recipe.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-100">{recipe.name}</h3>
                      <span className="text-xs text-blue-400">{recipe.category}</span>
                    </div>
                    <button
                      onClick={() => saveRecipe(recipe)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 rounded-lg border border-slate-700"
                    >
                      + Save Recipe
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* SAVED RECIPES TAB */}
        {activeTab === 'saved' && (
          <main className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-blue-400">Saved Recipes ({savedRecipes.length})</h2>
            <div className="space-y-3">
              {savedRecipes.map((r) => (
                <div key={r.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-slate-200">{r.name}</h3>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {r.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* AUTOMATED SHOPPING LIST TAB */}
        {activeTab === 'shopping' && (
          <main className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-blue-400">Weekly Grocery Checklist</h2>
              <p className="text-xs text-slate-400">Auto-generated from your scheduled calendar meals.</p>
            </div>

            {groceryItems.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Your calendar is empty! Add meals on the Calendar tab to generate your list.</p>
            ) : (
              <div className="space-y-3">
                {groceryItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <input type="checkbox" className="w-5 h-5 accent-blue-500 rounded cursor-pointer" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-100">{item.ingredient}</span>
                      <div className="text-[11px] text-slate-500">For {item.recipeName} ({item.day})</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}