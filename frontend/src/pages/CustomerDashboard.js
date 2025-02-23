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
          if (!shipmentId) {
            setStatusMessage("Enter shipment ID.");
            return;
          }
      
          setStatusMessage("Fetching shipment details...");
          const shipmentContract = await connectToContract();
          
          // Fetch shipment details
          const details = await shipmentContract.getShipment(Number(shipmentId));
      
          // Fetch products in shipment
          const products = await shipmentContract.getProducts(Number(shipmentId));
      
          // Convert product details to readable format
          const formattedProducts = products.map((product) => ({
            name: product.name,
            manufacturingDate: new Date(Number(product.manufacturingDate) * 1000).toDateString(),
            expiryDate: new Date(Number(product.expiryDate) * 1000).toDateString(),
            price: ethers.formatUnits(product.price, "ether"), // Convert from Wei
            quantity: Number(product.quantity),
          }));
      
          // Store shipment and product details in state
          setShipmentDetails({
            sender: details.sender,
            receiver: details.receiver,
            status: getStatusText(Number(details.status)),
            createdAt: new Date(Number(details.createdAt) * 1000).toString(),
            startedAt: details.startedAt > 0 ? new Date(Number(details.startedAt) * 1000).toString() : "Not started",
            completedAt: details.completedAt > 0 ? new Date(Number(details.completedAt) * 1000).toString() : "Not completed",
            products: formattedProducts,  // Add products here
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
          placeholder="Shipment ID"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
        />
        <button onClick={fetchShipment}>Fetch Shipment</button>
  
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

export default CustomerDashboard;
