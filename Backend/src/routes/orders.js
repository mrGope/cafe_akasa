const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkout, getOrderHistory, getOrderDetails } = require('../controllers/orderController');

router.post('/checkout', auth, checkout);
router.get('/', auth, getOrderHistory);
router.get('/:orderId', auth, getOrderDetails);

module.exports = router;

