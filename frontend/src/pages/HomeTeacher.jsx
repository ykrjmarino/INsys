import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axiosConfig.js';

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';

//components
import Button from '../components/Buttons.jsx';
import LogoutButton, { LogoutSpan } from '../components/Logout.jsx'
import SelectField from '../components/SelectFields.jsx';
import DraftExams from '../components/home-teacher/DraftExams.jsx';
import PublishedExams from '../components/home-teacher/PublishedExams.jsx';
import OngoingExams from '../components/home-teacher/OngoingExams.jsx';
import CompletedExams from '../components/home-teacher/CompletedExams.jsx';
import HeaderTeacher from '../components/Header.jsx';

function HomeTeacher() {
  const navigate = useNavigate();
  const { user } = useAuth();

  //========= home filter status =========//
  const { exams, deleteExam, duplicateExam, fetchAllExams } = useExams();

  const [status, setStatus] = useState('draft');
  const [allExams, setAllExams] = useState([]);

  //========= create exam modal =========//
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    try {
      const res = await axios.post('/exams/create-exam', {
        title,
        schedule: null,
        status: "draft"
      });
      navigate(`/update-exam/${res.data.exam_id}`)
    } catch (err) {
      console.error("Error creating exam", err);
    }
  };
  
  useEffect(() => {
    const load = async () => {
      const data = await fetchAllExams;
      setAllExams(data);
    };
    load();
  }, []);

  const optionsArray = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" }
  ];

  return (
    <>
{/* <!-- whole  -->
    <!-- start --> */}
    <div className="whole">
    {/* <!-- header start --> */}
      <HeaderTeacher />
    {/* <!-- header end --> */}


  <div className="side-bar-and-main-container">

    {/* <!-- sidebar -->
      <!-- start-->   */}
      <div className="sidebar">
        <div className="sidebar-image">
          <img src="/images/insys3.webp" alt="Sidebar Image"/>
        </div>

        <div className="sidebar-buttons">
          <h1 className="sidebar-title">Tools</h1>
          <button className="sidebar-btn" onClick={() => setShowModal(true)}><i className="fas fa-plus"></i>Create Exam</button>
            {showModal && (
              <>
              <div className="overlay" onClick={() => setShowModal(false)}></div>
              <div className="modal">
                <form onSubmit={(e) => {e.preventDefault(); handleCreate();}}>
                  <h3>Create Exam</h3>
                  <input
                    type="text"
                    placeholder="Enter exam title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <div className="modal-actions">
                    <button type="submit">Confirm</button>
                  </div>
                </form>
              </div>
              </>
            )}
          <button
            className="sidebar-btn"
            onClick={( )=> navigate(asdsdasd)}
          ><i className="fas fa-chart-bar"></i> Exam Analytics </button>
          
        </div>

        <div className="profile-container">
          <i className="fa-solid fa-user"></i>
          <div className="profile-info">
              <div className="profile-name">{user.nameFNfirst}</div>
              <div className="profile-title">Instructor</div>
          </div>
        </div>
        
      </div>
      {/* <!-- end sidebar --> */}

      

{/* <!-- main home content -->
    <!-- start --> */}
    <div className="main-home-content">
      <label className="main-container-title">Exams</label>
      <SelectField className="dropdown-main"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={optionsArray}
      />

  {/* <!--  grid container -->
      <!-- start grid container --> */}
      <div className="grid-container">

    {/* <!-- grid item-->
        <!--start--> */}
          {status === 'draft' && 
          <DraftExams 
            exams={exams.filter(e => e.status === 'draft')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam}
          />}
          {status === 'published' && 
          <PublishedExams 
            exams={exams.filter(e => e.status === 'published')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
          />}
          {status === 'ongoing' && 
          <OngoingExams 
            exams={exams.filter(e => e.status === 'ongoing')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
          />}

          {status === 'completed' && 
          <CompletedExams 
            exams={exams.filter(e => e.status === 'completed')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
          />}

      {/* <!--  grid container -->
          <!-- end grid container --> */}
          </div>


    {/* <!-- main home content -->
        <!-- end --> */}
        </div>

      </div>
      
    </div>
    </>
  );
}

export default HomeTeacher;