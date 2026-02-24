const { Prisma } = require("@prisma/client");
const bcrypt = require("bcrypt");

module.exports = Prisma.defineExtension({
  name: "userHashPasswordExtension",
  query: {
    boss: {
      create: async ({ args, query }) => {
        const hashedPassword = bcrypt.hashSync(args.data.password, 12);
        args.data.password = hashedPassword;
        return query(args);
      },
    },
    employee: {
      create: async ({ args, query }) => {
        const hashedPassword = bcrypt.hashSync(args.data.password, 12);
        args.data.password = hashedPassword;
        return query(args);
      },
    },
  },
});
