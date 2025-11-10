import { useEffect, useState } from "react";
import axios from "../utils/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function LandingPage () {
  const { accessToken } = useAuth();
  const [userCounts, setuserCounts] = useState({});
  const navigate = useNavigate();

  useEffect(()=>{
    fetchAllUsers(); 
  }, []);
  
  const fetchAllUsers = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/users/counts`, config); // getAllUsers 

      setuserCounts(res.data);
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

  return(
    <>
    <div className="landing-page-whole">

        <header className="main-header">
            
            <div className="header-left">
                <div className="logo">
                    <img src="IMG_0493.PNG" alt="INsys Logo" /> 
                </div>
            </div>

            
            <div className="header-center">
                <nav className="nav-links">
                    <a onClick={() => document.getElementById('home').scrollIntoView({ behavior: 'smooth' })} className="nav-link">Home</a>
                    <a onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="nav-link">Features</a>
                    <a onClick={() => document.getElementById('users').scrollIntoView({ behavior: 'smooth' })} className="nav-link">Users</a>
                    <a onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} className="nav-link">How it Works</a>
                </nav>
            </div>

          
            <div className="header-right">
                <button onClick={() => navigate("/login")} className="btn-login">Log In</button>
                <button onClick={() => navigate("/welcome-register")} className="btn-register">Register</button>
            </div>

            <div className="hamburger-menu">
                <button className="hamburger-btn">
                    <i className="fas fa-bars"></i>
                </button>
            </div>
        </header>

        <div className="mobile-menu">
            <a onClick={() => document.getElementById('home').scrollIntoView({ behavior: 'smooth' })} className="mobile-nav-link">Home</a>
            <a onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="mobile-nav-link">Features</a>
            <a onClick={() => document.getElementById('users').scrollIntoView({ behavior: 'smooth' })} className="mobile-nav-link">Users</a>
            <a onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} className="mobile-nav-link">How it Works</a>
            <div className="mobile-buttons">
                <button onClick={() => navigate("/login")} className="btn-login mobile">Log In</button>
                <button onClick={() => navigate("/welcome-register")} className="btn-register mobile">Register</button>
            </div>
        </div>


        <div id="home" className="landing-page-slide-image">
            <div className="slides">
                <div className="slide active">
                    <img src="aryann.jpg" alt="Slide 1" />
                </div>
                <div className="slide">
                    <img src="IMG_9960.PNG" alt="Slide 2" />
                </div>
                <div className="slide">
                    <img src="slide3.jpg" alt="Slide 3" />
                </div>
            </div>

          
            <div className="slide-content">
                <h2 className="slide-content-h2"><span className="insys-gradient">INSYS</span> ...</h2>
                <p>A secure and easy-to-use platform for creating, managing, <br /> monitoring online exams that ensure a honest and reliable results.</p>
                <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>Learn more</button>
            </div>

        
            <div className="slider-line-container">
                <div className="line-segment active"></div>
                <div className="line-segment"></div>
                <div className="line-segment"></div>
            </div>
        </div>

        <div id="features" className="landing-page-features-container">
            <h1>Key Features</h1>
          
            <div className="landing-page-features-row">

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-user-group"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis </p>
                    </div>
                </div>

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-regular fa-clock"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis </p>
                    </div>
                </div>

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis </p>
                    </div>
                </div>
            </div>
            
            <div className="landing-page-features-row">

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-shuffle"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis </p>
                    </div>
                </div>

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-user-lock"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis </p>
                    </div>
                </div>
                
                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-user-lock"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div id="users" className="landing-page-features-definition">
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis </p>
                    </div>
                </div>
            </div>
        </div>

        {/* id="users" .... but i put it on  className="landing-page-features-definition" kase masyado mataas yung pagscroll*/}
        <div className="landing-page-animation-slide">
            <div className="bg2"></div> 
            <div className="bg3"></div> 
            
            <div className="landing-page-users-container"> 
                <div className="white-container">
                    <i className="fa-solid fa-user-tie"></i>
                    <label>Teachers</label>
                    <p>{userCounts.admin || 0}</p>
                </div>
                <div className="white-container">
                    <i className="fa-solid fa-user"></i>
                   <label>Students</label>
                    <p>{userCounts.student || 0}</p>
                </div>
                <div className="white-container">
                    <i className="fa-solid fa-users"></i>
                    <label>All Users</label>
                    <p>{userCounts.all || 0}</p>
                </div>
            </div>
        </div>

        <div id="how-it-works" className="landing-page-features-objective">

         <div className="how-it-works-landing-page-container">
            <h2 className="how-it-works-landing-page-section-title">How It Works</h2>
            <p className="how-it-works-landing-page-section-subtitle">Conduct secure online exams in three simple steps</p>
            <div className="how-it-works-landing-page-steps-wrapper">
                <div className="how-it-works-landing-page-step-card">
                    <div className="how-it-works-landing-page-step-number">01</div>
                    <div className="how-it-works-landing-page-step-icon-wrapper">
                        <div className="how-it-works-landing-page-step-icon">📋</div>
                    </div>
                    <h3 className="how-it-works-landing-page-step-title">Create Exam</h3>
                    <p className="how-it-works-landing-page-step-description">Set up your exam questions, configure security settings, and schedule the test date and time.</p>
                </div>
                <div className="how-it-works-landing-page-step-connector">
                    <div className="how-it-works-landing-page-step-line"></div>
                    <div className="how-it-works-landing-page-step-arrow">→</div>
                </div>
                <div className="how-it-works-landing-page-step-card">
                    <div className="how-it-works-landing-page-step-number">02</div>
                    <div className="how-it-works-landing-page-step-icon-wrapper">
                        <div className="how-it-works-landing-page-step-icon">👥</div>
                    </div>
                    <h3 className="how-it-works-landing-page-step-title">Invite Students</h3>
                    <p className="how-it-works-landing-page-step-description">Send secure exam links to students with and access codes.</p>
                </div>
                <div className="how-it-works-landing-page-step-connector">
                    <div className="how-it-works-landing-page-step-line"></div>
                    <div className="how-it-works-landing-page-step-arrow">→</div>
                </div>
                <div className="how-it-works-landing-page-step-card">
                    <div className="how-it-works-landing-page-step-number">03</div>
                    <div className="how-it-works-landing-page-step-icon-wrapper">
                        <div className="how-it-works-landing-page-step-icon">🔍</div>
                    </div>
                    <h3 className="how-it-works-landing-page-step-title">Monitor & Review</h3>
                    <p className="how-it-works-landing-page-step-description">Watch exams in real-time, receive alerts for suspicious activity, and review detailed reports.</p>
                </div>
            </div>
        </div>
        


        </div>
         

        </div>

        <footer id="footer">
            <div className="landing-page-footer">
                <div className="landing-page-insys-logo">
                    <img src="insys-example.PNG" alt="logo" />
                    <p>Exclusive for</p>
                    <div className="landing-page-school-logos">
                        <div className="landing-page-psu-logo">
                            <img src="psu.PNG" alt="logo" />
                        </div>
                        <div className="landing-page-psu-logo">
                            <img src="ccs.PNG" alt="logo" />
                        </div>
                    </div>
                </div>

                <div className="landing-page-details">
                    <h1>About</h1>
                    <ul className="landing-page-list">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Mission</a></li>
                        <li><a href="#">Terms and Condition</a></li>
                    </ul>
                </div>

                <div className="landing-page-details">
                    <h1>Contact Us</h1>
                    <ul className="landing-page-list">
                        <li><a><i className="fa-solid fa-envelope"></i>insyscor@gmail.com</a></li>
                        <li><a><i className="fa-solid fa-phone"></i>045-280-7973</a></li>
                        <li><a><i className="fa-brands fa-facebook-f"></i>@INsys-corp</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    </>
  );
}

export default LandingPage;