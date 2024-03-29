const Product=require('../models/product')

exports.getAddProducts= (req, res, next) => {
    res.render("add-product", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      productCSS: true,
      formsCSS: true,
      activeAddProduct: true,
    });
  };

exports.postAddProducts= (req, res, next) => {
    // console.log(req.body);
   const product = new Product(req.body.title);
   product.save();
    res.redirect("/");
  };

exports.getProducts=(req, res, next) => {
    Product.fetchAll(products=>{
      res.render("shop", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
      });
    });
  } ;