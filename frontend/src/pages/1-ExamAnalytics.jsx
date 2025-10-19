import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";

function StudentDetails ({studentsInfo}) {

  return (
    <tbody>
      {studentsInfo.map((a) => (
        <tr key={a.school_id}>
          <td>{a.first_name}</td> 
          <td>{a.last_name}</td>
          <td>{a.school_id}</td>
          <td>{a.objective_score}</td>
          <td>{a.essay_score}</td>
          <td>{a.total_score} / {a.total_points}</td>
        </tr>
      ))}
    </tbody>
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

      setInfoExam(res.data.exam);
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
  

  // const fetchScores = async() => {
  //   const config = {
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //     withCredentials: true
  //   };

  //   try {
  //     const allExamInfo = await axios.get(`/exams/analytics/${examId}`, config); // getExamAnalytics 
      
  //   } catch (error) {
  //     console.log('fetchScores failed, in ExamAnalytics')
  //     console.error(err.message);
  //   }
  // }
    
  
  return (
    <>
    {/* START */}
      <div style={{ backgroundColor: '#a4f1ffff', padding: '10px' }}> {/* 3 divs */}
        {/* S1*/}
        <div style={{ backgroundColor: '#005bc2ff', margin: '6px' }}>
          
          <button>arrow back-button</button>
          <p style={{ backgroundColor: '#e2a1d4ff', margin: '5px' }}>
            {infoExam.title}
          </p>
          <div style={{ backgroundColor: '#e403b3ff', padding: '5px' }}>
            <label>Select Section</label>
            <SelectField
              name="section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)} //this is section_id (optionSections value)
              options={optionSections}
            />
          </div>

        </div> {/* E1*/}
        

        
        {/* S2*/}
        <div style={{ backgroundColor: '#ecebaeff', margin: '6px' }}>
          <p> Student Performance Analytics </p>
        </div> {/* E2*/}



        {/* S3*/}
        <div style={{ backgroundColor: '#00a136ff', margin: '5px' }}>

          {/* S3.1*/}
          <div style={{ backgroundColor: '#ff0000ff', padding: '6px' }}>
            <div style={{ backgroundColor: '#e8bff5ff', margin: '6px' }}>
              <p> SECTION: {} </p>
            </div>
            <div style={{ backgroundColor: '#ecc5aeff', margin: '6px' }}>
              <p> # of students </p>
            </div>
          </div>{/* E3.1*/}


          {/* S3.2*/}
          <div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>School ID</th>
                  <th>Objective Score</th>
                  <th>Essay Score</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              {selectedSection &&
                <StudentDetails 
                  studentsInfo={infoStudent.filter(e=>e.section_id === Number(selectedSection))}
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