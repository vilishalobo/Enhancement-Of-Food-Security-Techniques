import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import FloatingImages from "./FloatingImages";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Floating Images Background */}
      <FloatingImages />
      
      {/* Title at the top */}
      <h1 className="WebName">
        <span className="text-white">Trace</span>
        <span className="text-red-600">Originality</span>
      </h1>

      {/* Content Row for Left and Right Containers */}
      <div className="content-row">
        <div className="content-container left-container">
          <div className="form-wrapper">
            <h1 className="white-text">Are you an Industry/Retailer/Customer?</h1>
            <button className="bg-red-600" onClick={() => navigate("/register-blockchain")}>
              Get Started
            </button>
          </div>
        </div>
        <div className="content-container right-container">
          <div className="form-wrapper">
            <h1 className="white-text">Are you a Farmer?</h1>
            <button className="bg-red-600" onClick={() => navigate("/Login")}>
              Get Started
            </button>
          </div>     
          <div className="center-container">
            <button2 onClick={() => navigate("/admin-dashboard")}>
              Admin
            </button2>
          </div>       
        </div>


      </div>
    </div>
  );
};

export default LandingPage;