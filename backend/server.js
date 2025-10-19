import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// ENV + CORE IMPORTS
// ======================
import dotenv from "dotenv";
dotenv.config(); // must come first before using process.env

import express from "express";
import cors from "cors";
import cron from "node-cron";
import session from "express-session";
import cookieParser from "cookie-parser";

import { db } from "./db.js";

// ======================
// ROUTES & MIDDLEWARE IMPORTS
// ======================

// AUTH ROUTES
import teacherAuthRoutes from "./utils/teacherAuth.js";
import studentAuthRoutes from "./utils/studentAuth.js";
import authRoutes from "./utils/auth.js";
import { verifyJWT, verifyRole, refreshAccessToken } from "./utils/jwt.js";

// STUDENT CONTROLLERS
import {
  verifyExamAccess,
  answerSubmission,
  autoScoringTemplate,
  manualEssayScoring,
  getInfoPerExam,
  getStudentExamHistory,
  autoSubmitAllAnswers,
  startExam,
  submitAllAnswers,
} from "./controllers/studentQuery.js";

// USER CONTROLLERS
import { getUserById } from "./controllers/userControllers/GET.js";
import { createUser } from "./controllers/userControllers/POST.js";

// EXAM CONTROLLERS
import {
  getAllExams,
  getExamById,
  getExamsByTitle,
  getExamsByStatus,
  getExamCode,
  getSectionTakersByExamId,
  getAllScoresByExam,
  getEssayPerStudent,
  getExamSchedule,
  getExamSession,
  getStudentCurrentSession,
} from "./controllers/examControllers/GET.js";

import { createExam, duplicateExam } from "./controllers/examControllers/POST.js";
import {
  updateExamDetails,
  updateExamCode,
  updateExamStatus,
  updateExamTimer,
  updateSectionTakers,
  finalizeExamSchedule,
} from "./controllers/examControllers/UPDATE.js";
import { deleteExam } from "./controllers/examControllers/DELETE.js";

// QUESTION CONTROLLERS
import { getQuestionsByExamId } from "./controllers/examControllers/GET.js";
import { createQuestion } from "./controllers/questionControllers/POST.js";
import { updateQuestion } from "./controllers/questionControllers/UPDATE.js";
import { deleteQuestionById } from "./controllers/questionControllers/DELETE.js";

// YEAR & SECTION CONTROLLERS
import {
  addSection,
  courseData,
  yearLevelData,
  deleteSection,
  yearSection,
} from "./controllers/yearSection.js";

// ANALYTICS
import { getQuestionsForStudent, getUnansweredQuestions } from "./controllers/questionControllers/GET.js";
import { getExamAnalytics, getStudentAnalytics } from "./controllers/analyticsControlers/GET.js";

// ======================
// 3️⃣ APP CONFIG
// ======================
const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "TOPSECRET-UWU",
    resave: false,
    saveUninitialized: true,
  })
);

// ======================
// 4️⃣ ROLE MIDDLEWARE
// ======================
const teacherOnly = [verifyJWT, verifyRole("teacher")];
const studentOnly = [verifyJWT, verifyRole("student")];
const adminOnly = [verifyJWT, verifyRole("admin")];

// ======================
// 5️⃣ AUTH ROUTES
// ======================
app.use("/api", authRoutes);
app.use("/api/student", studentAuthRoutes);
app.use("/api/teacher", teacherAuthRoutes);

app.post("/api/refresh", refreshAccessToken);
app.get("/api/protected", teacherOnly, (req, res) => {
  res.json({ message: "JWT is valid", user: req.user });
});

// ======================
// 6️⃣ BASIC TEST
// ======================
app.get("/", (req, res) => res.send("Backend is running UwU!"));

// ======================
// 7️⃣ TEACHER ROUTES
// ======================
app.patch("/api/student-score/essay/:examId/:questionId", teacherOnly, manualEssayScoring);

