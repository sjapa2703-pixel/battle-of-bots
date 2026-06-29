const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

let transporter;
async function initMailer() {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });
  } else {

    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}
initMailer();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { email, password, nickname, team } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const nicknameExists = await User.findOne({ nickname });
    if (nicknameExists) {
      return res.status(400).json({ message: 'Nickname is already taken' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const autoVerify = !process.env.SMTP_HOST; // auto-verify if no real SMTP configured

    const user = await User.create({
      email,
      passwordHash: password,
      nickname,
      team: team || '',
      verificationToken: autoVerify ? null : verificationToken,
      isVerified: autoVerify
    });

    if (user) {
      if (!autoVerify) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationToken}`;
        try {
          await transporter.sendMail({
            from: '"Battle of Bots" <no-reply@nhrl.io>',
            to: user.email,
            subject: 'Please verify your email',
            html: `<p>Welcome, Commander <b>${nickname}</b>!</p><p>Please click <a href="${verifyUrl}">here</a> to verify your account and join the league.</p>`
          });
        } catch (err) {
          console.error('Email send failed', err);
        }
        res.status(201).json({
          message: 'Registration successful! Please check your email to verify your account.'
        });
      } else {
        res.status(201).json({
          message: 'Registration successful! You can now log in.'
        });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email first. Check your inbox.' });
      }

      res.json({
        _id: user._id,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.nickname && req.body.nickname !== user.nickname) {

        const nicknameExists = await User.findOne({ nickname: req.body.nickname });
        if (nicknameExists) {
          return res.status(400).json({ message: 'Nickname is already taken' });
        }
        user.nickname = req.body.nickname;
      }
      
      if (req.body.avatarUrl !== undefined) {
        user.avatarUrl = req.body.avatarUrl;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    res.json({ message: 'Email successfully verified!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  verifyEmail,
};
