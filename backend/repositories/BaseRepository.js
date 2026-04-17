/**
 * Base Repository - Abstract Class
 * 
 * DESIGN PATTERN: Repository Pattern
 * OOP CONCEPT: Abstraction + Inheritance
 * 
 * This is the parent class for ALL repositories.
 * It provides common CRUD operations that every repository needs.
 * Specific repositories (UserRepository, QuestionRepository, etc.)
 * extend this class and add their own specialized methods.
 * 
 * WHY REPOSITORY PATTERN?
 * - Controllers and Services don't need to know about MongoDB/Mongoose
 * - If we switch databases, we only change repository implementations
 * - Makes unit testing easier (we can mock repositories)
 * - Keeps data access logic in one place
 * 
 * ABSTRACTION:
 * - The rest of the app calls repository.findById(id)
 * - They don't care HOW it queries the database internally
 */

class BaseRepository {
  /**
   * @param {mongoose.Model} model - The Mongoose model this repository manages
   */
  constructor(model) {
    // Prevent direct instantiation of BaseRepository
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is abstract and cannot be instantiated directly');
    }

    this.model = model;
  }

  /**
   * Find a document by its ID
   * @param {string} id - MongoDB ObjectId
   * @returns {Promise<Object|null>} The found document or null
   */
  async findById(id) {
    return this.model.findById(id);
  }

  /**
   * Find all documents, with optional filtering
   * @param {Object} filter - MongoDB query filter
   * @returns {Promise<Array>} Array of matching documents
   */
  async findAll(filter = {}) {
    return this.model.find(filter);
  }

  /**
   * Find a single document matching the filter
   * @param {Object} filter - MongoDB query filter
   * @returns {Promise<Object|null>} First matching document or null
   */
  async findOne(filter) {
    return this.model.findOne(filter);
  }

  /**
   * Create a new document
   * @param {Object} data - The data to save
   * @returns {Promise<Object>} The created document
   */
  async create(data) {
    const document = new this.model(data);
    return document.save();
  }

  /**
   * Update a document by ID
   * @param {string} id - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} The updated document or null
   */
  async update(id, updateData) {
    return this.model.findByIdAndUpdate(id, updateData, {
      new: true,         // Return the updated document
      runValidators: true // Run schema validators on update
    });
  }

  /**
   * Delete a document by ID
   * @param {string} id - MongoDB ObjectId
   * @returns {Promise<Object|null>} The deleted document or null
   */
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  /**
   * Count documents matching a filter
   * @param {Object} filter - MongoDB query filter
   * @returns {Promise<number>} Count of matching documents
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
