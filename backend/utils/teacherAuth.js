import express from "express";
import bcrypt from 'bcryptjs';
import {db} from '../db.js';
import { generateOTP, verifyOTP } from "./otp.js";
import { sendUserEmail } from "./nodemailer.js";
import redisClient from "./redisClient.js";

const teacherAuthRoutes = express.Router();
const saltRounds = 5;

teacherAuthRoutes.post ('/register/email-otp', async(req, res) => { //email input
  const { username, schoolId } = req.body;
  const email = `${username}@pampangastateu.edu.ph`;

  if (!username) return res.status(400).json({ error: 'Missing username' });

  if (/^\d+$/.test(username)) return res.status(400).json({ error: "Students cannot use this route." }); //if username have number in it, not allowed to register here

  try {
    //check email if used or not
    const checkEmail = await db.query (`SELECT * FROM users WHERE email = $1`, [email]);
    //check school_id if used or not
    const checkSchoolId = await db.query (`SELECT * FROM users WHERE school_id = $1`, [schoolId]);

    if (checkEmail.rows.length > 0) return res.status(400).json({error: 'Email is already used. Proceed to Log-In'})
    if (checkSchoolId.rows.length > 0) return res.status(400).json({error: 'School ID already used.'})

    //generate OTP and send email
    const otp = await generateOTP(email, "register"); //wait for redis to store this
    await sendUserEmail({ email, token: otp, context: "register" }); //nodemailer

    res.status(201).json({ 
      message: "OTP sent to email.",
      isItSent: true,
    });
  } catch (error) {
    console.error('Error Verifying Email', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
})

teacherAuthRoutes.post('/register/verify-otp', async (req, res) => { //verify code only
  const { code, username } = req.body; //code from input ni user so we can compare sa generateOTP.js
  const email = `${username}@pampangastateu.edu.ph`;
  
  if (!username || !code) return res.status(400).json({ error: 'Missing username or code' });
  if (!email) return res.status(400).json({ error: 'Invalid or expired code' });

  try {
    const isValid = await verifyOTP(email, code); //send to generateOTP.js
            console.log(`isValid: ${isValid}`)
    if (!isValid) return res.status(400).json({ error: 'Invalid or expired code' })

    await redisClient.setEx(`verifiedEmail:${email}`, 300, "true");
    console.log(`verifiedEmail:${email}`)
    return res.status(200).json({ message: "Email verified." });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});

teacherAuthRoutes.post ('/register/user-info', async(req, res) => { //complete input user data
  let { username, schoolId, password, firstName, lastName, middleInitial } = req.body;
  const email = `${username}@pampangastateu.edu.ph`;
  
  // capitalize first letter of first and last name
  firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  middleInitial = middleInitial.toUpperCase();
  //optional
  const {userGender, college} = req.body;

  if (!username) return res.status(400).json({ error: 'Missing username' });
  if (!schoolId) return res.status(400).json({ error: 'Missing school ID' });

  try {
    //check school_id if used or not
    const checkSchoolId = await db.query (`SELECT * FROM users WHERE school_id = $1`, [schoolId]);
    if (checkSchoolId.rows.length > 0) return res.status(400).json({error: 'School ID already used.'})

    //check email if used or not
    const checkEmail = await db.query (`SELECT * FROM users WHERE email = $1`, [email]);

    if (checkEmail.rows.length > 0) return res.status(400).json({error: 'Email is already used. Proceed to Log-In'})

    const verified = await redisClient.get(`verifiedEmail:${email}`);
    if (!verified) {
      return res.status(403).json({ error: "Email not verified. Try refreshing the page" });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    //password hashing uwu
    if (!strongPassword.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    //temporarily store user info in Redis (optional,, to auto-insert after verify)
    await redisClient.setEx(`pendingUser:${email}`, 300, JSON.stringify({ hash, firstName, lastName, userGender, college, schoolId }));

    //registering details to database
    await db.query(`
      INSERT INTO users (email, password, first_name, last_name, school_id, gender, college, role ) VALUES ($1, $2, $3 ,$4 ,$5 ,$6 ,$7, $8) RETURNING *
    `, [email, hash, firstName, lastName, schoolId, userGender, college, 'admin']); //changed password to hash (hashed password)

    await redisClient.del(`verifiedEmail:${email}`);//delete temporary user info
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error Registering', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

export default teacherAuthRoutes;






