require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  database: "loyalty_card_test",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

async function resetDatabase() {
  await pool.query(`
    TRUNCATE TABLE 
      iskoristavanje_nagrade,
      transakcija_bodova,
      qr_kod,
      kartica_lojalnosti,
      nagrada,
      administrator,
      kupac,
      korisnik
    RESTART IDENTITY CASCADE;
  `);

  // podaci kao oni iz dumpa (zadnjeg koje sam gledala)
  await pool.query(`
    -- Korisnici
    INSERT INTO korisnik (korisnik_id, auth0_id, ime, email, uloga) VALUES
      ('11111111-1111-1111-1111-111111111111', 'auth0|kupac1', 'Ana Anić', 'ana@email.com', 'kupac'),
      ('22222222-2222-2222-2222-222222222222', 'auth0|kupac2', 'Marko Marić', 'marko@email.com', 'kupac'),
      ('33333333-3333-3333-3333-333333333333', 'auth0|admin1', 'Admin Adminić', 'admin@email.com', 'admin'),
      ('46fc1143-24c3-4e03-93d5-0dba657e704c', 'auth0|6a023e5ee0b0edd76a85472a', 'ema11092002@gmail.com', 'ema11092002@gmail.com', 'kupac'),
      ('e071f28a-6c7f-49b2-8aa4-87ee11481d75', 'auth0|6a023ebe1a7861c446468968', 'ema.bradic@fer.unizg.hr', 'ema.bradic@fer.unizg.hr', 'admin'),
      ('d001d5b6-6494-49ff-97c2-95038899ea35', 'auth0|69e0f7e4a4f938eedceb7c93', 'ema.bradic', 'ema.bradic@icloud.com', 'admin');
    
    -- Kupci
    INSERT INTO kupac (korisnik_id) VALUES
      ('11111111-1111-1111-1111-111111111111'),
      ('22222222-2222-2222-2222-222222222222'),
      ('46fc1143-24c3-4e03-93d5-0dba657e704c'),
      ('e071f28a-6c7f-49b2-8aa4-87ee11481d75'),
      ('d001d5b6-6494-49ff-97c2-95038899ea35');
    
    -- Administratori
    INSERT INTO administrator (korisnik_id, vrsta_admina) VALUES
      ('33333333-3333-3333-3333-333333333333', 'superadmin'),
      ('d001d5b6-6494-49ff-97c2-95038899ea35', 'konobar'),
      ('e071f28a-6c7f-49b2-8aa4-87ee11481d75', 'superadmin');
    
    -- Kartice lojalnosti
    INSERT INTO kartica_lojalnosti (kartica_id, korisnik_id, broj_bodova) VALUES
      ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 5),
      ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', 10),
      ('2630a0f5-1a06-475a-97bb-de784666a8c6', 'd001d5b6-6494-49ff-97c2-95038899ea35', 5),
      ('70bc1d4e-10f9-40e3-8f00-606f43240b42', '46fc1143-24c3-4e03-93d5-0dba657e704c', 2);
    
    -- Nagrade
    INSERT INTO nagrada (nagrada_id, naziv, potrebni_bodovi) VALUES
      ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Besplatna kava', 5),
      ('cad91c1c-5f1f-442c-a9cb-0aff614f0d27', 'Kroasan', 8);
    
    -- QR kodovi
    INSERT INTO qr_kod (kod_id, aktivan, vrijeme_kreiranja) VALUES
      ('ccccccc1-cccc-cccc-cccc-ccccccccccc1', false, NOW()),
      ('ccccccc2-cccc-cccc-cccc-ccccccccccc2', true, NOW());
  `);
}

async function closePool() {
  await pool.end();
}

module.exports = { pool, resetDatabase, closePool };
