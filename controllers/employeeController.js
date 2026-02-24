const { PrismaClient } = require("../generated/prisma/client");
const hashExtension = require("../middleware/extensions/userHashPassword");
const validateEmployee = require("../middleware/extensions/validateEmployee");
const multer = require("multer");
const path = require("path");
const { sendEmail } = require('../middleware/services/mailService');


const prisma = new PrismaClient()
  .$extends(validateEmployee)
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
exports.upload = upload.single("photo");

exports.displayRegisterEmployee = async (req, res) => {
  try {
    const boss = await prisma.boss.findUnique({
      where: {
        id: req.session.bossId,
      },
      select: {
        backgroundImage: true,
      },
    });
    console.log(boss);

    res.render("pages/addEmployee.twig", { boss: boss });
  } catch (error) {
    console.log(error);
    res.redirect("/admin");
  }
};

exports.postEmployee = async (req, res) => {
  if (!req.session.bossId) {
    return res.redirect("/loginBoss");
  }

  try {
    if (req.body.password !== req.body.confirm) {
      const error = new Error("Les mots de passe ne correspondent pas.");
      error.confirm = error.message;
      throw error;
    }

   const newEmployee=  await prisma.employee.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mail: req.body.mail,
        password: req.body.password,
        age: parseInt(req.body.age),
        genre: req.body.genre,
        photo: req.file ? req.file.path : null,
        bossId: req.session.bossId,
      },
    });
    const subject = "Bienvenue dans l'équipe !";
    const html = `<h1>Bonjour ${newEmployee.firstName},</h1><p>Votre profil a été créé avec succès.</p>`;
    await sendEmail(newEmployee.mail, subject, html);



    res.redirect("/admin");

  } catch (error) {
    console.log(error);
    const boss = await prisma.boss.findUnique({
      where: {
        id: req.session.bossId,
      },
      select: {
        backgroundImage: true,
      },
    });
    if (error.code == "P2002") {
      res.render("pages/addEmployee.twig", {
        duplicateMail: "Mail deja utilisé",
        boss: boss,
      });
    } else {
      res.render("pages/addEmployee.twig", {
        errors: error.details || {},
        confirmError: error.confirm || null,
        boss: boss,
      });
    }
  }
};

exports.displayLoginEmployee = async (req, res) => {
  res.render("pages/loginEmployee.twig");
};

exports.loginEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        mail: req.body.mail,
      },
    });
    if (employee) {
      if (bcrypt.compareSync(req.body.password, employee.password)) {
        req.session.employeeId = employee.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session non enregistrée :", err);
          }
          res.redirect("/employees/profile");
        });
      } else {
        throw { password: "mauvais mot de passe" };
      }
    } else {
      throw { mail: "Ce mail n'est pas enregistré" };
    }
  } catch (error) {
    res.render("pages/loginEmployee.twig", {
      error: error,
    });
  }
};

exports.displayEmployee = async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id: req.session.employeeId,
    },
    include: {
      boss: {
        select: {
          backgroundImage: true,
        },
      },
      computers: true,
    },
  });

  res.render("pages/profile.twig", {
    employee: employee,
    errorDelete: req.session.errorRequest,
  });
  delete req.session.errorRequest;
};

exports.displayUpdateEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id, 10);

    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        computers: true,
        boss: {
          select: {
            backgroundImage: true,
          },
        },
      },
    });
    if (!employee) {
      return res.status(404).send("Employé non trouvé");
    }

    const availableComputers = await prisma.computer.findMany({
      where: {
        bossId: req.session.bossId,
        employeeId: null,
      },
    });
    const isBoss = !!req.session.bossId;

    const renderOptions = {
        employee: employee,
        computers: availableComputers,
        isBoss: isBoss,
    };

    if (isBoss) {
        renderOptions.boss = employee.boss;
    }

    res.render("pages/addEmployee.twig",renderOptions) 
  } catch (error) {
    console.log(error);
    res.redirect("/admin");
  }
};

exports.updateEmployee = async (req, res) => {
  const employeeId = parseInt(req.params.id, 10);
  if (isNaN(employeeId)) {
    return res.status(400).send("ID d'employé invalide.");
  }
  try {
    const dataToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      mail: req.body.mail,
      age: parseInt(req.body.age),
      genre: req.body.genre,
    };
    if (req.body.password) {
      dataToUpdate.password = req.body.password;
    }
    if (req.file) {
      dataToUpdate.photo = req.file.path;
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: dataToUpdate,
    });
    if (req.session.bossId) {
      const subject = "Votre profil a été mis à jour";
      const html = `<h1>Bonjour ${updatedEmployee.firstName},</h1><p>Votre profil a été mis à jour avec succès.</p>`;
      await sendEmail(updatedEmployee.mail, subject, html);
    

    res.redirect("/admin");
    } else {
        res.redirect("/employees/profile");
    }
  } catch (error) {
    console.log(error);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        computers: true,
        boss: { select: { backgroundImage: true } },
      },
    });

    if (!employee) {
      return res.redirect("/admin?error=employee_not_found");
    }
    const availableComputers = await prisma.computer.findMany({
      where: {
        bossId: req.session.bossId,
        employeeId: null,
      },
    });

    res.render("pages/addEmployee.twig", {
      errors: error.details || {},
      employee: employee,
      computers: availableComputers,
      boss: employee.boss,
    });
  }
};

exports.logoutEmployee = async (req, res) => {
  req.session.destroy();
  res.redirect("/employees/loginEmployee");
};

exports.assignComputer = async (req, res) => {
  const { employeeId } = req.params;
  const { computerId } = req.body;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId, 10) },
      include: { computers: true },
    });
    if (employee.computers.length > 0) {
      return res.redirect(
        `/employees/updateemployee/${employeeId}?error=already_assigned`
      );
    }

    await prisma.computer.update({
      where: {
        id: parseInt(computerId, 10),
      },
      data: {
        employeeId: parseInt(employeeId, 10),
      },
    });
    res.redirect(`/employees/updateemployee/${employeeId}`);
  } catch (error) {
    console.log(error);
    res.redirect(
      `/employees/updateemployee/${req.params.employeeId}?error=assignment_failed`
    );
  }
};

exports.unassignComputer = async (req, res) => {
  try {
    const { computerId } = req.params;
    const computer = await prisma.computer.findUnique({
      where: { id: parseInt(computerId, 10) },
    });
    const employeeId = computer.employeeId;
    await prisma.computer.update({
      where: {
        id: parseInt(computerId, 10),
      },
      data: {
        employeeId: null,
      },
    });
    res.redirect(`/employees/updateemployee/${employeeId}`);
  } catch (error) {
    console.log(error);
    res.redirect(`/admin?error=unassignment_failed`);
  }
};


exports.reportBroken = async (req, res) => {
  try {
    const computerId = parseInt(req.params.computerId, 10);
    const employeeId = req.session.employeeId;

   if (!employeeId) {
      return res.status(403).send("Accès non autorisé.");
    }
     const computer = await prisma.computer.findUnique({
      where: { id: computerId },
    });

    if (!computer || computer.employeeId !== employeeId) {
           return res.status(403).send("Opération non autorisée.");
    }

   await prisma.computer.update({
      where: { id: computerId },
      data: { isBroken: true },
    });
       res.redirect("/employees/profile");
        } catch (error) {
    console.log(error);
        res.redirect("/employees/profile?error=broken_report_failed");
  }
};