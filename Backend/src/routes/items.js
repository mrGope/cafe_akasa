const express = require('express');
const router = express.Router();
const { getCategories, getItems } = require('../controllers/itemController');

router.get('/categories', getCategories);
router.get('/', getItems);

module.exports = router;

