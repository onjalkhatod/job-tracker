const express = require('express');
const router = express.Router();
const { 
  getApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} = require('../controllers/applicationController');

// Import the security middleware
const verifyToken = require('../middleware/auth');

// Protect ALL routes below by passing verifyToken as the first argument
router.get('/', verifyToken, getApplications);
router.post('/', verifyToken, createApplication);
router.put('/:id', verifyToken, updateApplication);
router.delete('/:id', verifyToken, deleteApplication);

module.exports = router;