import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";
import Button from "../components/Buttons.jsx"

function StudentDetails ({studentsInfo}) {
  const navigate = useNavigate();

  return (
    <tbody>
      {studentsInfo.map((s) => (
        <tr key={s.school_id} style={{ borderBottom: '1px solid #ddd' }}>
          <td style={{ padding: '8px' }}>{s.last_name}</td>
          <td style={{ padding: '8px' }}>{s.first_name}</td>
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
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>82%</p>
          </div>

          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Total Takers</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{analyticsInfo.total_takers}</p>
          </div>

          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Highest Score</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>98%</p>
          </div>

          <div style={{ flex: 1, minWidth: "150px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 5px" }}>Lowest Score</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>60%</p>
          </div>
        </div>
      </div>
    </>
  )
}

const QuestionGraph = () => {
  return (
    <>
      <div>
        <h3>Question Stats</h3>
        <p>Q1 - 80% correct</p>
      </div>
    </>
  )
}


function ExamAnalytics () {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { examId, studentId } = useParams(); 

  const [infoExam, setInfoExam] = useState({});
  const [infoStudent, setInfoStudent] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [selectedSection , setSelectedSection] = useState('');


  useEffect(()=>{
    fetchExamInfo(); 
  }, [examId]);
  
  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/exams/analytics/${examId}`, config); // getExamAnalytics 

      setInfoExam({...res.data.exam, total_takers: res.data.total_takers});
      setInfoStudent(res.data.students);
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

 
  return (
    <>
    {/* START */}
      <div style={{ backgroundColor: '#a4f1ffff', padding: '10px' }}> {/* 3 divs */}
        {/* S1*/}
        <div style={{ backgroundColor: '#005bc2ff', margin: '6px' }}>
          
          <button onClick={() => navigate(-1)}>arrow back-button</button>
          <p style={{ backgroundColor: '#e2a1d4ff', margin: '5px' }}>
            {infoExam.title}
          </p>

        </div> {/* E1*/}

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#333', background: '#f5f5f5', margin: '5px' }}>
          <div onClick={() => navigate(`/exam-analytics/${examId}`)}>Analytics</div>
          <div>|</div>
          <div onClick={() => navigate(`/exam-analytics/section/${examId}`)}>Scores</div>
        </div>
        
        <div style={{ backgroundColor: '#00c21aff', margin: '10px', padding: '20px' }}>
          <ExamGraph 
            analyticsInfo={infoExam} //general = all sections data
          />
          <QuestionGraph />
        </div>

      </div>
    {/* END */}
    </>
  )
}

export default ExamAnalytics;