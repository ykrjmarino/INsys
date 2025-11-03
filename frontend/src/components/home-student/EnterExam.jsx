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

  const [canStartExam, setCanStartExam] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      const tooSmall = window.innerWidth < minWidth || window.innerHeight < minHeight;
      setCanStartExam(!tooSmall);
    };

    checkSize(); // initial check on page load
    window.addEventListener("resize", checkSize); // re-check on resize
    return () => window.removeEventListener("resize", checkSize);
  }, [minWidth, minHeight]);
  
  return (
    <>
    {!isVerified ? (
      <>
      <HeaderStudent />
      <div className="student-home-code-container">
        <div className = "student-home-container-logo" >
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
      <ScoreHistory />
      </>
    ) : (
      <>
      <div className="student-instructions-whole">
        <div className="student-instructions-container">
          <div className="student-instruction-icon-container">
            <i className="fa-solid fa-file-contract"></i>
          </div>
          <label>Exam Instructions</label>
          <p>
            1. The exam consists of 30 questions: 10 multiple-choice, 10 identification, and 10 true-or-false questions.<br />
            2. You have 30 seconds to answer each question.<br />
            3. Ensure a stable internet connection throughout the exam.<br />
            4. Switching tabs, opening new tabs, or accessing external resources is strictly prohibited.<br />
            5. Your activity is monitored. Any violation will result in a warning.<br />
            6. Three warnings will result in a red flag being issued for your exam.<br />
            7. Submit your answers before the time expires to ensure they are recorded.<br />
            8. Read each question carefully before answering.<br />
            9. Use only the provided interface to submit your responses.<br />
            10. Contact the proctor if you encounter technical issues.
          </p>

          {!canStartExam && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>
              ⚠️ Your window is too small to take the exam. Please resize it.
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