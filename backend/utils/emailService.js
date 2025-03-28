import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendResetPasswordEmail = async (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Redefinição de Senha - SuperComercial ERP',
    html: `<p>Você solicitou a redefinição de senha.</p>
           <p>Clique <a href="${resetLink}">aqui</a> para redefinir sua senha. Este link é válido por 1 hora.</p>
           <p>Se não solicitou essa ação, ignore este e-mail.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
