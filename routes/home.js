const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const auth0Id = req.oidc.user.sub;

  const result = await pool.query(
    `SELECT k.broj_bodova
     FROM kartica_lojalnosti k
     JOIN korisnik u ON u.korisnik_id = k.korisnik_id
     WHERE u.auth0_id = $1`,
    [auth0Id]
  );

  res.render("home", { points: result.rows[0].broj_bodova });
});

module.exports = router;