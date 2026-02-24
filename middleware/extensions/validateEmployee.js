const { Prisma } = require('@prisma/client')
const bcrypt = require('bcrypt')

module.exports = Prisma.defineExtension({
    name: "employeeValidateExtension",
    query: {
        employee: {
            create: async ({ args, query }) => {
                const errors = { }
                if (!/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(args.data.mail)) {
                    errors.mail = "Email invalide"
                }

                if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(args.data.password)) {
                    errors.password = "Mot de passe invalide (min 6 caractères, lettres et chiffres)"
                }

                if (!/^[a-zA-ZÀ-ÿ' -]{2,30}$/.test(args.data.firstName)) {
                    errors.firstName = "Nom invalide (pas de chiffre ni caractere speciaux)"
                }

                 if (!/^[a-zA-ZÀ-ÿ' -]{2,30}$/.test(args.data.lastName)) {
                    errors.lastName = "Prenom invalide (pas de chiffre ni caractere speciaux)"
                }
                  if (!/^(1[8-9]|[2-5][0-9]|6[0-5])$/.test(args.data.age)) {
                    errors.age = "Age invalide , ne doit pas être inférieur à 18 et supérieur à 65"
                }
                if (!/^[a-zA-ZÀ-ÿ' -]{2,30}$/.test(args.data.genre)) {
                    errors.genre = "Genre invalide (pas de chiffre ni caractere speciaux)"
                }

                if (Object.keys(errors).length > 0) {
                    const error = new Error("Erreur de validation")
                    error.details = errors
                    throw error;  
                }
                return query(args)
                

            }
        }
    }
})