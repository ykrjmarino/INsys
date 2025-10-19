import {db} from '../db.js';

//VERIFY BEFORE ENTERING
export const verifyExamAccess = async(req, res) => {
  console.log("Raw body:", req.body);
  const { inputCode, inputSection } = req.body;
  const userId = req.user.userId; 

  let studentSchoolId = null;
  let studentName = null;

  try {  
    //========= kuha lang tayo ng info sa user dito, not really that important sa logic =========//
    const resUserInfo = await db.query(`
      SELECT school_id, first_name, last_name
      FROM users
      WHERE user_id = $1
      `, [userId]);

    if (resUserInfo.rows.length === 0) return res.status(404).json({ error: "User not found, can't access exam" }) //prbly expired token, cuz the userId is from jwt payload
       
    const resUser = resUserInfo.rows[0];
    const studentName = `${resUser.last_name}, ${resUser.first_name}`;
    const studentSchoolId = resUser.school_id; //or just req.user.schoolId.. lol
    //========= ========= ========= ========= ========= ========= ========= ========= =========//
    
    const result = await db.query( //gives us the exam info
      `SELECT *,
        e.start_datetime AS start_utc,
        e.end_datetime   AS end_utc,
        e.exam_id 
      FROM examinations e
      JOIN section_takers s
        ON e.exam_id = s.exam_id 
      WHERE e.exam_code = $1 
        AND s.section_name = $2
        AND (e.status = 'published' OR e.status = 'ongoing')`,
      [inputCode, inputSection]
    );
                                      console.log("inputCode:", inputCode);
                                      console.log("inputSection:", inputSection);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid code or section' });
    }

  //always work in UTC internally
    const currentTimeUTC = new Date(new Date().toISOString()); // always UTC
    const startTimeUTC = new Date(result.rows[0].start_utc);
    const endTimeUTC = new Date(result.rows[0].end_utc);

  //time validation
    if (currentTimeUTC > endTimeUTC) {
      return res.status(403).json({ error: 'Exam has ended' });
    }
    if (currentTimeUTC < startTimeUTC) {
      return res.status(403).json({ error: 'Exam has not started' });
    }
    
  //check submissions
    const isSubmitted = await db.query(`
      SELECT * FROM student_scores
      WHERE student_school_id = $1
        AND section_name = $2
        AND exam_id = $3
        AND is_submitted = true
      `, [studentSchoolId, inputSection, result.rows[0].exam_id]);

    if (isSubmitted.rows.length === 1) {
      return res.status(403).json({ error: 'You already submitted this exam' });
    } 

    //will check if you already answered some questions.. idk if i did the per question yet
    const isStarted = await db.query(`
      SELECT * 
      FROM student_scores
      WHERE student_school_id = $1
        AND section_name = $2
        AND exam_id = $3
        AND is_submitted = false
      `, [studentSchoolId, inputSection, result.rows[0].exam_id]);

    if (isStarted.rows.length === 1) {
      return res.status(200).json({ message: 'Already Allowed. Proceed to exam', exam: result.rows[0] });
    }
    
    res.status(200).json({ message: 'Exam entry granted', exam: result.rows[0] });
  } catch (error) {
    console.error('Error verifying exam entry:', {
      message: error.message,
      stack: error.stack,
      inputCode,
      inputSection,
      userId,
      studentSchoolId,
      studentName
    });
    res.status(500).json({ error: error.message  || 'Failed to enter exam' });
  }
}

