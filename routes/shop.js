const express = require("express");
const router = express.Router();
router.get("/", (req, res, next) => {
  res.send(
    `<h1>Express</h1><form action="/admin/add-product"><button type="submit">Route</button></form>`
  );
});
module.exports = router;
