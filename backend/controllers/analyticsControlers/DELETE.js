import {db} from '../../db.js';
import { logAction } from '../../utils/logAction.js'

export const archiveUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const userResult = await db.query(`
      UPDATE users
      SET is_archived = true
      WHERE user_id = $1 RETURNING *` , [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await logAction(req.user.userId, `Archived User: ${userId}`, userId);

    const examResult = await db.query(`
      UPDATE examinations
        SET is_archived = true
      WHERE user_id = $1 RETURNING *` 
      ,[userId]
    );

    if (examResult.rows.length > 0) {
      await logAction(req.user.userId, `Archived Exams of User: ${userId}`, userId);
    }

    res.status(200).json({ message: "User archived successfully" });
  } catch (err) {
    console.error("archiveUser failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await logAction(req.user.userId, `Deleted User: ${userId}`, userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};