const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const { signToken } = require('../utils/auth.js');

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: 'Invalid password' });
    }

    const token = signToken({
      _id: user._id,
      secret: process.env.JWT_SECRET,
      expireTime: process.env.JWT_EXPIRE || '1d'
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create User
exports.createUser = async (req, res) => {
  try {
    const { userId, email, password, confirmPass, firstName, lastName, birthDate, isAdmin } = req.body;

    if (!userId || !email || !password || !confirmPass || !firstName || !lastName || !birthDate) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const userIdValid = userId.length >= 6 && /[0-9]/.test(userId) && /[^A-Za-z0-9]/.test(userId);
    if (!userIdValid) {
      return res.status(400).json({ error: 'userId must be at least 6 characters, including a number and a special character.' });
    }

    const emailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if (!emailValid) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPass) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const nameRegex = /^[A-Za-z]+$/;
    if (firstName.length < 2 || !nameRegex.test(firstName)) {
      return res.status(400).json({ error: 'First name must be at least 2 letters and contain only letters.' });
    }
    if (lastName.length < 2 || !nameRegex.test(lastName)) {
      return res.status(400).json({ error: 'Last name must be at least 2 letters and contain only letters.' });
    }

    const age = getAge(birthDate);
    if (age < 6 || age > 130) {
      return res.status(400).json({ error: 'Age must be between 6 and 130.' });
    }

    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(409).json({ error: 'User with this userId already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      birthDate,
      isAdmin: isAdmin === true
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully.', user: newUser });

  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

const getAge = (birthDateStr) => {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};