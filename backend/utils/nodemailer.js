import sgMail from '@sendgrid/mail';
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendUserEmail = async({ email, token, context }) => {
  console.log({ email });

  const msg = {
    to: email,
    from: 'gunshogun333@gmail.com', // your verified sender
    subject: context === "forgot" 
      ? "INsys password reset code"
      : "INsys confirmation code TESTER",
    text: context === "forgot"
      ? `Use this code to reset your password: ${token}`
      : `Your verification code is: ${token}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
        <h1 style="...">${context === "forgot" ? "Password Reset Request" : "Welcome to your account!"}</h1>
        <p style="...">
          ${context === "forgot"
            ? "You requested a password reset. Use the code below to proceed:"
            : "Thank you for creating an account. To complete your registration, please use the verification code below:"}
        </p>
        <div style="display: inline-block; background: #f0f0f0; padding: 15px 40px; border-radius: 8px; font-size: 30px; font-weight: bold; color: #101010; margin: 15px 0 20px;">
          ${token}
        </div>
        <p style="font-size: 11px; color: #888; margin: 0 0 12px;">
          This code is valid for 10 minutes. If you didn't create an account, you can disregard this email or contact our support team. Thank you.
        </p>
        <a href="#" style="font-size: 13px; color: #333; text-decoration: underline; display: inline-block; margin: 15px 0;">Contact us</a>
        <p style="font-size: 14px; color: #666; margin: 15px 0 0;">
          <strong>Best regards,</strong><br>
          The INsys Team
        </p>
      </div>
    </div>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Message sent");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};










// import nodemailer from 'nodemailer';
// import dotenv from "dotenv";

// dotenv.config(); 

// // Create a test account or replace with real credentials.
// export const sendUserEmail = async({email, token, context }) => {
//   console.log({ email});
//   const transporter = nodemailer.createTransport({
//     service:"gmail",
//     secure:false,
//     port: 587,
//     tls: { rejectUnauthorized: false },
//     auth: {
//       user: process.env.NDM_USER,
//       pass: process.env.NDM_PASSWORD
//     },
//   });

//   const mailOptions = {
//     from: {
//       name: 'yla tester',
//       address: process.env.NDM_USER,
//     },
//     to: email,
//     subject: context === "forgot" 
//       ? "INsys password reset code"
//       : "INsys confirmation code TESTER",
//     text: context === "forgot"
//       ? `Use this code to reset your password: ${token}`
//       : `Your verification code is: ${token}`,
//     html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
//       <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">

//         <h1 style="...">${context === "forgot" ? "Password Reset Request" : "Welcome to your account!"}</h1>
//         <p style="...">
//           ${context === "forgot"
//             ? "You requested a password reset. Use the code below to proceed:"
//             : "Thank you for creating an account. To complete your registration, please use the verification code below:"}
//         </p>

//         <div style="display: inline-block; background: #f0f0f0; padding: 15px 40px; border-radius: 8px; font-size: 30px; font-weight: bold; color: #101010; margin: 15px 0 20px;">
//           ${token}
//         </div>
//         <p style="font-size: 11px; color: #888; margin: 0 0 12px;">
//           This code is valid for 10 minutes. If you didn't create an account, you can disregard this email or contact our support team. Thank you.
//         </p>
//         <a href="#" style="font-size: 13px; color: #333; text-decoration: underline; display: inline-block; margin: 15px 0;">Contact us</a>
//         <p style="font-size: 14px; color: #666; margin: 15px 0 0;">
//           <strong>Best regards,</strong><br>
//           The INsys Team
//         </p>
//       </div>
//     </div>`,
//   };
  

//   try {
//       const emailResponse = await transporter.sendMail(mailOptions);
//   console.log("Message sent:", emailResponse.messageId);
//   } catch (error) {
//     console.log(error);

//     throw new Error(error)
//   }

// }


  
