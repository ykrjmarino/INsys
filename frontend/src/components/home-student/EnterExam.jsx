import Button from '../../components/Buttons.jsx'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import axios from '../../utils/axiosConfig.js';
import { useAuth } from '../../context/AuthContext.jsx';

import InputField from '../InputFields.jsx';
import ScoreHistory from './HistoryScores.jsx';
import { HeaderStudent } from '../Header.jsx';


function EnterExam() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [inputExamCode, setInputExamCode] = useState('');
  const [inputExamSection, setInputExamSection] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [examId, setExamId] = useState(null);

  const [phraseInstructions, setPhraseInstructions] = useState('');


  const handleEnterCode = async () =>  {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };
    try {
      const res = await axios.post(`/student/verify`, {inputCode: inputExamCode, inputSection: inputExamSection}, config) //this post request still returns value, so we can use the data
      setIsVerified(true);
      
      //if verified, it will proceed to this
      setExamId(res.data.exam.exam_id);

      if (Number(res.data.exam.timer_question) === 0) {
        setPhraseInstructions('There is no time limit for answering each questions.');
      } else {
        setPhraseInstructions(`You have ${res.data.exam.timer_question} seconds to answer each question.`);
      }
      console.log("Try lang,,, Exam ID:", res.data.exam.exam_id);
    } catch (error) {
      alert(error.response?.data?.error || error.message || "Something went wrong");
    }
  }

  const handleStartClick = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };
    try {
      const res = await axios.post(`/student/exams/${examId}/start`, {inputCode: inputExamCode, inputSection: inputExamSection}, config);   
      navigate(`/exam/start/${examId}`);
    } catch (error) {
      alert(error.response?.data?.error || "Something went wrong");
    }
  }
  
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const minWidth = isMobile ? 300 : 1700;
  const minHeight = isMobile ? 400 : 400;

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isWindowTooSmall, setIsWindowTooSmall] = useState(false);
  const [canStartExam, setCanStartExam] = useState(false);

  useEffect(() => {
    if (!isVerified) return; // don't check camera yet

    const checkAll = async () => {
      const tooSmall = window.innerWidth < minWidth || window.innerHeight < minHeight;
      setIsWindowTooSmall(tooSmall);

      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraOn(true);
      } catch {
        setIsCameraOn(false);
      }

      setCanStartExam(!tooSmall && isCameraOn);
    };

    checkAll();
    window.addEventListener("resize", checkAll);
    return () => window.removeEventListener("resize", checkAll);
  }, [isVerified, minWidth, minHeight, isCameraOn]);
  
  return (
    <>
    {!isVerified ? (
      <>
      <div className="student-home-whole">
        <div className="student-home-header"></div>{/* <HeaderStudent /> */}

        <input type="checkbox" className="student-home-open-sidebar-menu" id="student-home-open-sidebar-menu" />
        <label htmlFor="student-home-open-sidebar-menu" className="student-home-sidebar-icon-toggle">
            <div className="s-h-spinner s-h-diagonal s-h-part-1"></div>
            <div className="s-h-spinner s-h-horizontal"></div>
            <div className="s-h-spinner s-h-diagonal s-h-part-2"></div>
        </label>

        <div id="student-home-sidebar-menu">
          <div className="sidebar-logo">
            <img src="insys3.PNG" alt="Sidebar Logo" />
          </div>

          <div className="student-home-sidebar-buttons">
            <h1 className="student-home-sidebar-title">Tools</h1>
            <button className="student-home-sidebar-btn" onClick={()=> navigate('/student-entry')}><i className="fas fa-chart-bar"></i> Dashboard</button>
            <button className="student-home-sidebar-btn" onClick={()=> navigate('/student-history')}><i className="fa-solid fa-clock-rotate-left"></i>History</button>
            <button className="student-home-sidebar-btn"><i className="fa-solid fa-gear"></i> Settings</button>
          </div>


          <div className="student-home-logout">
            <a href="#" className="student-home-logout-btn"><i className="fa-solid fa-right-from-bracket"></i> Logout</a>
          </div>
        </div>


        <div className="student-home-code-container">
          <div className="student-home-container-logo">
            <img src="/images/insys-logo.webp" alt="logo" />
          </div>
          <div className="student-home-input">
            <label htmlFor="section">Section</label>
            <InputField 
              name="section"
              id="section"
              value={inputExamSection} 
              onChange={(e) => setInputExamSection(e.target.value)}
              placeholder="Enter your section"
            />
          </div>
          <div className="student-home-input">
            <label htmlFor="code">Code</label>
            <InputField
              name="code"
              id="code"
              value={inputExamCode} 
              onChange={(e) => setInputExamCode(e.target.value)}
              placeholder="Enter your exam code"
            />
          </div>
          <Button className="student-home-exam-button" label="Take Exam" onClick={handleEnterCode} />
        </div>
      </div>
      </>
    ) : (
      <>
      <div className="student-instructions-whole">
        <div className="student-instructions-container">
          <div className="student-instruction-icon-container">
            <i className="fa-solid fa-file-contract"></i>
          </div>
          <label>Exam Instructions</label>
          <p className="student-instructions-text">
            • {phraseInstructions}<br/>
            • Ensure a stable internet connection throughout the exam.<br/>
            • Switching tabs, opening new tabs, or accessing external resources is strictly prohibited.<br/>
            • Your activity is monitored. Any violation will be recorded.<br/>
            • Three warnings will result in a red flag being issued for your exam.<br/>
            • Read each question carefully before answering.<br/>
            • Contact the proctor if you encounter technical issues.
          </p>

          {isWindowTooSmall  && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontStyle: "italic"}}></i>
              Your window is too small to take the exam. Please resize it.
            </p>
          )}

          {!isCameraOn  && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontStyle: "italic"}}></i>
              Open your camera.
            </p>
          )}

          <div className="student-instruction-bottom-stick">
            <div className="student-instruction-checkbox-container">
              <input type="checkbox" id="agree-checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <label htmlFor="agree-checkbox">I have read and understand the instructions</label>
            </div>
            <button className="student-instruction-take-exam-btn" id="student-instruction-take-exam-btn" disabled={!agreed || !canStartExam} onClick={handleStartClick}>Take Exam</button>
          </div>
        </div>
      </div>
      </>
    )}
    
    </>
  )
}

export default EnterExam;