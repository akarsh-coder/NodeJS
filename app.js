const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoConnect=require('./util/database').mongoConnect//mongo import
const User=require('./models/user')
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
	User.findById('63b6b37669781cf29d4d5cba')
		.then((user) => {
			req.user = new User(user.name, user.email, user.cart, user._id);
			next();
		})
		.catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
mongoConnect(()=>{
app.listen(3000)
})
