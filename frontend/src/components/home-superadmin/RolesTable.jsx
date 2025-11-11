import axios from "../../utils/axiosConfig";
import { useExams } from "../../hooks/useExams";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";
import SelectField from "../SelectFields";
import Button from "../Buttons";

import { toast } from 'react-toastify';

export const ManageUsersTable = ({selectedRole}) => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState([]);
  
  const [editUser, setEditUser] = useState(null);
  const [editCreate, setEditCreate] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [superadminCount, setSuperadminCount] = useState(0);

  const pageSize = 10; 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // will update after fetching

  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [accessToken, currentPage, selectedRole, searchTerm]);

  useEffect(() => {
    if (selectedRole === "superadmin") checkSuperadminCount();
  }, [accessToken, currentPage, selectedRole]);

  const fetchUsers = async () => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    };

    try {
      const res = await axios.get(`/system/manage-users?role=${selectedRole}&page=${currentPage}&limit=${pageSize}&search=${searchTerm}`, config);

      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDelete = async (userId) => {
    // if (!window.confirm("Are you sure you want to delete this user?")) return;

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    }; 

    try {
      await axios.delete(`/system/manage-users/${userId}`, config);
      setUsers((prev) => prev.filter((s) => s.user_id !== userId));

      if (selectedRole === "superadmin") {
        setSuperadminCount((prev) => prev - 1);
      }

      toast.success("User deleted successfully");
      console.log(`Deleted user ${userId}`);
    } catch (error) {
      console.error("Failed to delete user:", error.message);
    } finally {
      setShowModal(false);
      setUserToDelete(null);
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
      setUsers((prev) =>
        prev.map((s) =>
          s.user_id === res.data.user_id ? res.data : s
        )
      );

      setEditUser(null);
      console.log("User updated:", res.data);
      toast.success("User updated");
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
      setUsers((prev) =>
        prev.map((s) =>
          s.user_id === res.data.user_id ? res.data : s
        )
      );
      setEditCreate(null);

      if (selectedRole === "superadmin") {
        setSuperadminCount((prev) => prev + 1);
        setTimeout(() => window.location.reload(), 1000); //let the toast show before reloading page
      }

      toast.success("User added successfully");
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
      setSuperadminCount(res.data.users?.length || 0);
    } catch (error) {
      console.error("Failed to check superadmin count:", error.message);
    }
  };
  

  return (
    <div className="super-admin-manage-account-table-container">
      <input className="super-admin-manage-account-search"
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset to first page when searching
        }} 
      />

      {showModal && (
        <div className=""
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
          <div className=""
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
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this user?</p>

            <div className="">
              <button className=""
                onClick={() => handleDelete(userToDelete)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#d9534f",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100px",
                }}
              >
                Yes
              </button>

              <button className=""
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginLeft: "10px",
                  width: "100px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="super-admin-manage-account-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Middle Initial</th>
              <th>School ID</th>
              <th>Role</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .map((s) => (
              <tr key={s.user_id}>
                <td>{s.last_name}</td>
                <td>{s.first_name}</td>
                <td>{s.middle_initial}.</td>
                <td>{s.school_id}</td>
                <td>{s.role}</td>
                <td className="email">{s.email}</td>
                <td>
                  <button className="super-admin-manage-account-edit-btn" onClick={() => handleEditButton(s)}>Edit</button>
                  <button
                    className="super-admin-manage-account-delete-btn"
                    onClick={() => {
                      setUserToDelete(s.user_id);
                      setShowModal(true);
                    }}
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
      </div>
      
      
      <div className="super-admin-manage-acount-message">
        <Button 
          className="super-admin-manage-account-add-btn"
          label="Add User" 
          onClick={() => {
          setFormData({
            first_name: "",
            last_name: "",
            middle_initial: "",
            school_id: "",
            email: "",
            password: "",
            role: "student",
          });
          setEditCreate(true);
        }}/>
        {selectedRole === "superadmin" && superadminCount === 1 && (
        <p className="super-admin--manage-account-message" style={{ color: "red", marginTop: "10px" }}>⚠️ At least one Super Admin must remain in the system.</p>
        )}
      </div>
        
      
      <div className="super-admin-manage-account-pagination">
        <button className="super-admin-manage-account-button" onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
        <label className="super-admin-manage-account-pagination-label">Page {currentPage} of {totalPages}</label>
        <button className="super-admin-manage-account--button" onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
      </div>

      

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
          autoComplete="off"
        />
        <p>Last Name</p>
        <input
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
          autoComplete="off"
        />
        <p>School ID</p>
        <input
          name="school_id"
          value={formData.school_id}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
          autoComplete="off"
        />
        <p>Email</p>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "15px" }}
          autoComplete="off"
        />
        <p>Password</p>
        <input
          type="password"
          name="password"
          placeholder="Leave blank to keep current password"
          value={formData.password || ""}
          onChange={handleChange}
          autoComplete="off"
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
        <p>Middle Initial</p>
        <input
          name="middle_initial"
          value={formData.middle_initial}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "8px" }}
          maxLength={1}
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