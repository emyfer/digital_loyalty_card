const express = require("express");
const router = express.Router();
const pool = require("../db.js");

router.get("/", async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.render("index", { user: null });
  }

  const auth0Id = req.oidc.user.sub;
  const email = req.oidc.user.email;

  // provjeri postoji li korisnik
  let userResult = await pool.query(
    "SELECT * FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  let korisnikId;

  if (userResult.rows.length === 0) {

    const newUser = await pool.query(
      `INSERT INTO korisnik (auth0_id, ime, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [auth0Id, req.oidc.user.nickname, email]
    );

    korisnikId = newUser.rows[0].korisnik_id;

    // default = kupac
    await pool.query(
      "INSERT INTO kupac (korisnik_id) VALUES ($1)",
      [korisnikId]
    );

    await pool.query(
      `INSERT INTO kartica_lojalnosti (korisnik_id, broj_bodova)
       VALUES ($1, 5)`,
      [korisnikId]
    );

  } else {
    korisnikId = userResult.rows[0].korisnik_id;
  }

  // 🔎 PROVJERA ROLE IZ TABLICE administrator
  const adminResult = await pool.query(
    `SELECT vrsta_admina
     FROM administrator
     WHERE korisnik_id = $1`,
    [korisnikId]
  );

  if (adminResult.rows.length > 0) {

    const role = adminResult.rows[0].vrsta_admina;

    if (role === "superadmin") return res.redirect("/rewards");
    if (role === "konobar") return res.redirect("/qr_code");
  }

  // ako nije admin → kupac
  return res.redirect("/home");
});

module.exports = router;