// YEAR & SECTION
app.get("/api/sections/year-section", teacherOnly, yearSection);
app.get("/api/course/details", teacherOnly, courseData);
app.get("/api/year-level/details", teacherOnly, yearLevelData);
app.post("/api/sections", adminOnly, addSection);
app.delete("/api/sections/:sectionId", adminOnly, deleteSection);

// USER ROUTES
app.get("/api/users/:id", teacherOnly, getUserById);
app.post("/api/users", createUser);

// EXAM ROUTES
app.get("/api/exams/:userId", teacherOnly, getAllExams);
app.get("/api/exams/search", teacherOnly, getExamsByTitle);
app.get("/api/exams/status", teacherOnly, getExamsByStatus);
app.get("/api/exams/exam/:examId", teacherOnly, getExamById);
app.get("/api/exams/:examId/essays/:studentId", teacherOnly, getEssayPerStudent);
app.get("/api/exams/:examId/code", teacherOnly, getExamCode);
app.get("/api/exams/:examId/sections", teacherOnly, getSectionTakersByExamId);
app.get("/api/exams/:examId/scores/:sectionTaker", teacherOnly, getAllScoresByExam);

app.post("/api/exams/create-exam", teacherOnly, createExam);
app.post("/api/exams/:examId/duplicate", teacherOnly, duplicateExam);

app.put("/api/exams/:examId/sections", teacherOnly, updateSectionTakers);
app.patch("/api/exams/:examId/status", teacherOnly, updateExamStatus);
app.patch("/api/exams/:examId/timer", teacherOnly, updateExamTimer);
app.patch("/api/exams/:examId/details", teacherOnly, updateExamDetails);
app.patch("/api/exams/:examId/code", teacherOnly, updateExamCode);

app.get("/api/exams/:examId/schedule", teacherOnly, getExamSchedule);
app.put("/api/exams/:examId/schedule", teacherOnly, finalizeExamSchedule);

app.delete("/api/exams/:examId", teacherOnly, deleteExam);

// QUESTION ROUTES
app.post("/api/questions/:examId", teacherOnly, createQuestion);
app.get("/api/exams/:examId/questions", teacherOnly, getQuestionsByExamId);
app.patch("/api/exams/:examId/questions/:questionId", teacherOnly, updateQuestion);
app.delete("/api/exams/:examId/questions/:questionId", teacherOnly, deleteQuestionById);

// ======================
// 8️⃣ STUDENT ROUTES
// ======================
app.post("/api/student/verify", studentOnly, verifyExamAccess);
app.post("/api/student/exams/:examId/start", studentOnly, startExam);
app.get("/api/student/session", studentOnly, getStudentCurrentSession);
app.get("/api/student/exams/:examId/info", studentOnly, getInfoPerExam);
app.get("/api/students/exam-history", studentOnly, getStudentExamHistory);
app.get("/api/exams/session/:examId", studentOnly, getExamSession);
app.get("/api/exams/questions/:examId", studentOnly, getQuestionsForStudent);
app.get("/api/exams/unanswered/:examId", studentOnly, getUnansweredQuestions);

app.post("/api/student/exams/:examId/auto-submit", studentOnly, autoSubmitAllAnswers);
app.post("/api/student/exams/:examId/submit", studentOnly, submitAllAnswers);
app.post("/api/student-answers/:examId/submit", studentOnly, answerSubmission);
app.put("/api/student-scores/score", autoScoringTemplate);

// ======================
// 9️⃣ ANALYTICS
// ======================
app.get("/api/exams/analytics/:examId", getExamAnalytics);
app.get("/api/exams/student/:studentId/analytics/:examId", getStudentAnalytics);


// ======================
// 🔟 START SERVER
// ======================
app.listen(port, () => {
  db.connect();
  console.log(`✅ Backend running at http://localhost:${port} idk tinatamad ako magchange ng text`);
});
