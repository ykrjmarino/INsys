import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";





//bruh edit ts after


function IndividualAnalytics () {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { examId, studentId } = useParams(); 

  const [studentsInfo, setStudentsInfo] = useState('null');

  useEffect(()=>{
    fetchExamInfo(); 
  }, [examId]);

  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const allStudentAnswers = await axios.get(`/exams/student/${studentId}/analytics/${examId}`, config); // getStudentAnalytics

      setStudentsInfo(allStudentAnswers.data);
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics')
      console.error(err.message);
    }
  }
  return (
    <>
    {/* START */}
      <div style={{ backgroundColor: '#a4f1ffff', padding: '10px' }}> {/* 3 divs */}
        {/* S1*/}
        <div style={{ backgroundColor: '#00c2b2ff', margin: '6px' }}>
          <button>arrow back-button</button>
          <p>title</p>
          <select></select>
        </div> {/* E1*/}
        

        
        {/* S2*/}
        <div style={{ backgroundColor: '#ecebaeff', margin: '6px' }}>
          <p> Student Performance Analytics </p>
        </div> {/* E2*/}



        {/* S3*/}
        <div style={{ backgroundColor: '#00a136ff', padding: '5px' }}>

          {/* S3.1*/}
          <div style={{ backgroundColor: '#ff0000ff', margin: '6px' }}>
            <div style={{ backgroundColor: '#e8bff5ff', margin: '6px' }}>
              <p> SECTION: {} </p>
            </div>
            <div style={{ backgroundColor: '#ecc5aeff', margin: '6px' }}>
              <p> # of students </p>
            </div>
          </div>{/* E3.1*/}


          {/* S3.2*/}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '40px' }}>
            <div> Name </div>
            <div> School ID </div>
            <div> Objective Score </div>
            <div> Essay Score </div>
            <div> Score </div>
            <div> Time Taken </div>

            {/* {students.map((s) => (
              <React.Fragment key={i}>
                <div>{s.name}</div>
                <div>{s.score}</div>
                <div>{s.status}</div>
              </React.Fragment>
            ))} */}
          </div>{/* E3.2*/}
          
        </div> {/* E3*/}

      </div>
    {/* END */}
    </>
  )
}

export default IndividualAnalytics;