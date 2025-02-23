import React, { useState } from "react";
import { ethers } from "ethers";
import SupplyChainABI from "../SupplyChainABI.json";
import contractData from "../deployedAddress.json";

const IndustryDashboard = () => {
  const [shipmentId, setShipmentId] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Product fields
  const [productName, setProductName] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

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

  async function fetchShipment() {
    try {
      if (!shipmentId) {
        setStatusMessage("Enter shipment ID.");
        return;
      }

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

  async function startShipment() {
    try {
      if (!shipmentId) {
        setStatusMessage("Enter shipment ID.");
        return;
      }
      setStatusMessage("Starting shipment...");
      const shipmentContract = await connectToContract();
      const tx = await shipmentContract.startShipment(Number(shipmentId));
      await tx.wait();
      setStatusMessage("Shipment started successfully!");
      fetchShipment();
    } catch (error) {
      console.error("Error starting shipment:", error);
      setStatusMessage("Failed to start shipment.");
    }
  }

  // async function completeShipment() {
  //   try {
  //     if (!shipmentId) {
  //       setStatusMessage("Enter shipment ID.");
  //       return;
  //     }
  //     setStatusMessage("Completing shipment...");
  //     const shipmentContract = await connectToContract();
  //     const tx = await shipmentContract.completeShipment(Number(shipmentId));
  //     await tx.wait();
  //     setStatusMessage("Shipment completed successfully!");
  //     fetchShipment();
  //   } catch (error) {
  //     console.error("Error completing shipment:", error);
  //     setStatusMessage("Failed to complete shipment.");
  //   }
  // }

  async function addProductToShipment() {
    try {
        if (!shipmentId || !productName || !manufacturingDate || !expiryDate || !price || !quantity) {
            setStatusMessage("All product details are required.");
            console.warn("Missing product details:", { shipmentId, productName, manufacturingDate, expiryDate, price, quantity });
            return;
        }

        setStatusMessage("Connecting to contract...");
        console.log("Connecting to contract...");

        const shipmentContract = await connectToContract();
        if (!shipmentContract) {
            console.error("Contract connection failed.");
            setStatusMessage("Failed to connect to contract.");
            return;
        }

        console.log("Contract connected:", shipmentContract.target);

        // Check if function exists
        if (!shipmentContract.addProductToShipment) {
            console.error("Function addProductToShipment not found in contract!");
            setStatusMessage("Error: addProductToShipment function not found in contract.");
            return;
        }

        // Convert dates to timestamps
        const manufacturingTimestamp = Math.floor(new Date(manufacturingDate).getTime() / 1000);
        const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
        const priceInWei = ethers.parseUnits(price, "ether"); // Adjust units if needed

        setStatusMessage("Adding product to shipment...");

        const tx = await shipmentContract.addProductToShipment(
            Number(shipmentId),
            productName,
            manufacturingTimestamp,
            expiryTimestamp,
            priceInWei,
            Number(quantity)
        );

        console.log("Transaction sent:", tx);

        await tx.wait();
        console.log("Transaction confirmed:", tx);

        setStatusMessage("Product added successfully!");
    } catch (error) {
        console.error("Error adding product:", error);
        if (error.reason) {
            setStatusMessage(`Failed: ${error.reason}`);
        } else if (error.code === "CALL_EXCEPTION") {
            setStatusMessage("Transaction reverted: Likely require() failed in contract.");
        } else {
            setStatusMessage("Failed to add product.");
        }
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
        <h2>Add Product to Shipment</h2>
        
        <p>Product Name:
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        </p>

        <p>Manufacturing Date: 
        <input
          type="date"
          placeholder="Manufacturing Date"
          value={manufacturingDate}
          onChange={(e) => setManufacturingDate(e.target.value)}
        />
        </p>

        <p>Expiry Date: 
        <input
          type="date"
          placeholder="Expiry Date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        </p>

        <p>Price in Rupees: 
        <input
          type="number"
          placeholder="Price (in Rupees)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        </p>

        <p>Quantity:
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        </p>

        <button onClick={addProductToShipment}>Add Product</button>
      </div>

      <div>
        <h2>Fetch Shipment</h2>
        <input
          type="number"
          placeholder="Shipment ID"
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
        <button onClick={startShipment}>Start Shipment</button>
      </div>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default IndustryDashboard;
