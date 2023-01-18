const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const session = require("express-session");
const errorController = require("./controllers/error");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const fs = require("fs");

// const mongoConnect = require("./util/database").mongoConnect; //mongo import
const User = require("./models/user");
const app = express();

const MONGODB_URI =
	"mongodb+srv://node-mongo-akr:5MWyf2Hpo3lENKjU@cluster0.vgx1sko.mongodb.net/shop";

const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: "sessions",
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});
const filefilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};


app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

///testing mysql
// db.execute("SELECT * FROM products")
// 	.then((result) => {console.log(result[0],result[1]);})
// 	.catch(err=>{
//     console.log(err);
//   });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	multer({ storage: fileStorage, fileFilter: filefilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));
app.use(
	session({
		secret: "my secret",
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

app.use(csrfProtection);
app.use(flash());

//adding authentication and csrf tokens to every views
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then((user) => {
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch((err) => {
			next(new Error(err));
		});
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
	res.status(500).render("500", {
		pageTitle: "Some error occured!",
		path: "/500",
		isAuthenticated: req.session.isLoggedIn,
	});
});
// mongoConnect(()=>{
// app.listen(3000)
// })
mongoose
	.connect(MONGODB_URI)
	.then((result) => {
		app.listen(5000);
	})
	.catch((err) => {
		console.log(err);
	});
