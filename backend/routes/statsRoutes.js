const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', protectAdmin, getStats);

module.exports = router;
