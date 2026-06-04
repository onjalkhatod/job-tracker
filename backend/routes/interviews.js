const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { 
  updateInterview, 
  deleteInterview, 
  getUpcomingInterviews 
} = require('../controllers/interviewController');

// Global upcoming timeline utility (Placed above dynamic id paths)
router.get('/upcoming', verifyToken, getUpcomingInterviews);

// Interacting directly with an interview ID
router.put('/:id', verifyToken, updateInterview);
router.delete('/:id', verifyToken, deleteInterview);

module.exports = router;