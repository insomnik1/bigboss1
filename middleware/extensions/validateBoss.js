const { Prisma } = require('@prisma/client')
const bcrypt = require('bcrypt')

module.exports = Prisma.defineExtension({
    name: "bossValidateExtension",
    query: {
        boss: {
            create: async ({ args, query }) => {
                const errors = { }
                if (!/^\d{0,14}$/.test(args.data.siret)) {
                    errors.siret = "Siret invalide"
                }

                if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(args.data.password)) {
                    errors.password = "Mot de passe invalide (min 6 caractere, lettres et chiffres)"
                }

                if (!/^[a-zA-ZÀ-ÿ' -]{2,30}$/.test(args.data.firstName)) {
                    errors.firstName = "Prenom invalide (pas de chiffre ni caractere speciaux)"
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