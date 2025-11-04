import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";
import Button from "../components/Buttons.jsx"
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
    <tbody>
      {studentsInfo.map((s) => {
        const studentViolations = violations.filter(
          (v) => v.student_school_id === s.school_id
        );

        return (
          <tr key={s.school_id}>
            <td style={{ padding: "8px" }}>{s.last_name}</td>
            <td style={{ padding: "8px" }}>{s.first_name}</td>
            <td style={{ padding: "8px" }}>{s.middle_initial}</td>
            <td style={{ padding: "8px" }}>{s.school_id}</td>
            <td style={{ padding: "8px" }}>{s.objective_score}</td>
            <td style={{ padding: "8px" }}>
              {s.essay_score === null ? "Not Yet Graded" : s.essay_score}{" "}
              <button onClick={() =>navigate(`/exam-analytics/${s.exam_id}/student-essay/${s.school_id}`)}>
                <i class="fa-solid fa-eye"></i>
              </button>
            </td>

            <td>
              <p>-{deductions[s.school_id]}</p>
              <span
                style={{
                  textDecoration: "underline",
                  color: "blue",
                  cursor: "pointer",
                }}
                onClick={() => setShowModal(s.school_id)}
              >
                View Violations
              </span>

              {showModal === s.school_id && (
                <>
                  <div className="overlay" onClick={() => setShowModal(null)}></div>
                  <div className="modal">
                    <h3>Violation Details</h3>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {studentViolations.length > 0 ? (
                        studentViolations.map((v, index) => (
                          <p key={index}>
                            {v.details}
                            {v.is_warning && (
                              <span style={{ color: "orange" }}> (Warning)</span>
                            )}
                          </p>
                        ))
                      ) : (
                        <p>No violations recorded.</p>
                      )}
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <label>
                        Deduct points:
                        <input
                          type="number"
                          value={deductions[s.school_id]}
                          onChange={(e) =>
                            handleDeductionChange(
                              s.school_id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                        />
                      </label>
                      <button onClick={() => handleSaveDeduction(s)}>Save</button>
                      <button onClick={() => setShowModal(null)}>Close</button>
                    </div>
                  </div>
                </>
              )}
            </td>

            <td style={{ padding: "8px" }}>
              {s.total_score} / {s.total_points}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

function ExamGraph({ analyticsInfo }) {
  console.log("uwwww:", analyticsInfo);


  return (
    <>
      <div class="score-exam-analytics-label">Exam Analytics</div>

      <div class="score-exam-analytics-container">
        <div class="score-exam-items">
          <label class="score-exam-label">Average Score</label>
          <p>{analyticsInfo.average_score}</p>
        </div>
        <div class="score-exam-items">
          <label class="score-exam-label">Total Takers</label>
          <p>{analyticsInfo.total_takers}</p>
        </div>
        <div class="score-exam-items">
          <label class="score-exam-label">Highest Score</label>
          <p>{analyticsInfo.highest_score}</p>
        </div>
        <div class="score-exam-items">
          <label class="score-exam-label">Lowest Score</label>
          <p>{analyticsInfo.lowest_score}</p>
        </div>
        <div class="score-exam-items">
          <label class="score-exam-label">No. of Passers</label>
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
      <div class="score-whole"> {/* 3 divs */}
        
        <AnalyticsHeaderBar />

        <div class="analytics-score-choice"> 
          <div class="analytic-score-btn" onClick={() => navigate(`/exam-analytics/${examId}`)}>Analytics</div>
          <div class="analytics-s-score-btn active" onClick={() => navigate(`/exam-analytics/section/${examId}`)}>Scores</div>
        </div> 
        <div class="score-main-container">
          <div>
            <div class="score-select-sectopn-label">Select Section</div>
            <SelectField
              className="score-select-section-inner"
              name="section"
              value={selectedSection}
              onChange={handleSectionChange} //this is section_id (optionSections value)
              options={optionSections}
            />
            <i className="fa-solid fa-file-export" onClick={exportScoresPerSection}></i>
          </div>


          <div class="score-student-performance-label">Student Performance Analytics</div>
          
          <div class="score-selected-section-container">
            <div class="score-selected-section-inner">
              <p> SECTION: {optionSections.find(o => o.value === selectedSection)?.label || 'None'} </p>
            </div>
          </div>


          <div class="score-analytics-conatiner">
            {selectedSection &&
            <ExamGraph analyticsInfo={sectionData || { total_takers: 0 }} />
            }
          </div>

          
          <div class="table-container">
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