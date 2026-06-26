const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { 
  updateInterview, 
  deleteInterview, 
  getUpcomingInterviews,
} = require('../controllers/interviewController');

router.get('/upcoming', verifyToken, getUpcomingInterviews);
router.put('/:id', verifyToken, updateInterview);
router.delete('/:id', verifyToken, deleteInterview);

module.exports = router;