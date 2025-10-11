import axios from "../utils/axiosConfig.js";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import InputField from "../components/InputFields.jsx"
import Button from "../components/Buttons.jsx"
import { useAuth } from "../context/AuthContext.jsx";

import { useNavigate } from 'react-router-dom'; //temporary? idk

function Login() {
  const navigate = useNavigate();
  const { accessToken, setAccessToken, setUser } = useAuth();

  const [formLogin, setFormLogin] = useState({
    email: "",
    password: ""
  });

          useEffect(() => {
            console.log("Sending access token:", accessToken);

            if (!accessToken) return console.log("no access token");
            axios.get('/protected',  {
              headers: {
                Authorization: `Bearer ${accessToken}`
            }});
          }, [accessToken]);


        

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("/login", formLogin, { withCredentials: true })
      .then(res => {
        const { accessToken, user, message} = res.data; //response from backend login (auth.js)

        setAccessToken(accessToken); //store access token in global context (AuthContext.js)
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        setUser(user); //from backend login (auth.js).. but came from userPayload

        toast.info(message);

        if (user.role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (user.role === "student") {
          navigate("/student-entry");
        } else if (user.role === "admin") {
          navigate("/admin");
        }
      })
      .catch(err => {
        console.log(err.response?.data);
        toast.info(err.response?.data.error ||"for testing: check console for error");
      })

      // 🚀 redirect after login
    
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
   <>
   <div className="login-whole">
    <div className="container" id="login-container">
      <h1>Login</h1>
      <div id="login-container-inner">
        <form onSubmit={handleSubmit}>
          <div className="email-group">
            <label>Email</label>
            <InputField 
              name="email"
              id="email"
              type="email"
              value={formLogin.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="password-group">
            <label>Password</label>
            <InputField 
              name="password"
              id="password"
              type="password"
              value={formLogin.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            <div className="forgot-password-container">
              <a className="forgot-password" href="/forgot-password">Forgot Password?</a>
            </div>
          </div>

          <Button className="login-btn" label="Login" type="submit" />

          <div className="line">
            <span>or</span>
          </div>

          <Button className="signup-btn" label="Sign Up" onClick={() => navigate('/welcome-register')} />
        </form>
      </div>
    </div>
   </div>
    
    </>
  )

}

export default Login;