const db = require('../config/database');

const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [cartItems] = await db.execute(
      `SELECT ci.id, ci.item_id, ci.quantity, i.name, i.price, i.stock, i.image_url, i.description
       FROM cart_items ci
       JOIN items i ON ci.item_id = i.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Item ID and valid quantity are required' });
    }

    // Check if item exists and is in stock
    const [items] = await db.execute(
      'SELECT id, stock FROM items WHERE id = ?',
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = items[0];
    if (item.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Check if item already in cart
    const [existingCart] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND item_id = ?',
      [userId, itemId]
    );

    if (existingCart.length > 0) {
      // Update quantity
      const newQuantity = existingCart[0].quantity + quantity;
      if (item.stock < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingCart[0].id]
      );

      res.json({ message: 'Cart updated successfully' });
    } else {
      // Add new item to cart
      await db.execute(
        'INSERT INTO cart_items (user_id, item_id, quantity) VALUES (?, ?, ?)',
        [userId, itemId, quantity]
      );

      res.json({ message: 'Item added to cart successfully' });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Check if item exists and is in stock
    const [items] = await db.execute(
      'SELECT stock FROM items WHERE id = ?',
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (items[0].stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Update cart item
    const [result] = await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ?',
      [quantity, userId, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const [result] = await db.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND item_id = ?',
      [userId, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };

