const express = require("express");
const app = express();
const path = require("path")
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));

const landingRoute = require('./routes/landing/index')

app.use('/', landingRoute)

app.get("/signin", (req, res) => {
    // return res.render("auth/signin");
})

app.get("/signup", (req, res) => {
    return res.render("auth/signup");
})
app.listen(process.env.PORT, process.env.IP, () => {
    console.log(`App is running on ${process.env.PORT}`);
})