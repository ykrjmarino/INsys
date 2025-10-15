import express from "express";
import cors from "cors";
import cron from "node-cron";
import dotenv from 'dotenv';
dotenv.config({ path: './.env', quiet: true });
import { db } from "./db.js";

//AUTH 
import session from "express-session";
import cookieParser from 'cookie-parser';
import teacherAuthRoutes from "./utils/teacherAuth.js";
import studentAuthRoutes from "./utils/studentAuth.js";
import authRoutes from "./utils/auth.js";
import { verifyJWT, verifyRole, refreshAccessToken, clearToken } from "./utils/jwt.js";


const app = express();
const port = process.env.PORT || 3000;

// import passport from "passport";
// app.use(passport.initialize());
// app.use(passport.session());

app.use(cookieParser());

//prep frontend:
app.use(cors({ //allow frontend to access backend
  origin: `http://localhost:5173`, //React frontend
  credentials: true
}));

//authentication
app.use(
  session({
    secret: 'TOPSECRET-UWU',
    resave: false, 
    saveUninitialized: true,
  })
);

const teacherOnly = [verifyJWT, verifyRole('teacher')];
const studentOnly = [verifyJWT, verifyRole('student')];
const adminOnly = [verifyJWT, verifyRole('admin')];


//just for testing if jwt working
app.get('/api/protected', teacherOnly, (req, res) => {
  res.json({ message: "JWT is valid", user: req.user });
});

app.post("/api/refresh", refreshAccessToken);

  

 








app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); 

