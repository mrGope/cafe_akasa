const db = require('../config/database');
const { randomUUID } = require('crypto');

const checkout = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    const userId = req.user.userId;

    // Get cart items
    const [cartItems] = await connection.execute(
      `SELECT ci.item_id, ci.quantity, i.name, i.price, i.stock
       FROM cart_items ci
       JOIN items i ON ci.item_id = i.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check inventory and calculate total
    let totalAmount = 0;
    const unavailableItems = [];
    const orderItems = [];

    for (const cartItem of cartItems) {
      if (cartItem.stock < cartItem.quantity) {
        unavailableItems.push({
          itemId: cartItem.item_id,
          name: cartItem.name,
          requested: cartItem.quantity,
          available: cartItem.stock
        });
      } else {
        const itemTotal = cartItem.price * cartItem.quantity;
        totalAmount += itemTotal;
        orderItems.push(cartItem);
      }
    }

    // If any items unavailable, return error
    if (unavailableItems.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Some items are not available in requested quantity',
        unavailableItems
      });
    }

    // Generate tracking ID
    const uuid = randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    const trackingId = `CA-${Date.now()}-${uuid}`;

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, status, tracking_id) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, 'Pending', trackingId]
    );

    const orderId = orderResult.insertId;

    // Create order items and deduct inventory
    for (const item of orderItems) {
      // Insert order item
      await connection.execute(
        'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.item_id, item.quantity, item.price]
      );

      // Deduct inventory
      await connection.execute(
        'UPDATE items SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.item_id]
      );
    }

    // Clear cart
    await connection.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: orderId,
        trackingId,
        totalAmount,
        status: 'Pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error during checkout' });
  } finally {
    connection.release();
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [orders] = await db.execute(
      `SELECT o.id, o.tracking_id, o.total_amount, o.status, o.order_date, o.created_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(orders);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ message: 'Server error fetching order history' });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    // Get order
    const [orders] = await db.execute(
      `SELECT o.id, o.tracking_id, o.total_amount, o.status, o.order_date, o.created_at
       FROM orders o
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [orderItems] = await db.execute(
      `SELECT oi.item_id, oi.quantity, oi.price, i.name, i.image_url
       FROM order_items oi
       JOIN items i ON oi.item_id = i.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
};

module.exports = { checkout, getOrderHistory, getOrderDetails };

