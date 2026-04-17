/**
 * Admin Controller
 * 
 * Handles admin-only operations:
 * - View all users
 * - View aggregated interview analytics/reports
 */

const { ResponseFactory } = require('../utils/factory');
const { HTTP_STATUS } = require('../utils/constants');

class AdminController {
  #userRepository;
  #interviewRepository;
  #scoreReportRepository;

  constructor(userRepository, interviewRepository, scoreReportRepository) {
    this.#userRepository = userRepository;
    this.#interviewRepository = interviewRepository;
    this.#scoreReportRepository = scoreReportRepository;

    // Bind methods
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getAnalytics = this.getAnalytics.bind(this);
  }

  /**
   * GET /api/admin/users
   * Get all registered users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await this.#userRepository.findAll();

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(users, 'Users fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/reports
   * Get aggregated analytics:
   * - Total users, total interviews, average score
   * - Category-wise breakdown
   */
  async getAnalytics(req, res, next) {
    try {
      // Count totals
      const totalUsers = await this.#userRepository.count();
      const totalInterviews = await this.#interviewRepository.count();
      const completedInterviews = await this.#interviewRepository.count({ status: 'completed' });

      // Get all score reports to calculate averages
      const allReports = await this.#scoreReportRepository.findAll();

      // Calculate average score
      let averageScore = 0;
      if (allReports.length > 0) {
        const totalScore = allReports.reduce((sum, report) => sum + report.totalScore, 0);
        const totalMaxScore = allReports.reduce((sum, report) => sum + report.maxPossibleScore, 0);
        averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
      }

      const analytics = {
        totalUsers,
        totalInterviews,
        completedInterviews,
        averageScorePercentage: averageScore,
        totalReports: allReports.length,
      };

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(analytics, 'Analytics fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
