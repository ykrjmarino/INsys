import {db} from '../../db.js';
import { logAction } from '../../utils/logAction.js'

export const updateSectionTakers = async (req, res) => {
  const { examId } = req.params;
  const { sections } = req.body; // [{ id, name }, ...]

  if (!Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ error: "At least one section is required" });
  }

  try {
    await db.query("BEGIN");

    // 1. Delete old assignments for this exam
    await db.query("DELETE FROM section_takers WHERE exam_id = $1", [examId]);

    // 2. Insert new selections
    for (const s of sections) {
      await db.query(
        `INSERT INTO section_takers (exam_id, section_name, section_id, is_finalized)
         VALUES ($1, $2, $3, false)`,
        [examId, s.name, s.id]
      );
    }

    await db.query("COMMIT");

    res.status(200).json({ message: "Section takers updated" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error updating section takers", error);
    res.status(500).json({ error: "Failed to update section takers" });
  }
};

export const updateExamStatus = async(req, res) => {
  const { examId } = req.params;
  const { status } = req.body;
  const userId = req.user.userId; 

  try {
    const result = await db.query("UPDATE examinations SET status = $1 WHERE exam_id = $2 RETURNING *", [status, examId]);

    if(result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    //log the action
    await logAction(userId, `Published Exam: ${examId}`, examId);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating exam status', error);
    res.status(500).json({ error: 'Failed to update exam status' });
  }
}

export const updateExamTimer = async(req, res) => {
  const { examId } = req.params;
  const { exam_duration } = req.body;

  try {
    const result = await db.query ("UPDATE examinations SET exam_duration = $1 WHERE exam_id = $2 RETURNING *", [exam_duration, examId]);

    if(result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating exam duration timer', error);
    res.status(500).json({ error: 'Failed to update exam timer' });
  }
}

export const updateExamDetails = async(req, res) => {
  const { examId } = req.params;
  const userId = req.user.userId;
  const { title, exam_duration, status, passing_score, total_points } = req.body;

  try {
    const fields = [];
    const values = [];
    let count = 1; //SQL placeholders start at $1 (not $0)

    if (title) { //if exists = edited/patch
      fields.push(`title = $${count++}`); //count = 1, then → increment count = 2
      values.push(title);
    }
    // if (schedule) {
    //   fields.push(`schedule = $${count++}`); //count = 2, then count = 3
    //   values.push(schedule);
    // }
    if (status) {
      fields.push(`status = $${count++}`); //count = 3, then count = 4
      values.push(status);
    }
    if (exam_duration) {
      fields.push(`exam_duration = $${count++}`); //count = 4, then count = 5
      values.push(exam_duration);
    }
    if (passing_score !== undefined) {
      fields.push(`passing_score = $${count++}`);
      values.push(passing_score);
    }
    if (total_points !== undefined) {
      fields.push(`total_points = $${count++}`);
      values.push(total_points);
    }
    
    if (fields.length === 0) {
      return res.status(404).json({ message: "Exam not found or unauthorized" });
    }

    const examIdCount = count++;
    const userIdCount = count;

    //WHERE clause values
    values.push(examId);
    values.push(userId);
      
      
    //fields = ["title = $1", "exam_duration = $2"]
      
    const query = 
    `UPDATE examinations 
    SET ${fields.join(", ")} 
    WHERE exam_id = $${examIdCount} 
      AND user_id = $${userIdCount} RETURNING *`;

      //query = $1 $2 $3 $4 
            //fields have $1 and $2
            //exam_id have $3
            //user_id have $4
      //values = [title, exam_duration, examId]

    const result = await db.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating exam details", error);
    res.status(500).json({ error: "Failed to update exam details" });
  }
}

export const updateExamCode = async(req, res) => {
  const { examId } = req.params;
  const randomExamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const result = await db.query("UPDATE examinations SET exam_code = $1 WHERE exam_id = $2 RETURNING *", [randomExamCode, examId]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating exam code", error);
    res.status(500).json({ error: "Failed to create exam code" });
  }
}

export const finalizeExamSchedule = async(req, res) => {
  const {examId} = req.params;
  const {scheduledDate, addExamDuration, sectionName, questionTimer} = req.body; 
        //scheduledDate here is a string... convert to date 

  // Validate scheduledDate
  if (!scheduledDate || isNaN(new Date(scheduledDate))) {
    return res.status(400).json({ error: "Invalid or missing scheduledDate" });
  }

  //parse date
  const startExamDateUTC = new Date(scheduledDate).toISOString(); //always ISO UTC string
  const durationMinutes = Number(addExamDuration) || 0;

  //calculate end date
  const endExamDateUTC = new Date(startExamDateUTC);
  endExamDateUTC.setMinutes(endExamDateUTC.getMinutes() + durationMinutes);

  const dateNow = new Date();
  const shouldFinalize = dateNow >= endExamDateUTC; //true or false
  //we compare numbers (date) Unix Epoch
      /*
      example: it's been 1758103200000 milliseconds since Jan 1, 1970 UTC
      It’s a timestamp (called the Unix Epoch).

      so the bigger the number--- much later in time
      */

  try {
    const timerValue = Number(questionTimer) > 0 ? Number(questionTimer) : null;

    const result = await db.query(`
      UPDATE examinations
      SET start_datetime = $1,
          exam_duration = $2,
          end_datetime = $3,
          timer_question = $4
      WHERE exam_id = $5
      RETURNING *`, 
      [startExamDateUTC, addExamDuration, endExamDateUTC.toISOString(), timerValue || 0, examId]);


      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No matching section or exam found" });
      }

      await db.query(`
        UPDATE section_takers
        SET is_finalized = $1
        WHERE exam_id = $2
          AND section_name = $3`, [shouldFinalize, examId, sectionName])

      res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating finalized schedule", error);
    res.status(500).json({ error: "Failed to update finalized timer schedule" });
  }
}


export const archiveExam = async (req, res) => { 
  const { examId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await db.query(`
      UPDATE examinations
      SET is_archived = true
      WHERE exam_id = $1
        AND user_id = $2 RETURNING *` , [examId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    await logAction(userId, `Archived their exam: ${examId}`, userId);

    res.status(200).json({ message: "Exam archived successfully" }); 
  } catch (err) {
    console.error("archiveExam failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const unarchiveExam = async (req, res) => { 
  const { examId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await db.query(`
      UPDATE examinations
      SET is_archived = false
      WHERE exam_id = $1
        AND user_id = $2 RETURNING *` , [examId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    await logAction(userId, `Unarchived their exam: ${examId}`, userId);

    res.status(200).json({ message: "Exam unarchived successfully" }); 
  } catch (err) {
    console.error("unarchiveExam failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};