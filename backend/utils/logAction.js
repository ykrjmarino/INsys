import { db } from "../db.js"; 

/**
 * Logs an action in system_logs
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Description of the action
 * @param {number|null} targetId - ID of the affected record (exam, user, etc.)
*/
export const logAction = async (userId, action, targetId = null) => {
  try {
    await db.query(
      `INSERT INTO system_logs (user_id, action, target_id) VALUES ($1, $2, $3)`,
      [userId, action, targetId]
    );
  } catch (err) {
    console.error("logAction failed:", err.message);
  }
};

/*


  const userId = req.user.userId; 

  // Creating an exam
  const result = await db.query(
    `INSERT INTO exams (title, created_by) VALUES ($1, $2) RETURNING *`,
    [title, user.user_id]
  );
  await logAction(userId, `Created exam: ${result.rows[0].title}`, result.rows[0].exam_id);

  // Publishing an exam
  await db.query(`UPDATE exams SET status = 'published' WHERE exam_id = $1`, [examId]);
  await logAction(userId, `Published exam: ${examId}`, examId);

  // Updating a user role
  await db.query(`UPDATE users SET role = $1 WHERE user_id = $2`, [newRole, targetUserId]);
  await logAction(userId, `Changed user role to ${newRole}`, targetUserId);

  //Updating password (own)
  await logAction(userId, `Updated password`, schoolId);
*/