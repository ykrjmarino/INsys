import axios from "../utils/axiosConfig.js"; //did not use axiosConfig here so use the full url
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

import InputField from "../components/InputFields.jsx"
import SelectField from "../components/SelectFields.jsx";
import Button from '../components/Buttons.jsx';
import RadioButtonGender from '../components/RadioButtonGender.jsx';

function RegisterTeacher() {
  const navigate = useNavigate();
  const [formRegister, setFormRegister] = useState({
    username: "",
    schoolId: "",
    password: "",
    retypePassword: "",
    firstName: "",
    lastName: "",
    middleInitial: "",
    userGender: "",
    college: ""
  });

  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState(""); //otp
  const [sentOTP, setSentOTP] = useState(false);
  const username = formRegister.username;
  const [disableButton, setDisableButton] = useState(false);

  const handleSendOtp = async () => {
    setDisableButton(true);

    try {
      const res = await axios.post("/teacher/register/email-otp", { username: username });
      toast.info(res.data.message);

      if (res.data.isItSent) { //from backend res.json.. if message is sent
        setSentOTP(true);
      }

      setInterval(()=> {
        setDisableButton(false);
      }, 15000) //15secs
    } catch (err) {
      console.log(err.response?.data);
      toast.info(err.response?.data?.error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("/teacher/register/verify-otp", { username, code });
      toast.info(res.data.message);
      setIsVerified(true);
    } catch (err) {
      console.log(err.response?.data);
      toast.info(err.response?.data?.error || "Invalid OTP");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) return toast.info("Verify your email first");
    if (formRegister.password !== formRegister.retypePassword) return toast.info("Passwords do not match");
  
    axios.post("/teacher/register/user-info", formRegister)
      .then(res => {
        console.log(res.data.message);
        toast.info(res.data.message);
        setTimeout(() => navigate("/login"), 700);
      })
      .catch(err => {
        console.log(err.response?.data);
        toast.info(err.response?.data?.error);
      });  
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormRegister((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="register-whole">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>

      <div className="register-side-design">
        <img src="wait2.PNG" alt="Sidebar Logo" />
        <label>Already Have An Account</label>
        <button className="registration-login-option">Login</button>
      </div>

      <div className="registration-whole-form">
        <div className="registration-top-label">
          <button className="registration-back-btn" onClick={() => navigate(-1)}><i className="fa-solid fa-arrow-left"></i></button>
        </div>

        <div className="reigistration-main-label">
            <label>Register Your Account</label>  
        </div>

        <div className="registration-progress-bar">
          <ul id="progressbar">
            <li className="active"><strong>OTP Code</strong></li>
            <li><strong>Verify</strong></li>
            <li><strong>Register</strong></li>
          </ul>
        </div>



        {!isVerified ? (
          !sentOTP ? (
          <>
          <div className="registration-container" id="otp-container">
            <form id="otp-form">
  
              <div className="registration-form-group">
                <label htmlFor="username">Username</label>
                <InputField 
                  name="username"
                  id="username"
                  value={formRegister.username} 
                  onChange={handleChange}
                  placeholder="Enter your School Id" 
                  disabled={isVerified}
                  required
                />
              </div>

              <Button
                className="registration-next-btn"
                onClick={handleSendOtp} 
                label='Send OTP' 
                disabled={isVerified}
              />
               
            </form>
          </div>
          </>    
          ) : (
          <>
           <div className="registration-container" id="otp-code-container">
            <form id="otp-code-form">
              <label className= "registration-otp-message">We sent a code to your account <span id="user-email"></span></label>
              <div className="registration-form-group">
                <label htmlFor="otp-code">OTP Code</label>
                <InputField
                  name="code" //otp
                  id="otp-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter OTP"
                  disabled={isVerified}
                />
              </div>
              <Button className="registration-next-btn" onClick={handleVerifyOtp} label='Verify' disabled={isVerified}/>
            </form>
            <label className="registration-resend-link"><a onClick={!disableButton ? handleSendOtp : undefined} id="resend-otp">Didn't get a code? Resend</a></label>
          </div>
          </>
          )
        ) : (
        <>
        <div className="registration-form"  id="registration-form">
          <form id="registration-form" onSubmit={handleSubmit}>
            <div className="registration-form-group">
              <label htmlFor="email">Email</label>
              <InputField 
                name="email"
                id="email"
                type="email"
                value={`${formRegister.username}@pampangastateu.edu.ph`}
                placeholder="Enter Student ID"
                disabled={true}
              /> 
            </div>


            <div className="registration-form-group">
              <label htmlFor="password">Password</label>
                <InputField 
                  name="password"
                  id="password" 
                  type="password"
                  value={formRegister.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                /> 
            </div>


            <div className="registration-form-group">
              <label htmlFor="retype-password">Retype Password</label>
              <InputField 
                name="retypePassword"
                id="retype-password"
                type="password"
                value={formRegister.retypePassword}
                onChange={handleChange}
                placeholder="Re-type your password"
              /> 
            </div>


            <div className="registration-name-group">
              <div className="registration-form-group">
                <label htmlFor="first-name">First Name</label>
                <InputField 
                  name="firstName"
                  id="first-name" 
                  value={formRegister.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  require
                /> 
              </div>
              <div className="registration-form-group">
                <label htmlFor="last-name">Last Name</label>
                <InputField 
                  name="lastName"
                  id="last-name" 
                  value={formRegister.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  require
                />
              </div>
              <div className="registration-form-group">
                <label htmlFor="middle-initial">Middle Initial</label>
                <InputField 
                  name="middleInitial"
                  id="middle-initial" 
                  value={formRegister.middleInitial}
                  onChange={handleChange}
                  placeholder="Enter your middle initial, e.g., R"
                  maxLength={1}
                  require
                />
              </div>
            </div>

            <div className="registration-form-group">
              <label>School ID</label>
              <InputField 
                name="schoolId"
                value={formRegister.schoolId}
                onChange={handleChange}
                placeholder="Enter your school ID"
              />
            </div>

            <RadioButtonGender
              divClassName="registration-form-group"
              label="Gender"
              name="userGender"
              value={formRegister.userGender}
              onChange={handleChange}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" }
              ]}
            />

            <div className="registration-form-group">
              <SelectField
                label="College Department"
                name="college"
                id="options"  
                value={formRegister.college}
                onChange={handleChange}
                options={[
                  { label: "CCS", value: "CCS" },
                  { label: "CEA", value: "CEA" },
                  { label: "CBA", value: "CBA" },
                  { label: "CHM", value: "CHM" },
                  { label: "GA", value: "GA" }
                ]}
              />
            </div>
            <Button className="registration-next-btn" type="submit" label='Submit Registration'/>
          </form>  
        </div>
        </>
        )}
      </div>
    </div>
  );
}
export default RegisterTeacher;