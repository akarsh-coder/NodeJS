const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const app = express();
const Product = require("./models/product");
const User = require("./models/user");

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
	User.findByPk(1)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
Product.belongsTo(User, { constarints: true, onDelete: "CASCADE" });
User.hasMany(Product);
sequelize
	// .sync({force:true})
	.sync()
	.then((result) => {
		return User.findByPk(1);
		// console.log(result)
		// app.listen(3000);
	})
	.then((user) => {
		if (!user) {
			return User.create({ name: "Max", email: "test@test.com" });
		}
		return user;
	})
	.then((user) => {
		// console.log(user);
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
