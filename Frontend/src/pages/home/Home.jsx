import React, { useState, useEffect } from 'react';
import { getCategories, getItems } from '../../services/api';
import ItemCard from '../../components/ItemCard';
import SearchBar from '../../components/SearchBar';
import { fuzzySearch } from '../../utils/fuzzySearch';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  useEffect(() => {
    // Apply fuzzy search when search query or items change
    const filtered = fuzzySearch(items, searchQuery);
    setFilteredItems(filtered);
    // Reset animation key when search query changes to trigger new animations
    if (searchQuery) {
      setAnimationKey(prev => prev + 1);
    }
  }, [searchQuery, items]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const categoryId = selectedCategory === 'All' ? null : selectedCategory;
      const response = await getItems(categoryId);
      setItems(response.data);
      setFilteredItems(response.data);
      // Reset animation key to trigger new animations
      setAnimationKey(prev => prev + 1);
    } catch (error) {
      setError('Failed to load items. Please try again.');
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div id="menu-section" className="container">
        <div className="page-header">
          <h1 className="page-title">Browse Menu</h1>
          <p className="page-subtitle">Discover delicious items from our menu</p>
        </div>
        
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by name, description, or category..."
        />
        
        <div className="category-filter">
          {categories.map((category) => {
            const isAllCategory = category.name === 'All' || category.id === 1;
            const categoryValue = isAllCategory ? 'All' : category.id;
            const isActive = selectedCategory === 'All' ? isAllCategory : selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(categoryValue);
                  setSearchQuery(''); // Clear search when category changes
                }}
                className={`category-btn ${isActive ? 'active' : ''}`}
              >
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="no-items">
            <p>{searchQuery ? 'No items found matching your search.' : 'No items found in this category.'}</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="search-results-info">
                Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
            <div className="items-grid" key={animationKey}>
              {filteredItems.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

