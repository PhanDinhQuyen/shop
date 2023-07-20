const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

const {
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET,
  GOOGLE_MAILER_REFRESH_TOKEN,
  ADMIN_EMAIL_ADDRESS,
  APP_NAME,
} = require("../Configs").mailConfig;

const { BadRequestError } = require("../Core/error.response");
const { sendMailVerifyEmail } = require("../Utils");

const oAuth2Client = new OAuth2Client(
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
});

class MailService {
  static sendMail = async ({ email, url, content }) => {
    const accessTokenObject = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenObject?.token;
    if (!accessToken) throw new BadRequestError("Can't send mail");

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: ADMIN_EMAIL_ADDRESS,
        clientId: GOOGLE_MAILER_CLIENT_ID,
        clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
        refreshToken: GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken,
        timeout: 300,
      },
    });

    const mailOptions = {
      from: ADMIN_EMAIL_ADDRESS,
      to: email,
      subject: APP_NAME,
      html: sendMailVerifyEmail(url, content),
    };

    await transport.sendMail(mailOptions);

    return;
  };
}

module.exports = MailService;
