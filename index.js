const express = require("express");
const bossRouter = require("./routers/bossRouter");
const session = require("express-session");
const employeeRouter = require("./routers/employeeRouter");
const computerRouter = require("./routers/computerRouter");
const profileRouter = require("./routers/profileRouter");

const app = express();
app.set("views", "./views"); 
app.set("view engine", "twig");

app.use(express.static("publics"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(bossRouter);
app.use("/employees", employeeRouter);


app.use("/computers", computerRouter);
app.use(profileRouter);

app.listen(3000, (err) => {
  console.log(!err ? "connecté au serveur" : err);
});
