const express = require("express");
const app = express();
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

const path = require("path")
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use(flash());
app.use(cookieParser());
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
// setting local variables for all routes
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

const landingRoute = require('./routes/landing/index')
const authRoute = require('./routes/auth/index')
const adminRoute = require('./routes/admin/index')

app.use('/', landingRoute)
app.use('/auth', authRoute)
app.use('/admin', adminRoute)

app.listen(process.env.PORT, process.env.IP, () => {
    console.log(`App is running on ${process.env.PORT}`);
})