const Joi = require(`joi`);
const { UnprocessableEntityRequestError } = require("../Core/error.response");

const schema = new Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
});

const signUpMiddle = async (req, _, next) => {
  try {
    const { email, password } = req.body;

    await schema.validateAsync(
      { email, password },
      {
        abortEarly: false,
      }
    );

    next();
  } catch (error) {
    next(new UnprocessableEntityRequestError(error.message));
  }
};

module.exports = signUpMiddle;
