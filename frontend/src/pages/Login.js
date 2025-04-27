import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LandingPage.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("❌ Enter valid credentials!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("username", username); // Store username in localStorage
        alert("✅ Login successful! Redirecting...");
        navigate("/submit-request");  // Redirect to next page
      } else {
        alert(data.error || "❌ Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("❌ Something went wrong! Please try again later.");
    }
  };

  return (
    <div className="Login">
    <div>
      <h2>Farmer Login</h2>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button1 onClick={handleLogin}>Login</button1>
      <p>New user? <Link to="/signup">Signup</Link></p>
    </div>
    </div>
  );
};

export default Login;
