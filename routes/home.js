const express = require("express");
const router = express.Router();
const pool = require("../db");


router.get("/", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const auth0Id = req.oidc.user.sub;

  const karticaResult = await pool.query(
    `SELECT k.kartica_id, k.broj_bodova
     FROM kartica_lojalnosti k
     JOIN korisnik u ON u.korisnik_id = k.korisnik_id
     WHERE u.auth0_id = $1`,
    [auth0Id]
  );

  const kartica = karticaResult.rows[0];

  // dohvati nagrade koje može iskoristiti
  const nagradeResult = await pool.query(
    `SELECT * FROM nagrada
     WHERE potrebni_bodovi <= $1`,
    [kartica.broj_bodova]
  );

  res.render("home", {
    points: kartica.broj_bodova,
    rewards: nagradeResult.rows,
  });
});


router.post("/redeem/:id", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const auth0Id = req.oidc.user.sub;

  const karticaResult = await pool.query(
    `SELECT k.kartica_id, k.broj_bodova
     FROM kartica_lojalnosti k
     JOIN korisnik u ON u.korisnik_id = k.korisnik_id
     WHERE u.auth0_id = $1`,
    [auth0Id]
  );

  const kartica = karticaResult.rows[0];

  const nagradaResult = await pool.query(
    "SELECT * FROM nagrada WHERE nagrada_id = $1",
    [req.params.id]
  );

  const nagrada = nagradaResult.rows[0];

  if (kartica.broj_bodova < nagrada.potrebni_bodovi) {
    return res.status(400).send("Nedovoljno bodova");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE kartica_lojalnosti
       SET broj_bodova = broj_bodova - $1
       WHERE kartica_id = $2`,
      [nagrada.potrebni_bodovi, kartica.kartica_id]
    );

    await client.query(
      `INSERT INTO iskoristavanje_nagrade (kartica_id, nagrada_id)
       VALUES ($1, $2)`,
      [kartica.kartica_id, nagrada.nagrada_id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
  } finally {
    client.release();
  }

  res.redirect("/home");
});

module.exports = router;