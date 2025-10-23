import {db} from '../../db.js';

export const postViolation = async (req, res) => {
  const { examId, studentId } = req.params;
  const { session_id, event_type, severity, details } = req.body;

  try {
    const result = await db.query(`
      INSERT INTO exam_monitoring 
        (exam_id, student_school_id, session_id, event_type, severity, details)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`
      , [examId, studentId, session_id, event_type, severity, details]
    );

    console.log("Violation saved to database~");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving violation:", error.message);
    res.status(500).json({ error: "Failed to save violation" });
  }
};