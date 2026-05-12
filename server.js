require('dotenv').config();
const path = require('path')
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const methodOverride = require("method-override");


const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(methodOverride("_method"));

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(auth(config));

app.use("/", require("./routes/index"));
app.use("/home", require("./routes/home"));
app.use("/rewards", require("./routes/rewards"));
app.use("/qr_code", require("./routes/qr_code"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});