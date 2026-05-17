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

  const korisnici = await pool.query(
    `SELECT k.korisnik_id, k.ime, k.email, kl.broj_bodova, kl.kartica_id
     FROM korisnik k
     JOIN kupac ku ON ku.korisnik_id = k.korisnik_id
     JOIN kartica_lojalnosti kl ON kl.korisnik_id = k.korisnik_id
     ORDER BY k.ime`
  );

  res.render("users", {
    korisnici: korisnici.rows
  });
});

router.get("/:id/detail", async (req, res) => {
  const auth0Id = req.oidc.user.sub;

  const user = await pool.query(
    "SELECT korisnik_id FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );
  const korisnikId = user.rows[0].korisnik_id;

  const admin = await isSuperAdmin(korisnikId);
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const korisnikResult = await pool.query(
    `SELECT kl.kartica_id
     FROM korisnik k
     JOIN kartica_lojalnosti kl ON kl.korisnik_id = k.korisnik_id
     WHERE k.korisnik_id = $1`,
    [req.params.id]
  );
  const kartica = korisnikResult.rows[0];

  const iskoristene = await pool.query(
    `SELECT n.naziv, n.potrebni_bodovi, i.vrijeme
     FROM iskoristavanje_nagrade i
     JOIN nagrada n ON n.nagrada_id = i.nagrada_id
     WHERE i.kartica_id = $1
     ORDER BY i.vrijeme DESC`,
    [kartica.kartica_id]
  );

  res.json({ iskoristene: iskoristene.rows });
});

module.exports = router;