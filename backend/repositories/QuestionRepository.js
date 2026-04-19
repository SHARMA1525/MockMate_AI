const BaseRepository = require('./BaseRepository');
const Question = require('../models/Question');

class QuestionRepository extends BaseRepository {
  constructor() {
    super(Question);
  }
  async findByCategory(category) {
    return this.model.find({ category });
  }

  async getRandomByCategory(category, count) {
    return this.model.aggregate([
      { $match: { category } },      
      { $sample: { size: count } },    
    ]);
  }
}

module.exports = QuestionRepository;
