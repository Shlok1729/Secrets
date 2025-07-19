const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Controller
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.send("Weak password format.");
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    await User.create({ name, email, password: hash });
    res.redirect('/login');
  } catch (err) {
    res.send("Email already exists.");
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
};

// Dashboard Controller
exports.dashboard = async (req, res) => {
  res.render('dashboard', { user: req.user });
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};

// Submit Secret Controller (GET)
exports.getSubmitSecret = (req, res) => {
  res.render('submit', { user: req.user });
};

// Submit Secret Controller (POST)
exports.postSubmitSecret = async (req, res) => {
  const secret = req.body.secret;
  try {
    const user = await User.findById(req.user._id);
    user.secrets.push(secret);
    await user.save();
    res.redirect('/secrets');
  } catch (error) {
    res.status(500).send("Error submitting secret.");
  }
};

// View All Secrets Controller
exports.viewSecrets = async (req, res) => {
  try {
    const usersWithSecrets = await User.find({ secrets: { $ne: [] } }, 'name secrets');
    res.render('secrets', { users: usersWithSecrets });
  } catch (error) {
    res.status(500).send("Error loading secrets.");
  }
};
