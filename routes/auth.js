const express = require("express");
//check or body any thing can be user
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();
const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
	"/login",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email eamil address").normalizeEmail(),
		body("password", "password has to be valid")
			.isLength({ min: 5 })
			.isAlphanumeric()
      .trim(),
	],
	authController.postLogin
);

router.post(
	"/signup",
	[
		check("email")
			.isEmail()
			.withMessage("Please Enter a valid email")
			.custom(async (value, { req }) => {
				//     if (value === "aka@test.com") {
				// 			throw new Error("This email is already in use");
				// 		}
				// 		return true;
				//   }),

				// return User.findOne({ email: value }).then((userDoc) => {
				// 	if (userDoc) {
				//     return Promise.reject("This email is already in use")
				// 	}
				// });
				const userDoc = await User.findOne({ email: value });
				if (userDoc) {
					return Promise.reject("This email is already in use");
				}
			}).normalizeEmail(),
		body(
			"password",
			"Please enter a password with only numbers, text and with at least 5 characters and maximum 8 characters"
		)
			.isLength({ min: 5, max: 8 })
			.isAlphanumeric().trim(),
		body("confirmPassword").trim().custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords did not match");
			}
			return true;
		}),
	],
	authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

module.exports = router;
