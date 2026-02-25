const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { sendEmail } = require("../middleware/services/mailService");

exports.displayAddComputer = async (req, res) => {
  if (!req.session.bossId) {
    return res.redirect("/loginBoss");
  }
  try {
    const computers = await prisma.computer.findMany({
      where: {
        bossId: req.session.bossId,
      },
      include: {
        employee: true,
      },
    });
    console.log("Boss ID from session:", req.session.bossId);
    console.log("Computers fetched:", computers);

    const boss = await prisma.boss.findUnique({
      where: {
        id: req.session.bossId,
      },
      select: {
        backgroundImage: true,
      },
    });
    console.log(boss);
    res.render("pages/computerInventory.twig", {
      computers: computers,
      boss: boss,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin");
  }
};

exports.displayAddComputerForm = async (req, res) => {
  if (!req.session.bossId) {
    return res.redirect("/loginBoss");
  }
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
  console.log(boss);
  res.render("pages/addComputer.twig", { boss: boss });
};

exports.postComputer = async (req, res) => {
  if (!req.session.bossId) {
    return res.redirect("/loginBoss");
  }
  const boss = await prisma.boss.findUnique({
    where: {
      id: req.session.bossId,
    },
    select: {
      backgroundImage: true,
    },
  });
  try {
    await prisma.computer.create({
      data: {
        mac: req.body.mac,
        description: req.body.description,
        bossId: req.session.bossId,
      },
    });
    res.redirect("/computers");
  } catch (error) {
    console.log(error);

    let errorMessage = "";
    if (error.code == "P2002") {
      errorMessage = "Cette adresse MAC existe déjà.";
    }

    res.render("pages/addComputer.twig", {
      error: errorMessage,
      boss: boss,
      old_input: req.body,
    });
  }
};

exports.displayUpdateComputer = async (req, res) => {
  try {
    if (!req.session.bossId) {
      return res.redirect("/loginBoss");
    }
    const computer = await prisma.computer.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    const boss = await prisma.boss.findUnique({
      where: {
        id: req.session.bossId,
      },
      select: {
        backgroundImage: true,
      },
    });
    res.render("pages/addComputer.twig", {
      computer: computer,
      boss: boss,
    });
  } catch (error) {
    console.log(error);

    res.redirect("/computers");
  }
};

exports.updateComputer = async (req, res) => {
  try {
    await prisma.computer.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        mac: req.body.mac,
        description: req.body.description,
      },
      include: {
        boss: { select: { backgroundImage: true } },
      },
    });
    res.redirect("/computers");
  } catch (error) {
    console.log(error);
    res.redirect("/computers/update/" + req.params.id);
  }
};

exports.removeComputer = async (req, res) => {
  try {
    await prisma.computer.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.redirect("/computers");
  } catch (error) {
    console.log(error);
    res.redirect("/computers");
  }
};

exports.repairComputer = async (req, res) => {
  try {
    if (!req.session.bossId) {
      return res.status(403).send("Accès non autorisé.");
    }

    const computerId = parseInt(req.params.id, 10);
    const repairedComputer = await prisma.computer.update({
      where: {
        id: computerId,
      },
      data: {
        isBroken: false,
      },
      include: {
        employee: true,
      },
    });
    if (repairedComputer.employee) {
      const subject = "Votre ordinateur est de nouveau opérationnel";
      const html = `<h1>Bonjour ${repairedComputer.employee.firstName},</h1><p>Bonne nouvelle ! L'ordinateur <strong>${repairedComputer.mac}</strong> a été réparé.</p>`;
      await sendEmail(repairedComputer.employee.mail, subject, html);
    }

    res.redirect("/computers");
  } catch (error) {
    console.log(error);
    res.redirect("/computers?error=repair_failed");
  }
};

