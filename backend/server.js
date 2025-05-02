// require("dotenv").config();
// const express = require("express");
// const { ethers } = require("ethers");

// const app = express();
// app.use(express.json());

// // Connect to the blockchain
// const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat local node
// const contractABI = require("./SupplyChainABI.json"); // ABI file (we will create this next)
// const contractAddress = deployedConfig.contractAddress; // Replace this after deployment

// const signer = provider.getSigner(0); // Get the first Hardhat account
// const contract = new ethers.Contract(contractAddress, contractABI, signer);

// // API to add a product
// app.post("/add-product", async (req, res) => {
//     try {
//         const { name } = req.body;
//         const tx = await contract.addProduct(name);
//         await tx.wait();
//         res.json({ message: "Product added successfully!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // API to fetch products
// app.get("/products", async (req, res) => {
//     try {
//         let productCount = await contract.productCount();
//         productCount = Number(productCount);

//         let products = [];
//         for (let i = 1; i <= productCount; i++) {
//             const product = await contract.products(i);
//             products.push({
//                 id: Number(product.id),
//                 name: product.name,
//                 owner: product.owner,
//                 delivered: product.delivered,
//             });
//         }

//         res.json(products);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { ethers } = require("ethers");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); // Ensuring JSON parsing is available

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Define User Schema (Farmer Model)
const farmerSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const Farmer = mongoose.model("Farmer", farmerSchema);

// ✅ Define Request Schema (Fruit Requests)
const requestSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fruitType: { type: String, required: true },
  landArea: { type: Number, required: true },
  amount: { type: Number, required: true }, 
  quantity: { type: Number, default: 0 },
  status: { type: String, default: "pending" }
});
const Request = mongoose.model("Request", requestSchema);


// ✅ Blockchain Setup
let contract;
try {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat local node
  const contractABI = require("./SupplyChainABI.json"); 
  const deployedAddressPath = path.join(__dirname, "deployedAddress.json");
  const { contractAddress } = JSON.parse(fs.readFileSync(deployedAddressPath, "utf-8"));
  const signer = provider.getSigner(0);
  console.log("Contract address:", contractAddress);
  contract = new ethers.Contract(contractAddress, contractABI, signer);
} catch (error) {
  console.warn("⚠️ Warning: Could not connect to blockchain. Some features may be limited.");
  contract = null;
}

// ✅ Authentication Routes
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const existingFarmer = await Farmer.findOne({ username });
    if (existingFarmer) return res.status(400).json({ error: "Username already exists. Try logging in." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newFarmer = new Farmer({ username, password: hashedPassword });
    await newFarmer.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error during signup" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const farmer = await Farmer.findOne({ username });
    if (!farmer) return res.status(400).json({ error: "❌ User not found." });

    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) return res.status(400).json({ error: "❌ Invalid credentials" });

    res.json({ message: "✅ Login successful", redirect: "/submit-request" });
  } catch (error) {
    res.status(500).json({ error: "❌ Internal server error during login" });
  }
});

// ✅ Get Farmer's Requests
app.get("/farmer/requests", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "❌ Username is required" });

    const requests = await Request.find({ username });
    res.json(requests);  // Return the fetched requests
  } catch (error) {
    res.status(500).json({ error: "❌ Server error while fetching requests" });
  }
});


// ✅ Submit new request
app.post("/farmer/request", async (req, res) => {
  try {
    const { username, fruitType, landArea, amount } = req.body;
    if (!username || !fruitType || !landArea || !amount) return res.status(400).json({ error: "All fields required" });

    const farmerExists = await Farmer.findOne({ username });
    if (!farmerExists) return res.status(400).json({ error: "User not found." });

    const newRequest = new Request({ username, fruitType, landArea, amount, status: "pending" });
    await newRequest.save();

    res.json({ message: "✅ Request submitted.", request: newRequest });
  } catch (error) {
    res.status(500).json({ error: "Server error while submitting request" });
  }
});

// ✅ Blockchain Product Handling
app.post("/add-product", async (req, res) => {
  try {
    const { name } = req.body;
    const tx = await contract.addProduct(name);
    await tx.wait();
    res.json({ message: "✅ Product added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    let productCount = await contract.productCount();
    productCount = Number(productCount);

    let products = [];
    for (let i = 1; i <= productCount; i++) {
      const product = await contract.products(i);
      products.push({
        id: Number(product.id),
        name: product.name,
        owner: product.owner,
        delivered: product.delivered,
      });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Approve Farmer Requests (Admin)
app.post("/approve-request", async (req, res) => {
  try {
    const { requestId, quantity } = req.body;
    if (!requestId || !quantity) return res.status(400).json({ error: "❌ Request ID and quantity required" });

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status: "approved", quantity },
      { new: true }
    );

    if (!updatedRequest) return res.status(404).json({ error: "❌ Request not found" });

    res.json({ message: "✅ Request approved successfully", request: updatedRequest });
  } catch (error) {
    res.status(500).json({ error: "❌ Server error while approving request" });
  }
});



// ✅ Get All Pending Requests
app.get("/pending-requests", async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" });
    res.json(requests.length ? requests : []);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching requests" });
  }
});

// ✅ Get Predictions
app.get("/predictions", async (req, res) => {
  try {
    // Sample prediction data - replace with actual ML model predictions
    const predictions = {
      apple: [
        { year: 2024, value: 100 },
        { year: 2025, value: 110 },
        { year: 2026, value: 120 }
      ],
      orange: [
        { year: 2024, value: 80 },
        { year: 2025, value: 85 },
        { year: 2026, value: 90 }
      ],
      mango: [
        { year: 2024, value: 60 },
        { year: 2025, value: 65 },
        { year: 2026, value: 70 }
      ]
    };
    
    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching predictions" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

