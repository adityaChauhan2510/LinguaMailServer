import express from "express";
import nodemailer from "nodemailer";
const router = express.Router();


router.post("/purchase", async(req, res)=> {
    
    const { tutor_email, course_name, student_name} = req.body;

    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: "adityachauhan2501@gmail.com",
              pass: "vyns wtlm qvda mnrg",
            },
          });

          const info = await transporter.sendMail({
            from: '"Aditya Chauhan👻" <adityachauhan2501@gmail.com>', // sender address
            to: `${tutor_email}`, // list of receivers
            subject: `Congratulations ${student_name} purchased your course ${course_name}`, // Subject line
            text: `Congratulations ${student_name} purchased your course ${course_name}`, // plain text body
            html: `Congratulations ${student_name} purchased your course ${course_name}`, // html body
          });

          console.log("Message sent: %s", info.messageId);
          res.send("Message was sent successfully");
    }catch(err){
         console.log(err);
    }

});

router.post("/ask-doubt", async(req, res) => {
    const { tutor_email, course_name, student_name, student_email, doubt} = req.body;

    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: "adityachauhan2501@gmail.com",
              pass: "vyns wtlm qvda mnrg",
            },
          });

          const info = await transporter.sendMail({
            from: `${student_name}👻 <${student_email}>`, // sender address
            to: `${tutor_email}`, // list of receivers
            subject: `${student_name} has a doubt regarding ${course_name} course`, // Subject line
            text: `Student Email: ${student_email}\n \nDoubt: \n ${doubt}`,
            html: `Student Email: ${student_email}<br><br>Doubt:<br>${doubt}`, 
          });

          console.log("Message sent: %s", info.messageId);
          res.send("Message was sent successfully");
    }catch(err){
        console.log(err);
    }
})


export default router;