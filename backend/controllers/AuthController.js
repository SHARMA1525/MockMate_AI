/**
 * Auth Controller
 * 
 * Handles HTTP requests for authentication endpoints.
 * 
 * CONTROLLER RESPONSIBILITIES:
 * 1. Extract data from the request (req.body, req.params, etc.)
 * 2. Call the appropriate service method
 * 3. Send back the HTTP response
 * 
 * Controllers should NOT contain business logic.
 * They delegate everything to the service layer.
 */

const { ResponseFactory } = require('../utils/factory');
const { HTTP_STATUS } = require('../utils/constants');

class AuthController {
  #authService;

  constructor(authService) {
    this.#authService = authService;

    // Bind methods to preserve 'this' context when used as route handlers
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  /**
   * POST /api/auth/register
   * Register a new user account
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const result = await this.#authService.register(username, email, password);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFactory.success(result, 'Registration successful')
      );
    } catch (error) {
      next(error);  // Pass to global error handler
    }
  }

  /**
   * POST /api/auth/login
   * Login with email and password, receive JWT token
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await this.#authService.login(email, password);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(result, 'Login successful')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user's profile (requires authentication)
   */
  async getProfile(req, res, next) {
    try {
      const user = await this.#authService.getProfile(req.user.id);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(user, 'Profile fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