export const startExam = async(req, res) => {
  const { examId } = req.params; 
  const { inputCode, inputSection } = req.body; 
  const studentSchoolId = req.user.schoolId;

  console.log("startExam received:", { inputCode, inputSection, examId });


  try {
    const currentTimeUTC = new Date(new Date().toISOString());

    const result = await db.query( //gives us the exam info
      `SELECT *,
        e.start_datetime AS start_utc,
        e.end_datetime   AS end_utc,
        e.exam_id 
      FROM examinations e
      JOIN section_takers s
        ON e.exam_id = s.exam_id 
      WHERE e.exam_code = $1 
        AND s.section_name = $2
        AND e.status = 'published'`,
      [inputCode, inputSection]
    );

    const isSubmitted = await db.query(`
      SELECT * FROM student_scores
      WHERE student_school_id = $1
        AND exam_id = $2
        AND is_submitted = true`
    , [studentSchoolId, examId]);

    if (isSubmitted.rows[0]?.is_submitted) return res.status(400).json({ error: 'Exam submitted. Can only take once.' });

    //will check if you already answered some questions.. idk if i did the per question yet
    const isStarted = await db.query(`
      SELECT * 
      FROM student_scores
      WHERE student_school_id = $1
        AND section_name = $2
        AND exam_id = $3
        AND is_submitted = false
      `, [studentSchoolId, inputSection, examId]);

    if (isStarted.rows.length === 1) {
      return res.status(200).json({ message: 'Already Allowed. Proceed to exam', exam: result.rows[0] });
    } else { //if starting for the first time, we insert user data
      console.log('Attempting insert:', { studentSchoolId, examId, inputSection });

      await db.query(
      `INSERT INTO student_scores (student_school_id, exam_id, section_name) 
      VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, 
      [studentSchoolId, examId, inputSection]);
    }

    const existingSession = await db.query(`
      SELECT * FROM exam_sessions
      WHERE exam_id = $1 AND student_school_id = $2
        AND status = 'in-progress'
    `, [examId, studentSchoolId]);

    if (existingSession.rows.length > 0) {
      console.log("Found existing session:", existingSession.rows[0]);
      return res.status(200).json({ message: 'Exam already in progress', session: existingSession.rows[0] 
      });
    }

    //if no session found -- create one
    const newSession = await db.query(`
      INSERT INTO exam_sessions (exam_id, student_school_id, status, started_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [examId, studentSchoolId, 'in-progress', currentTimeUTC]);
    //console.log("New session created:", newSession.rows[0]);

    res.status(201).json({ 
      message: 'Exam session started', 
      session: newSession.rows[0] 
    });
  } catch (error) {
    console.error('Error starting exam', error);
    res.status(500).json({ error: 'Failed to start exam' });
  }
}


//ALL QUESTION TYPE
export const answerSubmission = async(req, res) => {
  const { examId } = req.params;
  const studentSchoolId = req.user.schoolId;
  const { questionId, studentAnswer } = req.body;
      //no req.params because we get the info if they are validated/verified examinee

  try {
//======= check if exam is submitted =======//
    const isSubmitted = await db.query(`
    SELECT is_submitted FROM student_scores
    WHERE exam_id = $1 AND student_school_id = $2`, 
    [examId, studentSchoolId]);

    if (isSubmitted.rows[0]?.is_submitted) {
      return res.status(400).json({ error: 'Exam already submitted' });
    }
// ======= // ======= // ======= // ======= //

    const questionRow = await db.query(
      `SELECT question_type, correct_answer 
       FROM questions 
       WHERE exam_id = $1 AND question_id = $2`,
      [examId, questionId]
    );

    const questionType = questionRow.rows[0]?.question_type;
    const correctAnswer = questionRow.rows[0]?.correct_answer;
    const isCorrect = correctAnswer && correctAnswer.trim().toLowerCase() === studentAnswer.trim().toLowerCase(); //1 or 0

    const didAnswer = await db.query(
        `SELECT 1 FROM student_answers
         WHERE exam_id = $1 AND question_id = $2 AND student_school_id = $3`,
        [examId, questionId, studentSchoolId]
    );

    if (didAnswer.rows.length != 0) {
      return res.status(400).json({ error: 'Question already answered' });
    }

    if (questionType === 'essay') {
      const session = await db.query(
        `SELECT session_id FROM exam_sessions
        WHERE exam_id = $1 AND student_school_id = $2`,
        [examId, studentSchoolId]
      );

      if (session.rows.length === 0) {
        return res.status(400).json({ error: "No active exam session found" });
      }
      const sessionId = session.rows[0].session_id;

      //insert essay ans linked to session
      const result = await db.query(
        `INSERT INTO essay_answers (session_id, question_id, student_school_id, student_answer)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [sessionId, questionId, studentSchoolId, studentAnswer]
      );

      res.status(201).json(result.rows[0]);
    } else {
      const result = await db.query(`INSERT INTO student_answers (exam_id, question_id, student_school_id, student_answer, is_correct) VALUES ($1, $2, $3,$4, $5) RETURNING *`,[examId, questionId, studentSchoolId, studentAnswer, isCorrect]);

  //trigger auto score
      await autoScoringHelper(examId, studentSchoolId);
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error saving exam entry:', error);
    res.status(500).json({ error: error.message || 'Failed to save answers' });
  }
}

//NON-ESSAY SCORING
export const autoScoringTemplate = async(req, res) => { 
  const { examId, studentSchoolId } = req.body

  try {
    const score = await autoScoringHelper(examId, studentSchoolId)
    res.status(200).json({ message: 'Score updated', score });
  } catch (error) {
    console.error('Automatic scoring failed:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
}

  //helper function:
      async function autoScoringHelper(examId, studentSchoolId) { // use examId & studentSchoolId from autoScoringTemplate

        const result = await db.query(
          `SELECT q.points
            FROM student_answers s, questions q
            WHERE s.exam_id = $1
              AND s.student_school_id = $2
              AND s.is_correct = true
              AND s.question_id = q.question_id`,
          [examId, studentSchoolId]
        ) //will list the points for each correct answers (true)

        let totalScore = 0;

        result.rows.forEach(row => {
          totalScore = totalScore + row.points;
        })
        const score = parseInt(totalScore);

        await db.query(
          `UPDATE student_scores
            SET objective_score = $1,
                total_score = $1 + essay_score
            WHERE exam_id = $2 AND student_school_id = $3`,
          [score, examId, studentSchoolId]
        );

        return score;
      }

//ESSAY SCORING
export const manualEssayScoring = async(req, res) => {
  const {questionId, examId} = req.params;
  const {studentSchoolId, essayScore} = req.body;

  try {
    const result = await db.query(
      `UPDATE essay_answers
        SET essay_score = $1
        WHERE question_id = $2
          AND student_school_id = $3
        RETURNING *`,
      [essayScore, questionId, studentSchoolId]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "No essay found to score" });
    }

    await essayScoringHelper(examId, studentSchoolId);
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating essay score:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
}
    async function essayScoringHelper(examId, studentSchoolId) { 

      const result = await db.query(
        `SELECT SUM(essay_score) AS total_essay_score
        FROM essay_answers
        JOIN questions ON essay_answers.question_id = questions.question_id
        WHERE questions.exam_id = $1 AND essay_answers.student_school_id = $2`,
        [examId, studentSchoolId]
      );

      const totalEssayScore = parseInt(result.rows[0].total_essay_score) || 0;

      await db.query(
        `UPDATE student_scores
          SET essay_score = $1,
              total_score = $1 + objective_score
          WHERE exam_id = $2 AND student_school_id = $3`,
        [totalEssayScore, examId, studentSchoolId]
      );

      return totalEssayScore;
    }

//Purpose: Fetch details of one specific exam for the logged-in student. example: exam details after exam ends
//Response: Single exam object [title, teacher, section, submitted_at, total_score, total_questions(number of questions)].
export const getInfoPerExam = async(req, res) => {
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

//Purpose: Fetch all exam records/history of a given student. 
// Response: List/array of exam objects, ordered by submitted_at DESC (latest first).
export const getStudentExamHistory = async(req, res) => {
  const studentId = req.user.schoolId;

  try {
    const result = await db.query(`
      SELECT
        e.exam_id,
        e.title,
        e.total_points,
        (u.first_name || ' ' || u.last_name) AS teacher_name,
        s.section_name,
        s.submitted_at,
        s.total_score
      FROM student_scores s
      JOIN examinations e ON s.exam_id = e.exam_id
      JOIN users u ON e.user_id = u.user_id
      WHERE s.student_school_id = $1
      ORDER BY s.submitted_at DESC;
      `, [studentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({error: 'No Exam detail fetched'})
      }

      res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error getting exam history details:', error);
    res.status(500).json({ error: error.details || 'Failed to get exam history details' });
  }
}


export const autoSubmitAllAnswers = async (req, res) => {
  const studentId = req.user.schoolId;
  const { examId } = req.params;

  try {
    // ======= GET SESSION ID =======
    const { rows: sessionRows } = await db.query(`
      SELECT session_id
      FROM exam_sessions
      WHERE exam_id = $1 AND student_school_id = $2
    `, [examId, studentId]);

    if (!sessionRows[0]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionId = sessionRows[0].session_id;

    //====== objective questions
    const questionType_Obj = ['multiplechoice', 'identification', 'truefalse'];
    const unansweredQuestions_Obj = await db.query(`
      SELECT q.question_id
      FROM questions q
      LEFT JOIN student_answers s
        ON q.question_id = s.question_id
        AND s.student_school_id = $1
      WHERE q.question_type = ANY ($2)
        AND q.exam_id = $3
        AND s.student_school_id IS NULL
    `, [studentId, questionType_Obj, examId]);

    // Batch insert unanswered objective questions
    if (unansweredQuestions_Obj.rows.length > 0) {
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const q of unansweredQuestions_Obj.rows) {
        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        params.push(sessionId, examId, q.question_id, ' ', false);
      }

      await db.query(`
        INSERT INTO student_answers (session_id, exam_id, question_id, student_answer, is_correct)
        VALUES ${values.join(', ')}
      `, params);
    }

    //======= subjective questions
    const unansweredQuestions_Ess = await db.query(`
      SELECT q.question_id
      FROM questions q
      LEFT JOIN essay_answers e
        ON q.question_id = e.question_id
        AND e.student_school_id = $1
      WHERE q.question_type = $2
        AND q.exam_id = $3
        AND e.student_school_id IS NULL
    `, [studentId, 'essay', examId]);

    // Batch insert unanswered essay questions
    if (unansweredQuestions_Ess.rows.length > 0) {
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const q of unansweredQuestions_Ess.rows) {
        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        params.push(sessionId, q.question_id, studentId, ' ', 0);
      }

      await db.query(`
        INSERT INTO essay_answers (session_id, question_id, student_school_id, student_answer, essay_score)
        VALUES ${values.join(', ')}
      `, params);
    }

    // Check student_scores if already submitted
    const isSubmitted = await db.query(`
      SELECT is_submitted FROM student_scores
      WHERE exam_id = $1 AND student_school_id = $2
    `, [examId, studentId]);

    // Always update exam_sessions first
    await db.query(`
      UPDATE exam_sessions
      SET status = 'submitted'
      WHERE exam_id = $1 AND student_school_id = $2
    `, [examId, studentId]);

    if (isSubmitted.rows[0]?.is_submitted) {
      return res.status(400).json({ error: 'Already submitted' });
    } 
    
    // ---- Only reached if exam_scores is NOT already submitted ----
    // Update student_scores to mark as submitted
    await db.query(`
      UPDATE student_scores
      SET is_submitted = true, submitted_at = CURRENT_TIMESTAMP
      WHERE exam_id = $1 AND student_school_id = $2
    `, [examId, studentId]);


    // Auto scoring
    await autoScoringHelper(examId, studentId);

    res.status(200).json({ message: 'Exam marked as submitted' });

  } catch (error) {
    console.error('Error submitting student exam', error);
    res.status(500).json({ error: 'Failed to mark exam as submitted' });
  }
};

//manual submission, after done answering.
export const submitAllAnswers = async(req, res) => {
  const studentId = req.user.schoolId;
  const { examId } = req.params;

  try {
    await db.query(
      `UPDATE student_scores
       SET is_submitted = true
       WHERE exam_id = $1 AND student_school_id = $2`,
      [examId, studentId]);

    await db.query(`
      UPDATE exam_sessions
      SET status = 'submitted'
      WHERE exam_id = $1 AND student_school_id = $2`, 
      [examId, studentId]);

    return res.status(200).json({ message: "Exam submitted successfully" });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return res.status(500).json({ error: "Failed to submit exam" });
  }
}
