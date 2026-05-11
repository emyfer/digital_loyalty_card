const express = require("express");
const router = express.Router();
const pool = require("../db.js");

router.get("/", async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.render("index", { user: null });
  }

  const auth0Id = req.oidc.user.sub;
  const email = req.oidc.user.email;

  let userResult = await pool.query(
    "SELECT * FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  if (userResult.rows.length === 0) {

    const newUser = await pool.query(
      `INSERT INTO korisnik (auth0_id, ime, email, uloga)
       VALUES ($1, $2, $3, 'kupac')
       RETURNING *`,
      [auth0Id, req.oidc.user.nickname, email]
    );

    const korisnikId = newUser.rows[0].korisnik_id;

    await pool.query(
      "INSERT INTO kupac (korisnik_id) VALUES ($1)",
      [korisnikId]
    );

    await pool.query(
      `INSERT INTO kartica_lojalnosti (korisnik_id, broj_bodova)
       VALUES ($1, 5)`,
      [korisnikId]
    );
  }

  const roleResult = await pool.query(
    "SELECT uloga FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  const role = roleResult.rows[0].uloga;

  if (role === "admin") return res.redirect("/rewards");
  if (role === "konobar") return res.redirect("/qr_code")
  if (role === "kupac") return res.redirect("/home");

  res.redirect("/");
});

module.exports = router;