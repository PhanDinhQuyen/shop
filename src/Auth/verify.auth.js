const { request } = require("express");
const {
  BadRequestError,
  UnauthorizedRequestError,
} = require("../Core/error.response");
const userModel = require("../Models/user.model");
const TokenService = require("../Services/token.service");
const { decodedToken } = require("../Utils");

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

  static verifyToken = async (clientKey, token, option = `privateKey`) => {
    const findToken = await TokenService.findTokenWithUserId({
      userId: clientKey,
    });

    const key = findToken[option];

    const decoded = decodedToken(token, key);

    if (decoded._id !== clientKey) {
      throw new UnauthorizedRequestError(`Unauthorized`);
    }

    return decoded;
  };

  static verifyAccessToken = async (req, _, next) => {
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    const clientKey = req.headers[HEADER.CLIENT_KEY];

    const user = await this.verifyClientKey(clientKey);

    if (!accessToken) {
      throw new BadRequestError(`Token missing`);
    }
    const decoded = await this.verifyToken(clientKey, accessToken);
    req.user = decoded;
    next();
  };

  static verifyRefreshToken = async (req, _, next) => {
    const refreshToken = req.headers[HEADER.AUTHORIZATION];
    const clientKey = req.headers[HEADER.CLIENT_KEY];
    const user = await this.verifyClientKey(clientKey);
    if (!refreshToken) {
      throw new BadRequestError(`Token missing`);
    }
    req.refreshToken = refreshToken;
    req.user = user;
    next();
  };
}

module.exports = Auth;
