import React, { useState } from "react";
import { ethers } from "ethers";
import SupplyChainABI from "../SupplyChainABI.json";
import contractData from "../deployedAddress.json";

const CustomerDashboard = () => {
    const [shipmentId, setShipmentId] = useState("");
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
  
    async function connectToContract() {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return null;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.resolveName = async (name) => name;
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractAddress = contractData.contractAddress;
        return new ethers.Contract(contractAddress, SupplyChainABI, signer);
      } catch (error) {
        console.error("Error connecting to contract:", error);
        setStatusMessage("Failed to connect to contract.");
        return null;
      }
    }

    async function fetchShipment() {
      try {
        setStatusMessage("Fetching shipment details...");
        const shipmentContract = await connectToContract();
        const details = await shipmentContract.getShipment(Number(shipmentId));
  
        setShipmentDetails({
          sender: details.sender,
          receiver: details.receiver,
          status: getStatusText(Number(details.status)),
          createdAt: new Date(Number(details.createdAt) * 1000).toString(),
          startedAt: details.startedAt > 0 ? new Date(Number(details.startedAt) * 1000).toString() : "Not started",
          completedAt: details.completedAt > 0 ? new Date(Number(details.completedAt) * 1000).toString() : "Not completed",
        });
  
        setStatusMessage("Shipment details fetched successfully!");
      } catch (error) {
        console.error("Error fetching shipment details:", error);
        setStatusMessage("Failed to fetch shipment details.");
      }
    }

    function getStatusText(status) {
      switch (status) {
        case 0:
          return "Pending";
        case 1:
          return "In Progress";
        case 2:
          return "Delivered";
        default:
          return "Unknown";
      }
    }

  return (
    <div>
        <h2>Fetch Shipment</h2>
        <input
          type="number"
          placeholder="Enter Shipment ID"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
        />
        <button onClick={fetchShipment}>Fetch Shipment</button>
      {shipmentDetails && (
        <div>
          <h3>Shipment Details</h3>
          <p>Sender: {shipmentDetails.sender}</p>
          <p>Receiver: {shipmentDetails.receiver}</p>
          <p>Status: {shipmentDetails.status}</p>
          <p>Created At: {shipmentDetails.createdAt}</p>
          <p>Started At: {shipmentDetails.startedAt}</p>
          <p>Completed At: {shipmentDetails.completedAt}</p>
        </div>
      )}
      </div>
  );
};

export default CustomerDashboard;
