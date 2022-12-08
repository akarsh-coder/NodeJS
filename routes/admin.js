const path = require("path");
const express = require("express");
const router = express.Router();
const rootDir = require("../utils/path");
router.get("/add-product", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});
// router.get("/add-product", (req, res, next) => {
//   res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
// });
router.post("/add-product", (req, res, next) => {
  //   res.send(`<h1>${req.body}</h1>`); didn't work
  console.log(req.body);
  res.redirect("/");
});
module.exports = router;
