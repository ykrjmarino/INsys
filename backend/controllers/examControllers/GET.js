import {db} from '../../db.js';

export const getAllExams = async(req, res) =>{
  const userId = req.user.userId;
  try {
    const result = await db.query("SELECT * FROM examinations WHERE user_id = $1", [userId])
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error cant GET exams', error)
  }
} 

export const getAllExamsByTeacher = async(req, res) =>{
  const { teacherId } = req.params;
  const { filter } = req.query;
  try {
    const result = await db.query(`
      SELECT * FROM examinations 
      WHERE user_id = $1
        AND status ILIKE $2`, [teacherId, filter]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching completed exams by teacher', error);
    res.status(500).json({ message: "Server error" });
  }
} 

export const getQuestionsByExamId = async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT question_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, points 
      FROM questions 
      WHERE exam_id = $1
        AND user_id = $2`, 
      [examId, userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching questions by exam:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};



export const getExamsByTitle = async(req, res) => { //for searbar sorting
  const { title } = req.query;

  try {
    const result = await db.query("SELECT * FROM examinations WHERE title ILIKE $1", [`%${title}%`]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Searched exam not found' })
    }

    res.status(200).json(result.rows) //no [0] because there might be several results
  } catch (error) {
    console.error('Error searching exams by title', error);
    res.status(500).json({ error: 'Failed to search exams' });
  }
}

export const getExamById = async(req, res) => {
  const {examId} = req.params;
  try {
    const result = await db.query("SELECT * FROM examinations WHERE exam_id = $1", [examId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.status(200).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error cant GET exam', error)
    res.status(500).json({error: 'Failed to GET exam'});
  }
}

export const getExamsByStatus = async(req, res) => { //draft, published, on-going, completed
  const userId = req.user.userId;
  const { filter } = req.query;
  try {
    const result = await db.query(`
      SELECT * FROM examinations 
      WHERE user_id = $1
        AND status ILIKE $2`, [userId, filter]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error searching exams by status', error);
    res.status(500).json({ error: 'Failed to sort exams' });
  }
}

export const getExamCode = async(req, res) => {
  const { examId } = req.params;

  try {
    const result = await db.query("SELECT exam_code FROM examinations WHERE exam_id = $1", [examId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error cant get exam code', error);
    res.status(500).json({ error: 'Failed to get exam code' });
  }
}

export const getSectionTakersByExamId = async (req, res) => {
  const { examId } = req.params;
  const { courseCode } = req.query; //for fallback onli??

  console.log("examId:", examId, "courseCode:", courseCode);


  try {
    // 1️⃣ Try to get sections that actually have takers for this exam
    let result = await db.query(`
      SELECT DISTINCT 
        s.section_id, 
        s.section_name, 
        c.course_code, 
        y.year_number
      FROM section_takers st
      JOIN sections s ON st.section_id = s.section_id
      JOIN courses c ON s.course_id = c.course_id
      JOIN year_levels y ON s.year_level_id = y.year_level_id
      WHERE st.exam_id = $1
      ORDER BY c.course_code, y.year_number, s.section_name
    `, [examId]);

    // 2️⃣ If no takers found, fallback to showing at least one related section
    if (result.rows.length === 0 && courseCode) {
      console.warn("No linked sections found. Using fallback for", courseCode);
      const fallbackResult = await db.query(`
        SELECT 
          s.section_id,
          s.section_name,
          c.course_code,
          y.year_number
        FROM sections s
        JOIN courses c ON s.course_id = c.course_id
        JOIN year_levels y ON s.year_level_id = y.year_level_id
        WHERE c.course_code = $1
        ORDER BY y.year_number, s.section_name
        LIMIT 1
      `, [courseCode]);
      result = fallbackResult;
    }
    
    // let result = await db.query(`
    //   SELECT st.section_id, s.section_name, c.course_code, y.year_number
    //   FROM section_takers st
    //   JOIN sections s ON st.section_id = s.section_id
    //   JOIN courses c ON s.course_id = c.course_id
    //   JOIN year_levels y ON s.year_level_id = y.year_level_id
    //   WHERE st.exam_id = $1
    //   ORDER BY c.course_code, y.year_number, s.section_name
    // `, [examId]);

    // //fallback for new exam: no sections linked yet
    // if (result.rows.length === 0 && courseCode) {
    //   console.warn("No linked sections found. Using fallback for", courseCode);
    //   const fallbackResult = await db.query(
    //     `SELECT 
    //        s.section_id,
    //        s.section_name,
    //        c.course_code,
    //        y.year_number
    //      FROM sections s
    //      JOIN courses c ON s.course_id = c.course_id
    //      JOIN year_levels y ON s.year_level_id = y.year_level_id
    //      WHERE c.course_code = $1
    //       AND y.year_number = 1
    //      ORDER BY y.year_number, s.section_name
    //      LIMIT 1`, //only shows the first section by default
    //     [courseCode]
    //   );
    //   result = fallbackResult; // now safe
    // }

    res.status(200).json(result.rows); //section_id, section_name, course_code, year_number
  } catch (error) {
    console.error('Error getting section takers', error);
    res.status(500).json({ error: 'Failed to fetch section takers' });
  }
};

