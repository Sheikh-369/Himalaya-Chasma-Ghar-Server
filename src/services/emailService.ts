import nodemailer from "nodemailer"
import { config } from "dotenv";
config();

interface IMailInformation{
    to:string,
    subject:string,
    html:string
}

const sendEmail=async(mailInformation:IMailInformation)=>{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.NODEMAILER_EMAIL,
            pass:process.env.NODEMAILER_PASSWORD
        }
    })

    const mailFormatObject={
        from:"Himalaya Chasma Ghar",
        to:mailInformation.to,
        subject:mailInformation.subject,
        html:mailInformation.html
    }

    try {
        await transporter.sendMail(mailFormatObject)
    } catch (error) {
        console.log(error)
    }
}


export default sendEmail