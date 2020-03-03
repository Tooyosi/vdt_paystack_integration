const models = require('../../connection/sequelize')
const { logger } = require('../../loggers/logger')


module.exports = {
    getLogin: ('/', async (req, res) => {
        return res.render("landing/index");
    }),

    postLogin: ('/', async (req, res) => {
        let { id, amount } = req.body

    }),

    getSignup: ('/', async (req, res) => {
        return res.render("landing/index");
    }),

    posSignup: ('/login', async (req, res) => {
        let { id, amount } = req.body

    }),
};
