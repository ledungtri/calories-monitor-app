const router = require('express').Router();
const userController = require('../controllers/userController');
const authService = require('../services/authService');

router.use(authService.verifyLoggedIn);

router.route('/')
    .get(authService.verifyManagerOrAdmin, userController.find);

router.route("/:id")
    .get(authService.verifySelfOrManagerOrAdmin, userController.findById)
    .put(authService.verifySelfOrManagerOrAdmin, userController.update)
    .delete(authService.verifySelfOrManagerOrAdmin, userController.remove);

/** Load user when API with id route parameter is hit */
router.param('id', userController.load);

module.exports = router;