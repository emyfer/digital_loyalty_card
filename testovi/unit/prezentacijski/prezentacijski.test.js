const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

// potrebno za unit test EJS templatea
const templatePath = path.join(__dirname, "../../../views/rewards.ejs");
const template = fs.readFileSync(templatePath, "utf-8"); // cita sadržaj EJS templatea kao običan tekst

test("prikazuje listu nagrada", () => {
  const mockData = {
    rewards: [
      { naziv: "Kava", potrebni_bodovi: 5 },
      { naziv: "Kroasan", potrebni_bodovi: 8 },
    ],
    user: { uloga: "superadmin" },
    search: "",
  };
  // rucno renderiranje EJS templatea s laznim podacima
  const html = ejs.render(template, mockData);
  // provjera je li se u renderiranom HTML-u pojavljuju ti mock podaci
  expect(html).toContain("Kava");
  expect(html).toContain("Kroasan");
});
