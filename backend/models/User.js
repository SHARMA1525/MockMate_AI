/**
 * User Model
 * 
 * Represents a registered user in the system.
 * Uses Mongoose pre-save hook to automatically hash passwords
 * before storing them in the database.
 * 
 * SECURITY: Passwords are never stored in plain text.
 * We use bcryptjs to create a one-way hash.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Pre-save Hook — Hash Password Before Storing
 * 
 * This runs automatically before every save() call.
 * If the password hasn't changed, it skips hashing
 * (important for updates that don't touch the password).
 */
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('passwordHash')) {
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

/**
 * Instance Method — Compare Password
 * 
 * Used during login to check if the provided password
 * matches the stored hash. Returns true/false.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Transform — Hide sensitive data in JSON output
 * 
 * When we send user data in API responses, the password
 * hash is automatically removed for security.
 */
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