//authRouting
app.use('/api', authRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/teacher', teacherAuthRoutes);


//verify student
  import { verifyExamAccess, answerSubmission, autoScoringTemplate, manualEssayScoring, getInfoPerExam, getStudentExamHistory, autoSubmitAllAnswers, startExam, submitAllAnswers } from "./controllers/studentQuery.js";

//userCONTROLLERS
  //GET
    import { getUserById } from './controllers/userControllers/GET.js'
  //POST
    import { createUser } from './controllers/userControllers/POST.js'
  //UPDATE
    import {  } from './controllers/userControllers/UPDATE.js'
  //DELETE
    import {  } from "./controllers/userControllers/DELETE.js";


//examCONTROLLERS
  //GET
    import { getAllExams, getExamById, getExamsByTitle, getExamsByStatus, getExamCode, getSectionTakersByExamId, getAllScoresByExam, getEssayPerStudent, getExamSchedule, getExamSession, getStudentCurrentSession } from './controllers/examControllers/GET.js'
  //POST
    import { createExam, duplicateExam } from './controllers/examControllers/POST.js'
  //UPDATE
    import { updateExamDetails, updateExamCode, updateExamStatus, updateExamTimer, updateSectionTakers, finalizeExamSchedule } from './controllers/examControllers/UPDATE.js'
  //DELETE
    import { deleteExam } from "./controllers/examControllers/DELETE.js";


//questionCONTROLLERS
  //GET
    import { getQuestionsByExamId } from "./controllers/examControllers/GET.js";
  //POST
    import { createQuestion } from './controllers/questionControllers/POST.js'
  //UPDATE
    import { updateQuestion } from './controllers/questionControllers/UPDATE.js'
  //DELETE
    import { deleteQuestionById } from "./controllers/questionControllers/DELETE.js";

//year and section
  import { addSection, courseData, yearLevelData, deleteSection, yearSection } from "./controllers/yearSection.js";
import { getQuestionsForStudent, getUnansweredQuestions } from "./controllers/questionControllers/GET.js";


// ========== TEST IF BACKEND WORKING ==========
  app.get('/', (req, res) => res.send('Backend is running UwU!'));

// ========== TEACHER ROUTES ==========
  app.patch('/api/student-score/essay/:examId/:questionId', teacherOnly, manualEssayScoring);

// ========== YEAR AND SECTION ROUTES ==========
  app.get('/api/sections/year-section', teacherOnly, yearSection);
  app.get('/api/course/details', teacherOnly, courseData); 
  app.get('/api/year-level/details', teacherOnly, yearLevelData); 

  //not for exams, but for the whole department
  app.post('/api/sections', adminOnly, addSection);
  app.delete('/api/sections/:sectionId', adminOnly, deleteSection);


// ========== USER ROUTES ==========
  app.get('/api/users/:id', teacherOnly, getUserById);
  app.post('/api/users', createUser);


// ========== EXAM ROUTES ==========
  app.get('/api/exams/:userId', teacherOnly, getAllExams);
  app.get('/api/exams/search', teacherOnly, getExamsByTitle); 
      //for searchbar title search
  app.get('/api/exams/status', teacherOnly, getExamsByStatus);
  app.get('/api/exams/exam/:examId', teacherOnly, getExamById); 
      //fetch a single exam's details (not questions)
      //teachers (to view or edit a specific exam) 
      //students (to display exam info before starting)
      
  app.get('/api/exams/:examId/essays/:studentSchoolId', teacherOnly, getEssayPerStudent);
  app.get('/api/exams/:examId/code', teacherOnly, getExamCode);
      //or destructure the getExamById in frontend like:
      //const [exam, setExam] = useState(null);
      //useEffect(() => {
      //  axios.get(`/api/exams/${examId}`)
      //    .then(res => setExam(res.data));
      //}, []);
      //<p>Exam Code: {exam?.exam_code}</p>
  app.get('/api/exams/:examId/sections', teacherOnly, getSectionTakersByExamId);
  app.get('/api/exams/:examId/scores/:sectionTaker', teacherOnly, getAllScoresByExam);
  
  app.post('/api/exams/create-exam', teacherOnly, createExam); 
  app.post('/api/exams/:examId/duplicate', teacherOnly, duplicateExam);

  app.put('/api/exams/:examId/sections', teacherOnly, updateSectionTakers);
      //can be null at first, when published without sections, will show popup alert... imma fix it later
      //im fixing it now, bruh galing sa chatgpt lang kase nagmamadali nako matulog

  app.patch('/api/exams/:examId/status', teacherOnly, updateExamStatus);
  app.patch('/api/exams/:examId/timer', teacherOnly, updateExamTimer);
  app.patch('/api/exams/:examId/details', teacherOnly, updateExamDetails);
  app.patch('/api/exams/:examId/code', teacherOnly, updateExamCode);
      //not really needed, cuz we create the exam code at exam creation\

  app.get('/api/exams/:examId/schedule', teacherOnly, getExamSchedule); 
  app.put('/api/exams/:examId/schedule', teacherOnly, finalizeExamSchedule);

  app.delete('/api/exams/:examId', teacherOnly, deleteExam);
      //singular... one exam deletion

// ========== QUESTION ROUTES ==========
  app.post('/api/questions/:examId', teacherOnly, createQuestion);
  app.get('/api/exams/:examId/questions', teacherOnly, getQuestionsByExamId); 
      //questions by exam.. for teachers.
  app.patch('/api/exams/:examId/questions/:questionId', teacherOnly, updateQuestion);
  
  app.delete('/api/exams/:examId/questions/:questionId', teacherOnly, deleteQuestionById);

// ========== STUDENT ROUTES ==========
  app.post('/api/student/exams/:examId/start', studentOnly, startExam);
  app.post('/api/student/verify', studentOnly, verifyExamAccess);
  app.get('/api/student/session', studentOnly, getStudentCurrentSession);
      //for checking existing on-going exams before entering another one
      
  app.get('/api/student/exams/:examId/info', studentOnly, getInfoPerExam);
  app.get('/api/students/exam-history', studentOnly, getStudentExamHistory);
  app.get('/api/exams/session/:examId', studentOnly, getExamSession);
      //status, started_at, finished_at, current_index, time_remaining
  app.get('/api/student/:studentId/exam-history', studentOnly);
  app.get('/api/exams/questions/:examId', studentOnly, getQuestionsForStudent) 
      //not used because we use the unanswered route (below this)
      //questions by exam.. limited selection in db, for student only.
  app.get('/api/exams/unanswered/:examId', studentOnly, getUnansweredQuestions)
      //unanswered questions, in-case accidentally exit page: still can answer the remaining questions

  app.post('/api/student/exams/:examId/auto-submit', studentOnly, autoSubmitAllAnswers);
      //time sensitive
  app.post('/api/student/exams/:examId/submit', studentOnly, submitAllAnswers);
      //answer all question, then submit
  app.post('/api/student-answers/:examId/submit', studentOnly, answerSubmission); 
      //per question submission
      //autoScoringLogic works here

  app.put('/api/student-scores/score', autoScoringTemplate); 
      //backup tool
      //admin suspects incorrect scoring
      //wants to force re-check


// ========== ANALYTICS ROUTES ==========

  //meron pa una dito: all exams done so we can view exam analytics per exam


  app.get('/api/exams/analytics/:examId', )



   
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
})
