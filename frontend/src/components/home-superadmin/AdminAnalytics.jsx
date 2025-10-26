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
    <div className="whole">
      <HeaderTeacher />
      <div className="side-bar-and-main-container">
        <HomeSuperadmin />
        <div className="main-home-content" style={{ padding: '10px' }}>          
          <h2>Admin Analytics</h2>

          <AdminsComponent />
        </div>
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


  useEffect(() => {
    fetchExamInfo();
  }, [accessToken]);

  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/admin/analytics`, config); //getAdminExamAnalytics
      /* {
        user_id, first_name, last_name, school_id, role, email, total_exams
      } */
      

      setExamInfo(res.data || []);
      console.log(res.data);

      console.log('fetchExamInfo wrking');
    } catch (error) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
        {examInfo
        .filter((s) => {
          const term = searchTerm.toLowerCase();
          return (
            s.first_name.toLowerCase().includes(term) ||
            s.last_name.toLowerCase().includes(term) ||
            s.school_id.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term)
          )
        })
        .map((s) => (
          <div
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
            <p><b>Name:</b> {s.last_name}, {s.first_name}</p>
            <p><b>School ID:</b> {s.school_id}</p>
            <p><b>Email:</b> {s.email}</p>
            <p><b>Exams Published:</b> {s.total_exams}</p>
            {/* <p><b>Role:</b> {s.role}</p>
            <p><b>Email:</b> {s.email}</p> */}
          </div>
        ))}

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
          <div className="main-home-content">
            <div className="grid-container">
              {completedExams.map(exam => (
                <AdminExamCard
                  key={exam.exam_id}
                  exam={exam}
                  onClick={() => navigate(`/exam-analytics/${exam.exam_id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    
  );
};

export const AdminExamCard = ({ exam, onClick }) => {
  return (
    <div
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
      <p><b>Title:</b> {exam.title}</p>
    </div>
  );
};