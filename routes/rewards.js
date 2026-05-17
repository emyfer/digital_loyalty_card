const express = require("express");
const router = express.Router();
const pool = require("../db");

async function isSuperAdmin(korisnikId) {
  const result = await pool.query(
    `SELECT vrsta_admina
     FROM administrator
     WHERE korisnik_id = $1
     AND vrsta_admina = 'superadmin'`,
    [korisnikId]
  );

  return result.rows.length > 0;
}

router.get("/", async (req, res) => {

  const auth0Id = req.oidc.user.sub;

  const user = await pool.query(
    "SELECT korisnik_id FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  const korisnikId = user.rows[0].korisnik_id;

  const admin = await isSuperAdmin(korisnikId);
  if (!admin) return res.status(403).send("Access denied");

  const search = req.query.search || "";

  const result = await pool.query(
    `SELECT *
     FROM nagrada
     WHERE LOWER(naziv) LIKE LOWER($1)
     ORDER BY naziv`,
    [`%${search}%`]
  );

  res.render("rewards", {
    rewards: result.rows,
    search
  });
});

router.post("/add", async (req, res) => {
  const auth0Id = req.oidc.user.sub;

  const user = await pool.query(
    "SELECT korisnik_id FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  const korisnikId = user.rows[0].korisnik_id;

  const admin = await isSuperAdmin(korisnikId);
  if (!admin) return res.status(403).send("Access denied");

  const { naziv, slika, potrebni_bodovi } = req.body;

  await pool.query(
    `INSERT INTO nagrada (naziv, slika, potrebni_bodovi)
     VALUES ($1, $2, $3)`,
    [naziv, slika, potrebni_bodovi]
  );

  res.redirect("/rewards");
});

router.delete("/:id", async (req, res) => {
  const auth0Id = req.oidc.user.sub;

  const user = await pool.query(
    "SELECT korisnik_id FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  const korisnikId = user.rows[0].korisnik_id;

  const admin = await isSuperAdmin(korisnikId);
  if (!admin) return res.status(403).send("Access denied");

  await pool.query(
    "DELETE FROM nagrada WHERE nagrada_id = $1",
    [req.params.id]
  );

  res.redirect("/rewards");
});

router.put("/:id", async (req, res) => {

  const auth0Id = req.oidc.user.sub;

  const user = await pool.query(
    "SELECT korisnik_id FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  const korisnikId = user.rows[0].korisnik_id;

  const admin = await isSuperAdmin(korisnikId);
  if (!admin) return res.status(403).send("Access denied");

  const { naziv, slika, potrebni_bodovi } = req.body;

  await pool.query(
    `UPDATE nagrada
     SET naziv = $1,
         slika = $2,
         potrebni_bodovi = $3
     WHERE nagrada_id = $4`,
    [naziv, slika, potrebni_bodovi, req.params.id]
  );

  res.redirect("/rewards");
});

module.exports = router;