const express = require("express");
const router = express.Router();
router.get("/add-product", (req, res, next) => {
  res.send(
    '<form action="/admin/product" method="POST"><input type="text" name="sample"/><button type="submit">Send</button></form>'
  );
});
router.post("/product", (req, res, next) => {
  //   res.send(`<h1>${req.body}</h1>`); didn't work
  console.log(req.body);
  res.redirect("/");
});
module.exports = router;
