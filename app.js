const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
///////////////////////////////
/// handlebars syntax///
//const expressHbs = require("express-handlebars");
// app.engine(
//   "hbs",
//   expressHbs.engine({
//     extname: "hbs",
//     defaultLayout: "main-layout",
//     layoutsDir: "views/layouts/",
//   })
// );
//////////////////////////////
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoute = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", adminRoutes);
app.use(shopRoute);
app.use((req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page not found" });
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});
// const server = http.createServer(app);
// server.listen(5001);
app.listen(5001);
