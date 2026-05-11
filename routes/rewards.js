const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  res.render("rewards");
});

module.exports = router;