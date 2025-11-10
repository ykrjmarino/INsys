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
    <div class="public-choose-role-whole">
      <label>Choose Your Role:</label>

      <div class="role-options">

        <div onClick={() =>{ navigate("/register/teacher") }} class="public-choose-role-teacher">
          <div class="role-content">
            <div class="choose-role-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
            <div class="role-title">Teacher</div>
            <div class="role-description">Creates and manages exams.</div>
          </div>
        </div>

        <div onClick={() =>{ navigate("/register/student") }} class="public-choose-role-student">
          <div class="role-content">
            <div class="choose-role-icon"><i class="fa-solid fa-user"></i></div>
            <div class="role-title">Student</div>
            <div class="role-description">Takes assigned exams.</div>
          </div>
        </div>
        
      </div>
    </div>
    </>
  )
}

export default Welcome;