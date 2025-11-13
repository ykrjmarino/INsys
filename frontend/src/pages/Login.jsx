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


        

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post("/login", formLogin, { withCredentials: true })
      .then(res => {
        const { accessToken, user, message } = res.data; //response from backend login (auth.js)

        setAccessToken(accessToken); //store access token in global context (AuthContext.js)
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        setUser(user); //from backend login (auth.js).. but came from userPayload

        toast.success(message);

        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (user.role === "student") {
          navigate("/student-entry");
        } else if (user.role === "superadmin") {
          navigate("/dashboard");
        }
        
      })
      .catch(err => {
        console.log(err.response?.data);
        toast.error(err.response?.data?.error || "Something went wrong");
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
    <div className="log-in-whole">
      
        <div id="login-stars"></div>
        <div id="login-stars2"></div>
        <div id="login-stars3"></div>

        <div className="login-side-design">
            <img src="/images/sample03.PNG" alt="Sidebar Logo" />
            <label>Don't Have An Account Yet</label>
            <Button className="login-register-btn" label="Sign Up" onClick={() => navigate('/welcome-register')} />
        </div>
        
        <div className="login-whole-container">
            <button onClick={()=>navigate('/')} className="login-back-btn"><i className="fa fa-arrow-left"></i></button>

            <label className="login-label">Login</label>
            
            <div id="login-container">
                <div className="login-group">
                    <label htmlFor="email">Email</label>
                    <InputField 
                      name="email"
                      id="email"
                      type="email"
                      value={formLogin.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                </div>
                <div className="login-group">
                    <label htmlFor="password">Password</label>
                    <InputField 
                      name="password"
                      id="password"
                      type="password"
                      value={formLogin.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                </div>
                <div className="login-forgot-password">
                    <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
                </div>
            </div>
            
            <Button className="login-btn" label="Login" onClick={handleLogin}/>
            <div className="login-or-label">or</div>
            <Button className="login-register-btn-mobile" label="Sign Up" onClick={() => navigate('/welcome-register')} />
        </div>
    </div>
  )

}

export default Login;

/*

  return (
   <>
   <div className="login-whole">
    <div id="login-stars"></div>
    <div id="login-stars2"></div>
    <div id="login-stars3"></div>

    <div className="container" id="login-container">
      <h1>Login</h1>
      <div id="login-container-inner">
        <form onSubmit={handleLogin}>
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

          <Button className="login-register-btn" label="Sign Up" onClick={() => navigate('/welcome-register')} />
        </form>
      </div>
    </div>
   </div>
    
    </>
  )

*/