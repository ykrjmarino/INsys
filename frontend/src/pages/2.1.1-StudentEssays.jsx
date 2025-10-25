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
      <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <p>points: {essay.points}</p>
        <p>Question:</p>
        <p>{essay.question_text}</p>
        <div style={{ border: '1px solid #ccc', backgroundColor: '#ccccccff', padding: '10px', borderRadius: '6px', minHeight: '220px', marginBottom: '10px', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', }}>
          {essay.student_answer}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="number"
            value={value} 
            min='0'
            max={max}
            onChange={onChange}
            placeholder="Grade" 
            style={{ width: '60px', padding: '5px' }} />
          <button onClick={()=>onSubmit(essay.question_id)} style={{ padding: '8px 15px', border: 'none', backgroundColor: '#4CAF50', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
            Submit
          </button>
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
    <div>
      <div style={{ backgroundColor: '#e403b3ff', padding: '5px' }}>
        <button onClick={() => navigate(-1)}>arrow back-button</button>
        <p>student name {essay.question_id}</p>
        <p>student id</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px'}}>
        <p>Essay Answers</p>
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
        {/* Essay Card */}
        
      </div>
    </div>
    </>
  )
}

export default StudentEssays;