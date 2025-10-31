import React from "react";
import axios from "../utils/axiosConfig.js";
import { useNavigate, useParams } from "react-router-dom";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';
import { useState } from "react";
import { useEffect } from "react";
import { DashboardSuper } from "../components/home-superadmin/DashboardSuper.jsx";

export const HomeSuperadmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* start sidebar */}
      <div className="super-admin-sidebar">
        <div className="sidebar-image">
          <img src="/images/insys3.webp" alt="Sidebar Image"/>
        </div>

        <div className="sidebar-buttons">
          <h1 className="sidebar-title">Tools</h1>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/dashboard')}
          ><i className="fas fa-chart-bar"></i> Dashboard </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/admin-analytics')}
          ><i className="fas fa-chart-bar"></i> Admin Analytics </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/user-management')}
          ><i className="fas fa-chart-bar"></i> Manage Accounts </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/system-settings')}
          ><i className="fas fa-chart-bar"></i> System Settings </button>
          <button
            className="sidebar-btn"
            onClick={()=> navigate('/account-settings')}
          ><i className="fas fa-chart-bar"></i> Account Settings </button>
          
        </div>

        <div className="sidebar-profile-container">
          <i className="fa-solid fa-user"></i>
          <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">{user.nameFNfirst}</div>
              <div className="sidebar-profile-title">System Admin</div>
          </div>
        </div>
      </div>
      {/* end sidebar */}
    </>
  )
}