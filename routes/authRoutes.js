const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const { register, login, dashboard, logout } = require('../controllers/authController');

// Public routes
router.get('/', (req, res) => res.redirect('/login'));
router.get('/register', (req, res) => res.render('register'));
router.post('/register', register);
router.get('/login', (req, res) => res.render('login'));
router.post('/login', login);

// Protected routes
router.get('/dashboard', auth, dashboard);
router.get('/logout', logout);

// GET: Show submit secret form
router.get('/submit', auth, (req, res) => {
  res.render('submit'); // Make sure submit.ejs exists in views/
});

// POST: Handle secret submission
router.post('/submit', auth, async (req, res) => {
  const secret = req.body.secret;
  const userId = req.user._id; // <-- FIXED: use _id

  try {
    await User.findByIdAndUpdate(
      userId,
      { $push: { secrets: secret } }
    );
    res.redirect('/secrets');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});


// GET: Display all shared secrets
router.get('/secrets', async (req, res) => {
  try {
    const usersWithSecrets = await User.find({ secrets: { $exists: true, $ne: [] } });
    const allSecrets = usersWithSecrets.flatMap(user => user.secrets);
    res.render('secrets', { secrets: allSecrets });
  } catch (err) {
    console.error('Error fetching secrets:', err);
    res.redirect('/dashboard');
  }
});

module.exports = router;
