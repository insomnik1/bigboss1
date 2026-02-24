const employeeRouter = require('express').Router()
const employeeController = require("../controllers/employeeController")
const authGuard = require("../middleware/services/authguard")

employeeRouter.get('/addEmployee' , authGuard, employeeController.displayRegisterEmployee)
employeeRouter.post('/addEmployee', employeeController.upload, employeeController.postEmployee)

employeeRouter.get('/loginEmployee',employeeController.displayLoginEmployee)
employeeRouter.post('/loginEmployee', employeeController.loginEmployee)

employeeRouter.get('/profile', authGuard, employeeController.displayEmployee)

employeeRouter.get("/logoutEmployee", employeeController.logoutEmployee)

employeeRouter.get('/updateemployee/:id', employeeController.displayUpdateEmployee);
employeeRouter.post('/updateemployee/:id', employeeController.upload, employeeController.updateEmployee);

employeeRouter.post('/assign-computer/:employeeId', authGuard, employeeController.assignComputer);
employeeRouter.get('/unassign-computer/:computerId', authGuard, employeeController.unassignComputer);

employeeRouter.post('/report-broken/:computerId', authGuard, employeeController.reportBroken);


module.exports = employeeRouter