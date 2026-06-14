const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { 
  createInterview, 
  updateInterview, 
  deleteInterview, 
  getUpcomingInterviews,
  getApplicationInterviews 
} = require('../controllers/interviewController');

router.post('/applications/:applicationId/interviews', verifyToken, createInterview); 

router.get('/applications/:applicationId/interviews', verifyToken, getApplicationInterviews);

router.get('/upcoming', verifyToken, getUpcomingInterviews);
router.put('/:id', verifyToken, updateInterview);
router.delete('/:id', verifyToken, deleteInterview);

module.exports = router;