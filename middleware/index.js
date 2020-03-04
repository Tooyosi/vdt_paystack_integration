const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // check for token and save in a variable
    const token =
        req.body.token ||
        req.query.token ||
        req.headers['x-access-token'] ||
        req.cookies.token;

    // TODO: verify the token
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err || !decoded) {
            req.flash("error", "You must be logged in")
            return res.redirect("back");
        }
        req.user = decoded;
        req.token = token;
        next();
    });
}