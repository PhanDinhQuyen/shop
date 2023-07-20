const { request } = require("express");
const {
  BadRequestError,
  UnauthorizedRequestError,
} = require("../Core/error.response");
const userModel = require("../Models/user.model");

const HEADER = {
  CLIENT_KEY: "x-client-key",
  AUTHORIZATION: "authorization",
};

class Auth {
  static async verifyClientKey(clientKey) {
    if (!clientKey) {
      throw new UnauthorizedRequestError(`Invalid client key 1`);
    }
    const user = await userModel
      .findById(clientKey)
      .select(`-password`)
      .lean()
      .exec();

    if (!user) {
      throw new UnauthorizedRequestError(`Invalid client key 2`);
    }

    return user;
  }

  static verifyRefreshToken = async (req, _, next) => {
    const refreshToken = req.headers[HEADER.AUTHORIZATION];
    const clientKey = req.headers[HEADER.CLIENT_KEY];
    const user = await this.verifyClientKey(clientKey);
    if (!refreshToken) {
      throw new UnauthorizedRequestError(`Invalid refresh token`);
    }
    req.refreshToken = refreshToken;
    req.user = user;
    next();
  };
}

module.exports = Auth;
