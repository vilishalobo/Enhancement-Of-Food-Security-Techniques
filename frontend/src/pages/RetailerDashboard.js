import React, { useState } from "react";
import { ethers } from "ethers";
import SupplyChainABI from "../SupplyChainABI.json";
import contractData from "../deployedAddress.json";

const RetailerDashboard = () => {
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
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      return new ethers.Contract(contractData.contractAddress, SupplyChainABI, signer);
    } catch (error) {
      console.error("Error connecting to contract:", error);
      setStatusMessage("Failed to connect to contract.");
      return null;
    }
  }

  async function fetchShipment() {
    if (!shipmentId) {
      setStatusMessage("Enter shipment ID.");
      return;
    }

    setStatusMessage("Fetching shipment details...");
    const shipmentContract = await connectToContract();
    if (!shipmentContract) return;

    try {
      const details = await shipmentContract.getShipment(Number(shipmentId));
      const products = await shipmentContract.getProducts(Number(shipmentId));

      const formattedProducts = products.map((product) => ({
        name: product.name,
        manufacturingDate: new Date(Number(product.manufacturingDate) * 1000).toDateString(),
        expiryDate: new Date(Number(product.expiryDate) * 1000).toDateString(),
        price: ethers.formatUnits(product.price, "ether"),
        quantity: Number(product.quantity),
      }));

      setShipmentDetails({
        sender: details.sender,
        receiver: details.receiver,
        status: getStatusText(Number(details.status)),
        createdAt: new Date(Number(details.createdAt) * 1000).toString(),
        startedAt: details.startedAt > 0 ? new Date(Number(details.startedAt) * 1000).toString() : "Not started",
        completedAt: details.completedAt > 0 ? new Date(Number(details.completedAt) * 1000).toString() : "Not completed",
        products: formattedProducts,
      });

      setStatusMessage("Shipment details fetched successfully!");
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      setStatusMessage("Failed to fetch shipment details.");
    }
  }

  async function completeShipment() {
    if (!shipmentId) {
      setStatusMessage("Shipment ID is required.");
      return;
    }

    setStatusMessage("Completing shipment...");
    const shipmentContract = await connectToContract();
    if (!shipmentContract) return;

    try {
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
    return ["Pending", "In Progress", "Delivered"][status] || "Unknown";
  }

  return (
    <div>
      <h2>Fetch Shipment</h2>
      <input
        type="number"
        placeholder="Shipment ID"
        value={shipmentId}
        onChange={(e) => setShipmentId(e.target.value)}
      />
      <button onClick={fetchShipment}>Fetch Shipment</button>
      <button onClick={completeShipment}>Complete Shipment</button>

      {statusMessage && <p>{statusMessage}</p>}

      {shipmentDetails && (
        <div>
          <h3>Shipment Details</h3>
          <p><strong>Sender:</strong> {shipmentDetails.sender}</p>
          <p><strong>Receiver:</strong> {shipmentDetails.receiver}</p>
          <p><strong>Status:</strong> {shipmentDetails.status}</p>
          <p><strong>Created At:</strong> {shipmentDetails.createdAt}</p>
          <p><strong>Started At:</strong> {shipmentDetails.startedAt}</p>
          <p><strong>Completed At:</strong> {shipmentDetails.completedAt}</p>

          {shipmentDetails.products.length > 0 ? (
            <div>
              <h3>Products in Shipment</h3>
              <ul>
                {shipmentDetails.products.map((product, index) => (
                  <li key={index}>
                    <p><strong>Name:</strong> {product.name}</p>
                    <p><strong>Manufacturing Date:</strong> {product.manufacturingDate}</p>
                    <p><strong>Expiry Date:</strong> {product.expiryDate}</p>
                    <p><strong>Price:</strong> {product.price} ETH</p>
                    <p><strong>Quantity:</strong> {product.quantity}</p>
                    <hr />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No products added to this shipment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;
