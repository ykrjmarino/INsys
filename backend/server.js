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
  verifyDateBeforeReEntering,
} from "./controllers/studentQuery.js";

// USER CONTROLLERS
import { getUserById } from "./controllers/userControllers/GET.js";
import { createUser } from "./controllers/analyticsControlers/POST.js";

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
  getAllExamsByTeacher,
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
import { getAdminExamAnalytics, getAllAnalytics, getExamAnalytics, getQuestionAnalytics, getSectionAnalytics, getStudentAnalytics, getSystemLogs, getUser } from "./controllers/analyticsControlers/GET.js";
import { postViolation } from "./controllers/monitoringControllers/POST.js";
import { deleteUser } from "./controllers/analyticsControlers/DELETE.js";
import { updateDeduction, updateUser } from "./controllers/analyticsControlers/UPDATE.js";
import { deleteOwnAccount } from "./controllers/userControllers/DELETE.js";
import { deleteAllData, deleteOldData } from "./controllers/systemSystemControllers/superadminSettings.js";

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
const studentOnly = [verifyJWT, verifyRole("student")];
const adminOnly = [verifyJWT, verifyRole("admin")];
const superadminOnly = [verifyJWT, verifyRole("superadmin")];

const usersOnly = [verifyJWT, verifyRole("student", "admin", "superadmin")];
const adminsOnly = [verifyJWT, verifyRole("admin", "superadmin")];


// ======================
// 5️⃣ AUTH ROUTES
// ======================
app.use("/api", authRoutes);
app.use("/api/student", studentAuthRoutes);
app.use("/api/teacher", teacherAuthRoutes);

app.post("/api/refresh", refreshAccessToken);
app.get("/api/protected", adminsOnly, (req, res) => {
  res.json({ message: "JWT is valid", user: req.user });
});

// ======================
// 6️⃣ BASIC TEST
// ======================
app.get("/", (req, res) => res.send("Backend is running UwU!"));

// ======================
// 7️⃣ TEACHER ROUTES
// ======================
app.patch("/api/student-score/essay/:examId/:questionId", adminsOnly, manualEssayScoring);
app.patch("/api/exam-analytics/:examId/student/:studentId/deduction", adminsOnly, updateDeduction);

// YEAR & SECTION 
app.get("/api/sections/year-section", adminsOnly, yearSection);
app.get("/api/course/details", adminsOnly, courseData);
app.get("/api/year-level/details", adminsOnly, yearLevelData);
app.post("/api/sections", adminOnly, addSection);
app.delete("/api/sections/:sectionId", adminOnly, deleteSection);

// USER ROUTES
app.get("/api/users/:userId", usersOnly, getUserById);
app.post("/api/users", adminsOnly, createUser);
app.delete("/api/user/delete", usersOnly, deleteOwnAccount);

// EXAM ROUTES
app.get("/api/exams/:userId", adminsOnly, getAllExams);
app.get("/api/exams/teacher/:teacherId", adminsOnly, getAllExamsByTeacher);
app.get("/api/exams/search", adminsOnly, getExamsByTitle);
app.get("/api/exams/status", adminsOnly, getExamsByStatus);
app.get("/api/exams/exam/:examId", adminsOnly, getExamById);
app.get("/api/exams/:examId/essays/:studentId", adminsOnly, getEssayPerStudent);
app.get("/api/exams/:examId/code", adminsOnly, getExamCode);
app.get("/api/exams/:examId/sections", adminsOnly, getSectionTakersByExamId);
app.get("/api/exams/:examId/scores/:sectionTaker", adminsOnly, getAllScoresByExam);

app.post("/api/exams/create-exam", adminOnly, createExam);
app.post("/api/exams/:examId/duplicate", adminOnly, duplicateExam);

app.put("/api/exams/:examId/sections", adminOnly, updateSectionTakers);
app.patch("/api/exams/:examId/status", adminOnly, updateExamStatus);
app.patch("/api/exams/:examId/timer", adminOnly, updateExamTimer);
app.patch("/api/exams/:examId/details", adminOnly, updateExamDetails);
app.patch("/api/exams/:examId/code", adminOnly, updateExamCode);

app.get("/api/exams/:examId/schedule", adminsOnly, getExamSchedule);
app.put("/api/exams/:examId/schedule", adminOnly, finalizeExamSchedule);

app.delete("/api/exams/:examId", adminOnly, deleteExam);

// QUESTION ROUTES
app.post("/api/questions/:examId", adminOnly, createQuestion);
app.get("/api/exams/:examId/questions", adminsOnly, getQuestionsByExamId);
app.patch("/api/exams/:examId/questions/:questionId", adminOnly, updateQuestion);
app.delete("/api/exams/:examId/questions/:questionId", adminOnly, deleteQuestionById);

// ======================
// 8️⃣ STUDENT ROUTES
// ======================
app.get("/api/student/verify/re-enter/:examId", studentOnly, verifyDateBeforeReEntering);
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
//general
app.get("/api/exam/analytics/:examId", adminsOnly, getExamAnalytics);
app.get("/api/exam/analytics/:examId/questions", adminsOnly, getQuestionAnalytics);
//per sections
app.get("/api/exams/student/:studentId/analytics/:examId", adminsOnly, getStudentAnalytics);
app.get("/api/exam/analytics/:examId/section-filter", adminsOnly, getSectionAnalytics);


app.get("/api/all/analytics", superadminOnly, getAllAnalytics);
app.get("/api/admin/analytics", superadminOnly, getAdminExamAnalytics);
app.get("/api/system/logs", superadminOnly, getSystemLogs);
app.get("/api/system/manage-users", superadminOnly, getUser);


app.patch("/api/system/manage-users/:userId", superadminOnly, updateUser);
app.delete("/api/system/manage-users/:userId", superadminOnly, deleteUser);

//system maintenance
app.delete("/api/maintenance/old", superadminOnly, deleteOldData); //7months old data in examinations and logs
app.delete("/api/maintenance/all", superadminOnly, deleteAllData); //all rows in examinations and logs



app.post("/api/exam/:examId/violations/student", studentOnly, postViolation);


// ======================
// 🔟 START SERVER
// ======================
app.listen(port, () => {
  db.connect();
  console.log(`✅ Backend running at http://localhost:${port} idk tinatamad ako magchange ng text`);
});
