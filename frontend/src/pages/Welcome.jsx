import axios from "../utils/axiosConfig.js";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.jsx";

//components
import Button from "../components/Buttons.jsx";

function Welcome() {
  const navigate = useNavigate();
  return (
    <>
    <div className="public-choose-role-whole">
      <label>Choose Your Role:</label>

      <div className="role-options">

        <div onClick={() =>{ navigate("/register/teacher") }} className="public-choose-role-teacher">
          <div className="role-content">
            <div className="choose-role-icon"><i className="fa-solid fa-chalkboard-user"></i></div>
            <div className="role-title">Teacher</div>
            <div className="role-description">Creates and manages exams.</div>
          </div>
        </div>

        <div onClick={() =>{ navigate("/register/student") }} className="public-choose-role-student">
          <div className="role-content">
            <div className="choose-role-icon"><i className="fa-solid fa-user"></i></div>
            <div className="role-title">Student</div>
            <div className="role-description">Takes assigned exams.</div>
          </div>
        </div>
        
      </div>
    </div>
    </>
  )
}

export default Welcome;