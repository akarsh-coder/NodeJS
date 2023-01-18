const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { validationResult } = require("express-validator");


exports.getSignup = (req, res, next) => {
	const errors = validationResult(req);
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup",
		errorMessage: message,
		oldInput: {
			email: "",
			password: "",
			confirmPassword: "",
		},
		validationErrors: [],
	});
};

exports.postSignup = (req, res, next) => {
	// console.log(req.body.email);
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render("auth/signup", {
			path: "/signup",
			pageTitle: "Signup",
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email: email,
				password: password,
				confirmPassword: req.body.confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}

	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email: email,
				password: hashedPassword,
				cart: {
					items: [],
				},
			});
			return user.save();
		})
		.then((result) => {
			res.redirect("/");
		}).catch(err => {
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.getLogin = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
		errorMessage: message,
		oldInput:{
			email:'',
			password:''
		},
		validationErrors:[],
	});
};


exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors=validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render("auth/login", {
			path: "/login",
			pageTitle: "Login",
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email: email,
				password: password,
			},
			validationErrors: errors.array(),
		});
	}

	User.findOne({ email: email })
		.then((user) => {
			if(!user){
				return res.status(422).render("auth/login", {
					path: "/login",
					pageTitle: "Login",
					errorMessage: 'Invalid email or password',
					oldInput: {
						email: email,
						password: password,
					},
					validationErrors: [{param:'email',param:'password'}]
				}); 
			}
			bcrypt
				.compare(password, user.password)
				.then((doMatch) => {
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save((err) => {
							console.log(err);
							res.redirect("/");
						});
					}
					return res.status(422).render("auth/login", {
						path: "/login",
						pageTitle: "Login",
						errorMessage: 'Invalid email or password',
						oldInput: {
							email: email,
							password: password,
						},
						validationErrors: [{param:'email',param:'password'}]
					});
				})
				.catch((err) => {
					console.log(err);
					res.redirect("/login");
				});
		})
		.catch(err => {
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/");
	});
};

exports.getReset = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/reset", {
		path: "/reset",
		pageTitle: "Reset password",
		errorMessage: message,
	});
};
exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect("/reset");
		}
		const token = buffer.toString("hex");
		User.findOne({
			email: req.body.email,
		})
			.then((user) => {
				if (!user) {
					req.flash("error", "No account with that email found");
					return res.redirect("/reset");
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save();
			})
			.then((result) => {
				res.redirect("/reset");
				const resetToken = token;
				console.log(resetToken);
			})
			.catch(err => {
				const error=new Error(err);
				error.httpStatusCode=500;
				return next(error)
			});
	});
};
