import {db} from '../../db.js';

export const postViolation = async (req, res) => {
  const {examId} = req.params;
  const studentId = req.user.schoolId;
  const { event_type, is_warning, details } = req.body; // default to 0 if not tied to a specific question
  let session_id;

  try {

    // 1️⃣ If frontend didn't send one, find an active session
    if (!session_id) {
      const existingSession = await db.query(
        `SELECT session_id FROM exam_sessions 
        WHERE exam_id = $1 AND student_school_id = $2 
        AND status = 'in-progress'
        ORDER BY started_at DESC LIMIT 1`,
        [examId, studentId]
      );
      

      // 2️⃣ If no active session, create one
      if (existingSession.rows.length === 0) {
        const newSession = await db.query(
          `INSERT INTO exam_sessions (exam_id, student_school_id)
          VALUES ($1, $2)
          RETURNING session_id`,
          [examId, studentId]
        );
        session_id = newSession.rows[0].session_id;
      } else {
        session_id = existingSession.rows[0].session_id;
      }
    }

    const result = await db.query(
      `INSERT INTO exam_monitoring 
        (exam_id, student_school_id, session_id, event_type, is_warning, details)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [examId, studentId, session_id, event_type, is_warning, details]
    );

    console.log("Violation saved to database~");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving violation:", error.message);
    res.status(500).json({ error: "Failed to save violation" });
  }
};