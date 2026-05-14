const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");


async function isKonobar(korisnikId) {
  const result = await pool.query(
    `SELECT vrsta_admina
     FROM administrator
     WHERE korisnik_id = $1
     AND vrsta_admina = 'konobar'`,
    [korisnikId]
  );

  return result.rows.length > 0;
}


router.get("/", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const auth0Id = req.oidc.user.sub;

  const user = await pool.query(
    "SELECT korisnik_id FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  const korisnikId = user.rows[0].korisnik_id;

  const konobar = await isKonobar(korisnikId);
  if (!konobar) return res.status(403).send("Access denied");

  const result = await pool.query(
    `SELECT * FROM qr_kod
     WHERE aktivan = true
     ORDER BY vrijeme_kreiranja DESC
     LIMIT 1`
  );

  res.render("qr_code", {
    activeCode: result.rows[0] || null
  });
});


router.post("/open", async (req, res) => {

  const kodId = uuidv4();

  await pool.query(
    `UPDATE qr_kod SET aktivan = false WHERE aktivan = true`
  );

  await pool.query(
    `INSERT INTO qr_kod (kod_id, aktivan, vrijeme_kreiranja)
     VALUES ($1, true, NOW())`,
    [kodId]
  );

  res.redirect("/qr_code");
});


router.post("/close", async (req, res) => {

  await pool.query(
    `UPDATE qr_kod SET aktivan = false WHERE aktivan = true`
  );

  res.redirect("/qr_code");
});

module.exports = router;