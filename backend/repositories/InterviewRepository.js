const BaseRepository = require('./BaseRepository');
const InterviewSession = require('../models/InterviewSession');
const { SESSION_STATUS } = require('../utils/constants');

class InterviewRepository extends BaseRepository {
  constructor() {
    super(InterviewSession);
  }

  async findByUserId(userId) {
    return this.model
      .find({ userId })
      .sort({ startTime: -1 }) 
      .populate('questionIds', 'content category difficulty');
  }

  async findActiveSession(userId) {
    return this.model.findOne({
      userId,
      status: SESSION_STATUS.IN_PROGRESS,
    });
  }
}

module.exports = InterviewRepository;
