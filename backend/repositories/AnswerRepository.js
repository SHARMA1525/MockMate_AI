const BaseRepository = require('./BaseRepository');
const Answer = require('../models/Answer');

class AnswerRepository extends BaseRepository {
  constructor() {
    super(Answer);
  }


  async findBySessionId(sessionId) {
    return this.model
      .find({ sessionId })
      .populate('questionId');  
  }
  async findBySessionAndQuestion(sessionId, questionId) {
    return this.model.findOne({ sessionId, questionId });
  }
}

module.exports = AnswerRepository;
