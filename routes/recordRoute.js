const router = require('express').Router();
const recordController = require('../controllers/recordController');
const authService = require('../services/authService');

router.use(authService.verifyLoggedIn);

router.route('/')
    .get(recordController.find)
    .post(recordController.create);

router.route("/:id")
    .get(authService.verifyOwnerOrAdmin, recordController.findById)
    .put(authService.verifyOwnerOrAdmin, recordController.update)
    .delete(authService.verifyOwnerOrAdmin, recordController.remove);

/** Load record when API with id route parameter is hit */
router.param('id', recordController.load);

module.exports = router;