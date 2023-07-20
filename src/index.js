`use strict`;
require("dotenv").config();

const express = require(`express`);
const helmet = require(`helmet`);
const morgan = require(`morgan`);
const cors = require(`cors`);
const { StatusCodes, ReasonPhrases } = require(`http-status-codes`);
const { NotFoundRequestError } = require(`./Core/error.response`);
const { serverConfig } = require("./Configs");

const App = express();

// Middleware

const corsOption = {
  credentials: true,
  origin: serverConfig.urlClient,
};

App.use(helmet());
App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(morgan(`dev`));
App.use(cors(corsOption));
// Routes
App.use("/api/v1", require(`./Routes/user.route`));

App.get(`/`, (_, res) => {
  res.status(StatusCodes.OK).json({
    message: `Shop say: Hi!`,
  });
});

//Handler error response
App.use((_, __, next) => {
  const error = new NotFoundRequestError(`Not found request`);
  next(error);
});
App.use((error, _, res, __) => {
  const statusCode = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(statusCode).json({
    status: "Error",
    code: statusCode,
    message: error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
    stack: process.env.NODE_ENV === "local" ? error.stack : null,
  });
});

//Dbs
require(`./Database/init.mongo`);

App.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
