import express from "express";
import bcrypt from 'bcryptjs';

import {db} from '../db.js';
import { generateOTP, verifyOTP } from "./otp.js";
import { sendUserEmail } from "./nodemailer.js";
import redisClient from "./redisClient.js";
import { generateAccessToken, generateRefreshToken, verifyJWT } from "./jwt.js";
import { logAction } from "./logAction.js";

const authRoutes = express.Router();
const saltRounds = 5;

import { verifyToken } from '../utils/jwt.js';

authRoutes.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  try {
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET); 
    res.json({ message: 'Protected route OK', user: decoded });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
});


authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email && !password) return res.status(400).json({ error: 'Missing credentials. Please fill all the missing field' });

  if (!email || !password) {
    const missingField = !email ? 'email' : 'password';
    return res.status(400).json({ error: `Please enter your ${missingField}.` });
  }

  try {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'This email is not associated with an account. Please register to continue.' });
    }

    const user = result.rows[0]; //mostly used, dont delete
    const passwordMatch = await bcrypt.compare(password, user.password ) //true or false

    if (!passwordMatch) { //if false (password did not match)
      return res.status(401).json({error: `Incorrect Password`})
    }

//=================== JWT start ===================//
    const userPayload = { //data will come from here --> handleSubmit (setUser from Login)
      userId: user.user_id, //we turn them to camelCase coz we handle them in frontend
      schoolId: user.school_id, //these came from database, hence snake_case
      role: user.role,
      nameLNfirst: `${user.last_name}, ${user.first_name}`,
      nameFNfirst: `${user.first_name} ${user.last_name}`,
      lastName: user.last_name,
      firstName: user.first_name
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.LOCAL !== "true", //for local testing false, devewlopment oki
      sameSite: process.env.LOCAL === "true" ? "Lax" : "None",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    });
//=================== JWT end ===================//

    // Send access token to frontend... this is where it starts
    res.status(200).json({ 
      message: "Login successful", 
      accessToken, 
      user: userPayload 
    });
  } catch (error) {
    console.error('Error Logging In', error);
    res.status(500).json({ error: 'Failed to Log in' });
  }
  
});

authRoutes.post('/logout', async (req, res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.LOCAL !== "true",
      path: "/",
      sameSite: process.env.LOCAL === "true" ? "Lax" : "None"
    });

    res.status(200).json({ message: "Logged out" });
})

  









































