import {db} from '../../db.js';

export const getExamAnalytics = async(req, res) =>{
  const { examId } = req.params;

  try {
    /*
    {
      exam: { exam_id, title, status, exam_type, ... },
      students: [ { first_name, last_name, total_score, ... } ]
    }
    */
    // 1️⃣ Fetch exam info (even if no students)
    const examInfo = await db.query(`
      SELECT 
        exam_id,
        title,
        status,
        exam_type,
        total_points,
        passing_score,
        start_datetime,
        end_datetime
      FROM examinations
      WHERE exam_id = $1
    `, [examId]);

    if (examInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // 2️⃣ Fetch all student analytics (if any)
    const studentInfo = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.school_id,
        u.email,
        st.section_id, 
        st.section_name,
        ss.total_score,
        ss.objective_score,
        ss.essay_score,
        ss.section_name,
        ss.is_submitted,
        ss.submitted_at
      FROM student_scores ss
      JOIN users u ON ss.student_school_id = u.school_id
      JOIN section_takers st ON ss.exam_id = st.exam_id AND ss.section_name = st.section_name
      WHERE ss.exam_id = $1
    `, [examId]);

    // 3️⃣ Combine results
    const response = {
      exam: examInfo.rows[0],
      students: studentInfo.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting exam details:', error);
    res.status(500).json({ error: error.details || 'Failed to get exam detail' });
  }
} 

export const getStudentAnalytics = async(req, res) =>{//for essay answer
  const { examId, studentId } = req.params;
  
  try {
    const result = await db.query(` 
      SELECT 
        q.question_id,
        q.question_text,
        q.question_type,
        sa.student_answer AS objective_answer,
        ea.student_answer AS essay_answer,
        ea.essay_score
      FROM exam_sessions es
      LEFT JOIN questions q ON q.exam_id = es.exam_id
      LEFT JOIN student_answers sa ON sa.question_id = q.question_id AND sa.session_id = es.session_id
      LEFT JOIN essay_answers ea ON ea.question_id = q.question_id AND ea.session_id = es.session_id
      WHERE es.exam_id = $1
        AND es.student_school_id = $2;`
    , [examId, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({error: 'No Answers fetched for this student'})
    }

    /* this will be the result
    [
      {
        "question_id": 1,
        "question_text": "What is the capital of France?",
        "question_type": "multiplechoice",
        "objective_answer": "Paris",
        "essay_answer": null,
        "essay_score": null
      },
      {
        "question_id": 2,
        "question_text": "Explain the importance of photosynthesis.",
        "question_type": "essay",
        "objective_answer": null,
        "essay_answer": "It allows plants to produce energy and oxygen.",
        "essay_score": 10
      },
      {
        "question_id": 3,
        "question_text": "2 + 2 = ?",
        "question_type": "multiplechoice",
        "objective_answer": "4",
        "essay_answer": null,
        "essay_score": null
      }
    ]
    */
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error getting answers:', error);
    res.status(500).json({ error: error.details || 'Failed to get answers for this student' });
  }
} 
    