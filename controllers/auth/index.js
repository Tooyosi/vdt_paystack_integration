const models = require('../../connection/sequelize')
const { logger } = require('../../loggers/logger')
const jwt = require('jsonwebtoken');

module.exports = {
    getLogin: ('/', async (req, res) => {
        return res.render("auth/login");
    }),

    postLogin: ('/', async (req, res) => {
        let { username, password } = req.body
        if(username.trim() == "" || password.trim() == ""){
            req.flash('error', 'One or more input parameters are not valid')
            return res.redirect('back')
        }
        try {
            let user = await models.User.findOne({
                where: {
                    username: username,
                    password: password
                }
            })
            if (user !== null && user !== undefined) {
                user.update({
                    last_login: new Date().toISOString().slice(0, 19).replace('T', ' ')
                })
                const token = jwt.sign(user.dataValues, process.env.TOKEN_SECRET, { expiresIn: '3 hours' })
                res.cookie('token', token, { maxAge: 33360000, httpOnly: true })
                req.flash('success', `Welcome ${user.username}`)
                return res.redirect('/admin/home')
            } else {
                req.flash('error', 'User does not exist')
                return res.redirect('back')
            }

        } catch (error) {
            logger.error(error)
            req.flash('error', 'An error occured while logging in')
            return res.redirect('back')
        }

    }),

    getSignup: ('/', async (req, res) => {
        return res.render("auth/signup");
    }),

    posSignup: ('/', async (req, res) => {
        let { username, password } = req.body
        
        if(username.trim() == "" || password.trim() == ""){
            req.flash('error', 'One or more input parameters are not valid')
            return res.redirect('back')
        }
        try {
            let newUser = await models.User.create({
                username: username,
                password: password,
                last_login: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })
            if (newUser !== null && newUser !== undefined) {
                const token = jwt.sign(newUser.dataValues, process.env.TOKEN_SECRET, { expiresIn: '3 hours' })
                res.cookie('token', token, { maxAge: 33360000, httpOnly: true })
                req.flash('success', `Welcome ${newUser.username}`)
                return res.redirect('/admin/home')
            } else {
                req.flash('error', 'An error occured while creating user')
                return res.redirect('back')
            }

        } catch (error) {
            logger.error(error)
            req.flash('error', 'An error occured while creating user')
            return res.redirect('back')
        }
    }),
};
