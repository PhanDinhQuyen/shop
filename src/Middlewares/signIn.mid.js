const Joi = require(`joi`);
const { UnprocessableEntityRequestError } = require(`../Core/error.response`);

const schema = Joi.object({
  username: Joi.string().alphanum().min(4).max(20).required().trim(),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/))
    .message(`Minimum eight characters, at least one letter and one number`),
  repeat_password: Joi.ref(`password`),
  email: Joi.string()
    .pattern(
      new RegExp(
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      )
    )
    .message(`Email address is invalid`),
}).with(`password`, `repeat_password`);

const signInMiddle = async (req, _, next) => {
  try {
    const { email, password, username, repeat_password } = req.body;

    await schema.validateAsync(
      { email, password, username, repeat_password },
      {
        abortEarly: false,
      }
    );

    next();
  } catch (error) {
    next(new UnprocessableEntityRequestError(error.message));
  }
};

module.exports = signInMiddle;
