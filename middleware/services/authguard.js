const { PrismaClient } = require("../../generated/prisma/client");
const prisma = new PrismaClient();

const authguard = async (req, res, next) => {
  try {
    if (req.session.bossId) {
      const boss = await prisma.boss.findUnique({
        where: {
          id: req.session.bossId,
        },
      });
      if (boss) {
        return next();
      }
    }

    if (req.session.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: {
          id: req.session.employeeId,
        },
      });
      if (employee) {
        return next();
      }
    }

    res.redirect("/loginBoss");
  } catch (error) {
    console.error("Erreur dans l'authguard:", error);
    res.redirect("/loginEmployee");
  }
};

module.exports = authguard;
