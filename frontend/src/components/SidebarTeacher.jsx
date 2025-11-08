import React from "react";
import axios from "../utils/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { LogoutSpan } from "./Logout";

import ReactDOM from "react-dom";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useState } from "react";

export const SidebarTeacher = () => {
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
    {/* <div className="teacher-home-whole"> */}
      <div className="header"></div>

      <input type="checkbox" className="openSidebarMenu" id="openSidebarMenu" />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className="spinner diagonal part-1"></div>
        <div className="spinner horizontal"></div>
        <div className="spinner diagonal part-2"></div>
      </label>
      
      <div id="sidebarMenu">
        <div className="sidebar-logo">
          <img src="insys3.PNG" alt="Sidebar Logo" />
        </div>


        <div className="teacher-home-sidebar-buttons">
          <h1 className="teacher-home-sidebar-title">Tools</h1>
          <button className="student-home-sidebar-btn" onClick={() => setShowModal(true)}><i className="fas fa-plus"></i>Create Exam</button>
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
          <button className="student-home-sidebar-btn" onClick={()=> navigate('/admin-dashboard')}><i className="fas fa-chart-bar"></i> Dashboard</button>
          <button className="student-home-sidebar-btn" onClick={()=> navigate('/exams-analytics')}><i className="fa-solid fa-clock-rotate-left"></i>Exam Analytics</button>
          <button className="student-home-sidebar-btn" onClick={()=> navigate('/admin/account-settings')}><i className="fa-solid fa-gear"></i>Account Settings</button>
        </div>
            
        <div className="teacher-home-logout">
          <LogoutSpan className="teacher-home-logout-btn"/>
        </div>
      </div>

      {/* DITO YUNG MAIN COMPONENT */}

    {/* </div> */}
    </>
  );
}