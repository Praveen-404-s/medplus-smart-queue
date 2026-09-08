const express = require('express');
const router = express.Router();
const {
  submitContact,
  getContacts,
  deleteContact,
} = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/', submitContact);
router.get('/', protectAdmin, getContacts);
router.delete('/:id', protectAdmin, deleteContact);

module.exports = router;
