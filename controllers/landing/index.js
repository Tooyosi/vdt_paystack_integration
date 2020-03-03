const models = require('../../connection/sequelize')
const { logger } = require('../../loggers/logger')
const request = require('request')
const { initializePayment, verifyPayment } = require('../../config/paystack')(request);


module.exports = {
    get: ('/', async (req, res) => {
        return res.render("landing/index");
    }),

    post: ('/', async (req, res) => {
        let { id, amount } = req.body
        request({
            uri: `${process.env.ALEPO_GET_USER}/${id}`,
            method: "GET",
            auth: {
                'user': process.env.ALEPO_USERNAME,
                'pass': process.env.ALEPO_PASSWORD,
            }
        }, (error, response) => {
            if (error || !response) {
                logger.error(error ? error : 'An error occured while fetching user details')
            } else {
                if (response.statusCode == 200) {
                    let userDetails = JSON.parse(response.body)
                    const form = {
                        fullName: userDetails.firstName + " " + userDetails.lastName,
                        amount: Number(amount),
                        email: userDetails.email
                    }
                    form.metadata = {
                        full_name: form.fullName
                    }
                    form.amount *= 100;
                    initializePayment(form, async (error, body) => {
                        if (error || !body) {
                            return logger.error(error)
                        } else {
                            let newResponse = JSON.parse(body)
                            if (newResponse.status) {
                                try {
                                    let newTransaction = await models.Transactions.create({
                                        subscriber_id: id,
                                        transaction_ref: newResponse.data.reference,
                                        customer_firstname: userDetails.firstName,
                                        customer_lastname: userDetails.lastName,
                                        customer_phone: userDetails.phoneHome,
                                        customer_email: userDetails.email,
                                        amount: amount,
                                        transaction_status: 'Pending',
                                        payment_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
                                    })
                                    if (newTransaction != null && newTransaction !== undefined) {
                                        return res.redirect(`${newResponse.data.authorization_url}`)
                                    } else {
                                        logger.error('Error in creating transaction')
                                    }

                                } catch (error) {
                                    logger.error(error.toString())
                                }
                            } else {
                                logger.error(newResponse.message)
                            }
                        }
                    })
                }
            }
        });

        //   console.log(result)


    }),

    paystack: ('/', async (req, res) => {
        const ref = req.query.reference;
        verifyPayment(ref, async (error, body) => {
            if (error || !body) {
                //handle errors appropriately
                console.log(error)

                return res.redirect('/')
            } else {
                let response = JSON.parse(body);
                if (response.status) {
                    let newTransaction = await models.Transactions.findOne({
                        where: {
                            transaction_ref: req.query.reference
                        } 
                    }) 
                    if(newTransaction !== null && newTransaction !==undefined){
                        newTransaction.update({
                            transaction_status: response.data.status,

                        })
                    }
                    return res.redirect('/')
                }

            }

        })
    })
};
