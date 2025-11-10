import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx';
import axios from '../utils/axiosConfig.js';
import { toast } from 'react-toastify';

//hooks
import { useExams } from '../hooks/useExams.js';
//components
import EnterExam from '../components/home-student/EnterExam.jsx';

function HomeStudent() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [checkSession, setCheckSession] = useState(null);
  const [examId, setExamId] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      }; 

      try {
        const res = await axios.get('/student/session', config); //status, exam_id, current_index
        
        if(res.data) {
          setExamId(res.data.exam_id);
          setCheckSession(res.data);
          
          // session in-progress and exam active → show popup
          const now = new Date();
          const startTime = new Date(res.data.start_datetime);
          const endTime = new Date(res.data.end_datetime);

          if (res.data.status === 'in-progress' && now >= startTime && now <= endTime) {
            setShowPopup(true);
            console.log(`Ongoing exam at exam_id: ${res.data.exam_id}`);
          } else {
            // auto-submit if session is in-progress but exam ended OR already submitted
            console.log('No popup: exam already completed or session submitted.');
            if (res.data.status === 'in-progress') {
              await axios.post(`/student/exams/${res.data.exam_id}/submit`, {}, config);
              console.log('Exam session auto-submitted.');
            }
          }
        }
      } catch (error) {
        console.log('wala nahanap');
        console.log('No active session found');
      }
    }

    fetchSession();
  }, []);

  //navigate to exam page
  const handleEnterExam = async() => {
    try {
      const res = await axios.get(`/student/verify/re-enter/${examId}`); 
      
      if (!res.data.allowed) {
        toast.error("You cannot enter this exam yet.");
        return;
      }

      setShowPopup(false);
      navigate(`/exam/start/${examId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to check exam status.");
    }
    // console.log("Entering exam", examId);
    // setShowPopup(false);
  };

  //submitAll
  const handleSubmitExam = async() => {
    console.log("Submit exam", examId);
    setShowPopup(false);

    try {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

      await axios.post(`/student/exams/${examId}/submit`, { examId }, config);
    } catch (error) {
      console.log(
        error.response?.data?.error ||
        error.response?.data ||
        error.message
      );
      alert(error.response?.data?.error || "Failed to submit = true");
    }
  };

  return (
    <>
      <div className="student-home-grid-bg"></div>

      <EnterExam />
      {showPopup && (
        <div className="entering-exam-modal">
          <div className="entering-exam-modal-container">
            <h4 className="entering-exam-modal-title">Ongoing Exam</h4>
            <div className="entering-exam-modal-content">
              You already have an exam in progress. Continue or submit?
            </div>
            <div className="entering-exam-modal-buttons">
              <button className="confirm" onClick={handleEnterExam}>Enter Exam</button>
              <button className="delete" onClick={handleSubmitExam}>Submit Exam</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomeStudent;