import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupplyChainABI from "../SupplyChainABI.json";
import { ethers } from "ethers";
import contractData from "../deployedAddress.json";
import "./LandingPage.css";
import FloatingImages from "./FloatingImages";

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

  const handleAuth = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const message = "Sign this message to verify your identity for SupplyChain DApp.";
      const messageHash = ethers.hashMessage(message);

      let signature;
      try {
        signature = await window.ethereum.request({
          method: "personal_sign",
          params: [messageHash, address],
        });
      } catch (err) {
        alert(`Signing failed: ${err.message}`);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI, signer);

      if (isSignup) {
        const tx = await contract.registerUser(address, role, signature);
        await tx.wait();
        setUserRole(role);
      } else {
        const userRole = await contract.getUserRole(address);
        if (!userRole || userRole === "") {
          alert("User not registered! Please sign up first.");
          return;
        }
        setUserRole(userRole);
      }

      const finalRole = isSignup ? role : await contract.getUserRole(address);
      navigate(`/${finalRole.toLowerCase()}-dashboard`);
    } catch (error) {
      alert("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="landing-page">
      <FloatingImages />
      <div className="overlay">
        <div className="form">
          <div className="auth-content">
            <h2 className="white-text">{isSignup ? "Sign Up" : "Login"}</h2>

            <div className="wallet-info">
              <span>Connected Account:</span>
              <span>{account || "Not Connected"}</span>
            </div>

            {isSignup && (
              <div className="form-group">
                <label>Select Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Industry">Industry</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            )}

            <div className="button-container">
              <p className="switch-text">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
              </p>

              <button className="auth-button" onClick={handleAuth}>
                {isSignup ? "Sign Up" : "Login"}
              </button>

              <button
                className="auth-button switch-button"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
