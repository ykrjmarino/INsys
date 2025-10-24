import axios from "../../utils/axiosConfig";
import { useExams } from "../../hooks/useExams";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";

export const ManageUser = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [infoStats, setInfoStats] = useState({});
  const [infoLogs, setInfoLogs] = useState([]);

  const [activeTab, setActiveTab] = useState('students');

  useEffect(()=>{
    fetchLogs();
  }, [accessToken]);


  const fetchLogs = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/system/logs`, config);
     

      setInfoLogs(res.data || []);
      console.log(res.data);

      console.log('fetchLogs wrking');
    } catch (error) {
      console.log('fetchLogs failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  return (
    <>
    <div className="whole">
      <HeaderTeacher />
      <div className="side-bar-and-main-container">
        <HomeSuperadmin />
        <div className="main-home-content" style={{ padding: '10px' }}>          
          <h2>User Management</h2>

          <div style={{ display: 'flex', gap: '5px', margin: '5px' }}>
            <div onClick={() => setActiveTab('students')}>Students</div>
            <div>|</div>
            <div onClick={() => setActiveTab('admins')}>Admins</div>
            <div>|</div>
            <div onClick={() => setActiveTab('superadmins')}>Superadmins</div>
          </div>

          {activeTab === 'students' && <StudentsTable />}
          {activeTab === 'admins' && <AdminsTable />}
          {activeTab === 'superadmins' && <SuperadminsTable />}
        </div>
      </div>
    </div>
    </>
  )
}

export const StudentsTable = () => {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState([]);
  
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    fetchStudents();
  }, [accessToken]);

  const fetchStudents = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      const res = await axios.get(`/system/manage-users/students`, config);

      setStudents(res.data || []);
      console.log(res.data)
    } catch (error) {
      console.error("Failed to fetch students:", error.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      await axios.delete(`/system/manage-users/${userId}`, config);
      setStudents((prev) => prev.filter((s) => s.user_id !== userId));
      console.log(`Deleted user ${userId}`);
    } catch (error) {
      console.error("Failed to delete user:", error.message);
    }
  };

   const handleEdit = (student) => {
    setEditUser(student);
    setFormData(student);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      const res = await axios.patch(
        `/system/manage-users/${formData.user_id}`,
        formData,
        config
      );

      // Update UI immediately
      setStudents((prev) =>
        prev.map((s) =>
          s.user_id === res.data.user_id ? res.data : s
        )
      );

      setEditUser(null);
      console.log("User updated:", res.data);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err.response?.data?.error || "Something went wrong.");console.log(err)
    }
  };

  const handleCancel = () => setEditUser(null);
  

  return (
    <div style={{ position: "relative" }}>
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />


      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>ID</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>School ID</th>
            <th>Role</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students
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
            <tr key={s.user_id}>
              <td>{s.user_id}</td>
              <td>{s.last_name}</td>
              <td>{s.first_name}</td>
              <td>{s.school_id}</td>
              <td>{s.role}</td>
              <td>{s.email}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button
                  onClick={() => handleDelete(s.user_id)}
                  style={{ backgroundColor: "red", color: "white", marginLeft: "5px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Edit User</h3>
            <label>First Name</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "8px" }}
            />
            <label>Last Name</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "8px" }}
            />
            <label>School ID</label>
            <input
              name="school_id"
              value={formData.school_id}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "8px" }}
            />
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "15px" }}
            />
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Leave blank to keep current password"
              value={formData.password || ""}
              onChange={handleChange}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleSave} style={{ backgroundColor: "green", color: "white" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};