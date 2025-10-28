import {db} from '../../db.js';
import bcrypt from 'bcryptjs';
import { logAction } from '../../utils/logAction.js';

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const actorId = req.user.userId;
  let { first_name, last_name, school_id, email, password, role } = req.body;

  try {
    const saltRounds = 5;
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (password && password.trim() !== "") {
      if (!strongPassword.test(password)) {
        return res.status(400).json({
          error:"Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character."});
      }

      const hash = await bcrypt.hash(password, saltRounds);
      await db.query(`
        UPDATE users
        SET first_name = $1, last_name = $2, school_id = $3, email = $4, password = $5, role = $6
        WHERE user_id = $7`
      , [first_name, last_name, school_id, email, hash, role, userId]
      );
    } else {
      await db.query(`
        UPDATE users
        SET first_name = $1, last_name = $2, school_id = $3, email = $4, role = $5
        WHERE user_id = $6`
      , [first_name, last_name, school_id, email, role, userId]
      );
    }
    await logAction(actorId, `Updated user information: ${userId}`, userId);

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("updateUser failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};