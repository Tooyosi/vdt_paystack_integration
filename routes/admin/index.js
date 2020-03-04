const express = require('express');
const router = express.Router({ mergeParams: true });
const adminController = require("../../controllers/admin/index")
const middleware = require('../../middleware/index')

router.get('/home', middleware, adminController.get)

module.exports = router;
