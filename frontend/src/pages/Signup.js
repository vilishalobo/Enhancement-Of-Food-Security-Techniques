import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LandingPage.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter both username and password!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Signup successful! Redirecting to login...");
        navigate("/login");  // Redirect to Login page
      } else {
        alert(data.error || "❌ Signup failed!");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("❌ Something went wrong! Please try again later.");
    }
  };

  return (
    <div className="Signup" style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#111',
      color: 'white'
    }}>
      <div className="form-wrapper" style={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0px 0px 15px rgba(255, 255, 255, 0.2)',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h2 style={{ 
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#ff0015'
        }}>Sign Up</h2>
        
        <form onSubmit={handleSignup} style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#222',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#222',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ff0015',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff3333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff0015'}
          >
            Sign Up
          </button>
        </form>
        
        <p style={{ 
          textAlign: 'center',
          marginTop: '1rem',
          color: 'white'
        }}>
          Already have an account? <Link to="/login" style={{ color: '#ff0015' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
