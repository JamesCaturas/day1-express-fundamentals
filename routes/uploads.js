const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

router.post('/avatar', authenticate, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: { message: err.message } });
    }
    res.status(201).json({ success: true, data: { filename: req.file.filename, path: req.file.path } });
  });
});

module.exports = router;
