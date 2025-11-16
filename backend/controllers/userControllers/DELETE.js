import {db} from '../../db.js'
import { logAction } from '../../utils/logAction.js';

export const deleteOwnAccount = async(req, res) => { //will not be used... use archiveOwnAccount instead
  const userId = req.user.userId;

  try {
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await logAction(req.user.userId, `Deleted own account`, userId);

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("deleteOwnAccount failed:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export const archiveOwnAccount = async (req, res) => {
  const userId = req.user.userId;

  try {
    const userResult = await db.query(`
      UPDATE users
      SET is_archived = true
      WHERE user_id = $1 RETURNING *` , [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await logAction(req.user.userId, `Disabled own account: ${userId}`, userId);

    res.status(200).json({ message: "Disabled account successfully" });
  } catch (err) {
    console.error("archiveOwnAccount failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};