//FOR FORGOT PASSWORD WHEN LOGGED OUT
//send request otp only
authRoutes.post('/forgot-password/request-otp', async (req, res) => {
  const { email } = req.body; //inputted new password

  try {
    const result = await db.query(`
      SELECT user_id, school_id 
      FROM users 
      WHERE email = $1`, [email]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found." });

    const user = result.rows[0];

    //generate OTP and send email
    const otp = await generateOTP(email, "forgot"); //wait for redis to store this
    await sendUserEmail({ email, token: otp, context: "forgot" }); //nodemailer

    //temporarily store user info in Redis (to auto-insert after verify)
    await redisClient.setEx(`pendingUser:${email}`, 
      300, 
      JSON.stringify({ user_id: user.user_id, school_id: user.school_id }));

    return res.status(200).json({ message: 'OTP sent. Verify to reset password.' });
  } catch (error) {
    console.error('Error Reset Password', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }

})


//verify otp 
authRoutes.post('/forgot-password/verify-otp', async (req, res) => {
  const { code, email } = req.body; //inputted new password

  try {
    //========== verify otp ==========//
    const isValid = await verifyOTP(email, code); //send to generateOTP.js
            console.log(`isValid: ${isValid}`)
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired code' })

    await redisClient.setEx(`verifiedEmail:${email}`, 300, "true");

    return res.status(201).json({ message: 'Email verified' });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    return res.status(500).json({ message: 'Server error during verification' });
  }
})


//check if verified and then we input new password
authRoutes.post('/forgot-password/reset', async (req, res) => {
  const { email, newPassword } = req.body; //inputted new password
  const userId = req.user.userId; 

  try {
    //check if verified flag exists in Redis
    const verified = await redisClient.get(`verifiedEmail:${email}`);
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      //At least 8 characters
      // At least one uppercase letter (A–Z)
      // At least one lowercase letter (a–z)
      // At least one number (0–9)
      // At least one special character (!@#$%^&*)

    if (!verified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." });
    }

    //password hashing
    const hash = await bcrypt.hash(newPassword, saltRounds);

    //updating password to database
    await db.query(`
      UPDATE users 
      SET password = $1
      WHERE email = $2
      RETURNING *`, 
      [hash, email]); //changed password to hash (hashed password)
    
    await logAction(userId, `Updated user info`, userId);
      
    await redisClient.del(`verifiedEmail:${email}`);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    return res.status(500).json({ message: 'Server error during verification' });
  }
})

















































//FOR FORGOT PASSWORD WHEN LOGGED IN
//verify and confirm reset password
authRoutes.post('/forgot-password/reset-password/:userId/:schoolId', async(req, res) => {
  const { userId, schoolId } = req.params;
  const { code } = req.body;
  const email = `${schoolId}@pampangastateu.edu.ph`;
  
  try {
    const result = await db.query(`
      SELECT user_id, school_id FROM users WHERE user_id = $1 AND school_id = $2`, [userId, schoolId]);

    if (result.rows.length === 0) return res.status(404).json({ message: "User not found." });
    
    const isValid = await verifyOTP(email, code); //send to generateOTP.js
            console.log(`isValid: ${isValid}`)
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired code' });

    const userDataRaw = await redisClient.get(`pendingUser:${email}`);
    if (!userDataRaw) return res.status(400).json({ message: 'No password input found' });

    const { hash } = JSON.parse(userDataRaw);

    //registering details to database
    await db.query(
      `UPDATE users
        SET password = $1
        WHERE user_id = $2
          AND school_id = $3 RETURNING *`,
      [hash, userId, schoolId]);
    
    //log
    await logAction(userId, `Updated password`, schoolId);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found or school ID mismatch." });
    }
    
    await redisClient.del(`pendingUser:${email}`); //delete temporary user info

    return res.status(201).json({ message: "Reset successfully." });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    return res.status(500).json({ message: 'Server error during verification' });
  }
});


//verify passwordMatch - only used in frontend
authRoutes.post('/verify/current-password', verifyJWT, async (req, res) => {
  // const { userId } = req.params;
  const userId = req.user.userId; 
  const { currentPassword } = req.body;

  if (!currentPassword) return res.status(400).json({ error: 'Please enter your current password' });

  try {
    const result = await db.query(`SELECT password FROM users WHERE user_id = $1`, [userId]);
    //console.log(result)
    if (result.rows.length === 0) return res.status(404).json({ error: 'User does not exist' });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) return res.status(401).json({ error: 'Incorrect Password' });
    console.log(res.status)

    return res.status(200).json({ passwordMatch: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

//verify if passwordMatch before changing password
authRoutes.post('/change/current-password/:userId', async(req, res) => {
  console.log("sumabit")
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  console.log("sumabit: ", currentPassword)
  console.log("sumabit: ", newPassword)

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  if (!currentPassword) return res.status(400).json({ error: 'Please enter your current password' });
  if (!newPassword) return res.status(400).json({ error: 'Please enter your new password' });
  
  try {
    const result = await db.query(`SELECT password FROM users WHERE user_id = $1`, [userId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'User does not exist' });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password ) //true or false

    if (!passwordMatch) { //if false (password did not match)
      return res.status(401).json({error: `The current password you entered is incorrect.`});
    }

    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ error: "New password cannot be the same as your current password." });
    }

    const hash = await bcrypt.hash(newPassword, saltRounds);
    
    await db.query (`UPDATE users SET password = $1 WHERE user_id = $2`, [hash, userId]);

    return res.status(200).json({ message: "Password changed successfully"});
  } catch (error) {
    console.error('Error changing password', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});


export default authRoutes;
