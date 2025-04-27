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
  <div className="IndustryDashboard">
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
        <button1 onClick={createShipment}>Create Shipment</button1>
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

        <button1 onClick={addProductToShipment}>Add Product</button1>
      </div>

      <div>
        <h2>Fetch Shipment</h2>
        <input
          type="number"
          placeholder="Shipment ID"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
        />
        <button1 onClick={fetchShipment}>Fetch Shipment</button1>
      </div>

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

      <div>
        <h2>Manage Shipment</h2>
        <button1 onClick={startShipment}>Start Shipment</button1>
      </div>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
    </div>
  );
};

export default IndustryDashboard;
