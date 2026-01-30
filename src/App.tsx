import { useState, useEffect } from 'react';
import './App.css';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  rating?: number;
  price?: string;
  strInstructions?: string;
  [key: string]: any;
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Chicken', 'Beef', 'Seafood', 'Pasta', 'Vegan', 'Breakfast', 'Dessert', 'Goat', 'Lamb', 'Side'];

  
  useEffect(() => {
    if (!inputValue.trim()) {
      setItems([]);
      return;
    }

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${inputValue}`);
        const data = await res.json();
        
       
        setTimeout(() => {
          const artisanData = (data.meals || []).map((meal: Meal) => ({
            ...meal,
            rating: Math.floor(Math.random() * 2) + 4, 
            price: (Math.random() * 15 + 12).toFixed(2) 
          }));
          setItems(artisanData);
          if (!data.meals) setError('Our chef couldn’t find that dish today.');
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('The kitchen is currently offline. Check your connection!');
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const searchByCategory = async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
      const data = await res.json();
      const artisanData = (data.meals || []).map((meal: Meal) => ({
        ...meal,
        rating: 5,
        price: (Math.random() * 10 + 15).toFixed(2)
      }));
      setItems(artisanData);
    } catch (err) {
      setError('Failed to load the menu category.');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (meal: Meal) => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const data = await res.json();
      setSelectedMeal({ ...data.meals[0], rating: meal.rating, price: meal.price });
    } catch (err) {
      setError('Recipe details lost in the kitchen.');
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="app-container">
      <header className="main-header">
      
        <div className="artisan-logo">
          <span className="est-text handwriting">Est. 2026</span>
          <h1 className="logo-title">اطبخ معي</h1>
          <div className="logo-subtitle handwriting">Kitchen & Recipes</div>
        </div>

        <div className="search-wrapper">
          <input 
            className="search-input" 
            placeholder="What's cooking today?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="tags-container">
          {categories.map(cat => (
            <button key={cat} className="tag-pill" onClick={() => searchByCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </header>

     
      {loading && (
        <div className="loader">
          <div className="chef-emoji">👨‍🍳</div>
          <p className="handwriting">....................LOOODING...................</p>
        </div>
      )}

      
      {error && !loading && <div className="error-note">"{error}"</div>}

      
      <div className="meal-grid">
        {!loading && items.map((meal) => (
          <div key={meal.idMeal} className="artisan-card" onClick={() => openDetails(meal)}>
            <div className="organic-price">${meal.price}</div>
            <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" />
            <div className="card-info">
              <h3 className="handwriting">{meal.strMeal}</h3>
              <div className="stars">{"★".repeat(meal.rating || 0)}</div>
            </div>
          </div>
        ))}
      </div>

      
      {selectedMeal && (
        <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
          <div className="notebook-modal" onClick={(e) => e.stopPropagation()}>
            <img src={selectedMeal.strMealThumb} className="modal-img" alt={selectedMeal.strMeal} />
            <h2 className="handwriting">{selectedMeal.strMeal}</h2>
            
            <div className="modal-body">
              <h4 className="handwriting">Ingredients</h4>
              <ul className="ink-list">
                {Array.from({ length: 20 }).map((_, i) => {
                  const ing = selectedMeal[`strIngredient${i + 1}`];
                  const msr = selectedMeal[`strMeasure${i + 1}`];
                  return ing && ing.trim() ? <li key={i}>{msr} {ing}</li> : null;
                })}
              </ul>
              
              <h4 className="handwriting">Chef's Method</h4>
              <p className="instructions">{selectedMeal.strInstructions}</p>
            </div>
            
            <button className="close-ink-btn" onClick={() => setSelectedMeal(null)}>
              Close Notebook
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;