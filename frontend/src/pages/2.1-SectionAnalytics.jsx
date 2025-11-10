import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";
import ReactDOM from "react-dom";
import { AnalyticsHeaderBar } from "../components/Header.jsx";

import { toast } from 'react-toastify';

function StudentDetails({ studentsInfo, violations, refreshExamInfo }) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [showModal, setShowModal] = useState(null); // store school_id of open modal
  const [deductions, setDeductions] = useState(() =>
    studentsInfo.reduce((acc, s) => {
      acc[s.school_id] = s.deduction || 0;
      return acc;
    }, {})
  );

  useEffect(() => {
    setDeductions(
      studentsInfo.reduce((acc, s) => {
        acc[s.school_id] = s.deduction ?? 0;
        return acc;
      }, {})
    );
  }, [studentsInfo]);

  const handleDeductionChange = (schoolId, value) => {
    setDeductions((prev) => ({ ...prev, [schoolId]: value }));
  };

  const handleSaveDeduction = async (student) => {
    try {
      await axios.patch(
        `/exam-analytics/${student.exam_id}/student/${student.school_id}/deduction`,
        { deduction: deductions[student.school_id] },
        { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true }
      );
      toast.info("Deduction updated!");

      setTimeout(() => {
        setShowModal(null); 
      }, 700); //0.7secs

      refreshExamInfo();
    } catch (err) {
      console.error(err);
      alert("Failed to update deduction");
    }
  };

    return (
    <>
      <tbody>
        {studentsInfo.map(s => {
          const studentViolations = violations.filter(
            v => v.student_school_id === s.school_id
          );

          return (
            <tr key={s.school_id}>
              <td style={{ padding: "8px" }}>{s.last_name}</td>
              <td style={{ padding: "8px" }}>{s.first_name}</td>
              <td style={{ padding: "8px" }}>{s.middle_initial}</td>
              <td style={{ padding: "8px" }}>{s.school_id}</td>
              <td style={{ padding: "8px" }}>{s.objective_score}</td>
              <td style={{ padding: "8px" }}>
                {s.essay_score ?? "Not Yet Graded"}{" "}
                <button onClick={() => navigate(`/exam-analytics/${s.exam_id}/student-essay/${s.school_id}`)}>
                  <i className="fa-solid fa-eye"></i>
                </button>
              </td>
              <td>
                <p>-{deductions[s.school_id]}</p>
                <span
                  style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
                  onClick={() => setShowModal(s.school_id)}
                >
                  View Violations
                </span>
              </td>
              <td style={{ padding: "8px" }}>{s.total_score} / {s.total_points}</td>
            </tr>
          );
        })}
      </tbody>

      {/* MODAL PORTAL OUTSIDE TABLE */}
      {showModal && (() => {
        const s = studentsInfo.find(st => st.school_id === showModal);
        const studentViolations = violations.filter(v => v.student_school_id === s.school_id);

        return ReactDOM.createPortal(
          <div className="violation-modal" onClick={() => setShowModal(null)}>
            <div className="violation-modal-container" onClick={e => e.stopPropagation()}>
              <h4 className="violation-modal-title">Violation Details</h4>
              <div className="violation-modal-content">
                {studentViolations.length > 0 ? (
                  studentViolations.map((v, i) => (
                    <p key={i}>{v.details}{v.is_warning && <span className="warning-text"> (Warning)</span>}</p>
                  ))
                ) : (
                  <p>No violations recorded.</p>
                )}
              </div>

              <div className="violation-modal-deduction">
                <div className="violation-modal-deduction-input">
                  <label className="violation-modal-deduction-input-label">
                    Deduct points:
                    <input
                      type="number"
                      value={deductions[s.school_id]}
                      onChange={e => handleDeductionChange(s.school_id, parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </label>
                </div>
                <div className="violation-modal-deduction-buttons">
                  <button className="confirm" onClick={() => handleSaveDeduction(s)}>Save</button>
                  <button className="cancel" onClick={() => setShowModal(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </>
  );
}

function ExamGraph({ analyticsInfo }) {
  console.log("uwwww:", analyticsInfo);


  return (
    <>
      <div className="score-exam-analytics-label">Exam Analytics</div>

      <div className="score-exam-analytics-container">
        <div className="score-exam-items">
          <label className="score-exam-label">Average Score</label>
          <p>{analyticsInfo.average_score}</p>
        </div>
        <div className="score-exam-items">
          <label className="score-exam-label">Total Takers</label>
          <p>{analyticsInfo.total_takers}</p>
        </div>
        <div className="score-exam-items">
          <label className="score-exam-label">Highest Score</label>
          <p>{analyticsInfo.highest_score}</p>
        </div>
        <div className="score-exam-items">
          <label className="score-exam-label">Lowest Score</label>
          <p>{analyticsInfo.lowest_score}</p>
        </div>
        <div className="score-exam-items">
          <label className="score-exam-label">No. of Passers</label>
          <p>{analyticsInfo.passed_count}</p>
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
  const [sectionData, setSectionData] = useState({});
  const [selectedSection, setSelectedSection] = useState(
    localStorage.getItem('selectedSection') || ''
  );

  const [violations, setViolations] = useState([]);


  useEffect(()=>{
    fetchExamInfo(); 
  }, [examId]);
  
  useEffect(() => {
    if (infoExam.exam_id) fetchSections();
  }, [infoExam]);

  useEffect(() => {
    if (selectedSection) {
      fetchPerSection(selectedSection);
    }
  }, [selectedSection]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedSection');
    if (saved) setSelectedSection(Number(saved));
  }, [allSections]);

  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/exam/analytics/${examId}`, config); // getExamAnalytics 

      setInfoExam({...res.data.exam, overall_stats: res.data.overall_stats}); //added: passed_count, failed_count
      setInfoStudent(res.data.students);
      setViolations(res.data.violations);
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

  const fetchPerSection = async(sectionId) => {//selectedSection
    if (!sectionId) return;

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/exam/analytics/${examId}/section-filter`, { // getSectionAnalytics
        params: {section: sectionId},
        ...config
      });

      setSectionData(res.data || {});
              // console.log(res.data.section_name);
              // console.log(res.data.average_score);
              // console.log(res.data.highest_score);
              // console.log(res.data.lowest_score);
              // console.log(res.data.total_takers);
              // console.log(res.data.passed_count);
      console.log('fetchPerSection wrking');
    } catch (error) {
      console.log('fetchPerSection failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  const fetchSections = async() => { //for options
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

  const handleSectionChange = (e) => {
    const value = Number(e.target.value);
    setSelectedSection(value);
    localStorage.setItem('selectedSection', value);
  };

  /*
  s.section_id, 
  s.section_name, 
  c.course_code, 
  y.year_number
  */
  const optionSections = allSections.map((s) => (
    { label:`${s.course_code}–${s.year_number}${s.section_name}`, value: s.section_id }
  ));
  
  const exportScoresPerSection = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    if (!infoStudent || !infoStudent.length) {
      console.log("No student data to export");
      return;
    }

    try {
      const response = await axios.get(`/export/${examId}/${selectedSection}`, { 
        ...config,
        responseType: "blob"
      });

      const examTitle = infoStudent[0]?.title;
      const sectionName = infoStudent[0]?.student_section_name;

      console.log("examTitle::::", examTitle);

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${examTitle}_${sectionName}_scores.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log('exportScoresPerSection wrking');
    } catch (error) {
      console.log('exportScoresPerSection failed, in ExamAnalytics');
      console.error(error.message);
    }
  }
  
  return (
    <>
      <div className="score-whole"> {/* 3 divs */}
        
        <AnalyticsHeaderBar />

        <div className="analytics-score-choice"> 
          <div className="analytic-score-btn" onClick={() => navigate(`/exam-analytics/${examId}`)}>Analytics</div>
          <div className="analytics-s-score-btn active" onClick={() => navigate(`/exam-analytics/section/${examId}`)}>Scores</div>
        </div> 
        <div className="score-main-container">
          <div className="score-select-section">
            <div className="score-select-sectopn-label">Select Section</div>
            <SelectField
              className="score-select-section-inner"
              name="section"
              value={selectedSection}
              onChange={handleSectionChange} //this is section_id (optionSections value)
              options={optionSections}
            />
            <div className="export-wrapper">
              <i className="fa-solid fa-file-export" onClick={exportScoresPerSection}></i>
              <span className="tooltip">Export</span>
            </div>
          </div>


          <div className="score-student-performance-label">Student Performance Analytics</div>
          
          <div className="score-selected-section-container">
            <div className="score-selected-section-inner">
              <p> SECTION: {optionSections.find(o => o.value === selectedSection)?.label || 'None'} </p>
            </div>
          </div>


          <div className="score-analytics-conatiner">
            {selectedSection &&
            <ExamGraph analyticsInfo={sectionData || { total_takers: 0 }} />
            }
          </div>

          
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>First Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Middle Initial</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>School ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Objective Score</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Essay Score</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Violations</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Score</th>
                </tr>
              </thead>
              {selectedSection &&
                <StudentDetails 
                  studentsInfo={infoStudent.filter(e=>e.section_id === selectedSection)}
                  violations={violations}
                  refreshExamInfo={fetchExamInfo}
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