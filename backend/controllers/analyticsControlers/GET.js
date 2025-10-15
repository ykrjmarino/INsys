import {db} from '../../db.js';

export const getExamAnalytics = async(req, res) =>{
  const studentId = req.user.schoolId;
  const { examId } = req.params;

  try {
    const result = await db.query(`
      SELECT
        e.exam_id, e.title, e.total_points,
        (u.first_name || ' ' || u.last_name) AS teacher_name_db,
        s.section_name, s.submitted_at, s.total_score,
        ( SELECT COUNT(*) 
          FROM questions q
          WHERE q.exam_id = e.exam_id
        ) AS total_questions
      FROM student_scores s
      JOIN examinations e ON s.exam_id = e.exam_id
      JOIN users u ON e.user_id = u.user_id
      WHERE e.exam_id = $1 
        AND s.student_school_id = $2
      `, [examId, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({error: 'No Exam detail fetched'})
    }
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error getting exam details:', error);
    res.status(500).json({ error: error.details || 'Failed to get exam detail' });
  }
} 
    