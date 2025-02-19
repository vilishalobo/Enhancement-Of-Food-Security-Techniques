require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

// Connect to the blockchain
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat local node
const contractABI = require("./SupplyChainABI.json"); // ABI file (we will create this next)
const contractAddress = deployedConfig.contractAddress; // Replace this after deployment

const signer = provider.getSigner(0); // Get the first Hardhat account
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// API to add a product
app.post("/add-product", async (req, res) => {
    try {
        const { name } = req.body;
        const tx = await contract.addProduct(name);
        await tx.wait();
        res.json({ message: "Product added successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to fetch products
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
