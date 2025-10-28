import {db} from '../../db.js';
import bcrypt from 'bcryptjs';
import { logAction } from '../../utils/logAction.js';

export const createUser = async (req, res) => {
  const actorId = req.user.userId
  const { userId } = req.params;
  let { first_name, last_name, school_id, password, role, email } = req.body;

  if (!school_id) return res.status(400).json({ error: 'Missing school ID' });

  try {
    const saltRounds = 5;
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    //check email if used or not
    const checkEmail = await db.query (`SELECT * FROM users WHERE email = $1`, [email]);

    //check school_id if used or not
    const checkSchoolId = await db.query (`SELECT * FROM users WHERE school_id = $1`, [school_id]);

    if (checkEmail.rows.length > 0) return res.status(400).json({error: 'Email is already used.'})

    if (checkSchoolId.rows.length > 0) return res.status(400).json({error: 'School ID already used.'})

    if (!strongPassword.test(password)) return res.status(400).json({error:"Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character."});

    const hash = await bcrypt.hash(password, saltRounds);
    
    await db.query(`
      INSERT INTO users (email, password, first_name, last_name, school_id, role ) VALUES ($1, $2, $3 ,$4 ,$5 ,$6) RETURNING *
    `, [email, hash, first_name, last_name, school_id, role]); //changed password to hash (hashed password)

    await logAction(actorId, `Created an account`, school_id);

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
  console.error("updateUser failed:", err.message);
  res.status(500).json({ error: err.message });
  }
};

    