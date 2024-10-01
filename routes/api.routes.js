const router = require("express").Router();
const userCtrl = require("../controllers/userController");

router.post("/user/register", userCtrl.registerUser);
router.post("/user/login", userCtrl.loginUser);
router.get("/user/profile", userCtrl.getUserProfile);
router.get("/user/refresh-token", userCtrl.getRefreshToken);
router.route("/verify/otp").post(userCtrl.verifyOtp);
router.route("resend-otp/:userId").post(userCtrl.resendOtp);
router.post("/logout", userCtrl.verifyToken, userCtrl.logoutUser);

module.exports = router;
