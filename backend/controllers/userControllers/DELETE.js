import {db} from '../../db.js'
import { logAction } from '../../utils/logAction.js';

export const deleteOwnAccount = async(req, res) => {
  const userId = req.user.userId;

  try {
    await logAction(req.user.userId, `Deleted own account`, userId);
    
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("deleteOwnAccount failed:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
}