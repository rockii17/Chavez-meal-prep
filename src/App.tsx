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
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'search' | 'add' | 'saved' | 'shopping'>('calendar');
  
  // Storage State
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

  // Manual Recipe Form State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Dinner');
  const [customIngredients, setCustomIngredients] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Online Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('chavez_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('chavez_calendar', JSON.stringify(calendar));
  }, [calendar]);

  // Fetching from TheMealDB API
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
    } fontally {
      setIsLoading(false);
    }
  };

  // Add Manual Recipe
  const handleAddCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customIngredients) return;

    const ingredientList = customIngredients
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const newRecipe: Recipe = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      ingredients: ingredientList,
      instructions: customInstructions.trim() || undefined,
    };

    setSavedRecipes([...savedRecipes, newRecipe]);
    setCustomName('');
    setCustomIngredients('');
    setCustomInstructions('');
    alert(`"${newRecipe.name}" added to your saved recipes!`);
    setActiveTab('saved');
  };

  const saveRecipe = (recipe: Recipe) => {
    if (!savedRecipes.some((r) => r.id === recipe.id)) {
      setSavedRecipes([...savedRecipes, recipe]);
      alert(`Saved "${recipe.name}"!`);
    }
  };

  const deleteRecipe = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setSavedRecipes(savedRecipes.filter((r) => r.id !== id));
      setCalendar(calendar.filter((c) => c.recipeId !== id));
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

  // Generate Grocery List
  const generateGroceryList = () => {
    const list: { ingredient: string; recipeName: string; day: string }[] = [];
    calendar.forEach((entry) => {
      const recipe = savedRecipes.find((r) => r.id === entry.recipeId);
      if (recipe && Array.isArray(recipe.ingredients)) {
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
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent drop-shadow-md">
            Chavez Meal Prep
          </h1>
          <p className="text-xs text-indigo-300 font-medium">Weekly Planner & Automated Shopping Assistant</p>

          <nav className="flex flex-wrap justify-center gap-2 border-t border-indigo-900/50 pt-4">
            {[
              { id: 'calendar', label: '📅 Calendar', color: 'bg-emerald-600 hover:bg-emerald-500' },
              { id: 'search', label: '🔍 Search Online', color: 'bg-blue-600 hover:bg-blue-500' },
              { id: 'add', label: '✏️ Add Recipe', color: 'bg-purple-600 hover:bg-purple-500' },
              { id: 'saved', label: `📖 Saved (${savedRecipes.length})`, color: 'bg-amber-600 hover:bg-amber-500' },
              { id: 'shopping', label: `🛒 Shopping List (${groceryItems.length})`, color: 'bg-rose-600 hover:bg-rose-500' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs md:text-sm font-extrabold rounded-xl transition shadow-md ${
                  activeTab === tab.id
                    ? `${tab.color} text-white ring-2 ring-white/50 scale-105`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/30 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h2 className="text-xl font-black text-emerald-400">Weekly Calendar Schedule</h2>
              <span className="text-xs text-slate-400">Select meals from your saved recipes</span>
            </div>
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-3">
                  <h3 className="font-bold text-emerald-300 text-sm">{day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MEAL_TYPES.map((type) => {
                      const entry = calendar.find((c) => c.day === day && c.mealType === type);
                      return (
                        <div key={type} className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-400 capitalize flex items-center gap-1">
                            {type === 'breakfast' ? '🍳' : type === 'lunch' ? '🥗' : '🥩'} {type}
                          </label>
                          <select
                            value={entry?.recipeId || ''}
                            onChange={(e) => updateCalendar(day, type, e.target.value)}
                            className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-400"
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

        {/* ADD RECIPE TAB */}
        {activeTab === 'add' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-purple-500/30 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-purple-400">Add Your Own Recipe</h2>
              <p className="text-xs text-slate-400">Type in custom recipes, meal prep batches, or family favorites.</p>
            </div>

            <form onSubmit={handleAddCustomRecipe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Recipe Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Breakfast Potatoes, Chicken Salad..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack / Drink">Snack / Drink</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Ingredients (One item per line)</label>
                <textarea
                  rows={4}
                  placeholder="4 Russet Potatoes&#10;1 Bell Pepper&#10;1/2 Onion..."
                  value={customIngredients}
                  onChange={(e) => setCustomIngredients(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Instructions / Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Dice potatoes, sauté with peppers..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-extrabold text-white text-sm rounded-xl transition shadow-lg"
              >
                + Save Custom Recipe
              </button>
            </form>
          </main>
        )}

        {/* ONLINE SEARCH TAB */}
        {activeTab === 'search' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-blue-500/30 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-blue-400">Search Web Recipes</h2>
            <form onSubmit={handleOnlineSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search meals (e.g. Chicken, Beef, Pasta, Rice)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-blue-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-400"
              />
              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 font-extrabold text-xs text-white rounded-xl transition shadow-md">
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className="space-y-4">
              {searchResults.map((recipe) => (
                <div key={recipe.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{recipe.name}</h3>
                      <span className="text-[11px] font-bold text-amber-400">{recipe.category}</span>
                    </div>
                    <button
                      onClick={() => saveRecipe(recipe)}
                      className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-xs font-bold text-blue-200 rounded-lg border border-blue-500/40"
                    >
                      + Save to My Recipes
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Ingredients:</strong> {recipe.ingredients.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* SAVED RECIPES TAB */}
        {activeTab === 'saved' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
            <h2 className="text-xl font-black text-amber-400">Saved Recipe Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedRecipes.map((r) => (
                <div key={r.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="font-bold text-amber-300 text-sm">{r.name}</h3>
                      <span className="text-[10px] bg-amber-950 text-amber-400 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                        {r.category || 'General'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteRecipe(r.id, r.name)}
                      className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-[11px] font-bold text-rose-300 rounded-lg border border-rose-500/40 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {Array.isArray(r.ingredients) ? (
                      r.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)
                    ) : (
                      <li className="text-slate-500 italic">No ingredients listed</li>
                    )}
                  </ul>

                  {r.instructions && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">{r.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </main>
        )}

        {/* SHOPPING LIST TAB */}
        {activeTab === 'shopping' && (
          <main className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-rose-500/30 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-rose-400">Weekly Grocery Checklist</h2>
              <p className="text-xs text-slate-400">Auto-generated from your assigned calendar meals.</p>
            </div>

            {groceryItems.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Your calendar is currently empty! Assign meals on the Calendar tab to auto-generate your shopping list.</p>
            ) : (
              <div className="space-y-2.5">
                {groceryItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
                    <input type="checkbox" className="w-5 h-5 accent-rose-500 rounded cursor-pointer" />
                    <div className="flex-1">
                      <span className="text-xs md:text-sm font-bold text-slate-100">{item.ingredient}</span>
                      <div className="text-[11px] text-rose-400 font-medium">
                        For {item.recipeName} ({item.day})
                      </div>
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