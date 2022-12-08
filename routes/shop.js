const path = require("path");
const adminData = require("./admin");
const express = require("express");
const router = express.Router();
const rootDir = require("../utils/path");
router.get("/", (req, res, next) => {
  const products = adminData.products;
  res.render("shop", { prods: products, docTitle: "Shop" });
  // console.log("shop.js", adminData.products);
  // res.sendFile(path.join(rootDir, "views", "shop.html"));
});
module.exports = router;
