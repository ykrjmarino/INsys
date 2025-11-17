import { useEffect, useState } from "react";
import axios from "../utils/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function AboutUsPage () {
  return(
    <>
      about pagee
    </>
  )
}

export const MissionPage = () => {
  return(
    <>
      Mission
    </>
  )
}

export const TermsConditionsPage = () => {
  return(
    <>
      Terms and Conditions
    </>
  )
}

export default AboutUsPage;