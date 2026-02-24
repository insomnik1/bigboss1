const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

exports.displayProfile = async (req, res) => {
  if (req.session.bossId) {
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

    res.render("pages/profile.twig", { boss: boss });
  } else if (req.session.employeeId) {
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
      },
    });
    res.render("pages/profile.twig", { employee: employee });
  } else {
    res.redirect("/loginBoss");
  }
};
