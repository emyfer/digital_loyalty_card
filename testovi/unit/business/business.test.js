const { hasEnoughPoints } = require("../../../routes/home");

describe("Poslovni sloj", () => {
  test("Korisnik s dovoljno bodova može iskoristiti nagradu", () => {
    expect(hasEnoughPoints(10, 5)).toBe(true);
  });
  test("Korisnik s nedovoljno bodova ne može iskoristiti nagradu", () => {
    expect(hasEnoughPoints(3, 5)).toBe(false);
  });
});
