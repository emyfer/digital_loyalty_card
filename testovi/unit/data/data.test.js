const { pool, resetDatabase, closePool } = require("../../reset/reset_baze");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closePool();
});

describe("Podatkovni sloj", () => {
  test("Dodavanje nove nagrade", async () => {
    await pool.query(
      `INSERT INTO nagrada (nagrada_id, naziv, potrebni_bodovi)
     VALUES ($1, $2, $3)`,
      ["aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "Test nagrada", 3],
    );
    const res = await pool.query(
      "SELECT * FROM nagrada WHERE naziv = 'Test nagrada'",
    );
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].potrebni_bodovi).toBe(3);
  });

  test("Ažuriranje nagrade", async () => {
    await pool.query(
      `UPDATE nagrada SET potrebni_bodovi = 10 WHERE naziv = 'Besplatna kava'`,
    );
    const res = await pool.query(
      "SELECT potrebni_bodovi FROM nagrada WHERE naziv = 'Besplatna kava'",
    );
    expect(res.rows[0].potrebni_bodovi).toBe(10);
  });

  test("Brisanje nagrade", async () => {
    await pool.query(`DELETE FROM nagrada WHERE naziv = 'Kroasan'`);
    const res = await pool.query(
      "SELECT * FROM nagrada WHERE naziv = 'Kroasan'",
    );
    expect(res.rows.length).toBe(0);
  });
});
