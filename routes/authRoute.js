const router = require('express').Router();
const authService = require('../services/authService');

router.route('/register').post(authService.register);
router.route('/login').post(authService.login);

module.exports = router;