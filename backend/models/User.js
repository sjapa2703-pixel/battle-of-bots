const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['User', 'Administrator'],
    default: 'User',
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
