const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})


const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Votre Application BigBoss" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
            });
            console.log('E-mail envoyé avec succès à :', to);
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'e-mail :", error);
            }
        }

        module.exports = { sendEmail };
