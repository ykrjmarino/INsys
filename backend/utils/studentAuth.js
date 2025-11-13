import express from "express";
import bcrypt from 'bcryptjs';
import {db} from '../db.js';
import { generateOTP, verifyOTP } from "./otp.js";
import { sendUserEmail } from "./nodemailer.js";
import redisClient from "./redisClient.js";

import passport from "passport";
import { Strategy } from "passport-local";
import { logAction } from "./logAction.js";

const studentAuthRoutes = express.Router();
const saltRounds = 5;

studentAuthRoutes.post ('/register/email-otp', async(req, res) => { //email input
  const {username} = req.body;
  const schoolId = username
  const email = `${schoolId}@pampangastateu.edu.ph`;

  if (!schoolId) return res.status(400).json({ error: 'Missing school ID' });

  if (!/^\d+$/.test(schoolId)) return res.status(400).json({ error: "Invalid username. Teachers cannot use this route." }); //only numbers allowed

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

studentAuthRoutes.post('/register/verify-otp', async (req, res) => { //verify code only
  const { code, username } = req.body; //code from input ni user so we can compare sa generateOTP.js
  const email = `${username}@pampangastateu.edu.ph`;
  
  if (!username || !code) return res.status(400).json({ error: 'Missing school ID or code' });

  if (!email) return res.status(400).json({ error: 'Invalid or expired code' });

  try {
    const isValid = await verifyOTP(email, code); //send to generateOTP.js
            console.log(`isValid: ${isValid}`)
    if (!isValid) return res.status(400).json({ error: 'Invalid or expired code' })

    await redisClient.setEx(`verifiedEmail:${email}`, 300, "true");
    return res.status(200).json({ message: "Email verified." });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});

studentAuthRoutes.post ('/register/user-info', async(req, res) => { //complete input user data
  //needed
  let { username, password, firstName, lastName, middleInitial } = req.body;
  const schoolId = username
  const email = `${schoolId}@pampangastateu.edu.ph`;

  // capitalize first letter of first and last name
  firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  middleInitial = middleInitial.toUpperCase();
  
  //optional
  const {userGender, college} = req.body;

  //check email if used or not
  const checkEmail = await db.query (`SELECT * FROM users WHERE email = $1`, [email]);

  if (checkEmail.rows.length > 0) return res.status(200).json({error: 'Email is already used. Proceed to Log-In'})

  const verified = await redisClient.get(`verifiedEmail:${email}`);
  if (!verified) {
    return res.status(403).json({ error: "Email not verified" });
  }

  try {
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
      INSERT INTO users (email, password, first_name, last_name, school_id, gender, college, role, middle_initial ) VALUES ($1, $2, $3 ,$4 ,$5 ,$6 ,$7, $8, $9) RETURNING *
    `, [email, hash, firstName, lastName, schoolId, userGender, college, 'student', middleInitial]); //changed password to hash (hashed password)

    await logAction(schoolId, `Registered new student: ${firstName} ${middleInitial}. ${lastName}`, schoolId);
    
    await redisClient.del(`verifiedEmail:${email}`);//delete temporary user info
    return res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error Registering', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});






//passport
/* 
authRoutes.post('/login', (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) { //login failed
      return res.status(401).json({ message: info?.error || "Login failed" });
    } 

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});

passport.use(
  new Strategy({ usernameField: 'email' }, async function verify(email, password, cb) {
    //no need to req.body email and inputPassword. passport automates it

    try {
      const checkLogin = await db.query(`
      SELECT * FROM users
      WHERE email = $1`, [email]);

      if (checkLogin.rows.length === 0) {
        return cb(null, false, { error: 'This email is not associated with an account. Please register to continue.' });
      }

      const user = checkLogin.rows[0];
      
      const passwordMatch = await bcrypt.compare(password, user.password ) //true or false

      if (!password || !user.password) {
        return cb(null, false, { error: 'Missing credentials. Please fill in the missing fields.' });
      }
      if (!passwordMatch) { //if false (password did not match)
        return cb(null, false, {error: `Incorrect Password`})
      }

      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
    // cb(null, user) → pass authentication
    // cb(null, false, { message }) → fail authentication
    // cb(error) → if an error occurred
  }
));

passport.serializeUser((user, cb) => { //runs after successful login
  cb(null, user)
})

passport.deserializeUser((user, cb) => { 
  cb(null, user)
})
*/


export default studentAuthRoutes;
