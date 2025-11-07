const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return emailRegex.test(email.trim().toLowerCase());
};

// Validate password strength
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  // Check for maximum length to prevent DoS attacks
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }

  return { valid: true };
};

const register = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Trim and normalize email
    email = email.trim().toLowerCase();

    // Validate email format
    if (!validateEmailFormat(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate email length
    if (email.length > 255) {
      return res.status(400).json({ message: 'Email address is too long' });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    console.log(`Registration attempt for: ${email}`);

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log(`Registration failed: User already exists - ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    console.log(`User registered successfully: ${email} (ID: ${result.insertId})`);

    // Generate JWT token (expires in 2 days)
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '2d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Trim and normalize email
    email = email.trim().toLowerCase();

    // Validate email format
    if (!validateEmailFormat(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate password is not empty
    if (typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token (expires in 2 days)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
      { expiresIn: '2d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { register, login };

