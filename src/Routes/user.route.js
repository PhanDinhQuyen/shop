const router = require("express").Router();
const UserController = require("../Controllers/user.controller");
const Auth = require("../Auth/verify.auth");

const signInMiddle = require("../Middlewares/signIn.mid");
const signUpMiddle = require("../Middlewares/signUp.mid");
const { wrapperAsyncError } = require("../Utils");

router.post("/signin", signInMiddle, UserController.signInUser);

router.post("/signup", signUpMiddle, UserController.signUpUser);

router.post(
  "/refresh",
  wrapperAsyncError(Auth.verifyRefreshToken),
  UserController.refreshTokenUser
);

router.get("/verify", UserController.activeAccountUser);

router.post("/forget", UserController.forgetPasswordUser);

router.get("/verify", UserController.verifyActiveTokenUser);

router.post(
  "/change_password",
  wrapperAsyncError(Auth.verifyAccessToken),
  UserController.changePasswordUser
);

module.exports = router;