export const getAllScoresByExam = async(req, res) => {
  const {examId, sectionTaker } = req.params;
  try {
    const result = await db.query(`
      SELECT total_score, submitted_at, student_school_id, student_name, objective_score, essay_score 
      FROM student_scores WHERE exam_id = $1 AND section_name = $2`, [examId, sectionTaker]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid section' });
    }
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching section scores/info idk:', error);
    res.status(500).json({ error: 'Failed to fetch section scores' });
  }
}

export const getEssayPerStudent = async(req, res) => {
  const {examId, studentId } = req.params;
  try {
    /*
    {
      question_id: 136,
      question_text: 'Explain the difference between client-side and server-side scripting.',
      points: 3,
      student_answer: 'uwu',
      essay_score: 0
    }
    */
    const result = await db.query(
      `SELECT 
        q.question_id,
        q.question_text,
        q.points,
        e.student_answer,
        e.essay_score
      FROM questions q
      JOIN essay_answers e ON q.question_id = e.question_id 
      WHERE q.exam_id = $1 
        AND e.student_school_id = $2
        AND q.question_type = 'essay'`,
      [examId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid' });
    }
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching section scores/info idk:', error);
    res.status(500).json({ error: 'Failed to fetch section scores' });
  }
}

export const getExamSchedule = async(req, res) => { //for teacher side, to see ALL(sections) schedule in an exam
  const {examId} = req.params;

  try {
    const result = await db.query(`
      SELECT * 
      FROM examinations 
      WHERE exam_id = $1`
      , [examId]);
  
    if (result.rows.length === 0) return res.status(404).json({ error: "No matching exam found" })

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting finalized schedule", error);
    res.status(500).json({ error: "Failed to get exam schedule" });
  }
}

//checking for fetching status only
export const getExamSession = async(req, res) => { //includes: status: in-progress or submitted
  const {examId} = req.params;
  const studentId = req.user.schoolId;

  try {
    const result = await db.query(`
      SELECT status, started_at, finished_at, current_index, time_remaining
        FROM exam_sessions
      WHERE exam_id = $1
        AND student_school_id = $2
    `, [examId, studentId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "No matching exam-session found" })

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting exam-session status", error);
    res.status(500).json({ error: "Failed to get exam-session status" });
  }
}


//landing page for checking if there is an ongoing exam for this student,, before proceeding in entering the code and subj
export const getStudentCurrentSession = async(req, res) => { //status: in-progress or submitted
  const studentId = req.user.schoolId;

  try {
    // const result = await db.query(`
    //   SELECT status, exam_id, current_index
    //     FROM exam_sessions
    //   WHERE student_school_id = $1
    //     AND status = 'in-progress'
    //   `
    // , [studentId]);

    const result = await db.query(`
      SELECT s.*, e.status AS exam_status, e.start_datetime, e.end_datetime
      FROM exam_sessions s
      JOIN examinations e ON s.exam_id = e.exam_id
      WHERE s.student_school_id = $1
      ORDER BY s.started_at DESC
      LIMIT 1`
    , [studentId]);

    if (result.rows.length === 0) return res.status(404).json({ message: "No exam-session found. Can enter other exam" });

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting exam-session status", error);
    res.status(500).json({ error: "Failed to get exam-session status" });
  }
}