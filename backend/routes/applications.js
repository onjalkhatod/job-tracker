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

// 1. GET Stats endpoint (Static path)
router.get('/stats', verifyToken, getApplicationStats);

// 2. GET All applications general collection (Static path)
router.get('/', verifyToken, getApplications);

// 3. GET Single Application Detail record (Dynamic path matching parameter)
router.get('/:id', verifyToken, getApplicationById);

// 4. POST New single application payload 
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

// 5. PUT / DELETE endpoints
router.put('/:id', verifyToken, updateApplication);
router.delete('/:id', verifyToken, deleteApplication);

// 6. Nested tracks for interview logs
router.post('/:applicationId/interviews', verifyToken, createInterview);
router.get('/:applicationId/interviews', verifyToken, getApplicationInterviews);;

module.exports = router;