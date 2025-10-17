import {db} from '../../db.js';

export const getExamAnalytics = async(req, res) =>{
  const { examId } = req.params;

  try {
    //we'll use: title, start_datetime, end_datetime, total_points, passing_score, exam_type
    const result = await db.query(` 
      SELECT * FROM examinations
      WHERE exam_id = $1
        AND status = 'completed'`
    , [examId]);

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
    