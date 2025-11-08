import axios from "../utils/axiosConfig.js";
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

//components
import Button from "../components/Buttons.jsx";
import InputField from "../components/InputFields.jsx";
import { useAuth } from "../context/AuthContext";
import { SidebarTeacher } from "../components/SidebarTeacher.jsx";



export const ForgotPasswordLoggedInComponent = () => { //when logged-in
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();

  const userId = user.userId;

  const [form, setForm] = useState({
    password: "",
    retypePassword: "",
  });

  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState(""); //otp
  const [message, setMessage] = useState(""); //success message
  const [error, setError] = useState(""); //error message
  const [isOtpSent, setIsOtpSent] = useState(false); //for toast error
  const [userEmail, setUserEmail] = useState("");


  useEffect(() => {
    if(userId) fetchUserEmail();
  }, [userId]);
  
  const fetchUserEmail = async() => { //for email lang
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/users/${userId}`, config); //getUserById 

      setUserEmail(res.data.email);
    } catch (err) {
      console.log('fetchUserInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

  const handleSendOtp = async () => {
    try {
      const res = await axios.post('/forgot-password/in/request-otp');
      setMessage(res.data.message);
      toast.success(res.data.message);
      setError("");
    } catch (err) {
      console.error(err.message);
      setError("Network or server error");
      setMessage("");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('/forgot-password/in/verify-otp', { code });
      setMessage(res.data.message);
      toast.success(res.data.message);
      setError("");
      setIsVerified(true);
    } catch (err) {
      setError(err.response?.data.message);
      toast.error(err.response?.data.message);
      setMessage("");
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isVerified) {
      toast.error("Invalid OTP");
      return;
    } 
    if (form.password !== form.retypePassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return; // stop submission
    }

    try {
      const res = await axios.post('/forgot-password/in/reset', { newPassword: form.password });

      setMessage(res.data.message);
      toast.success(res.data.message);
      setTimeout(() => navigate("/"), 2000);//2 sec
    } catch (err) {
      setError(err.response?.data?.message);
      toast.error(err.response?.data?.message);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {!isVerified ? (
      <>
        <h3>Forgot Password</h3>
        <label>Email</label>
        <div className="super-admin-account-settings-change-password-two-containers">
          <InputField 
            name="email"
            value={userEmail}
            onChange={handleChange}
            placeholder="Enter Email"
            disabled
          />
          <Button label="Send OTP" onClick={handleSendOtp} />
        </div>

        <label htmlFor="code">OTP</label>
        <div className="super-admin-account-settings-change-password-two-containers">
          <InputField 
            name="code"
            id="code"
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter OTP"
          />
          <Button label="Verify" onClick={handleVerifyOtp} />
        </div>
        
      </>
      ) : ( 
        <>
        <label htmlFor="newPassword">New Password:</label>
        <div class="super-admin-account-settings-change-password-input">
          <InputField 
            name="password"
            id="newPassword"
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="New Password"
          />
        </div>

        <label htmlFor="confirmPassword">Confirm New Password:</label>
        <div class="super-admin-account-settings-change-password-input">
          <InputField 
            id="confirmPassword"
            name="retypePassword"
            value={form.retypePassword} 
            onChange={(e) => setForm({ ...form, retypePassword: e.target.value })}
            placeholder="Confirm Password"
          />
        </div>
        <Button className="super-admin-account-seetings-change-password-container-button" label="Reset Password" onClick={handleSubmit} />
        </>
      )}
    </>
  )
}


function ForgotPassword() { //when logged-out
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    retypePassword: "",
  });

  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState(""); //otp
  const [message, setMessage] = useState(""); // ✅ success message
  const [error, setError] = useState(""); // ✅ error message

  const handleSendOtp = async () => {
    try {
      const res = await axios.post('/forgot-password/request-otp', { email: form.email });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      console.error(err.message);
      setError("Network or server error");
      setMessage("");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('/forgot-password/verify-otp', { email: form.email, code });
      setMessage(res.data.message);
      toast.success(res.data.message);
      setError("");
      setIsVerified(true);
    } catch (err) {
      console.log(err.response?.data);
      setError(err.response?.data.message);
      toast.error(err.response?.data.message);
      setMessage("");
    }
  };


  const handleSubmit = async(e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isVerified) return toast.error("Verify your email first");
    if (form.password !== form.retypePassword) return setError("Passwords do not match");

    try {
      const res = await axios.post('/forgot-password/reset', { 
        email: form.email, 
        newPassword: form.password 
      });
      console.log(res.data.message);
      setMessage(res.data.message);
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 2000);//2 sec
    } catch (err) {
      console.log(err.response?.data);
      setError(err.response?.data?.message);
      toast.error(error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {/*{!isVerified ? ( */}
        <>
        <p> Forgot Password </p>
        <label>Email</label>
        <InputField 
          name="email"
          value={form.email} 
          onChange={handleChange}
          placeholder="Enter Email"
        />
        <Button label="Send OTP" onClick={handleSendOtp} />
        <label>OTP</label>
        <InputField 
          name="code"
          value={code} 
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter OTP"
        />
        <Button label="Verify" onClick={handleVerifyOtp} />
        </>
      {/* ) : ( */}
        <>
        <label>password</label>
        <InputField 
          name="password"
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
        />
        <label>re-type password</label>
        <InputField 
          name="retypePassword"
          value={form.retypePassword} 
          onChange={(e) => setForm({ ...form, retypePassword: e.target.value })}
          placeholder="Confirm Password"
        />
        <Button label="Reset Password" onClick={handleSubmit} />
        </>
      {/* )} */}
      
    </>
  )
}

export default ForgotPassword;