const computerRouter = require("express").Router();

const computerController = require("../controllers/computerController");
const authGuard = require("../middleware/services/authguard");
/*
computerRouter.get('/addcomputer', authGuard, computerController.displayAddComputer)
computerRouter.post('/addcomputer', authGuard,computerController.addComputer)
computerRouter.get("/removecomputer/:id",authGuard , bookcomputerControllerController.removeComputer)
computerRouter.get("/updatecomputer/:id", authGuard, computerController.displayUpdateComputer)
computerRouter.post("/updatecomputer/:id" , authGuard , computerController.updateComputer)
*/
computerRouter.get("/", authGuard, computerController.displayAddComputer);
computerRouter.get(
  "/add",
  authGuard,
  computerController.displayAddComputerForm
);
computerRouter.post("/add", authGuard, computerController.postComputer);
computerRouter.get(
  "/update/:id",
  authGuard,
  computerController.displayUpdateComputer
);
computerRouter.post(
  "/update/:id",
  authGuard,
  computerController.updateComputer
);
computerRouter.get("/delete/:id", authGuard, computerController.removeComputer);

computerRouter.post("/repair/:id", authGuard, computerController.repairComputer);


module.exports = computerRouter;
