import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/pending-requests");
        console.log("Fetched Requests:", response.data);
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleQuantityChange = (requestId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  async function approveRequest(requestId) {
    const quantity = quantities[requestId];
    if (!quantity) {
      alert("Please enter a quantity before approving!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/approve-request", { requestId, quantity });
      alert("✅ Request approved!");
    } catch (error) {
      console.error("Error approving request:", error);
    }
  }

  const handleDownloadDataset = () => {
    const ipfsUrl = "https://ipfs.io/ipfs/bafkreif5k5e4vjw3fljabb5orajyztyipkq4petb4levi424mhtywuvnqa";
    const link = document.createElement("a");
    link.href = ipfsUrl;
    link.setAttribute("download", "dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="AdminDashboard" style={{ padding: "10px" }}>
      <h1>Admin Dashboard</h1>
      <h3>Pending Requests</h3>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length > 0 ? (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Farmer Username</th>
              <th>Fruit Type</th>
              <th>Land Area (acres)</th>
              <th>Quantity (Kgs)</th>
              <th>Enter Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.username}</td>
                <td>{req.fruitType}</td>
                <td>{req.landArea ? `${req.landArea} acres` : "N/A"}</td>
                <td>{req.amount ? `${req.amount} Kgs` : "Not predicted yet"}</td>
                <td>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={quantities[req._id] || ""}
                    onChange={(e) => handleQuantityChange(req._id, e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => approveRequest(req._id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending requests</p>
      )}

<<<<<<< HEAD
      {/* Button to go to Prediction page */}
      <button 
        onClick={() => navigate("/prediction")} // Redirect to Prediction.js
=======
      <button
        onClick={() => navigate("/prediction")}
>>>>>>> 109a6cc8133a50386e1e969d88075851964524b6
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px",
          marginRight: "10px"
        }}
      >
        Go to Prediction Page
      </button>

      <button
        onClick={handleDownloadDataset}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px"
        }}
      >
        Download Dataset
      </button>
    </div>
  );
}

export default AdminDashboard;