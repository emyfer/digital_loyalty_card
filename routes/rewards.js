const express = require("express");
const router = express.Router();
const pool = require("../db");

// Helper funkcija za provjeru admina
async function isAdmin(auth0Id) {
  const result = await pool.query(
    "SELECT uloga FROM korisnik WHERE auth0_id = $1",
    [auth0Id]
  );

  return result.rows.length > 0 && result.rows[0].uloga === "admin";
}

//
// GET — prikaz svih nagrada
//
router.get("/", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const admin = await isAdmin(req.oidc.user.sub);
  if (!admin) return res.status(403).send("Access denied");

  const result = await pool.query(
    "SELECT * FROM nagrada ORDER BY naziv"
  );

  res.render("rewards", { rewards: result.rows });
});

//
// POST — dodavanje nagrade
//
router.post("/add", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const admin = await isAdmin(req.oidc.user.sub);
  if (!admin) return res.status(403).send("Access denied");

  const { naziv, slika, potrebni_bodovi } = req.body;

  await pool.query(
    `INSERT INTO nagrada (naziv, slika, potrebni_bodovi)
     VALUES ($1, $2, $3)`,
    [naziv, slika, potrebni_bodovi]
  );

  res.redirect("/rewards");
});

//
// DELETE — brisanje nagrade
//
router.delete("/:id", async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect("/");

  const admin = await isAdmin(req.oidc.user.sub);
  if (!admin) return res.status(403).send("Access denied");

  await pool.query(
    "DELETE FROM nagrada WHERE nagrada_id = $1",
    [req.params.id]
  );

  res.redirect("/rewards");
});

module.exports = router;