const profileRouter = require('express').Router();
const profileController = require('../controllers/profileController');
const authGuard = require('../middleware/services/authguard'); 

profileRouter.get('/profil', authGuard, profileController.displayProfile);

module.exports = profileRouter;