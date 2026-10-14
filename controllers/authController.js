const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: { message: 'Email already registered' } });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }
    
    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    // 3. Generate Tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id }, 
      process.env.REFRESH_TOKEN_SECRET, 
      { expiresIn: '7d' }
    );
    
    // 4. Save refresh token to user document and await it safely inside the async function
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Send response
    res.json({ 
      success: true, 
      data: { 
        accessToken, 
        refreshToken, 
        user: { id: user._id, email: user.email } 
      } 
    });
    
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: { message: 'Refresh token required' } });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token no longer valid' } });
    }
    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token' } });
  }
};

exports.logout = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.refreshToken = null;
  await user.save();
  res.status(204).send();
};

