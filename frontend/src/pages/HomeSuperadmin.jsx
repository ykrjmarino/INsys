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
import { LogoutSpan } from "../components/Logout.jsx";

export const HomeSuperadmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* start sidebar */}
      <div className="super-admin-sidebar">
        <div className="sidebar-image">
          <img src="/images/sample03.PNG" alt="Sidebar Image"/>
        </div>
{/* className= 'active' */}
        <div className="sidebar-buttons">
          <h1 className="sidebar-title">Tools</h1>
          <button
            className="super-admin-sidebar-btn"
            onClick={()=> navigate('/dashboard')}
          ><i className="fas fa-chart-bar"></i> Dashboard </button>
          <button
            className="super-admin-sidebar-btn"
            onClick={()=> navigate('/admin-analytics')}
          ><i className="fa-solid fa-chart-simple"></i> Admin Analytics </button>
          <button
            className="super-admin-sidebar-btn"
            onClick={()=> navigate('/user-management')}
          ><i className="fa-solid fa-users"></i> Manage Accounts </button>
          <button
            className="super-admin-sidebar-btn"
            onClick={()=> navigate('/system-settings')}
          ><i className="fa-solid fa-sliders"></i> System Settings </button>
          <button
            className="super-admin-sidebar-btn"
            onClick={()=> navigate('/account-settings')}
          ><i className="fa-solid fa-gear"></i> Account Settings </button>
          <LogoutSpan className="super-admin-sidebar-btn"/>
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