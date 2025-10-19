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
          <td style={{ padding: '8px' }}>{s.total_score} / {s.total_points}</td>
        </tr>
      ))}
    </tbody>
  )
}

function ExamGraph() {
  const navigate = useNavigate();

  return (
    <>
      dito mga graphs.. tapusin mo na to ngayon, we dont have much time
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
  
  useEffect(() => {
    if (infoExam.exam_id) fetchSections();
  }, [infoExam]);

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

  const fetchSections = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/exams/${examId}/sections?courseCode=${infoExam.course_code}`, config); // getSectionTakersByExamId
      setAllSections(res.data);
      
      console.log('fetchsections wrking');
    } catch (err) {
      console.log('fetchSections failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

  /*
  s.section_id, 
  s.section_name, 
  c.course_code, 
  y.year_number
  */
  const optionSections = allSections.map((s) => (
    { label:`${s.course_code}–${s.year_number}${s.section_name}`, value: s.section_id }
  ));
  
    
  
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

          <div style={{ backgroundColor: '#00c21aff', padding: '6px' }}>
            <ExamGraph />
          </div>

          <div style={{ backgroundColor: '#e403b3ff', padding: '5px' }}>
            <label>Select Section</label>
            <SelectField
              name="section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(Number(e.target.value))} //this is section_id (optionSections value)
              options={optionSections}
            />
          </div>

        </div> {/* E1*/}
        

        
        {/* S2*/}
        <div style={{ backgroundColor: '#ecebaeff', margin: '6px' }}>
          <p> Student Performance Analytics </p>
          <p> Takers: {infoExam?.total_takers} </p>
        </div> {/* E2*/}



        {/* S3*/}
        <div style={{ backgroundColor: '#00a136ff', margin: '5px' }}>

          {/* S3.1*/}
          <div style={{ backgroundColor: '#ff0000ff', padding: '6px' }}>
            <div style={{ backgroundColor: '#e8bff5ff', margin: '6px' }}>
              <p> SECTION: {optionSections.find(o => o.value === selectedSection)?.label || 'None'} </p>
            </div>
          </div>{/* E3.1*/}


          {/* S3.2*/}
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>First Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>School ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Objective Score</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Essay Score</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Score</th>
                </tr>
              </thead>
              {selectedSection &&
                <StudentDetails 
                  studentsInfo={infoStudent.filter(e=>e.section_id === selectedSection)}
                />
              }
              
              

            </table>
          </div>{/* E3.2*/}


          
        </div> {/* E3*/}

      </div>
    {/* END */}
    </>
  )
}

export default ExamAnalytics;