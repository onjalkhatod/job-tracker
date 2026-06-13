const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const verifyToken = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');
const { createInterview, getApplicationInterviews } = interviewController;
const { 
  getApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication,
  getApplicationStats,
  getApplicationById 
} = require('../controllers/applicationController');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};

router.get('/stats', verifyToken, getApplicationStats);

router.get('/', verifyToken, getApplications);

router.get('/:id', verifyToken, getApplicationById);

router.post(
  '/',
  verifyToken,
  [
    body('company').notEmpty().withMessage('Company name is required.'),
    body('role').notEmpty().withMessage('Job role title is required.'),
    body('status')
      .optional()
      .isIn(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'])
      .withMessage('Status must be one of: APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED')
  ],
  validateFields,
  createApplication
);

router.put('/:id', verifyToken, updateApplication);
router.delete('/:id', verifyToken, deleteApplication);

router.post('/:applicationId/interviews', verifyToken, createInterview);
router.get('/:applicationId/interviews', verifyToken, getApplicationInterviews);;

module.exports = router;  