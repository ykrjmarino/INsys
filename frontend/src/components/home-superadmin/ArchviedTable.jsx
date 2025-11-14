import axios from "../../utils/axiosConfig";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
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
  const [userToArchive, setUserToArchive,] = useState(null);

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
      const res = await axios.get(`/system/manage-users/archived&page=${currentPage}&limit=${pageSize}&search=${searchTerm}`, config);

      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      console.log(res.data.users);
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
      await axios.delete(`/system/manage-users/${userId}/delete`, config);
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

  const handleArchive = async (userId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    }; 

    try {
      await axios.patch(`/system/manage-users/${userId}/archive`, config);
      setUsers((prev) => prev.filter((s) => s.user_id !== userId));

      if (selectedRole === "superadmin") {
        setSuperadminCount((prev) => prev - 1);
      }

      toast.success("User archived successfully");
    } catch (error) {
      console.error("Failed to archive user:", error.message);
    } finally {
      setShowModal(false);
      setUserToArchive(null);
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
            <h3>Confirm Archive</h3>
            <p>Are you sure you want to archive this user?</p>

            <div className="">
              <button className=""
                onClick={() => handleArchive(userToArchive)}
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
              <th>Status</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => user.user_status === "active")
              .map((s) => (
              <tr key={s.user_id}>
                <td>{s.last_name}</td>
                <td>{s.first_name}</td>
                <td>{s.middle_initial}.</td>
                <td>{s.school_id}</td>
                <td>{s.role}</td>
                <td style={{ fontWeight: "500", color: s.user_status === "active" ? "green" : "red" }}>{s.user_status}</td>
                <td className="email">{s.email}</td>
                <td>
                  <button className="super-admin-manage-account-edit-btn" onClick={() => handleEditButton(s)}>Edit</button>
                  <button
                    className="super-admin-manage-account-delete-btn"
                    onClick={() => {
                      setUserToDelete(s.user_id);
                      setUserToArchive(s.user_id);
                      setShowModal(true);
                    }}
                    style={{
                      backgroundColor:
                        selectedRole === "superadmin" && superadminCount === 1 ? "gray" : "",
                      color: 
                        selectedRole === "superadmin" && "white",
                      marginLeft: "5px",
                      cursor:
                        selectedRole === "superadmin" && superadminCount === 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={selectedRole === "superadmin" && superadminCount === 1}
                  >
                    Archive
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