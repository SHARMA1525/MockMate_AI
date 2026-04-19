const BaseRepository = require('./BaseRepository');
const ScoreReport = require('../models/ScoreReport');

class ScoreReportRepository extends BaseRepository {
  constructor() {
    super(ScoreReport);
  }

  async findBySessionId(sessionId) {
    return this.model
      .findOne({ sessionId })
      .populate('questionResults.questionId', 'content category difficulty');
  }

  async findBySessionIds(sessionIds) {
    return this.model
      .find({ sessionId: { $in: sessionIds } })
      .sort({ generatedAt: -1 });
  }
}

module.exports = ScoreReportRepository;
