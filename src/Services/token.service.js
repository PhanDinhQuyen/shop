const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const tokenModel = require("../Models/token.model");

const createKeyHash = () => {
  return crypto.randomBytes(64).toString("hex");
};

class TokenService {
  static createAccessToken(payload) {
    const privateKey = createKeyHash();
    const accessToken = jwt.sign(payload, privateKey, {
      expiresIn: "1h",
    });
    return {
      accessToken,
      privateKey,
    };
  }

  static createRefreshToken(payload) {
    const publicKey = createKeyHash();
    const refreshToken = jwt.sign(payload, publicKey, {
      expiresIn: "7d",
    });
    return {
      refreshToken,
      publicKey,
    };
  }

  static async createActiveToken({ _id, email }) {
    const activeKey = createKeyHash();
    const payload = { _id, email };
    const activeToken = jwt.sign(payload, activeKey, {
      expiresIn: "30m",
    });
    const storageActiveKey = await this.storageActiveKey({
      activeKey,
      _id,
    });
    console.log(storageActiveKey);
    return activeToken;
  }

  static async createTokensPair({ _id, email }) {
    const payload = { _id, email };
    const { accessToken, privateKey } = this.createAccessToken(payload);
    const { refreshToken, publicKey } = this.createRefreshToken(payload);

    const storageTokens = await this.storageTokensPair({
      userId: _id,
      refreshToken,
      privateKey,
      publicKey,
    });
    console.log(storageTokens);

    return { accessToken, refreshToken };
  }

  static async storageActiveKey(payload) {
    const { _id: userId, activeKey } = payload;
    const infor = await tokenModel
      .findOneAndUpdate({ userId }, { activeKey }, { new: true, upsert: true })
      .lean()
      .exec();
    return infor;
  }

  static async storageTokensPair(payload) {
    const updateData = {
      ...payload,
      refreshTokensUsed: [],
    };
    const findOptions = {
      userId: payload.userId,
    };
    const updateOptions = {
      new: true,
      upsert: true,
    };

    const tokens = await tokenModel
      .findOneAndUpdate(findOptions, updateData, updateOptions)
      .lean()
      .exec();

    return tokens;
  }

  static async updateTokenUsed({ userId, refreshToken }) {
    const updateData = {
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    };
    const update = await tokenModel.findOneAndUpdate({ userId }, updateData);

    return update;
  }

  static async findTokenUsed({ refreshToken }) {
    const findOptions = {
      refreshTokensUsed: refreshToken,
    };
    const find = await tokenModel.findOne(findOptions);
    return find;
  }

  static async findTokenWithRefreshToken({ refreshToken }) {
    const token = await tokenModel.findOne({ refreshToken }).lean().exec();
    return token;
  }

  static async findTokenWithUserId({ userId }) {
    const token = await tokenModel.findOne({ userId }).lean().exec();
    return token;
  }

  static async deleteTokensWithID({ _id }) {
    const find = await tokenModel.findByIdAndDelete(_id).lean();
    console.log(find);
    return find;
  }
}

module.exports = TokenService;
