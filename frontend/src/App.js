import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import IndustryDashboard from "./pages/IndustryDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";

function App() {
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
            setUserRole(storedRole);
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/register-blockchain" element={<Register setUserRole={setUserRole} />} />
                <Route path="/industry-dashboard" element={userRole === "Industry" ? <IndustryDashboard /> : <Navigate to="/" />} />
                <Route path="/retailer-dashboard" element={userRole === "Retailer" ? <RetailerDashboard /> : <Navigate to="/" />} />
                <Route path="/customer-dashboard" element={userRole === "Customer" ? <CustomerDashboard /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
