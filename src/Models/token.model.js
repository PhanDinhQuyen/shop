const { Schema, model, Types } = require("mongoose");

const DOCUMENT_NAME = "Token";
const COLLECTION_NAME = "Tokens";

const tokenSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    publicKey: {
      type: String,
    },
    privateKey: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    activeKey: {
      type: String,
    },
    refreshTokensUsed: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, tokenSchema);
