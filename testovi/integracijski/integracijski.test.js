const request = require("supertest");
const express = require("express");
const methodOverride = require("method-override");
const { resetDatabase, closePool } = require("../reset/reset_baze");
const pool = require("../../db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// mock Auth0 za kupca
app.use((req, res, next) => {
  req.oidc = {
    isAuthenticated: () => true,
    user: { sub: "auth0|kupac1", email: "ana@email.com", nickname: "Ana" },
  };
  next();
});

app.use("/", require("../../routes/index"));
app.use("/home", require("../../routes/home").router);
app.use("/rewards", require("../../routes/rewards").router);
app.use("/qr_code", require("../../routes/qr_code").router);
app.use("/users", require("../../routes/users"));

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closePool();
});

describe("Integracijski testovi", () => {
  test("POST /home/redeem/:id - slučaj s nedovoljno bodova", async () => {
    // prvo spustimo bodove na 3
    await pool.query(
      `UPDATE kartica_lojalnosti SET broj_bodova = 3 
       WHERE korisnik_id = '11111111-1111-1111-1111-111111111111'`,
    );
    const nagradaId = "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1"; // u bazi nam ova nagrada košta 5 bodova
    const res = await request(app).post(`/home/redeem/${nagradaId}`);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("Nedovoljno bodova");
  });

  test("GET /home/scan - ispravan QR kod dodaje bod", async () => {
    const kodId = "ccccccc2-cccc-cccc-cccc-ccccccccccc2"; // ovaj je aktivan kao u toj testnoj bazici
    const res = await request(app).get(`/home/scan?kod_id=${kodId}`);
    expect(res.statusCode).toBe(302);
    const kartica = await pool.query(
      `SELECT broj_bodova FROM kartica_lojalnosti 
       WHERE korisnik_id = '11111111-1111-1111-1111-111111111111'`,
    );
    expect(kartica.rows[0].broj_bodova).toBe(6); // bio 5, plus 1
  });
});
