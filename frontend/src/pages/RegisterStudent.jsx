import axios from "../utils/axiosConfig.js"; //did not use axiosConfig here so use the full url
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import InputField from "../components/InputFields.jsx"
import SelectField from "../components/SelectFields.jsx";
import Button from '../components/Buttons.jsx';
import RadioButtonGender from '../components/RadioButtonGender.jsx';

function RegisterStudent() {
  const navigate = useNavigate();
  const [formRegister, setFormRegister] = useState({
    username: "",
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

  const handleSendOtp = async () => {
    try { //did not use axiosConfig here so it's the full url
      const res = await axios.post("/student/register/email-otp", { username: username });
      
      toast.info(res.data.message);

      if (res.data.isItSent) { //from backend res.json.. if message is sent
        setSentOTP(true);
      }
    } catch (err) {
      console.log(err.response?.data);
      toast.info(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("/student/register/verify-otp", { username, code });
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

    axios.post("/student/register/user-info", formRegister)
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
    <>
      {!isVerified ? (
        !sentOTP ? (
          <div className='page-s-registration'>
            <div className="container" id="otp-container" >
              <h1>Email Verification</h1>
              <form id="otp-form">
                <button className="back-button" label="←" onClick={() => navigate(-1)}/>
                <div className="form-group">
                  <label>School Id</label>
                  <InputField 
                    name="username"
                    id="school-id"
                    value={formRegister.username} 
                    onChange={handleChange}
                    placeholder="Enter your School Id" 
                    disabled={isVerified}
                    required
                  />
                </div>
                <Button type="button" onClick={handleSendOtp} label='Send OTP' disabled={isVerified}/>
              </form>
            </div>
          </div>
        ) : (
          <div className='page-s-registration'>
            <div className='container' id='otp-code-container'>
              <h1>OTP Verification</h1>
              <form id="otp-code-form">
                <button type="button" className="back-button" label="←" onClick={() => setSentOTP(false)}/>
                <p className="otp-message">We sent a code to your account <span id="user-email"></span></p>
                <div className="form-group">
                  <label>OTP Code</label>
                  <InputField
                    name="code" //otp
                    id="otp-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter OTP"
                    disabled={isVerified}
                  />
                </div>
                <Button className="verify-button" onClick={handleVerifyOtp} label='Verify' disabled={isVerified}/>
              </form>
  
              
              <p className="resend-link">
                <span id="resend-otp" onClick={handleSendOtp}>
                  Didn't get a code? Resend
                </span>
              </p>
              
              
            </div>
          </div>
        )
      ) : (
        <div className='page-s-registration'>
          <div className="container" id="registration-container" >
          <h1> Registration Form </h1>
          <form id="registration-form" onSubmit={handleSubmit}>  
            <div className="form-group">
              <label>Email</label>
              <InputField 
                name="email"
                id="email"
                type="email"
                value={`${formRegister.username}@pampangastateu.edu.ph`}
                placeholder="Enter Student ID"
                disabled={true}
              /> 
            </div>
            <div className="form-group">
              <label>Password</label>
              <InputField 
                name="password"
                id="password" 
                type="password"
                value={formRegister.password}
                onChange={handleChange}
                placeholder="Enter your password"
              /> 
            </div>
            <div className="form-group">
              <label>Re-type Password</label>
              <InputField 
                name="retypePassword"
                id="retype-password"
                type="password"
                value={formRegister.retypePassword}
                onChange={handleChange}
                placeholder="Re-type your password"
              /> 
            </div>
            

            <div className="name-group">
              <div className="form-group">
                <label>First Name</label>
                <InputField 
                  name="firstName"
                  id="first-name" 
                  value={formRegister.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                /> 
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <InputField 
                  name="lastName"
                  id="last-name" 
                  value={formRegister.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="form-group">
                <label>Middle Initial</label>
                <InputField 
                  name="middleInitial"
                  id="middle-initial" 
                  value={formRegister.middleInitial}
                  onChange={handleChange}
                  placeholder="Enter your middle initial, e.g., R"
                  maxLength={1}
                />
              </div>
              
            </div>

            <RadioButtonGender
              divClassName="form-group"
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

            <SelectField
              divClassName="form-group"
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
            <br /> <br />
            <Button className="submit-register-btn" type="submit" label='Submit Registration'/>
            {/* triggers <form onSubmit={handleSubmit}/> */}
          </form>
          </div>
        </div>
      )}
    </>
  );
}
export default RegisterStudent;