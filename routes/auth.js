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

module.exports = router;
