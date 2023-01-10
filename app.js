const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect; //mongo import
const User = require("./models/user");
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

///testing mysql
// db.execute("SELECT * FROM products")
// 	.then((result) => {console.log(result[0],result[1]);})
// 	.catch(err=>{
//     console.log(err);
//   });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
	User.findById("63bd1126b2082ee52e667309")
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
// mongoConnect(()=>{
// app.listen(3000)
// })
mongoose
	.connect(
		"mongodb+srv://node-mongo-akr:5MWyf2Hpo3lENKjU@cluster0.vgx1sko.mongodb.net/shop?retryWrites=true&w=majority"
	)
	.then((result) => {
		User.findOne().then((user) => {
			if (!user) {
				const user = new User({
					name: "Akarsh",
					email: "akarsh@test.com",
					cart: {
						items: [],
					},
				});
				user.save();
			}
		});
			app.listen(5000);
	})
	.catch((err) => {
		console.log(err);
	});
