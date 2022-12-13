const products=[];
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
    console.log(req.body);
    products.push({title:req.body.title});
    res.redirect("/");
  };

exports.getProducts=(req, res, next) => {
    res.render("shop", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
    });
  } ;