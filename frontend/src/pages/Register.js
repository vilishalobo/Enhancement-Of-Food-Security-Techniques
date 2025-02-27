import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupplyChainABI from "../SupplyChainABI.json";
import { ethers } from "ethers";
import contractData from "../deployedAddress.json";

const CONTRACT_ADDRESS = contractData.contractAddress;

const Register = ({ setUserRole }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [account, setAccount] = useState("");
    const [role, setRole] = useState("Industry");
    const navigate = useNavigate();

    useEffect(() => {
        const connectWallet = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    setAccount(address);

                    window.ethereum.on("accountsChanged", (accounts) => {
                        setAccount(accounts[0] || "Disconnected");
                    });
                } catch (error) {
                    console.error("Wallet connection failed:", error);
                }
            } else {
                alert("Please install MetaMask to use this DApp.");
            }
        };
        connectWallet();
    }, []);

    // **🔹 Handle User Authentication (MetaMask Signature)**
    const handleAuth = async () => {
        try {
            console.log("🔹 Connecting to Ethereum...");
    
            if (!window.ethereum) {
                alert("MetaMask is not installed.");
                return;
            }
    
            // Request account connection
            await window.ethereum.request({ method: "eth_requestAccounts" });
    
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
    
            // Common message signing
            const message = "Sign this message to verify your identity for SupplyChain DApp.";
            const messageHash = ethers.hashMessage(message);
    
            let signature;
            try {
                signature = await window.ethereum.request({
                    method: "personal_sign",
                    params: [messageHash, address],
                });
                console.log("Signed Message:", signature);
            } catch (err) {
                console.error("Signing Failed:", err);
                alert(`Signing failed: ${err.message}`);
                return;
            }
    
            // Create contract instance
            const contract = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI, signer);
            console.log("Contract instance created:", contract);
    
            // Separate logic based on isSignup
            if (isSignup) {
                console.log("🔹 Calling registerUser with:", address, role, signature);
                const tx = await contract.registerUser(address, role, signature);
                await tx.wait();
                alert("Successfully registered!");
                setUserRole(role);
            } else {
                // Login: Check that the user is already registered
                console.log("Attempting login for:", address);

                const userRole = await contract.getUserRole(address);
                console.log("Retrieved role:", userRole);

                
                if (!userRole || userRole === "") {
                    alert("User not registered! Please sign up first.");
                    return;
                }
                console.log("Login successful. Role:", userRole);
                setUserRole(userRole);
                alert("Login successful!");
            }
    
            // Navigate based on role (use the role from registration/login)
            const finalRole = isSignup ? role : await contract.getUserRole(address);
            if (finalRole === "Industry") {
                navigate("/industry-dashboard");
            } else if (finalRole === "Retailer") {
                navigate("/retailer-dashboard");
            } else {
                navigate("/customer-dashboard");
            }
        } catch (error) {
            console.error("Authentication failed:", error);
            alert("Authentication failed. Please try again.");
        }
    };
              
    
    return (
        <div>
            <p>Connected Account: {account || "Not Connected"}</p>

            <h2>{isSignup ? "Sign Up" : "Login"}</h2>

            {isSignup && (
                <>
                    <label>Select Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Industry">Industry</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Customer">Customer</option>
                    </select>
                </>
            )}

            <button onClick={handleAuth}>{isSignup ? "Sign Up" : "Login"}</button>

            <p>
                {isSignup ? "Already have an account?" : "New user?"}{" "}
                <button onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? "Login" : "Sign Up"}
                </button>
            </p>
        </div>
    );
};

export default Register;
