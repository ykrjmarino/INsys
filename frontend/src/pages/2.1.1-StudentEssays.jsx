import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";
import Button from "../components/Buttons.jsx"

function EssayComponent({ essay, value, onChange, onSubmit, max }) {
  return(
    <>
      <div className="essay-box">

        <div className="essay-points-container">
          <p className="essay-points">{value ?? 0} / {max}</p>
        </div>
        <div className="essay-question-label">Question: <br/> {essay.question_text}</div>
        
        <div className="essay-answer">
          {essay.student_answer}
        </div>

        <div className="essay-grade">
          <input 
            type="number"
            value={value} 
            min='0'
            max={max}
            onChange={onChange}
            placeholder="Grade" 
            style={{ width: '60px', padding: '5px' }} />
          <button className="submit-grade-button" onClick={()=>onSubmit(essay.question_id)}>Submit</button>
        </div>
      </div>
    </>
  )
}

function StudentEssays() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { examId, studentId } = useParams(); 

  const [essay, setEssay] = useState([]);
  const [editScore, setEditScore] = useState({});

  useEffect(() => {
    const fetchEssay = async() => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

      try {
        const res = await axios.get(`/exams/${examId}/essays/${studentId}`, config);
        setEssay(res.data);
        /*
        question_id: 136,
        question_text: 'Explain the difference between client-side and server-side scripting.',
        points: 3,
        student_answer: 'uwu',
        essay_score: 0
        */
      } catch (error) {
        console.log('fetchEssay failed, in StudentEssays');
        console.error(error.message);
      }
    }
    fetchEssay();
  }, [ examId, studentId ]);

  const handleSubmitScore = async(questionId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.patch(`/student-score/essay/${examId}/${questionId}`, {studentSchoolId: studentId , essayScore: editScore[questionId]}, config);
      console.log('Score submitted:', res.data);
    } catch (error) {
      console.log('handleSubmitScore failed, in StudentEssays');
      console.error(error.message);
    }
  }
  

  return(
    <>
    <div className="essay-page">
      <header className="essay-header">
        <button className="back-button" onClick={() => navigate(-1)}><i className="fa-solid fa-arrow-left"></i></button>
        <p className="student-name">{essay[0]?.first_name} {essay[0]?.middle_initial}. {essay[0]?.last_name}</p>
        <p className="student-id">{essay[0]?.school_id}</p>
      </header>

      <main className="essay-container">
        <h2>Essay Answers</h2>
        {essay.length === 0 ? (
          <p>No essays found for this student.</p>
        ) : (essay.map((item) => (
          <EssayComponent 
            key={item.question_id}
            essay={item}
            value={editScore[item.question_id] ?? item.essay_score ?? ''}
            max={item.points}
            onChange={(e) => setEditScore({
                ...editScore,
                [item.question_id]: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            onSubmit={handleSubmitScore}
          />
          ))
        )}
      </main>
    </div>
    </>
  )
}

export default StudentEssays;