import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getBlockchain } from "./blockchain";
import Register from "./Register";
import IndustryDashboard from "./pages/IndustryDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
    const [account, setAccount] = useState("");

    useEffect(() => {
        const loadBlockchain = async () => {
            const blockchain = await getBlockchain();
            if (blockchain) {
                const { account } = blockchain;
                setAccount(account);

                // Detect account change in MetaMask
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
                <Route path="/" element={<Register />} />
                <Route path="/industry-dashboard" element={<IndustryDashboard />} />
                <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              </Routes>
            </Router>
        </div>
    );
}

export default App;
