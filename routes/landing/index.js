const express = require('express');
const router = express.Router({ mergeParams: true });
const landingController = require("../../controllers/landing/index")

router.get('/', landingController.get)
router.post('/', landingController.post)
router.get('/paystack/callback', landingController.paystack)

module.exports = router;
