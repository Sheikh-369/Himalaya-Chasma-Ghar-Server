// import nodemailer from "nodemailer"
// import { config } from "dotenv";
// config();

// interface IMailInformation{
//     to:string,
//     subject:string,
//     html:string
// }

// const sendEmail=async(mailInformation:IMailInformation)=>{
//     const transporter=nodemailer.createTransport({
//         service:"gmail",
//         auth:{
//             user:process.env.NODEMAILER_EMAIL,
//             pass:process.env.NODEMAILER_PASSWORD
//         }
//     })

//     const mailFormatObject={
//         from:"Himalaya Chasma Ghar",
//         to:mailInformation.to,
//         subject:mailInformation.subject,
//         html:mailInformation.html
//     }

//     try {
//         await transporter.sendMail(mailFormatObject)
//     } catch (error) {
//         console.log(error)
//     }
// }


// export default sendEmail


import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface IMailInformation {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (mailInformation: IMailInformation) => {
  try {
    await resend.emails.send({
      from: "Himalaya Chasma Ghar <onboarding@resend.dev>",
      to: [mailInformation.to],
      subject: mailInformation.subject,
      html: mailInformation.html,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;