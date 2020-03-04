const models = require('../../connection/sequelize')
const { logger } = require('../../loggers/logger')
const jwt = require('jsonwebtoken');
module.exports = {
    get: ('/', async (req, res) => {
        try {
            var perPage = 20;

            var pageQuery = parseInt(req.query.page);
            let { subsId, ref, email, amount, status } = req.query
            var pageNumber = pageQuery ? pageQuery : 1;
            let whereObj = {}
            if (subsId) {
                whereObj.subscriber_id = subsId
            }
            if (ref) {
                whereObj.transaction_ref = ref
            }
            if (email) {
                whereObj.customer_email = email
            }
            if (amount) {
                whereObj.amount = amount
            }
            if (status) {
                whereObj.transaction_status = status
            }
            let transactions = await models.Transactions.findAndCountAll({
                offset: ((perPage * pageNumber) - perPage),
                limit: perPage,
                where: whereObj
            })
            return res.render("admin", {
                data: transactions.rows,
                current: pageNumber,
                pages: Math.ceil(transactions.count / perPage),
                subsId: subsId ? subsId : false,
                ref: ref ? ref : false,
                email: email ? email : false,
                amount: amount ? amount : false,
                status: status ? status : false
            });

        } catch (error) {
            logger.error(error)
            req.flash('error', error)
            return res.redirect('back')
        }
    }),
};
