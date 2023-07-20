const { StatusCodes } = require("http-status-codes");
const UserService = require("../Services/user.service");

class UserController {
  static async signInUser(req, res, next) {
    try {
      return res
        .status(StatusCodes.CREATED)
        .json(await UserService.signIn(req.body));
    } catch (error) {
      next(error);
    }
  }
  static async signUpUser(req, res, next) {
    try {
      return res
        .status(StatusCodes.OK)
        .json(await UserService.signUp(req.body));
    } catch (error) {
      next(error);
    }
  }

  static async refreshTokenUser(req, res, next) {
    try {
      return res
        .status(StatusCodes.OK)
        .json(await UserService.handleRefreshToken({ ...req }));
    } catch (error) {
      next(error);
    }
  }

  static async activeAccountUser(req, res, next) {
    try {
      const { token: activeToken, userId } = req.query;

      return res.status(StatusCodes.OK).json(
        await UserService.activeAccount({
          activeToken,
          userId,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async forgetPasswordUser(req, res, next) {
    try {
      return res
        .status(StatusCodes.OK)
        .json(await UserService.forgetPassword(req.body));
    } catch (error) {
      next(error);
    }
  }

  static async changePasswordUser(req, res, next) {
    try {
      const { token: activeToken, userId } = req.query;

      return res.status(StatusCodes.OK).json(
        await UserService.changePassword({
          activeToken,
          userId,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
