
import dotenv from "dotenv"
import nodemailer from "nodemailer";
import { connectRedis, getRedisClient } from "./db.js";
dotenv.config();

async function processMail(data, retryCount = 0) {
    const { tutor_email, course_name, student_name} = JSON.parse(data);
    
    console.log('Trying to send mail...');
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
              user: process.env.EMAIL_USER, 
              pass: process.env.EMAIL_PASS, 
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
          console.log('Mail sent successfully');
    }catch(err){
        console.log(err);
        if (retryCount < 3) { 
            console.log(`Retrying (${retryCount + 1}/3) to send email...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 5 seconds 
            await processMail(data, retryCount + 1); 
        } else {
            console.error("Failed to send email after 3 attempts.");
        }

    }
   
}

async function startWorker() {

    try {
        await connectRedis();

        while (true) {
            try {
                const redisClient = getRedisClient();
                const data = await redisClient.brPop("courseEnrollment", 0);
                
                await processMail(data.element);
            } catch (error) {
                console.error("Error processing submission:", error);
                // Implement your error handling logic here. For example, you might want to push the submission back onto the queue or log the error to a file.
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startWorker();