import { useEffect, useState } from "react";
import axios from "../utils/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function LandingPage () {
  const { accessToken } = useAuth();
  const [userCounts, setuserCounts] = useState({});
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slides = document.querySelectorAll(".slide");
    const lines = document.querySelectorAll(".line-segment");

    const interval = setInterval(() => {
      // remove active from all
      slides.forEach((s) => s.classList.remove("active"));
      lines.forEach((l) => l.classList.remove("active"));

      // set active to current
      slides[currentSlide].classList.add("active");
      lines[currentSlide].classList.add("active");

      // update index
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // 3s per slide

    return () => clearInterval(interval);
  }, [currentSlide]);

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
                    <img src="/images/sample03.PNG" alt="INsys Logo" /> 
                </div>
            </div>

            
            <div className="header-center">
                <nav className="nav-links">
                    <a onClick={() => document.getElementById('home').scrollIntoView({ behavior: 'smooth' })} className="nav-link">Home</a>
                    <a onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} className="nav-link">How it Works</a>
                    <a onClick={() => document.getElementById('users').scrollIntoView({ behavior: 'smooth' })} className="nav-link">Users</a>
                    <a onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="nav-link">Features</a>
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
                    <img src="/images/slide0.png" alt="Slide 1" />
                </div>
                <div className="slide">
                    <img src="/images/22.webp" alt="Slide 2" />
                </div>
                <div className="slide">
                    <img src="/images/11.webp" alt="Slide 3" />
                </div>
            </div>

          
            <div className="slide-content">
                <h2 className="insys-gradient"> INSYS: The future of online examinations</h2>
                <p>A secure and easy-to-use platform for creating, managing, <br /> monitoring online exams that ensure a honest and reliable results.</p>
                <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>Learn more</button>
            </div>

        
            <div className="slider-line-container">
                <div className="line-segment active"></div>
                <div className="line-segment"></div>
                <div className="line-segment"></div>
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
                    <p  id="users"  className="how-it-works-landing-page-step-description">Watch exams in real-time, receive alerts for suspicious activity, and review detailed reports.</p>
                </div>
            </div>
            </div>
        
        </div>


    
        {/* id="users" .... but i put it on  className="how-it-works-landing-page-step-description" kase masyado mataas yung pagscroll*/}
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

        <div id="features" className="landing-page-features-container">
            <h1 className="lading-page-features-label">Key Features</h1>
          
            <div className="landing-page-features-row">

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-user-group"></i></div>
                    <div className="landing-page-bold-title">
                        <p>User friendly design</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Offers an intuitive interface that makes navigation simple and efficient for all users.</p>
                    </div>
                </div>

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
                    <div className="landing-page-bold-title">
                        <p>Tab Switching Detection </p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Monitor and detect  when a user switches tab to ensure exam integrity.</p>
                    </div>
                </div>

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-clock"></i></div>
                    <div className="landing-page-bold-title">
                        <p>Smart Timer </p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Automatically track and manage exam duration for each student's exam.</p>
                    </div>
                </div>
            </div>
            
            <div className="landing-page-features-row">

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-gears"></i></div>
                    <div className="landing-page-bold-title">
                        <p>Automated Grading</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Automatically check and grade submitted exam answers to provide instant results.</p>
                    </div>
                </div>

                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-shuffle"></i></div>
                    <div className="landing-page-bold-title">
                        <p>Question Randomization </p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Randomly arrange questions to provide each student with a unique set or sequence of questions.</p>
                    </div>
                </div>
                
                <div className="landing-page-features-item">
                    <div className="landing-page-icon"><i className="fa-solid fa-pen-to-square"></i></div>
                    <div className="landing-page-bold-title">
                        <p>Exam Creation</p>
                    </div>
                    <div className="landing-page-features-definition">
                        <p>Teachers can easily create, edit, customize question types and manage the exam</p>
                    </div>
                </div>
            </div>
        </div>
         

        </div>

        <footer id="footer">
            <div className="landing-page-footer">
                <div className="landing-page-insys-logo">
                    <img src="/images/sample03.PNG" alt="logo" />
                    <p>Exclusive for</p>
                    <div className="landing-page-school-logos">
                        <div className="landing-page-psu-logo">
                            <img src="/images/psu.PNG" alt="logo" />
                        </div>
                        <div className="landing-page-psu-logo">
                            <img src="/images/ccs.PNG" alt="logo" />
                        </div>
                    </div>
                </div>

                <div className="landing-page-details">
                    <h1>About</h1>
                    <ul className="landing-page-list">
                        <li><a href="/welcome-aboutUs">About Us</a></li>
                        <li><a href="/welcome-mission">Mission</a></li>
                        <li><a href="/welcome-terms">Terms and Condition</a></li>
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