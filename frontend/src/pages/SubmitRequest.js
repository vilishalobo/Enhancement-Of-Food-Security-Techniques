import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const SubmitRequest = () => {
  const [fruitType, setFruitType] = useState("");
  const [landArea, setLandArea] = useState("");  
  const [amount, setAmount] = useState("");
  const [username, setUsername] = useState("");
  const [requests, setRequests] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      alert("Error: User not logged in");
      navigate("/");
    } else {
      setUsername(storedUsername);
      fetchRequests(storedUsername);
    }
  }, [navigate]);

  const fetchRequests = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/farmer/requests?username=${username}`);
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch requests");
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !fruitType || !landArea || !amount) {
      alert("❌ Please enter fruit type, land area, and amount");
      return;
    }
    const requestData = { username, fruitType, landArea, amount  };
    console.log("Submitting Request Data:", requestData); // ✅ Debugging line
  
    try {
      const response = await fetch("http://localhost:5000/farmer/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      const data = await response.json();
      console.log("Response from server:", data); // ✅ Debugging line
  
      if (!response.ok) throw new Error(data.error || "Failed to submit request");
  
      alert(data.message);
      setFruitType(""); 
      setLandArea("");  
      setAmount("");
      fetchRequests(username);
  
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("❌ Error submitting request. Please try again.");
    }
  };
  

  return (
    <div className="SubmitRequest">
      <h2>Submit Request</h2>
      <p>Logged in as: <strong>{username}</strong></p>

      <input
        type="text"
        placeholder="Enter fruit type"
        value={fruitType}
        onChange={(e) => setFruitType(e.target.value)}
      />
      
      <input
  type="number"
  placeholder="Enter land area (in acres)"
  value={landArea}
  onChange={(e) => setLandArea(Number(e.target.value))} // ✅ Convert to number
/>
<input
        type="number"
        placeholder="Amount that can be grown (in kgs)"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />


      <button onClick={handleSubmit}>Submit</button>

      <h3>Your Submitted Requests</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Fruit Type</th>
            <th>Land Area</th>
            <th>Amount (in kgs)</th>
            <th>Approved Quantity</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td>{request.fruitType}</td>
              <td>{request.landArea ? `${request.landArea} acres` : "N/A"}</td>
              <td>{request.amount ? `${request.amount} kg` : "N/A"}</td>
              <td>{request.quantity || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmitRequest;
