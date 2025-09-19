// controllers/user.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const { password, __v, ...rest } = userDoc.toObject ? userDoc.toObject() : userDoc;
  return rest;
}

// POST /api/signup
async function signup(req, res) {
  try {
    console.log('Incoming signup data:', req.body);

    const { fullName, username, email, password, department, role, createdBy } = req.body;

    const missing = [];
    if (!fullName) missing.push('fullName');
    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (!department) missing.push('department');
    if (!role) missing.push('role');

    if (missing.length) {
      return res.status(400).json({ message: 'Missing required fields', missing });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedUsername = String(username).toLowerCase().trim();

    // Check duplicates (username OR email)
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existing) {
      if (existing.email === normalizedEmail && existing.username === normalizedUsername) {
        return res.status(400).json({ message: 'Both email and username are already in use' });
      }
      if (existing.email === normalizedEmail) {
        return res.status(400).json({ message: 'Email already in use', field: 'email' });
      }
      if (existing.username === normalizedUsername) {
        return res.status(400).json({ message: 'Username already in use', field: 'username' });
      }
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    // If first user, make org-admin regardless of requested role
    const usersCount = await User.countDocuments();
    const finalRole = usersCount === 0 ? 'org-admin' : role;

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: password, // Will be hashed by pre-save middleware
      department: String(department).trim(),
      role: finalRole,
      createdBy: createdBy || undefined,
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET not configured' });
    }
    
    const payload = { id: user._id, role: user.role, shortId: user.shortId };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(201).json({
      message: usersCount === 0 ? 'Organization admin created' : 'Account created successfully',
      user: sanitizeUser(user),
      token, 
    });
  } catch (err) {
    console.error('signup error', err);

    if (err.code === 11000) {
      const dup = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(400).json({ message: `${dup} already exists`, field: dup });
    }

    // Validation errors from Mongoose
    if (err.name === 'ValidationError') {
      const details = {};
      for (const k in err.errors) {
        details[k] = err.errors[k].message;
      }
      return res.status(400).json({ message: 'Validation failed', details });
    }

    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/login
async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const q = String(identifier).toLowerCase().trim();
    const user = await User.findOne({ $or: [{ email: q }, { username: q }] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET not configured' });
    }
    
    const payload = { id: user._id, role: user.role, shortId: user.shortId };
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/logout
async function logout(req, res) {
  try {
    const userId = req.user?.id; 
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastLogout: new Date() });
    }

    // Frontend will clear token from localStorage anyway
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


async function getUserById(req, res) {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}


// GET /api/users
async function listUsers(req, res) {
  try {
    const { skip = 0, limit = 50, department } = req.query;
    const q = {};
    if (department) q.department = department;

    const users = await User.find(q)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 200));

    const sanitized = users.map(user => {
      if (!user) return null;
      return sanitizeUser(user);
    }).filter(user => user !== null);
    
    return res.json({ total: sanitized.length, users: sanitized });
  } catch (err) {
    console.error('listUsers error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /api/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Password will be hashed by pre-save middleware if modified

    delete updates.role;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('updateUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  signup,
  login,
  listUsers,
  updateUser,
  deleteUser,
  logout,
  getUserById
};
