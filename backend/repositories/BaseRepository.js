class BaseRepository {

  constructor(model) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is abstract and cannot be instantiated directly');
    }

    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findAll(filter = {}) {
    return this.model.find(filter);
  }
  async findOne(filter) {
    return this.model.findOne(filter);
  }

  async create(data) {
    const document = new this.model(data);
    return document.save();
  }


  async update(id, updateData) {
    return this.model.findByIdAndUpdate(id, updateData, {
      new: true,         
      runValidators: true 
    });
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
