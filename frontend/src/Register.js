import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import deployedConfig from "./deployedAddress.json";
import SupplyChainABI from "./SupplyChainABI.json";

const CONTRACT_ADDRESS = deployedConfig.contractAddress;

const Register = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("1");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const registerUser = async () => {
    if (!window.ethereum) {
      alert("Metamask not detected");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI, signer);

      console.log("Sending registration transaction...");
      const tx = await contract.registerUser(name, parseInt(role));
      console.log("Transaction hash:", tx.hash);

      await tx.wait();
      alert("User registered successfully!");
      redirectUser(parseInt(role));
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === 1) {
      navigate("/industry-dashboard");
    } else if (role === 2) {
      navigate("/retailer-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="1">Industry</option>
        <option value="2">Retailer</option>
        <option value="3">Customer</option>
      </select>
      <button onClick={registerUser} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

export default Register;
