import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";
import Button from "../components/Buttons.jsx"
import { AnalyticsHeaderBar } from "../components/Header.jsx";

function StudentDetails ({studentsInfo}) {
  const navigate = useNavigate();

  return (
    <tbody>
      {studentsInfo.map((s) => (
        <tr key={s.school_id} style={{ borderBottom: '1px solid #ddd' }}>
          <td style={{ padding: '8px' }}>{s.last_name}</td>
          <td style={{ padding: '8px' }}>{s.first_name}</td>
          <td style={{ padding: '8px' }}>{s.middle_initial}</td>
          <td style={{ padding: '8px' }}>{s.school_id}</td>
          <td style={{ padding: '8px' }}>{s.objective_score}</td>
          <td style={{ padding: '8px' }}>{s.essay_score} <Button label="View" onClick={() => navigate(`/exam-analytics/${s.exam_id}/student-essay/${s.school_id}`)} /></td>
          <td style={{ padding: '8px' }}>{s.total_score} / {s.total_points} <Button label="Details" onClick={() => navigate(`/exam-analytics/${s.exam_id}/student-essay/${s.school_id}`)} /></td>
        </tr>
      ))}
    </tbody>
  )
}

function ExamGraph({ analyticsInfo }) {
  return (
    <>
      <div className = "score-analytics-conatiner">
        <div className="analytics-exam-analytics-label">Exam Analytics</div>

        <div className="analytics-exam-analytics-container">
          <div className="analytics-exam-items">
            <label className="analytics-exam-label">Average Score</label>
            <p>{analyticsInfo.average_score}</p>
          </div>

          <div className="analytics-exam-items">
            <label className="analytics-exam-label">Total Takers</label>
            <p>{analyticsInfo.total_takers}</p>
          </div>

          <div className="analytics-exam-items">
           <label className="analytics-exam-label">Highest Score</label>
            <p>{analyticsInfo.highest_score}</p>
          </div>

          <div className="analytics-exam-items">
            <label className="analytics-exam-label">Lowest Score</label>
            <p>{analyticsInfo.lowest_score}</p>
          </div>
        </div>
      </div> 
    </>
  )
}

const QuestionGraph = () => {
  const { accessToken } = useAuth();
  const { examId } = useParams(); 

  const [questionStats, setQuestionStats] = useState([]);

  useEffect(() => {
    fetchExamAnalytics(examId)
      .then(data => setQuestionStats(data))
      .catch(err => console.error(err));
  }, [examId]);

  const fetchExamAnalytics = async (examId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/exam/analytics/${examId}/questions`, config);
      console.log(res.data)
      return res.data; 
    } catch (error) {
      console.error("Error fetching exam analytics:", error);
      return []; 
    }
  };

  
  return (
    <>
      <div class= "analytics-table">
        <div class="analytics-exam-analytics-label">Question Stats</div>
        <table>
          <thead>
            <tr>
              <th className="question-text">Question</th>
              <th>Answered Correctly</th>
              <th>Points</th>
              <th>Accuracy (%)</th>
            </tr>
          </thead>
          <tbody>
            {questionStats.map(q => (
              <tr key={q.question_id}>
                <td className="question-text">{q.question_text}</td>
                <td>{q.correctCount}</td>
                <td>{q.points}</td>
                <td>{q.accuracy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}


function ExamAnalytics () {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { examId } = useParams(); 

  const [infoExam, setInfoExam] = useState({});
  const [infoStats, setInfoStats] = useState({});

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

      setInfoExam(res.data.exam);
      setInfoStats(res.data.overall_stats);
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

 
  return (
    <>
    {/* START */}
      <div> {/* 3 divs */}
        
        <AnalyticsHeaderBar />

        <div class="analytics-score-choice">
          <div class="analytics-btn active" onClick={() => navigate(`/exam-analytics/${examId}`)}>Analytics</div>
          <div class="score-btn" onClick={() => navigate(`/exam-analytics/section/${examId}`)}>Scores</div>
        </div>
        
        <div class="main-score-container">
          <ExamGraph analyticsInfo={infoStats || { total_takers: 0 }}/>
          <QuestionGraph />
        </div>

      </div>
    {/* END */}
    </>
  )
}

export default ExamAnalytics;