import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axiosConfig.js';
import ReactDOM from "react-dom";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';

//components
import SelectField from '../components/SelectFields.jsx';
import { SidebarTeacher } from '../components/SidebarTS.jsx';
import DraftExams, { CompletedExams, OngoingExams, PublishedExams } from '../components/home-teacher/ExamsPerStatus.jsx';

export const HomeExamsTeacher = () => {
  //========= home filter status =========//
  const { exams, archiveExam, deleteExam, duplicateExam, fetchAllExams } = useExams();

  const [status, setStatus] = useState(
    localStorage.getItem('examStatus') || 'draft'
  );
  const [allExams, setAllExams] = useState([]);

  
  useEffect(() => {
    const load = async () => {
      const data = await fetchAllExams;
      setAllExams(data);
    };
    load();
  }, []);

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    localStorage.setItem('examStatus', value);
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem('examStatus');
    };
  }, []);

  const optionsArray = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" }
  ];

  return (
    <>
{/* <!-- main home content -->
    <!-- start --> */}
    <div className="teacher-home-main-content">
      <div className="teacher-home-labels-dropdown-container">
        <label className="main-container-title">Exams</label>
        <SelectField className="dropdown-main"
          name="status"
          value={status}
          onChange={handleStatusChange}
          options={optionsArray}
        />
      </div>
      

      <div className="grid-container">

          {status === 'draft' && 
          <DraftExams 
            exams={exams.filter(e => e.status === 'draft')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam}
            onClickArch={archiveExam}
          />}
          {status === 'published' && 
          <PublishedExams
            exams={exams.filter(e => e.status === 'published')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
            onClickArch={archiveExam}
          />}
          {status === 'ongoing' && 
          <OngoingExams 
            exams={exams.filter(e => e.status === 'ongoing')} 
            // onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
            onClickArch={archiveExam}
          />}

          {status === 'completed' && 
          <CompletedExams 
            exams={exams.filter(e => e.status === 'completed')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
            onClickArch={archiveExam}
          />}
          </div>
        </div>
    </>
  );
}

export const HomeCount = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [examCounts, setExamCounts] = useState({
    total_exams: 0,
    published_exams: 0,
    ongoing_exams: 0,
    completed_exams: 0,
    archived_exams: 0
  });

  useEffect(()=>{
    const fetchSystemAnalytics = async() => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

      try {
        const res = await axios.get(`/exam/count`, config);
        console.log(res.data);

        setExamCounts(res.data || {});
        console.log('fetchSystemAnalytics wrking');
      } catch (error) {
        console.log('fetchSystemAnalytics failed, in ExamAnalytics');
        console.error(error.message);
      }
    }
    fetchSystemAnalytics(); 
  }, [accessToken]);


  const handleCreate = async () => {
    try {
      const res = await axios.post('/exams/create-exam', {
        title,
        status: "draft"
      });
      navigate(`/update-exam/${res.data.exam_id}`)
    } catch (err) {
      console.error("Error creating exam", err);
    }
  };

  return (
    <>
    <div class = "teacher-home-added-main-container">
      <label className="teacher-home-main-label">Exams</label>


      <div className="teacher-home-added-grid">
        <div className="teacher-home-added-item">
          <label className="teacher-home-added-label">No. of exams</label>
          <p>{examCounts.total_exams}</p>
        </div>

        <div className="teacher-home-added-item">
          <label className="teacher-home-added-label">Published Exams</label>
          <p>{examCounts.published_exams}</p>
        </div>

        <div className="teacher-home-added-item">
          <label className="teacher-home-added-label">Ongoing Exams</label>
          <p>{examCounts.ongoing_exams}</p>
        </div>

        <div className="teacher-home-added-item">
          <label className="teacher-home-added-label">Completed Exams</label>
          <p>{examCounts.completed_exams}</p>
        </div>

        <div className="teacher-home-added-item" onClick={() => setShowModal(true)}>
          <label className="teacher-home-added-label">Create Exam</label>
          <p><i className="fa-solid fa-plus"></i></p>
        </div>
        {showModal &&
            ReactDOM.createPortal(
              <div
                onClick={() => setShowModal(false)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 9999,
                }}
              >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "12px",
                  textAlign: "center",
                  width: "90%",
                  maxWidth: "400px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                >
                  <h3>Create Exam</h3>
                  <input
                    type="text"
                    placeholder="Enter exam title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "15px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  />
                  <div style={{ marginTop: "20px" }}>
                    <button
                      type="submit"
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "100px",
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>
     </div> 
    </>
  );
}

function HomeTeacher() {
  const navigate = useNavigate();
  const { user } = useAuth();
  //========= create exam modal =========//
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    try {
      const res = await axios.post('/exams/create-exam', {
        title,
        status: "draft"
      });
      navigate(`/update-exam/${res.data.exam_id}`)
    } catch (err) {
      console.error("Error creating exam", err);
    }
  };

  return (
    <>
    <div className="teacher-home-whole">
      <SidebarTeacher />
      <HomeCount />
      <HomeExamsTeacher />
    </div>
    </>
  );
}

export default HomeTeacher;