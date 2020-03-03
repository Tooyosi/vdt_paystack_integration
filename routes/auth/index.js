const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require("../../controllers/auth/index")

router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)
router.get('/signup', authController.getSignup)
router.post('/signup', authController.posSignup)

module.exports = router;
