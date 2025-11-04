import axios from "../../utils/axiosConfig";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";
import { useExams } from "../../hooks/useExams";

export const AdminAnalytics = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  return (
    <>
    <div className="super-admin-analytics-whole">
      <HomeSuperadmin />
      <div className="main-home-content">          
        <h2>Admin Analytics</h2>

        <AdminsComponent />
      </div>
    </div>
    </>
  )
}


export const AdminsComponent = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [examInfo, setExamInfo] = useState([]); //per admin
  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 2; // or whatever you want per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchExamInfo();
    }, 300); // debounce for smoother typing
    return () => clearTimeout(delay);
  }, [accessToken, currentPage, searchTerm]);

  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/admin/analytics`, {
        ...config,
        params: { page: currentPage, limit: pageSize, search: searchTerm },
      }); //getAdminExamAnalytics
      /* {
        user_id, first_name, last_name, school_id, role, email, total_exams
      } */
      

      setExamInfo(res.data.admins || []);
      setTotalPages(res.data.totalPages || 1);
      console.log(res.data);

      console.log('fetchExamInfo wrking');
    } catch (error) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  return (
    <div className="super-admin-analytics-components">
      <input className="super-admin-analytics-search"
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset to first page when searching
        }}
      />
        {examInfo
        .map((s) => (
          <div className="super-admin-analytics-box-info"
            key={s.user_id}
            style={{
              border: '2px solid black',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9'
            }}
            onClick={() => navigate(`/exams-analytics/${s.user_id}`)}
          >
            <p><b>Name:</b> {s.last_name}, {s.first_name} {s.middle_initial}.</p>
            <p><b>School ID:</b> {s.school_id}</p>
            <p><b>Email:</b> {s.email}</p>
            <p><b>Exams Published:</b> {s.total_exams}</p>
            {/* <p><b>Role:</b> {s.role}</p>
            <p><b>Email:</b> {s.email}</p> */}
          </div>
        ))}

        <div className="super-admin-analytics-pagination">
          <button className="super-admin-pagination-btn" onClick={() => setCurrentPage(p => Math.max(p-1, 1))} disabled={currentPage === 1}>Prev</button>
          <span className="super-admin-analytics-pagination-label">Page {currentPage} of {totalPages}</span>
          <button className="super-admin-pagination-btn" onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} disabled={currentPage === totalPages}>Next</button>
        </div>

    </div>
  );
};

export const HomeAdminAnalytics = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { teacherId } = useParams();
  const [completedExams, setCompletedExams] = useState([]);

  useEffect(() => {
    if (!teacherId) return;

    const fetchExams = async () => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

      try {
        const res = await axios.get(`/exams/teacher/${teacherId}`, {
          params: { filter: 'completed' }   //send status in database
        }, config);

        setCompletedExams(res.data || []);
      } catch (err) {
        console.error(err);
        setCompletedExams([]); //fallback
      }
    };

    fetchExams();
  }, [teacherId, accessToken]);

  return (
    <div className="whole">
      <HeaderTeacher />
      <div className="side-bar-and-main-container">
        <HomeSuperadmin />
        <div className="main-home-content" style={{ padding: '10px' }}>     
          <div className="grid-container">
            {completedExams.length === 0 ? (
              <div style={{
                width: '100%',
                textAlign: 'center',
                padding: '20px',
                margin: '20px 0',
                color: '#555',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                gridColumn: '1 / -1', // makes it span the full grid if inside a grid
                fontWeight: '500',
                fontSize: '16px'
              }}
              >
                No completed exams found for this teacher.
              </div>
            ) : (
              completedExams.map(exam => (
                <AdminExamCard
                  key={exam.exam_id}
                  exam={exam}
                  onClick={() => navigate(`/exam-analytics/${exam.exam_id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminExamCard = ({ exam, onClick }) => {
  return (
    <div className="super-admin-exam-card"
      onClick={onClick}
      style={{
        border: "2px solid black",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#f9f9f9",
        cursor: "pointer"
      }}
    >
      <p className="super-admin-exam-card-title"><b>Title:</b> {exam.title}</p>
      <p className="super-admin-exam-card-status"><b>Status:</b> {exam.status}</p>
    </div>
  );
};