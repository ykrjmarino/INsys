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
  const navigate = useNavigate();

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


function SectionAnalytics () {
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
        
        

      
        <div style={{ backgroundColor: '#ffa600ff', margin: '6px', padding: '20px'  }}>
          <div style={{ backgroundColor: '#e403b3ff', padding: '5px' }}>
            <label>Select Section</label>
            <SelectField
              name="section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(Number(e.target.value))} //this is section_id (optionSections value)
              options={optionSections}
            />
          </div>

          <p> Student Performance Analytics </p>

          
          
          <div style={{ backgroundColor: '#ff0000ff', padding: '6px' }}>
            <div style={{ backgroundColor: '#e8bff5ff', margin: '6px' }}>
              <p> SECTION: {optionSections.find(o => o.value === selectedSection)?.label || 'None'} </p>
            </div>
          </div>


          <div style={{ backgroundColor: '#00c21aff', margin: '10px', padding: '20px' }}>
            {selectedSection &&
            <ExamGraph 
              analyticsInfo={infoStudent.find(e=>e.section_id === selectedSection)}
            />
            }
          </div>

          
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
          </div>

        </div>
      </div> 
    </>
  )
}

export default SectionAnalytics;