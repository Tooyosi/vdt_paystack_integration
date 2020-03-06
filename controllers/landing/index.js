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
        if (id.trim() == "" || Number(amount) < 1) {
            req.flash('error', 'One or more input parameters are not valid')
            return res.redirect('back')
        }
        request({
            uri: `${process.env.ALEPO_GET_USER}/${id}`,
            method: "GET",
            auth: {
                'user': process.env.ALEPO_USERNAME,
                'pass': process.env.ALEPO_PASSWORD,
            }
        }, (error, response) => {
            if (error || !response) {
                logger.error(error ? error.toString() : 'An error occured while fetching user details')
                req.flash('error', error ? error.toString() : 'An error occured while fetching user details')
                return res.redirect('back')
            } else {
                let userDetails = JSON.parse(response.body)

                if (response.statusCode == 200) {
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
                            logger.error(error ? error : 'An error occured while attempting payment')
                            req.flash('error', error ? error : 'An error occured while attempting payment')
                            return res.redirect('back')
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
                                        transaction_status: 'initiated',
                                        payment_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
                                    })
                                    if (newTransaction != null && newTransaction !== undefined) {
                                        return res.redirect(`${newResponse.data.authorization_url}`)
                                    } else {
                                        logger.error('Error in creating transaction')
                                        req.flash('error', 'Error in creating transaction')
                                        return res.redirect('back')
                                    }

                                } catch (error) {
                                    logger.error(error.toString())
                                    req.flash('error', error.toString())
                                    return res.redirect('back')
                                }
                            } else {
                                logger.error(newResponse.message)
                                req.flash('error', newResponse.message)
                                return res.redirect('back')
                            }
                        }
                    })
                } else {
                    logger.error(userDetails && userDetails.errorMessage ? userDetails.errorMessage : 'An error occured while fetching user details')
                    req.flash('error', userDetails && userDetails.errorMessage ? userDetails.errorMessage : 'An error occured while fetching user details')
                    return res.redirect('back')
                }
            }
        });

        //   console.log(result)


    }),

    paystack: ('/', async (req, res) => {
        const ref = req.query.reference;
        let newTransaction = await models.Transactions.findOne({
            where: {
                transaction_ref: req.query.reference
            }
        })
        verifyPayment(ref, async (error, body) => {
            if (error || !body) {
                //handle errors appropriately
                if (newTransaction !== null && newTransaction !== undefined) {
                    newTransaction.update({
                        transaction_status: 'indeterminate',
                    })
                }
                req.flash('error', error ? error : 'An error occured while Verifying user payment')
                return res.redirect('/')
            } else {
                let response = JSON.parse(body);
                if (response.status) {
                    if (newTransaction !== null && newTransaction !== undefined) {
                        newTransaction.update({
                            transaction_status: response.data.status,
                        })

                        if (response.data.status == "success") {
                            request({
                                uri: `${process.env.ALEPO_POST_USER}/${newTransaction.dataValues.subscriber_id}/postamount?amount=${newTransaction.dataValues.amount}&paymentMethod=8&transactionType=Credit&cardId=xc03&paymentReceiver=chijioke`,
                                method: "GET",
                                auth: {
                                    'user': process.env.ALEPO_USERNAME,
                                    'pass': process.env.ALEPO_PASSWORD,
                                }
                            }, (error, alepoResponse)=>{
                                if (error || !alepoResponse) {
                                    logger.error(error ? error : 'An error occured while posting to Alepo')
                                    req.flash('error', error ? error : 'An error occured while posting to Alepo')
                                    return res.redirect('/')
                                }else {
                                    let newResponse = JSON.parse(alepoResponse.body)

                                    if(alepoResponse.statusCode == 200){
                                        newTransaction.update({
                                            post_amount_status: 'success',
                                            payment_number_alepo: newResponse.paymentNumber
                                        })
                                    }else{
                                        newTransaction.update({
                                            post_amount_status: 'failed',
                                            failure_reason_alepo: newResponse.errorMessage
                                        })
                                    }
                                }

                                req.flash('success', response.data.gateway_response)
                                return res.redirect('/')
                                // return res.send(alepoResponse)
                            })
                        }
                    }
                }

            }

        })
    })
};
