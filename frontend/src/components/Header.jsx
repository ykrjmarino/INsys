import React from "react";
import axios from "../utils/axiosConfig.js";
import { useNavigate, useParams } from "react-router-dom";
import { LogoutSpan } from "./Logout";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';
import { useState } from "react";
import { useEffect } from "react";


function HeaderTeacher() {
    return (
        <>
        {/* <!-- header start --> */}
        <header className="teacher-home-main-header">
          <div className = "teacher-home-header-logo" >
            <img src="/images/insys-logo.webp" alt="logo" />
          </div>
  
          <div className="teacher-home-spacer"></div>
          <nav>
            <ul>
              <li className="nav-item">
                <span>About</span>
                <ul className="teacher-home-header-dropdown">
                  <li><span>About Us</span></li>
                  <li><span>Terms and Conditions</span></li>
                </ul>
              </li>
              <li className="nav-item">
                <span>Settings</span>
                <ul className="teacher-home-header-dropdown">
                  <li><span>Account</span></li>
                  <li><span>Theme</span></li>
                </ul>
              </li>
              <li className="nav-item">
                <span>Logout</span>
                <ul className="teacher-home-header-dropdown">
                  <li>
                    <LogoutSpan className="dropdown-logout-btn"/>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </header>
        {/* <!-- header end --> */}
        </>
    )
}

export const HeaderStudent = () => {
  const navigate = useNavigate();
    return (
        <>
        {/* <!-- header start --> */}
        <header className="teacher-home-main-header">
          <div className = "teacher-home-header-logo" >
            <img alt="logo" />
          </div>
  
          <div className="teacher-home-spacer"></div>
          <nav>
            <ul>
              <li className="nav-item">
                <span>About</span>
                <ul className="teacher-home-header-dropdown">
                  <li><span>About Us</span></li>
                  <li><span>Terms and Conditions</span></li>
                </ul>
              </li>
              <li className="nav-item">
                <span>Settings</span>
                <ul className="teacher-home-header-dropdown">
                  {/* <li><span>Account</span></li>
                  <li><span>Theme</span></li> */}
                  <button
                    className="sidebar-btn"
                    onClick={()=> navigate('/account-settings')}
                  ><i className="fas fa-chart-bar"></i> Account Settings </button>
                  
                </ul>
              </li>
              <li className="nav-item">
                <span>Logout</span>
                <ul className="teacher-home-header-dropdown">
                  <li>
                    <LogoutSpan className="dropdown-logout-btn"/>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </header>
        {/* <!-- header end --> */}
        </>
    )
}

export const SideBar = () => { //old one
  const navigate = useNavigate();
  const { user } = useAuth();
  //========= create exam modal =========//
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    try {
      const res = await axios.post('/exams/create-exam', {
        title,
        status: "draft"
      });
      navigate(`/update-exam/${res.data.exam_id}`)
    } catch (err) {
      console.error("Error creating exam", err);
    }
  };

  return (
    <>
      {/* <!-- sidebar -->
      <!-- start-->   */}
      <div className="sidebar">
        <div className="sidebar-image">
          <img alt="Sidebar Image"/>
        </div>

        <div className="sidebar-buttons">
          <h1 className="sidebar-title">Tools</h1>
          <button className="sidebar-btn" onClick={() => setShowModal(true)}><i className="fas fa-plus"></i>Create Exam</button>
            {showModal && (
              <>
              <div className="overlay" onClick={() => setShowModal(false)}></div>
              <div className="modal">
                <form onSubmit={(e) => {e.preventDefault(); handleCreate();}}>
                  <h3>Create Exam</h3>
                  <input
                    type="text"
                    placeholder="Enter exam title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <div className="modal-actions">
                    <button type="submit">Confirm</button>
                  </div>
                </form>
              </div>
              </>
            )}
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/admin-dashboard')}
          ><i className="fas fa-chart-bar"></i> Dashboard </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/exams-analytics')}
          ><i className="fas fa-chart-bar"></i> Exam Analytics </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/account-settings')}
          ><i className="fas fa-chart-bar"></i> Account Settings </button>
          
        </div>

        <div className="profile-container">
          <i className="fa-solid fa-user"></i>
          <div className="profile-info">
              <div className="profile-name">{user.nameFNfirst}</div>
              <div className="profile-title">Admin</div>
          </div>
        </div>
        
      </div>
      {/* <!-- end sidebar --> */}
    </>
  )
}

export const AnalyticsHeaderBar = () => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const { examId } = useParams(); 
  const [infoExam, setInfoExam] = useState({});

  useEffect(()=>{
    fetchExamInfo(); 
  }, [examId]);

  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/exam/analytics/${examId}`, config); // getExamAnalytics 

      setInfoExam({...res.data.exam, overall_stats: res.data.overall_stats});
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

  const backPath = user?.role === 'superadmin' ? `/exams-analytics/${infoExam.user_id}` : '/exams-analytics';

  return(
    <>
      {/* S1*/}
      <div className="analytics-header">
        <button className="analytics-back-button"  onClick={() => navigate(backPath)}><i className="fa-solid fa-arrow-left"></i></button>
        <label className ="analytics-exam-title-label">{infoExam.title}</label>
      </div>
      {/* E1*/}
    </>
  )
}

export default HeaderTeacher;