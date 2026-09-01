const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const inMemoryUsers = [];

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, language: user.language || 'en' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );
};

const signup = async (req, res) => {
  console.time('auth_signup_total');
  try {
    const { name, email, password, role, language, learningStyle, accessibilityPrefs, pace } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    console.time('auth_bcrypt_hash');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.timeEnd('auth_bcrypt_hash');

    try {
      console.time('auth_db_query');
      const existingUser = await User.findOne({ email }).select('_id').lean();
      console.timeEnd('auth_db_query');

      if (existingUser) {
        console.timeEnd('auth_signup_total');
        return res.status(400).json({ error: 'User already exists' });
      }

      console.time('auth_db_create');
      const user = await User.create({
        name,
        email,
        passwordHash,
        role: role || 'student',
        language: language || 'en',
        learningStyle: learningStyle || 'visual',
        accessibilityPrefs: accessibilityPrefs || {},
        pace: pace || 'medium',
      });
      console.timeEnd('auth_db_create');

      const token = generateToken(user);
      console.timeEnd('auth_signup_total');

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          learningStyle: user.learningStyle,
          accessibilityPrefs: user.accessibilityPrefs,
          pace: user.pace,
        },
      });
    } catch (dbErr) {
      const existing = inMemoryUsers.find((u) => u.email === email);
      if (existing) {
        console.timeEnd('auth_signup_total');
        return res.status(400).json({ error: 'User already exists' });
      }

      const newUser = {
        id: 'mem_' + Date.now(),
        name,
        email,
        passwordHash,
        role: role || 'student',
        language: language || 'en',
        learningStyle: learningStyle || 'visual',
        accessibilityPrefs: accessibilityPrefs || {},
        pace: pace || 'medium',
      };
      inMemoryUsers.push(newUser);

      const token = generateToken(newUser);
      console.timeEnd('auth_signup_total');

      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          language: newUser.language,
          learningStyle: newUser.learningStyle,
          accessibilityPrefs: newUser.accessibilityPrefs,
          pace: newUser.pace,
        },
      });
    }
  } catch (error) {
    console.timeEnd('auth_signup_total');
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  console.time('auth_login_total');
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      console.time('auth_db_login_query');
      const user = await User.findOne({ email }).select('_id name email role language passwordHash').lean();
      console.timeEnd('auth_db_login_query');

      if (user) {
        console.time('auth_bcrypt_compare');
        const match = await bcrypt.compare(password, user.passwordHash);
        console.timeEnd('auth_bcrypt_compare');

        if (match) {
          const token = generateToken(user);
          console.timeEnd('auth_login_total');
          return res.json({
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              language: user.language,
            },
          });
        }
      }
    } catch (dbErr) {
      const memUser = inMemoryUsers.find((u) => u.email === email);
      if (memUser && (await bcrypt.compare(password, memUser.passwordHash))) {
        const token = generateToken(memUser);
        console.timeEnd('auth_login_total');
        return res.json({
          token,
          user: {
            id: memUser.id,
            name: memUser.name,
            email: memUser.email,
            role: memUser.role,
            language: memUser.language,
          },
        });
      }
    }

    console.timeEnd('auth_login_total');
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    console.timeEnd('auth_login_total');
    return res.status(500).json({ error: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required from Google Auth payload' });
    }

    let isNewUser = false;
    let user = null;

    try {
      user = await User.findOne({ email }).select('_id name email role language').lean();
      if (!user) {
        isNewUser = true;
        const created = await User.create({
          name: name || 'Google Learner',
          email,
          passwordHash: 'google_oauth_' + (googleId || Date.now()),
          role: 'student',
          language: 'en',
        });
        user = {
          _id: created._id,
          name: created.name,
          email: created.email,
          role: created.role,
          language: created.language,
        };
      }
    } catch (dbErr) {
      let existingMem = inMemoryUsers.find((u) => u.email === email);
      if (!existingMem) {
        isNewUser = true;
        existingMem = {
          id: 'mem_google_' + Date.now(),
          name: name || 'Google Learner',
          email,
          passwordHash: 'google_oauth_' + (googleId || Date.now()),
          role: 'student',
          language: 'en',
        };
        inMemoryUsers.push(existingMem);
      }
      user = existingMem;
    }

    const token = generateToken(user);
    return res.status(200).json({
      token,
      isNewUser,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language || 'en',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, login, googleAuth };
