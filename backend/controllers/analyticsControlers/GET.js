import {db} from '../../db.js';

export const getExamAnalytics = async(req, res) =>{
  const { examId } = req.params;

  try {
    // 1️⃣ Fetch exam info (even if no students)
    const examInfo = await db.query(`
      SELECT 
        exam_id,
        title,
        status,
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
        ss.section_name AS student_section_name,
        ss.is_submitted,
        ss.submitted_at,
        e.total_points,
        e.passing_score,
        e.exam_id,
        CASE 
          WHEN ss.total_score >= e.passing_score THEN 'Passed'
          ELSE 'Failed'
        END AS result
      FROM student_scores ss
      JOIN users u ON ss.student_school_id = u.school_id
      JOIN section_takers st ON ss.exam_id = st.exam_id AND ss.section_name = st.section_name
      JOIN examinations e ON ss.exam_id = e.exam_id
      WHERE ss.exam_id = $1
    `, [examId]);

    // 3️⃣ Count total assigned
    const overallStats = await db.query(`
      SELECT 
        COUNT(ss.student_school_id) AS total_takers,
        COALESCE(ROUND(AVG(ss.total_score)::numeric, 2), 0) AS average_score,
        COALESCE(MAX(ss.total_score), 0) AS highest_score,
        COALESCE(MIN(ss.total_score), 0) AS lowest_score,
        COUNT(CASE WHEN ss.total_score >= e.passing_score THEN 1 END)::int AS passed_count,
        COUNT(CASE WHEN ss.total_score < e.passing_score THEN 1 END)::int AS failed_count
      FROM student_scores ss
      INNER JOIN examinations e ON e.exam_id = ss.exam_id
      WHERE ss.exam_id = $1
    `, [examId]);
    // const overallStats = await db.query(`
    //   SELECT 
    //     COUNT(ss.student_school_id) AS total_takers,
    //     COALESCE(ROUND(AVG(ss.total_score)::numeric, 2), 0) AS average_score,
    //     COALESCE(MAX(ss.total_score), 0) AS highest_score,
    //     COALESCE(MIN(ss.total_score), 0) AS lowest_score
    //   FROM student_scores ss
    //   WHERE ss.exam_id = $1`, [examId]
    // );

    // 4️⃣ Combine results
    const response = {
      exam: examInfo.rows[0],
      students: studentInfo.rows,
      overall_stats: overallStats.rows[0] || {
        total_takers: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0
      }
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

export const getSectionAnalytics = async(req, res) => {
  const { examId } = req.params;     // ← from URL path
  const { section } = req.query; 

  console.log('getExam ID:', examId);
  console.log('getSection ID:', section);

  try {
    const result = await db.query(`
      SELECT 
        st.section_name,
        COUNT(ss.student_school_id) AS total_takers,
        COALESCE(ROUND(AVG(ss.total_score)::numeric, 2), 0) AS average_score,
        COALESCE(MAX(ss.total_score), 0) AS highest_score,
        COALESCE(MIN(ss.total_score), 0) AS lowest_score,
        COUNT(*) FILTER (WHERE ss.total_score >= (SELECT passing_score FROM examinations WHERE exam_id = $1)) AS passed_count,
        COUNT(*) FILTER (WHERE ss.total_score <  (SELECT passing_score FROM examinations WHERE exam_id = $1)) AS failed_count
      FROM student_scores ss
      JOIN section_takers st 
        ON st.exam_id = ss.exam_id 
        AND st.section_name = ss.section_name 
      WHERE ss.exam_id = $1
        AND st.section_id = $2              
      GROUP BY st.section_name
      ORDER BY st.section_name ASC;`
      , [examId, section]);

    /*
    {
      "section_name": BSIT 2-A
      "average_score": 82.5,
      "highest_score": 98,
      "lowest_score": 65,
      "total_takers": 10
    }
      
    `SELECT 
        st.section_name,
        COUNT(ss.student_school_id) AS total_takers,
        COALESCE(ROUND(AVG(ss.total_score)::numeric, 2), 0) AS average_score,
        COALESCE(MAX(ss.total_score), 0) AS highest_score,
        COALESCE(MIN(ss.total_score), 0) AS lowest_score
      FROM student_scores ss
      JOIN section_takers st 
        ON st.exam_id = ss.exam_id 
        AND st.section_name = ss.section_name 
      WHERE ss.exam_id = $1
        AND st.section_id = $2              
      GROUP BY st.section_name
      ORDER BY st.section_name ASC;
    `
    */

    if (result.rows.length === 0) {
      return res.json({
        section_name: null,
        total_takers: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("getSectionAnalytics failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllAnalytics = async(req, res) => { //used by superadmin

  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM examinations) AS total_exams,
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'superadmin') AS total_superadmins,
        (SELECT COUNT(*) FROM users) AS total_users
    `);

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("getAllAnalytics failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminExamAnalytics = async(req, res) => { //used by superadmin
  const role = 'admin'

  try {
    const result = await db.query(`
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.school_id,
        u.role,
        u.email,
        COUNT(e.exam_id) AS total_exams
      FROM users u
      LEFT JOIN examinations e ON e.user_id = u.user_id
      WHERE u.role = $1
      GROUP BY u.user_id
      ORDER BY u.last_name ASC;
    `, [role]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("getAdminExamAnalytics failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSystemLogs = async (req, res) => { //used by superadmin
  try {
    const result = await db.query(`
      SELECT sl.id, u.first_name, u.last_name, sl.action, sl.target_id, sl.created_at
      FROM system_logs sl
      JOIN users u ON sl.user_id = u.user_id
      ORDER BY sl.created_at DESC
      LIMIT 50
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getSystemLogs failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => { //used by superadmin
  const { role } = req.query;
  try {
    const result = await db.query(`
       SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.school_id,
        u.role,
        u.email
      FROM users u
      WHERE u.role = $1
      ORDER BY u.last_name ASC;
    `, [role]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getStudents failed:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuestionAnalytics = async (req, res) => {
  const userId = req.user.userId; 
  const { examId } = req.params;
  try {
    const questionsRes = await db.query(
      `SELECT question_id, question_text, points
       FROM questions
       WHERE exam_id = $1 AND user_id = $2`,
      [examId, userId]
    );

    const answersRes = await db.query(
      `SELECT question_id, is_correct
       FROM student_answers
       WHERE exam_id = $1`,
      [examId]
    );

    const questions = questionsRes.rows;
    const answers = answersRes.rows;

    const perQuestionStats = questions.map(q => {
      const questionAnswers = answers.filter(a => a.question_id === q.question_id);
      const correctCount = questionAnswers.filter(a => a.is_correct).length;
      const attemptedCount = questionAnswers.length;

      /*
      [
        {
          "question_id": 1,
          "question_text": "What is 2 + 2?",
          "correctCount": 8,
          "attemptedCount": 10,
          "accuracy": 80
        }
      ]
      */

      return {
        points: q.points,
        question_id: q.question_id,
        question_text: q.question_text,
        correctCount,
        attemptedCount,
        accuracy: attemptedCount
          ? Number(((correctCount / attemptedCount) * 100).toFixed(2))
          : 0
      };
    });

    res.json(perQuestionStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

