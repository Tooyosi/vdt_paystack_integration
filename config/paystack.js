const paystack = (request) => {
    const MySecretKey = process.env.PAYSTACK_SECRET;
    //replace the secret key with that from your paystack account
    const initializePayment = (form, mycallback) => {
        const options = {
            url : `${process.env.PAYSTACK_URL}/initialize`,
            headers : {
                authorization: `Bearer ${MySecretKey}`,
                'content-type': 'application/json',
                'cache-control': 'no-cache'    
            },
            form
        }
        const callback = (error, response, body) => {
            return mycallback(error, body)
        }
        request.post(options, callback)
    }

    const verifyPayment = (ref, mycallback) => {
        const options = {
            url : `${process.env.PAYSTACK_URL}/verify/${encodeURIComponent(ref)}`,
            headers : {
                authorization: `Bearer ${MySecretKey}`,
                'content-type': 'application/json',
                'cache-control': 'no-cache'    
            }
        }
        const callback = (error, response, body) => {
            return mycallback(error, body)
        }
        request(options, callback)
    }

    return {initializePayment, verifyPayment};
}

module.exports = paystack;