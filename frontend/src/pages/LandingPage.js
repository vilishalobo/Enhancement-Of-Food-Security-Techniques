import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1 style={{ color: "Black" }}>Are you an Industry/Retailer/Customer?</h1>
            <button onClick={() => navigate("/register-blockchain")}>Get Started</button>

            <h1 style={{ color: "Black" }}>Are you a Farmer?</h1>
            <button onClick={() => navigate("/login")}>Get Started</button>  

            <h4>Admin?</h4>
            <button onClick={() => navigate("/admin-dashboard")}>Get Started</button>  
        </div>
    );
};

export default LandingPage;
