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
import ForgotPassword from './pages/ForgotPassword.jsx';
import ExamAnalytics from './pages/1-ExamAnalytics.jsx';
import HomeAnalytics from './pages/1-HomeAnalytics.jsx';
//Layout
import LogoutButton from './components/Logout.jsx';
import ExamQuestions from './components/home-student/ExamQuestions.jsx';





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

  if (user.role === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />;
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
      const { userId, schoolId, nameFNfirst, nameLNfirst, role } = res.data.user || {};

      setAccessToken(res.data.accessToken);
      setUser({ userId, schoolId, nameFNfirst, nameLNfirst, role });
                            console.log("User after refresh: (obj)", { userId, schoolId, nameFNfirst, nameLNfirst, role }); //obj. for debugging only

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
    <ToastContainer position="top-right" autoClose={3000} />
    <AuthLoader>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path='/teacher-dashboard' element={<HomeTeacher />} />
          <Route path='/update-exam/:examId' element={<UpdateExam />} />
          <Route path='/exams-analytics' element={<HomeAnalytics />} />
          <Route path='/exam-analytics/:examId' element={<ExamAnalytics />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path='/student-entry' element={<HomeStudent />} />
          <Route path='/exam/start/:examId' element={<ExamQuestions />} />
        </Route>

        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/welcome-register' element={<Welcome />} /> 
        <Route path='/register/student' element={<RegisterStudent />} />
        <Route path='/register/teacher' element={<RegisterTeacher />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthLoader>
    
    </>
  )
}

export default App;