const { ResponseFactory } = require('../utils/factory');
const { HTTP_STATUS } = require('../utils/constants');

class AuthController {
  #authService;

  constructor(authService) {
    this.#authService = authService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const result = await this.#authService.register(username, email, password);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFactory.success(result, 'Registration successful')
      );
    } catch (error) {
      next(error);
    }
  }

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
