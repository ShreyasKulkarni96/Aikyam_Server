const router = require("express").Router();
const userCtrl = require("../controllers/userController");

router.post("/user/register", userCtrl.registerUser);
router.post("/user/login", userCtrl.loginUser);
router.get("/user/profile", userCtrl.getUserProfile);
router.route("/verify/otp").post(userCtrl.verifyOtp);
router.post("/user/resend-otp", userCtrl.resendOtp);

module.exports = router;
