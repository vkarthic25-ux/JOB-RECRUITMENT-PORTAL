const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'talent_ai_super_secret_jwt_key_2026_recruitment',
    { expiresIn: '30d' }
  );
};

// @desc    Register new user (Candidate or Recruiter)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location, companyName, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password).' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Default role is candidate unless specified as recruiter
    const selectedRole = role === 'recruiter' ? 'recruiter' : 'candidate';

    const user = await User.create({
      name,
      email,
      password,
      role: selectedRole,
      phone: phone || '',
      location: location || '',
    });

    // Create corresponding profile
    if (selectedRole === 'candidate') {
      await CandidateProfile.create({
        userId: user._id,
        headline: 'Aspiring Professional',
        skills: [],
        profileCompletion: 25,
      });
    } else if (selectedRole === 'recruiter') {
      let company = null;
      if (companyName) {
        company = await Company.findOne({ name: companyName });
        if (!company) {
          company = await Company.create({
            name: companyName,
            description: `${companyName} is hiring top talent.`,
            location: location || 'Headquarters',
          });
        }
      } else {
        // Fallback default company
        company = await Company.findOne() || await Company.create({
          name: 'TechCorp Global',
          description: 'Leading innovations in software engineering.',
          location: 'San Francisco, CA',
        });
      }

      await RecruiterProfile.create({
        userId: user._id,
        companyId: company._id,
        designation: designation || 'Talent Acquisition Partner',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & role profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ userId: user._id }).populate('resumeId');
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: user._id }).populate('companyId');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
