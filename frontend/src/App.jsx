import {Routes, Route, Link, useNavigate, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import axios from './utils/axiosConfig.js';
import { useAuth } from './context/AuthContext.jsx';

//Pages
import Login from './pages/Login.jsx';
import RegisterTeacher from './pages/RegisterTeacher.jsx';
import RegisterStudent from './pages/RegisterStudent.jsx'
import HomeTeacher from './pages/HomeTeacher.jsx';
import HomeStudent from './pages/HomeStudent.jsx';
import UpdateExam from './pages/UpdateExam.jsx';
import Welcome from './pages/Welcome.jsx';
import ForgotPassword, { ForgotPasswordLoggedIn } from './pages/ForgotPassword.jsx';
import HomeAnalytics from './pages/1-HomeAnalytics.jsx';
import ExamAnalytics from './pages/2-ExamAnalytics.jsx';
import SectionAnalytics from './pages/2.1-SectionAnalytics.jsx';
import StudentEssays from './pages/2.1.1-StudentEssays.jsx';

import LogoutButton from './components/Logout.jsx';
import ExamQuestions from './components/home-student/ExamQuestions.jsx';
import { HomeSuperadmin } from './pages/HomeSuperadmin.jsx';
import { ManageUser } from './components/home-superadmin/ManageUsers.jsx';
import { DashboardSuper } from './components/home-superadmin/DashboardSuper.jsx';
import { AdminAnalytics, HomeAdminAnalytics } from './components/home-superadmin/AdminAnalytics.jsx';
import UserSettings from './pages/UserSettings.jsx';
import { ForbiddenPage, NotFoundPage, UnauthorizedPage } from './pages/ErrorPage/ErrorPages.jsx';
import SystemSettings from './components/home-superadmin/SystemContent.jsx';






function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

function AuthLoader({ children }) {
  const { setUser, setAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.post("/refresh")
      .then(res => {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setUser, setAccessToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}

function RootRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (user.role === 'student') {
    return <Navigate to="/student-entry" replace />;
  }

  return <Navigate to="/login" replace />;
}


function App() {
  const navigate = useNavigate();
  const { setAccessToken, setUser, user } = useAuth();

useEffect(() => {
  const publicPaths = ["/login", "/register/student", "/register/teacher", "/welcome-register", "/forgot-password"];
  if (publicPaths.includes(window.location.pathname)) return;

  axios.post("/refresh")
    .then(res => {
      const newToken = res.data.accessToken;
      const { userId, schoolId, nameFNfirst, nameLNfirst, role, lastName, firstName } = res.data.user || {};

      setAccessToken(res.data.accessToken);
      setUser({ userId, schoolId, nameFNfirst, nameLNfirst, role });
                            console.log("User after refresh: (obj)", { userId, schoolId, nameFNfirst, nameLNfirst, role, lastName, firstName}); //obj. for debugging only

      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      console.log("Access token set:", newToken);
    })
    .catch(() => {
      setAccessToken('');
      navigate("/login");
    });
}, []);

useEffect(() => {
  console.log("User updated: (from global context)", user);  
}, [user, navigate]);

  return(
    <>
    <ToastContainer position="top-right" autoClose={2000} />
    <AuthLoader>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

         <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path='/student-entry' element={<HomeStudent />} />
          <Route path='/exam/start/:examId' element={<ExamQuestions />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path='/admin-dashboard' element={<HomeTeacher />} />
          <Route path='/update-exam/:examId' element={<UpdateExam />} />
          <Route path='/exams-analytics' element={<HomeAnalytics />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
          <Route path='/dashboard' element={<DashboardSuper />} />
          <Route path='/user-management' element={<ManageUser />} />
          <Route path='/admin-analytics' element={<AdminAnalytics />} />
          <Route path='/exams-analytics/:teacherId' element={<HomeAdminAnalytics />} />
          <Route path='/system-settings' element={<SystemSettings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superadmin", "admin"]} />}>
          <Route path='/exam-analytics/:examId' element={<ExamAnalytics />} />
          <Route path='/exam-analytics/section/:examId' element={<SectionAnalytics />} /> 
          <Route path='/exam-analytics/:examId/student-essay/:studentId' element={<StudentEssays />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superadmin", "admin", "student"]} />}>
          <Route path='/account-settings' element={<UserSettings />} />
          <Route path='/account-settings/forgot-password' element={<ForgotPasswordLoggedIn />} />
        </Route>

        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/welcome-register' element={<Welcome />} /> 
        <Route path='/register/student' element={<RegisterStudent />} />
        <Route path='/register/teacher' element={<RegisterTeacher />} />

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Fallback */}        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthLoader>
    
    </>
  )
}

export default App;