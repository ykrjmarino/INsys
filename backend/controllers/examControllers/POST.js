import {db} from '../../db.js';
import { logAction } from '../../utils/logAction.js'

export const createExam = async(req, res) => {
  const userId = req.user.userId;
  const { title, status } = req.body //add section_takers and subj code next time
  const randomExamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const result = await db.query('INSERT INTO examinations (title, status, exam_code, user_id) VALUES($1, $2, $3, $4) RETURNING *', [title, status, randomExamCode, userId]
    );

    const examId = result.rows[0].exam_id;
    await db.query(
      `INSERT INTO section_takers (exam_id, section_id, section_name)
      SELECT 
        $1, 
        s.section_id, 
        c.course_code || ' ' || y.year_number || '-' || s.section_name
      FROM sections s
      JOIN courses c ON s.course_id = c.course_id
      JOIN year_levels y ON s.year_level_id = y.year_level_id
      WHERE s.course_id = 1 AND s.year_level_id = 1 AND s.section_name = 'A'`,
      [examId]
    );

    //logs
    await logAction(userId, `Created exam: "${result.rows[0].title}"`, result.rows[0].exam_id);

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error cant CREATE exams', error)
    res.status(500).json({error: 'Failed to CREATE exam'});
  }
}


export const duplicateExam = async (req, res) => { //duplicate title and questions only
  const { examId } = req.params; //original exam_id
  const userId = req.user.userId;
  const randomExamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    //Fetch original exam
    const examResult = await db.query( //will get: examResult.rows[0].title
      `SELECT title, passing_score
       FROM examinations 
       WHERE exam_id = $1`,
      [examId]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({ error: 'Original exam not found' });
    }

    //Create new exam
    const newExamResult = await db.query(
      `INSERT INTO examinations (user_id, title, status, exam_code, passing_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING exam_id`,
      [userId, `${examResult.rows[0].title} copy`, 'draft', randomExamCode, examResult.rows[0].passing_score]
    );

    const newExamId = newExamResult.rows[0].exam_id;


    // //Duplicate sections
    // await db.query(
    //   `INSERT INTO section_takers (exam_id, section_name, is_finalized)
    //    SELECT $1, section_name, is_finalized
    //    FROM section_takers
    //    WHERE exam_id = $2`,
    //   [newExamId, examId]
    // );

    // //Duplicate date and time
    // await db.query(
    //   `INSERT INTO section_takers (exam_id, section_name, start_datetime, end_datetime, timer_minutes, is_finalized)
    //    SELECT $1, section_name, start_datetime, end_datetime, timer_minutes, is_finalized
    //    FROM section_takers
    //    WHERE exam_id = $2`,
    //   [newExamId, examId]
    // );


    //Duplicate questions
    await db.query(
      `INSERT INTO questions (exam_id, user_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, points)
       SELECT $1, user_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, points
       FROM questions
       WHERE exam_id = $2`,
      [newExamId, examId]
    );

    //Recalculate total points
    await db.query(`
      UPDATE examinations 
      SET total_points = (
        SELECT COALESCE(SUM(points), 0)
        FROM questions 
        WHERE exam_id = $1
      )
      WHERE exam_id = $1
    `, [newExamId]);

    //Insert section (default: BSIT 1-A)
    await db.query(`
      INSERT INTO section_takers (exam_id, section_id, section_name)
      SELECT 
        $1, 
        s.section_id, 
        c.course_code || ' ' || y.year_number || '-' || s.section_name
      FROM sections s
      JOIN courses c ON s.course_id = c.course_id
      JOIN year_levels y ON s.year_level_id = y.year_level_id
      WHERE s.course_id = 1 AND s.year_level_id = 1 AND s.section_name = 'A'
    `, [newExamId]);

    res.status(201).json({ message: 'Exam duplicated successfully', newExamId });
  } catch (error) {
    console.error('Error duplicating exam:', error);
    res.status(500).json({ error: 'Failed to duplicate exam' });
  }
};
