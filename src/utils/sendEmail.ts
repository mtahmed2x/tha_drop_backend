import nodemailer from "nodemailer";
import to from "await-to-ts";
import "dotenv/config";
import FormData from "form-data";
import Mailgun from "mailgun.js";

const currentDate = new Date();

const formattedDate = currentDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const sendEmail = async (email: string, verificationOTP: string) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: `${process.env.SERVICE_NAME}`,
    to: email,
    date: formattedDate,
    subject: "Verification",
    text: `Your verification code is ${verificationOTP}`,
  };
  const [error, info] = await to(transporter.sendMail(mailOptions));
  if (error) throw new Error(`Failed to send email: ${error.message}`);
  console.log(`Email sent: ${info.response}`);
};

export const sendEmailByMailGun = async (email: string, verificationOTP: string) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAIL_KEY!,
  });
  try {
    const data = await mg.messages.create("postmaster@sandbox64bd86a8903a4b7b9b587d91f288de31.mailgun.org", {
      from: "The Drop <thedrop@postmaster@sandbox64bd86a8903a4b7b9b587d91f288de31.mailgun.org>",
      to: [`<${email}>`],
      subject: "Verification OTP",
      text: `Your verification code is ${verificationOTP}`,
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
};

export default sendEmail;
