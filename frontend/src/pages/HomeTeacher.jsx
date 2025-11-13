import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axiosConfig.js';

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
            onClickDel={deleteExam} 
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

      {/* <!--  grid container -->
          <!-- end grid container --> */}
          </div>


    {/* <!-- main home content -->
        <!-- end --> */}
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
        schedule: null,
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
      <HomeExamsTeacher />
    </div>
    </>
  );
}

export default HomeTeacher;