import React from "react";
import axios from "../utils/axiosConfig.js";
import { useNavigate, useParams } from "react-router-dom";
import { LogoutSpan } from "./Logout";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';
import { useState } from "react";
import { useEffect } from "react";

export const SideBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
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
            onClick={()=> navigate('/admin-dashboard')}
          ><i className="fas fa-chart-bar"></i> Dashboard </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/exams-analytics')}
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
    </>
  )
}