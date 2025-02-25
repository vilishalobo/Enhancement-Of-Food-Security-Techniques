import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getBlockchain } from "./blockchain";
import Register from "./Register";
import IndustryDashboard from "./pages/IndustryDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
    const [account, setAccount] = useState("");
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

    useEffect(() => {
        const loadBlockchain = async () => {
            const blockchain = await getBlockchain();
            if (blockchain) {
                const { account } = blockchain;
                setAccount(account);

                window.ethereum.on("accountsChanged", (accounts) => {
                    setAccount(accounts[0] || "Disconnected");
                });
            }
        };
        loadBlockchain();
    }, []);

    return (
        <div>
            <h1>Blockchain Supply Chain</h1>
            <p>Connected Account: {account || "Not Connected"}</p>
            <Router>
                <Routes>
                    <Route path="/" element={<Register setUserRole={setUserRole} />} />
                    <Route path="/industry-dashboard" element={userRole === "Industry" ? <IndustryDashboard /> : <Navigate to="/" />} />
                    <Route path="/retailer-dashboard" element={userRole === "Retailer" ? <RetailerDashboard /> : <Navigate to="/" />} />
                    <Route path="/customer-dashboard" element={userRole === "Customer" ? <CustomerDashboard /> : <Navigate to="/" />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
