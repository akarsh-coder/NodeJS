const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/admin", adminRoute);
app.use(shopRoute);
app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found</h1>");
});
// const server = http.createServer(app);
// server.listen(5001);
app.listen(5001);
