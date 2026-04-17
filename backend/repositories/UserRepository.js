/**
 * User Repository
 * 
 * OOP CONCEPT: Inheritance
 * Extends BaseRepository to inherit common CRUD methods,
 * and adds user-specific query methods.
 */

const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    // Pass the User model to the parent class
    super(User);
  }

  /**
   * Find a user by their email address
   * Used during login to look up credentials
   * 
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find a user by their username
   * Used during registration to check for duplicates
   * 
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} User document or null
   */
  async findByUsername(username) {
    return this.model.findOne({ username });
  }

  /**
   * Get all users with the given role
   * Used by admin to view users
   * 
   * @param {string} role - Role to filter by ('user' or 'admin')
   * @returns {Promise<Array>} Array of user documents
   */
  async findByRole(role) {
    return this.model.find({ role });
  }
}

module.exports = UserRepository;
