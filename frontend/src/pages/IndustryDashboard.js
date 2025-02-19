import React, { useState } from "react";
import { ethers } from "ethers";
import SupplyChainABI from "../SupplyChainABI.json";
import contractData from "../deployedAddress.json";

const IndustryDashboard = () => {
  const [shipmentId, setShipmentId] = useState("");
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [receiverAddress, setReceiverAddress] = useState("");
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

  async function createShipment() {
    try {
      if (!receiverAddress) {
        setStatusMessage("Receiver address is required.");
        return;
      }
      setStatusMessage("Creating shipment...");
      const shipmentContract = await connectToContract();
      const tx = await shipmentContract.createShipment(receiverAddress);
      await tx.wait();
      const latestShipmentId = await shipmentContract.shipmentCount();
      setShipmentId(latestShipmentId.toString());
      setStatusMessage(`Shipment created successfully! ID: ${latestShipmentId}`);
    } catch (error) {
      console.error("Error creating shipment:", error);
      setStatusMessage("Failed to create shipment.");
    }
  }

  async function startShipment() {
    try {
      if (!shipmentId) {
        setStatusMessage("Shipment ID is required.");
        return;
      }
      setStatusMessage("Starting shipment...");
      const shipmentContract = await connectToContract();
      const tx = await shipmentContract.startShipment(Number(shipmentId));
      await tx.wait();
      setStatusMessage("Shipment started successfully!");
      await fetchShipment();
    } catch (error) {
      console.error("Error starting shipment:", error);
      setStatusMessage("Failed to start shipment.");
    }
  }

  async function completeShipment() {
    try {
      if (!shipmentId) {
        setStatusMessage("Shipment ID is required.");
        return;
      }
      setStatusMessage("Completing shipment...");
      const shipmentContract = await connectToContract();
      const tx = await shipmentContract.completeShipment(Number(shipmentId));
      await tx.wait();
      setStatusMessage("Shipment completed successfully!");
      await fetchShipment();
    } catch (error) {
      console.error("Error completing shipment:", error);
      setStatusMessage("Failed to complete shipment.");
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
      <h1>Shipment Management</h1>
      <div>
        <h2>Create Shipment</h2>
        <input
          type="text"
          placeholder="Receiver Address"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
        <button onClick={createShipment}>Create Shipment</button>
      </div>
      <div>
        <h2>Fetch Shipment</h2>
        <input
          type="number"
          placeholder="Enter Shipment ID"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
        />
        <button onClick={fetchShipment}>Fetch Shipment</button>
      </div>
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
      <div>
        <h2>Manage Shipment</h2>
        <input
          type="number"
          placeholder="Enter Shipment ID"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
        />
        <button onClick={startShipment}>Start Shipment</button>
        <button onClick={completeShipment}>Complete Shipment</button>
      </div>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default IndustryDashboard;
