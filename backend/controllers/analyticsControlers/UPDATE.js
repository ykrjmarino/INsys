import {db} from '../../db.js';
import bcrypt from 'bcryptjs';
import { logAction } from '../../utils/logAction.js';

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  let { first_name, last_name, school_id, email, password, role } = req.body;
  
  const firstName = first_name;
  const lastName = last_name;
  const schoolId = school_id;
  
  try {
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    //password hashing uwu
    if (!strongPassword.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    //registering details to database
    await db.query(`
      INSERT INTO users (email, password, first_name, last_name, school_id, gender, college, role ) VALUES ($1, $2, $3 ,$4 ,$5 ,$6 ,$7, $8) RETURNING *
    `, [email, hash, firstName, lastName, schoolId, userGender, college, 'student']); //changed password to hash (hashed password)

    await redisClient.del(`verifiedEmail:${email}`);//delete temporary user info
    return res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("updateUser failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};