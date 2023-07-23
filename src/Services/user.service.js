const {
  BadRequestError,
  NotFoundRequestError,
  UnauthorizedRequestError,
} = require("../Core/error.response");

const userModel = require("../Models/user.model");
const bcrypt = require("bcrypt");
const TokenService = require("./token.service");
const { getData, decodedToken } = require("../Utils");
const MailService = require("./mail.service");
const crypto = require("crypto");
const { serverConfig } = require("../Configs");

class UserService {
  static async signIn({ username, password, email }) {
    const holderUser = await userModel.findOne({ email });
    if (holderUser?.isVerified) {
      throw new BadRequestError(`Email has already been existing`);
    }

    if (holderUser) {
      await userModel.findByIdAndDelete(holderUser._id);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      email,
      password: passwordHash,
      username,
    });

    const activeToken = await TokenService.createActiveToken(newUser);
    const url = `${serverConfig.urlClient}/active?token=${activeToken}&userId=${newUser._id}`;
    await MailService.sendMail({
      email,
      url,
      content: `Verified account`,
    });
    return {
      message: `Please check your email address`,
      activeToken,
    };
  }

  static async activeAccount({ activeToken, userId }) {
    const token = await TokenService.findTokenWithUserId({ userId });
    if (!token) {
      throw new NotFoundRequestError(`Account not found`);
    }

    const user = await userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundRequestError(`Account not found`);
    }

    if (user.isVerified) {
      throw new BadRequestError(`Email has already been existing`);
    }

    const decoded = decodedToken(activeToken, token.activeKey);

    if (decoded._id !== userId) {
      throw new UnauthorizedRequestError(`Unauthorized`);
    }

    const updateUser = await userModel
      .findByIdAndUpdate(
        user._id,
        {
          $set: {
            isVerified: true,
          },
        },
        {
          new: true,
        }
      )
      .lean();

    await TokenService.deleteTokensWithID(token._id);

    return {
      message: `Account verification successful`,
      meta: {},
    };
  }

  static async signUp({ email, password }) {
    const holderUser = await userModel.findOne({ email }).lean();
    if (!holderUser) {
      throw new NotFoundRequestError(`Account does not exist`);
    }
    const isValid = await bcrypt.compare(password, holderUser.password);

    if (!isValid) {
      throw new BadRequestError(`Invalid password`);
    }

    if (!holderUser.isVerified) {
      const activeToken = await TokenService.createActiveToken(holderUser);
      const url = `${serverConfig.urlClient}/active?token=${activeToken}&userId=${holderUser._id}`;
      await MailService.sendMail({
        email,
        url,
        content: "Verified account",
      });
      throw new NotFoundRequestError(
        `Account does not verify. Please check your email to verify.`
      );
    }

    const tokens = await TokenService.createTokensPair(holderUser);

    return {
      message: `Login successfully`,
      meta: {
        user: getData([`username`, `_id`, "role"], holderUser),
        tokens,
      },
    };
  }

  static async forgetPassword({ email }) {
    const user = await userModel.findOne({ email }).lean().exec();
    if (!user) {
      throw new NotFoundRequestError(`Account does not exist`);
    }
    if (!user.isVerified) {
      throw new NotFoundRequestError(`Account does not exist`);
    }

    const activeToken = await TokenService.createActiveToken(user);

    const url = `${serverConfig.urlClient}/verify?token=${activeToken}&userId=${user._id}`;

    await MailService.sendMail({
      email,
      url,
      content: "Confirm reset password",
    });
    return {
      message: `Please check your email`,
      activeToken,
    };
  }

  static async verifyActiveToken({ activeToken, userId }) {
    const user = await userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundRequestError(`Account does not exist`);
    }
    const token = await TokenService.findTokenWithUserId({ userId });
    if (!token) {
      throw new UnauthorizedRequestError(`Unauthorized`);
    }
    const decoded = decodedToken(activeToken, token.activeKey);
    if (userId !== decoded._id) {
      throw new UnauthorizedRequestError(`Unauthorized`);
    }
    await TokenService.deleteTokensWithID(token);

    const tokens = await TokenService.createTokensPair(user);

    return {
      meta: {
        tokens,
        user: getData([`username`, `_id`, "role"], user),
      },
    };
  }

  static async changePassword({ _id, password }) {
    const user = await userModel.findById(_id).lean();
    if (!user) {
      throw new NotFoundRequestError("User not found");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const updateUser = await userModel
      .findByIdAndUpdate(_id, {
        $set: {
          password: passwordHash,
        },
      })
      .lean();

    await TokenService.deleteTokensWithID({ _id });

    return {
      message: `Update password successfully`,
    };
  }

  static async handleRefreshToken({ refreshToken, user }) {
    const tokenUsed = await TokenService.findTokenUsed({ refreshToken });

    if (tokenUsed) {
      console.log(tokenUsed);
      await TokenService.deleteTokensWithID(tokenUsed._id);
      throw new UnauthorizedRequestError(`Unauthorized 1`);
    }

    const token = await TokenService.findTokenWithRefreshToken({
      refreshToken,
    });

    if (!token) {
      throw new UnauthorizedRequestError(`Unauthorized 2`);
    }
    const strUserId = String(user._id);

    if (String(token.userId) !== strUserId) {
      throw new UnauthorizedRequestError(`Unauthorized 3`);
    }

    const decoded = decodedToken(refreshToken, token.publicKey);
    if (strUserId !== decoded._id) {
      throw new UnauthorizedRequestError(`Unauthorized 4`);
    }
    const storageTokens = await TokenService.createTokensPair(decoded);
    const updateTokenUsed = await TokenService.updateTokenUsed({
      userId: user._id,
      refreshToken,
    });

    return {
      messsage: "Refresh token successfully",
      meta: {
        user: getData([`username`, `_id`, "role"], user),
        tokens: storageTokens,
      },
    };
  }
}

module.exports = UserService;
