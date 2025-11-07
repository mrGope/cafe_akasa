// Fuzzy search utility function
export const fuzzySearch = (items, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return items;
  }

  const query = searchQuery.toLowerCase().trim();
  const queryWords = query.split(/\s+/);

  return items.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category_name || '').toLowerCase();
    
    const searchableText = `${name} ${description} ${category}`;
    
    // Check if all query words appear in the searchable text
    return queryWords.every(word => searchableText.includes(word));
  });
};

