const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login, updatePassword, getMe } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: "Too many attempts, please try again after 15 minutes." }
});
// Validation helper middleware
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('name').notEmpty().withMessage('Name is required.')
  ],
  validateFields,
  authLimiter,
  register
);

router.post('/login', authLimiter, login);
router.put('/password', authMiddleware, updatePassword);
router.get('/me', authMiddleware, getMe);

module.exports = router;