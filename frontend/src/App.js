import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import IndustryDashboard from "./pages/IndustryDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";  
import Signup from "./pages/Signup";
import SubmitRequest from "./pages/SubmitRequest";
import AdminDashboard from "./pages/AdminDashboard";
import Prediction from "./pages/Prediction";

function App() {
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
            setUserRole(storedRole);
        }

        // ✅ Ensure React updates when localStorage changes
        const handleStorageChange = () => {
            setUserRole(localStorage.getItem("userRole") || "");
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />   
                <Route path="/signup" element={<Signup />} />
                <Route path="/submit-request" element={<SubmitRequest />} />
                <Route path="/register-blockchain" element={<Register setUserRole={setUserRole} />} />

                <Route path="/industry-dashboard" element={userRole === "Industry" ? <IndustryDashboard /> : <Navigate to="/" />} />
                <Route path="/retailer-dashboard" element={userRole === "Retailer" ? <RetailerDashboard /> : <Navigate to="/" />} />
                <Route path="/customer-dashboard" element={userRole === "Customer" ? <CustomerDashboard /> : <Navigate to="/" />} />
               
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/prediction" element={<Prediction />} />
            </Routes>
        </Router>
    );
}

export default App;
