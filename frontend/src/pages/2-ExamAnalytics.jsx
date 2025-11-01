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
      <div>
        <h2>Exam Analytics</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Average Score</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{analyticsInfo.average_score}</p>
          </div>

          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Total Takers</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{analyticsInfo.total_takers}</p>
          </div>

          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Highest Score</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{analyticsInfo.highest_score}</p>
          </div>

          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Lowest Score</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{analyticsInfo.lowest_score}</p>
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
      <div>
        <h3>Question Stats</h3>
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Correct</th>
              <th>Points</th>
              <th>Accuracy (%)</th>
            </tr>
          </thead>
          <tbody>
            {questionStats.map(q => (
              <tr key={q.question_id}>
                <td>{q.question_text}</td>
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
      <div style={{ backgroundColor: '#a4f1ffff', padding: '10px' }}> {/* 3 divs */}
        
        <AnalyticsHeaderBar />

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#333', background: '#f5f5f5', margin: '5px' }}>
          <div onClick={() => navigate(`/exam-analytics/${examId}`)}>Analytics</div>
          <div>|</div>
          <div onClick={() => navigate(`/exam-analytics/section/${examId}`)}>Scores</div>
        </div>
        
        <div style={{ backgroundColor: '#00c21aff', margin: '10px', padding: '20px' }}>
          <ExamGraph analyticsInfo={infoStats || { total_takers: 0 }}/>
          <QuestionGraph />
        </div>

      </div>
    {/* END */}
    </>
  )
}

export default ExamAnalytics;