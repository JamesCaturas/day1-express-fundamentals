const express = require('express');
const router = express.Router();
const { register, login, refresh, logout} = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh)
router.post('/logout', authenticate, logout)

// Moved above module.exports so it registers correctly!
router.get('/profile', authenticate, (req, res) => {
  res.json({ success: true, data: { id: req.user.id, role: req.user.role } });
});

const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.post('/register', registerValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
  }
  next();
}, register);

const validate = require('../middleware/validate');
router.post('/register', registerValidation, validate, register);

module.exports = router;
