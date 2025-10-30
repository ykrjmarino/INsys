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

export const updateDeduction = async (req, res) => {
  const { examId, studentId } = req.params;
  const { deduction } = req.body;

  try {
    // 1️⃣ Get current scores
    const result = await db.query(
      `SELECT objective_score, essay_score FROM student_scores 
       WHERE exam_id = $1 AND student_school_id = $2`,
      [examId, studentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student score not found" });
    }

    const { objective_score, essay_score } = result.rows[0];
    const total_score = (objective_score || 0) + (essay_score || 0) - deduction;

    // 2️⃣ Update the deduction and total_score
    await db.query(
      `UPDATE student_scores 
       SET deduction = $1, total_score = $2 
       WHERE exam_id = $3 AND student_school_id = $4`,
      [deduction, total_score, examId, studentId]
    );

    res.status(200).json({ message: "Deduction updated", total_score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update deduction" });
  }
};