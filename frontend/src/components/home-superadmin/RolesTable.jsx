import axios from "../../utils/axiosConfig";
import { useExams } from "../../hooks/useExams";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";
import SelectField from "../SelectFields";
import Button from "../Buttons";


export const ManageUsersTable = ({selectedRole}) => {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState([]);
  
  const [editUser, setEditUser] = useState(null);
  const [editCreate, setEditCreate] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [superadminCount, setSuperadminCount] = useState(0);


  useEffect(() => {
    fetchStudents();
  }, [accessToken]);

  useEffect(() => {
    if (selectedRole === "superadmin") checkSuperadminCount();
  }, [selectedRole]);

  const fetchStudents = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      const res = await axios.get(`/system/manage-users?role=${selectedRole}`, config);

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

      if (selectedRole === "superadmin") {
        setSuperadminCount((prev) => prev - 1);
      }

      console.log(`Deleted user ${userId}`);
    } catch (error) {
      console.error("Failed to delete user:", error.message);
    }
  };

  const handleEditButton = (student) => {
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

  const handleAddUser = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      const res = await axios.post(`/users`, formData, config);

      // Update UI immediately
      setStudents((prev) =>
        prev.map((s) =>
          s.user_id === res.data.user_id ? res.data : s
        )
      );
      setEditCreate(null);

      if (selectedRole === "superadmin") {
        setSuperadminCount((prev) => prev + 1);
        window.location.reload();
      }

      console.log("User updated:", res.data);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err.response?.data?.error || "Something went wrong.");console.log(err)
    }
  };

  const handleCancel = () => {setEditUser(null); setEditCreate(null);}

  const checkSuperadminCount = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      const res = await axios.get(`/system/manage-users?role=superadmin`, config);
      setSuperadminCount(res.data.length);
    } catch (error) {
      console.error("Failed to check superadmin count:", error.message);
    }
  };
  

  return (
    <div style={{ position: "relative" }}>
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />

      <Button 
        label="Add User" 
        onClick={() => {
          setFormData({
            first_name: "",
            last_name: "",
            school_id: "",
            email: "",
            password: "",
            role: "student",
          });
          setEditCreate(true);
        }}/>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
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
              <td>{s.last_name}</td>
              <td>{s.first_name}</td>
              <td>{s.school_id}</td>
              <td>{s.role}</td>
              <td>{s.email}</td>
              <td>
                <button onClick={() => handleEditButton(s)}>Edit</button>
                <button
                  onClick={() => handleDelete(s.user_id)}
                  style={{
                    backgroundColor:
                      selectedRole === "superadmin" && superadminCount === 1 ? "gray" : "red",
                    color: "white",
                    marginLeft: "5px",
                    cursor:
                      selectedRole === "superadmin" && superadminCount === 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={selectedRole === "superadmin" && superadminCount === 1}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRole === "superadmin" && superadminCount === 1 && (
        <p style={{ color: "red", marginTop: "10px" }}>
          ⚠️ At least one Super Admin must remain in the system.
        </p>
      )}

      {editUser && (
        <EditUserComponent 
          handleCancel={handleCancel}
          handleSave={handleSave}
          handleChange={handleChange} 
          formData={formData}
        />
      )}
      {editCreate && (
        <AddingUserComponent 
          handleCancel={handleCancel}
          handleAddUser={handleAddUser}
          handleChange={handleChange} 
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

const EditUserComponent = ({handleChange, handleSave, handleCancel, formData}) => {
  return (
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
        <p>First Name</p>
        <input
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <p>Last Name</p>
        <input
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <p>School ID</p>
        <input
          name="school_id"
          value={formData.school_id}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <p>Email</p>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "15px" }}
        />
        <p>Password</p>
        <input
          type="password"
          name="password"
          placeholder="Leave blank to keep current password"
          value={formData.password || ""}
          onChange={handleChange}
        />
        <p>Role</p>
        <SelectField
          name="role"
          id="options"  
          value={formData.role}
          onChange={handleChange}
          options={[
            { label: "Student", value: "student" },
            { label: "Admin", value: "admin" },
            { label: "Superadmin", value: "superadmin" }
          ]}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleSave} style={{ backgroundColor: "green", color: "white" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const AddingUserComponent = ({handleChange, handleAddUser, handleCancel, formData}) => {
  return (
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
        <h3>Add User</h3>
        <p>First Name</p>
        <input
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <p>Last Name</p>
        <input
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <p>School ID</p>
        <input
          name="school_id"
          value={formData.school_id}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <p>Email</p>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "15px" }}
        />
        <p>Password</p>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password || ""}
          onChange={handleChange}
          required
        />
        <p>Role</p>
        <SelectField
          name="role"
          id="options"  
          value={formData.role}
          onChange={handleChange}
          options={[
            { label: "Student", value: "student" },
            { label: "Admin", value: "admin" },
            { label: "Superadmin", value: "superadmin" }
          ]}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleAddUser} style={{ backgroundColor: "green", color: "white" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}