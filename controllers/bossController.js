const { PrismaClient } = require("../generated/prisma/client");
const hashExtension = require("../middleware/extensions/userHashPassword");
const validateBoss = require("../middleware/extensions/validateBoss");
const multer = require("multer");
const path = require("path");

const prisma = new PrismaClient()
  .$extends(validateBoss)
  .$extends(hashExtension);

const bcrypt = require("bcrypt");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "publics/uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
exports.upload = upload.single("backgroundImage");

exports.displayRegister = async (req, res) => {
  res.render("pages/registerBoss.twig");
};

exports.postBoss = async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  try {
    if (req.body.password == req.body.confirm) {
      const boss = await prisma.boss.create({
        data: {
          siret: req.body.siret,
          password: req.body.password,
          firstName: req.body.firstName,
          backgroundImage: req.file ? req.file.path : null,
        },
      });

      res.redirect("/loginBoss");
    } else {
      const error = new Error("Mot de passe non correspondant");
      error.confirm = error.message;
      throw error;
    }
  } catch (error) {
    console.log(error);

    if (error.code == "P2002") {
      res.render("pages/registerBoss.twig", {
        duplicateSiret: "Siret deja utilisé",
        old_input: req.body,
      });
    } else {
      res.render("pages/registerBoss.twig", {
        errors: error.details,
        confirmError: error.confirm ? error.confirm : null,
        old_input: req.body,
      });
    }
  }
};

exports.displayLogin = async (req, res) => {
  res.render("pages/loginBoss.twig");
};

exports.login = async (req, res) => {
  try {
    const boss = await prisma.boss.findUnique({
      where: {
        siret: req.body.siret,
      },
    });
    if (boss) {
      if (bcrypt.compareSync(req.body.password, boss.password)) {
        req.session.bossId = boss.id;

        req.session.save((err) => {
          if (err) {
            console.error("Session non enregistrée :", err);
          }

          res.redirect("/admin");
        });
      } else {
        throw { password: "mauvais mot de passe" };
      }
    } else {
      throw { siret: "Ce Siret n'est pas enregistré" };
    }
  } catch (error) {
    res.render("pages/loginBoss.twig", {
      error: error,
    });
  }
};

exports.displayAdmin = async (req, res) => {
  const boss = await prisma.boss.findUnique({
    where: {
      id: req.session.bossId,
    },
    select: {
      id: true,
      siret: true,
      firstName: true,
      backgroundImage: true,
    },
  });
  const employees = await prisma.employee.findMany({
    where: {
      bossId: req.session.bossId,
    },
    include: {
      computers: true,
    },
  });
  boss.employees = employees;

  res.render("pages/admin.twig", {
    boss: boss,
    errorDelete: req.session.errorRequest,
  });
  delete req.session.errorRequest;
};



exports.displayHome = async (req, res) => {
  try {
    res.render("pages/home.twig");
  } catch (error) {
    console.log(error);
    res.status(500).send("Une erreur est survenue");
  }
};

exports.removeEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    });
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
    req.session.errorRequest =
      "La suppression a échoué. Vérifiez que l'employé n'est plus lié à un ordinateur.";
    res.redirect("/admin");
  }
};

exports.logout = async (req, res) => {
  req.session.destroy();
  res.redirect("/loginBoss");
};
