const db = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT * FROM categories ORDER BY name'
    );
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

const getItems = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT i.*, c.name as category_name 
      FROM items i 
      JOIN categories c ON i.category_id = c.id
    `;
    const params = [];

    if (category && category !== 'All' && category !== '0') {
      query += ' WHERE i.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY i.name';

    const [items] = await db.execute(query, params);
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
};

module.exports = { getCategories, getItems };

