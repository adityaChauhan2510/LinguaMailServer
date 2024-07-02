
import dotenv from "dotenv"
import nodemailer from "nodemailer";
import { connectRedis, getRedisClient } from "./db.js";
dotenv.config();

async function processEnrollment(data, retryCount = 0) {
    const { tutor_email, course_name, student_name} = JSON.parse(data);
    
    console.log('Trying to send enrollment mail...');
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
            from: '"Aditya Chauhan👻" <adityachauhan2501@gmail.com>', 
            to: `${tutor_email}`, 
            subject: `Congratulations ${student_name} purchased your course ${course_name}`, 
            text: `Congratulations ${student_name} purchased your course ${course_name}`, 
            html: `Congratulations ${student_name} purchased your course ${course_name}`, 
          });

          console.log("Message sent: %s", info.messageId);
          console.log('Mail sent successfully');
    }catch(err){
        console.log(err);
        if (retryCount < 3) { 
            console.log(`Retrying (${retryCount + 1}/3) to send email...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); 
            await processEnrollment(data, retryCount + 1); 
        } else {
            console.error("Failed to send email after 3 attempts.");
        }

    }
   
}

async function processDoubt(data, retryCount=0) {
    const { tutor_email, course_name, student_name, student_email, doubt } = JSON.parse(data);
    console.log('Trying to send doubt email...');

    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
              user: "adityachauhan2501@gmail.com",
              pass: "vyns wtlm qvda mnrg",
            },
          });

          const info = await transporter.sendMail({
            from: `${student_name}👻 <${student_email}>`,
            to: `${tutor_email}`, 
            subject: `${student_name} has a doubt regarding ${course_name} course`, 
            text: `Student Email: ${student_email}\n \nDoubt: \n ${doubt}`,
            html: `Student Email: ${student_email}<br><br>Doubt:<br>${doubt}`, 
          });

          console.log("Message sent: %s", info.messageId);
          console.log('Mail sent successfully');
    }catch (err) {
        console.log(err);
        if (retryCount < 3) {
            console.log(`Retrying (${retryCount + 1}/3) to send email...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); 
            await processDoubt(data, retryCount + 1);
        } else {
            console.error("Failed to send doubt email after 3 attempts.");
        }
    }
}

async function startCourseEnrollmentWorker() {
    try {
        await connectRedis();
        console.log('courseEnrollment worker started');

        const redisClient = getRedisClient();

        while (true) {
            try {
                const dataEnrollment = await redisClient.brPop("courseEnrollment", 0);
                await processEnrollment(dataEnrollment.element);
            } catch (error) {
                console.error("Error processing course enrollment:", error);
                // Handle error, maybe retry or log
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

async function startDoubtEmailWorker() {
    try {
        await connectRedis();
        console.log('Doubt-worker started');

        const redisClient = getRedisClient();

        while (true) {
            try {
                const doubtData = await redisClient.brPop("studentDoubt", 0);
                await processDoubt(doubtData.element);
            } catch (error) {
                console.error("Error processing student doubt:", error);
                // Handle error, maybe retry or log
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

// Start both workers after connecting to Redis
(async () => {
    await Promise.all([
        startCourseEnrollmentWorker(),
        startDoubtEmailWorker()
    ]);
})();