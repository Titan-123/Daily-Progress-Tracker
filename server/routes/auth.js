import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Goal from '../models/Goal.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Create default goals for new users
const createDefaultGoals = async (userId) => {
  const defaultGoals = [
    {
      title: 'Daily Writing',
      description: 'Write down your thoughts or work on creative projects',
      type: 'daily',
      category: 'Creative',
      target: '15 minutes',
      userId,
      isActive: true
    },
    {
      title: 'Learning Time',
      description: 'Dedicate time to learning something new',
      type: 'daily',
      category: 'Learning',
      target: '30 minutes',
      userId,
      isActive: true
    },
    {
      title: 'Physical Activity',
      description: 'Move your body and stay healthy',
      type: 'daily',
      category: 'Health',
      target: '20 minutes',
      userId,
      isActive: true
    }
  ];

  await Goal.insertMany(defaultGoals);
  console.log(`✅ Created default goals for user ${userId}`);
};

export const handleRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save middleware
      preferences: {
        theme: 'light',
        notifications: true,
        reminderTime: '09:00'
      },
      streaks: {
        current: 0,
        best: 0,
        lastActiveDate: new Date()
      }
    });

    await user.save();

    // Create default goals for the new user
    await createDefaultGoals(user._id);

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active date
    user.streaks.lastActiveDate = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        streaks: user.streaks
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const handleGetProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        streaks: user.streaks
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

export const handleUpdateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        streaks: user.streaks
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
