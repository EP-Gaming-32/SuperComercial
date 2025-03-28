// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // ou outro serviço
  auth: {
    user: process.env.EMAIL_USER,  // Configurado no .env
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Redefinição de Senha - SuperComercial ERP",
    html: `<p>Você solicitou a redefinição de sua senha.</p>
           <p>Clique <a href="${resetLink}">aqui</a> para redefinir sua senha. O link é válido por 1 hora.</p>`,
  });
};

module.exports = { sendResetPasswordEmail };
