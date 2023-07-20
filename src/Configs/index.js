const mailConfig = {
  GOOGLE_MAILER_CLIENT_ID: process.env.GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET: process.env.GOOGLE_MAILER_CLIENT_SECRET,
  GOOGLE_MAILER_REFRESH_TOKEN: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
  ADMIN_EMAIL_ADDRESS: process.env.ADMIN_EMAIL_ADDRESS,
  APP_NAME: process.env.APP_NAME,
};

const serverConfig = {
  port: process.env.PORT,
};

const databaseConfig = {
  url: process.env.URL_MONGO,
};

module.exports = {
  mailConfig,
  serverConfig,
  databaseConfig,
};
