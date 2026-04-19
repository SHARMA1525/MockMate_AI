const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username) {
    return this.model.findOne({ username });
  }

  async findByRole(role) {
    return this.model.find({ role });
  }
}

module.exports = UserRepository;
