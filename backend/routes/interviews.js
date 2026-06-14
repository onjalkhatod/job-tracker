const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { 
  createInterview, // <--- Add this import
  updateInterview, 
  deleteInterview, 
  getUpcomingInterviews 
} = require('../controllers/interviewController');

// Add this route:
router.post('/', verifyToken, createInterview); 

router.get('/upcoming', verifyToken, getUpcomingInterviews);
router.put('/:id', verifyToken, updateInterview);
router.delete('/:id', verifyToken, deleteInterview);

module.exports = router;