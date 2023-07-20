const jwt = require("jsonwebtoken");
const { UnauthorizedRequestError } = require("../Core/error.response");

const getData = (field = [], data = {}) => {
  const result = {};
  for (let i = 0; i < field.length; i++) {
    const key = field[i];

    if (!result[key] && data[key]) {
      result[key] = data[key];
    }
  }
  return result;
};

const wrapperAsyncError = (func) => (req, res, next) =>
  func(req, res, next).catch(next);

const decodedToken = (token, key) =>
  jwt.decode(token, key, (data, error) => {
    if (error) {
      throw UnauthorizedRequestError(`Unauthorized`);
    }
    return data;
  });

const sendMailVerifyEmail = (url, content) => `
              <div style="width: 500px; margin: 0 auto;">
              <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${content}</a>
          
              <p>If the button doesn't work for any reason, you can also click on the link below:</p>
          
              <div>${url}</div>
              </div>
            `;

module.exports = {
  getData,
  wrapperAsyncError,
  decodedToken,
  sendMailVerifyEmail,
};
