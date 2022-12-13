const path = require("path");
const express = require("express");
const router = express.Router();
const productsController=require('../controllers/products')
router.get("/add-product",productsController.getAddProducts);
router.post("/add-product",productsController.postAddProducts);
module.exports=router;
// router.get("/add-product", (req, res, next) => {
//   res.render("add-product", {
//     pageTitle: "Add product",
//     path: "/admin/add-product",
//     productCSS: true,
//     formsCSS: true,
//     activeAddProduct: true,
//   });
//   // res.sendFile(path.join(rootDir, "views", "add-product.html"));
// });
// router.get("/add-product", (req, res, next) => {
//   res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
// });
  // router.post("/add-product", (req, res, next) => {
  //   //   res.send(`<h1>${req.body}</h1>`); didn't work
  //   products.push({ title: req.body.title });
  //   console.log(req.body.title)
  //   console.log(req.body);
  //   res.redirect("/");
  // });
// exports.routes = router;
// exports.products = products;
