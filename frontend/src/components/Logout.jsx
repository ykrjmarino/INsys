import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig.js";
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from "react";
import ReactDOM from "react-dom";

function LogoutButton({className}) {
  
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuth();

  const handleLogout = () => {
    axios.post("/logout", {}, { withCredentials: true })
      .then(res => {
        console.log(res.data.message);
        setAccessToken(null); //clear token
        setUser(null); //clear user
        navigate("/login"); //redirect to login page
      })
      .catch(err => console.error(err));
  };

  return (
    <>
    <button className={className} onClick={handleLogout}>Logout</button>
    </>
  )
}

export const LogoutSpan = ({className}) => {
  
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    axios.post("/logout", {}, { withCredentials: true })
      .then(res => {
        console.log(res.data.message);
        setAccessToken(null); //clear token
        setUser(null); //clear user
        navigate("/login"); //redirect to login page
      })
      .catch(err => console.error(err));
  };

  const confirmLogout = () => {
    setShowModal(false);
    setInterval(() => handleLogout(), 1000);
  };

  return (
    <>
      <button className={className} onClick={() => setShowModal(true)}>
        <i className="fa-solid fa-right-from-bracket"></i> Logout
      </button>

      {showModal &&
        ReactDOM.createPortal(
          <div 
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}>
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                width: "90%",
                maxWidth: "400px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>

              <div>
              <button
                onClick={confirmLogout}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#d9534f",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100px",
                }}
              >
                Yes
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginLeft: "10px",
                  width: "100px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default LogoutButton;