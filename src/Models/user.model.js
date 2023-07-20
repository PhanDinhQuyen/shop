const { Schema, model } = require(`mongoose`);

const DOCUMENT_NAME = `User`;
const COLLECTION_NAME = `Users`;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 30,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: `user`,
      enum: [`admin`, `user`],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, userSchema);
