const bossRouter = require('express').Router()
const bossController = require("../controllers/bossController")
const authGuard = require("../middleware/services/authguard")

bossRouter.get('/registerBoss' , bossController.displayRegister)
bossRouter.post('/registerBoss', bossController.upload, bossController.postBoss)

bossRouter.get('/loginBoss',bossController.displayLogin)
bossRouter.post('/loginBoss', bossController.login)

bossRouter.get('/admin', authGuard, bossController.displayAdmin)

bossRouter.get("/logout", bossController.logout)

bossRouter.get('/', bossController.displayHome)

bossRouter.get('/removeemployee/:id', authGuard, bossController.removeEmployee);

module.exports = bossRouter