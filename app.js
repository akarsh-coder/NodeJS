const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set("view engine", "pug");
app.set("views", "views");

const adminData = require("./routes/admin");
const shopRoute = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", adminData.routes);
app.use(shopRoute);
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});
// const server = http.createServer(app);
// server.listen(5001);
app.listen(5001);
